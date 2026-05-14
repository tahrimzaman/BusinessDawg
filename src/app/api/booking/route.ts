/**
 * POST /api/booking — create a real booking from the public form. Honeypot
 * + IP rate-limit + zod validation. Uses a Postgres advisory lock keyed on
 * the slot's start-minute so two concurrent bookings can't both win the
 * same slot. Persists Booking + BookingEvent('created') in one transaction;
 * fires visitor + admin emails after commit. Phase 3a: no Google Meet —
 * meetUrl stays null and `needsMeetLink` is true.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { rateLimit, clientIp } from '@/lib/security/ratelimit';
import { isLikelyBot, HONEYPOT_FIELD, TIMESTAMP_FIELD } from '@/lib/security/honeypot';
import { hashIp } from '@/lib/security/hash';
import { getBookingRule } from '@/lib/booking/rules';
import { authedClient, getGoogleEnv, insertBookingEvent } from '@/lib/booking/google';
import { notifyVisitorBookingConfirmed, notifyAdminOfBooking } from '@/lib/email/booking';

export const runtime = 'nodejs';

const Schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  company: z.string().trim().max(160).optional().nullable(),
  role: z.string().trim().max(160).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  intent: z.string().trim().min(1).max(2000),
  source: z.string().trim().max(40).optional().nullable(),
  startUtc: z.string().datetime(),
  visitorTz: z.string().min(1).max(60),
  holdId: z.string().max(40).optional().nullable(),
  utmSource: z.string().max(120).optional().nullable(),
  utmMedium: z.string().max(120).optional().nullable(),
  utmCampaign: z.string().max(120).optional().nullable(),
  utmTerm: z.string().max(120).optional().nullable(),
  utmContent: z.string().max(120).optional().nullable(),
  referrer: z.string().max(500).optional().nullable(),
  landingPage: z.string().max(500).optional().nullable(),
  [HONEYPOT_FIELD]: z.string().optional(),
  [TIMESTAMP_FIELD]: z.union([z.number(), z.string()]).optional(),
});

class SlotContestedError extends Error {}
class SlotTakenError extends Error {}

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  if (!raw) return NextResponse.json({ error: 'invalid body' }, { status: 400 });

  const ip = clientIp(req);
  const limit = rateLimit(`booking:${ip}`, { max: 5, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'too many requests' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }

  if (isLikelyBot(parsed.data)) {
    // Silently succeed — don't tell bots we caught them.
    return NextResponse.json({ ok: true, bookingId: null });
  }

  const data = parsed.data;
  const startMs = Date.parse(data.startUtc);
  if (!Number.isFinite(startMs)) {
    return NextResponse.json({ error: 'invalid startUtc' }, { status: 400 });
  }

  const rule = await getBookingRule();
  const endMs = startMs + rule.durationMin * 60_000;
  const bufferMs = rule.bufferMin * 60_000;

  // Min-notice check (server-side authoritative).
  if (startMs < Date.now() + rule.minNoticeMin * 60_000) {
    return NextResponse.json({ error: 'slot too soon' }, { status: 409 });
  }

  // Validate visitor tz is real.
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: data.visitorTz });
  } catch {
    return NextResponse.json({ error: 'invalid visitorTz' }, { status: 400 });
  }

  const userAgent = req.headers.get('user-agent')?.slice(0, 500) || null;

  // Best-effort geo from Vercel/Cloudflare headers (null in local dev).
  const city = req.headers.get('x-vercel-ip-city') || req.headers.get('cf-ipcity');
  const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry');
  const approxLocation = city || country ? [city, country].filter(Boolean).join(', ') : null;

  const slotKey = Math.floor(startMs / 60_000);
  let bookingId: string | null = null;

  try {
    const created = await prisma.$transaction(async (tx) => {
      const lockRows = await tx.$queryRaw<{ locked: boolean }[]>`
        SELECT pg_try_advisory_xact_lock(${BigInt(slotKey)}::bigint) AS locked
      `;
      const locked = lockRows[0]?.locked === true;
      if (!locked) throw new SlotContestedError();

      const startUtc = new Date(startMs);
      const endUtc = new Date(endMs);
      const startMinusBuffer = new Date(startMs - bufferMs);
      const endPlusBuffer = new Date(endMs + bufferMs);

      const conflict = await tx.booking.findFirst({
        where: {
          status: { in: ['CONFIRMED', 'RESCHEDULED'] },
          AND: [{ startUtc: { lt: endPlusBuffer } }, { endUtc: { gt: startMinusBuffer } }],
        },
        select: { id: true },
      });
      if (conflict) throw new SlotTakenError();

      const booking = await tx.booking.create({
        data: {
          name: data.name,
          email: data.email,
          company: data.company || null,
          role: data.role || null,
          phone: data.phone || null,
          intent: data.intent,
          source: data.source || null,
          startUtc,
          endUtc,
          visitorTz: data.visitorTz,
          needsMeetLink: true,
          ipHash: hashIp(ip),
          userAgent,
          utmSource: data.utmSource || null,
          utmMedium: data.utmMedium || null,
          utmCampaign: data.utmCampaign || null,
          utmTerm: data.utmTerm || null,
          utmContent: data.utmContent || null,
          referrer: data.referrer || null,
          landingPage: data.landingPage || null,
          approxLocation,
        },
      });

      await tx.bookingEvent.create({
        data: {
          bookingId: booking.id,
          type: 'created',
          payload: {
            slot: { startUtc: startUtc.toISOString(), endUtc: endUtc.toISOString() },
            source: data.source || null,
          },
        },
      });

      return booking;
    });
    bookingId = created.id;

    // Best-effort: release the matching hold. Don't fail the booking if it's
    // already expired or missing.
    if (data.holdId) {
      prisma.slotHold.delete({ where: { id: data.holdId } }).catch(() => {});
    }

    // Try Google Calendar — fail-open. If no env / no token / API error,
    // booking still succeeds with needsMeetLink: true.
    let meetUrl: string | null = null;
    let gcalEventId: string | null = null;
    let googleConfigured = false;
    try {
      const env = getGoogleEnv();
      if (env) {
        const token = await prisma.googleToken.findUnique({ where: { id: 'singleton' } });
        if (token) {
          googleConfigured = true;
          const client = authedClient(env, token);
          const event = await insertBookingEvent(client, env, {
            bookingId: created.id,
            title: rule.meetingTitle,
            description: `${created.intent}\n\nBooked by: ${created.name} <${created.email}>${created.company ? ` · ${created.company}` : ''}`,
            startUtc: created.startUtc,
            endUtc: created.endUtc,
            attendeeEmail: created.email,
            attendeeName: created.name,
          });
          meetUrl = event.meetUrl;
          gcalEventId = event.eventId || null;

          // If the OAuth client refreshed the access token, persist it so
          // the next call reuses it instead of round-tripping again.
          const creds = client.credentials;
          if (creds.access_token && creds.access_token !== token.accessToken) {
            await prisma.googleToken.update({
              where: { id: 'singleton' },
              data: {
                accessToken: creds.access_token,
                expiresAt: creds.expiry_date ? new Date(creds.expiry_date) : null,
                lastRefreshAt: new Date(),
              },
            });
          }
        }
      }
    } catch (err) {
      console.error('[/api/booking] gcal insert failed (fail-open)', err);
    }

    if (meetUrl || gcalEventId) {
      await prisma.booking.update({
        where: { id: created.id },
        data: {
          meetUrl,
          gcalEventId,
          needsMeetLink: false,
        },
      });
      prisma.bookingEvent
        .create({
          data: {
            bookingId: created.id,
            type: 'meet_linked',
            payload: { meetUrl, gcalEventId },
          },
        })
        .catch(() => {});
    }

    // Fire-and-forget emails so the response stays fast.
    const emailPayload = {
      id: created.id,
      name: created.name,
      email: created.email,
      company: created.company,
      role: created.role,
      phone: created.phone,
      intent: created.intent,
      source: created.source,
      startUtc: created.startUtc,
      endUtc: created.endUtc,
      visitorTz: created.visitorTz,
      ownerTz: rule.ownerTz,
      meetingTitle: rule.meetingTitle,
      meetUrl,
      tokenVersion: created.tokenVersion,
      // If Google succeeded, it sends its own native calendar invite via
      // sendUpdates:'all'. Skip our ICS so the visitor doesn't end up with
      // two events on their calendar.
      skipIcs: !!meetUrl && googleConfigured,
    };
    notifyVisitorBookingConfirmed(emailPayload).catch((err) =>
      console.error('[/api/booking] visitor email failed', err),
    );
    notifyAdminOfBooking(emailPayload).catch((err) =>
      console.error('[/api/booking] admin email failed', err),
    );

    return NextResponse.json({ ok: true, bookingId });
  } catch (err) {
    if (err instanceof SlotContestedError || err instanceof SlotTakenError) {
      return NextResponse.json({ error: 'slot just taken', code: 'slot_taken' }, { status: 409 });
    }
    console.error('[/api/booking] error', err);
    return NextResponse.json({ error: 'persistence failed' }, { status: 500 });
  }
}
