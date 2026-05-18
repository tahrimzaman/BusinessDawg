/**
 * Booking transactional emails — visitor confirmation, visitor cancellation,
 * admin notification, 24h reminder. All use emailShell() from template.ts for
 * consistent on-brand layout. Also exports buildIcs() for the hand-rolled
 * iCalendar attachment so visitors can add the call to their calendar.
 */

import { FROM, ADMIN_INBOX } from './transport';
import { sendWithRetry } from './sendWithRetry';
import { emailShell, escapeHtml, infoCard, greyCard, ctaButton, fieldRow } from './template';
import { signManageToken } from '@/lib/booking/tokens';

const BOOKING_BASE_URL = process.env.BOOKING_BASE_URL || 'https://businessdawg.com';

export type BookingEmailPayload = {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  role?: string | null;
  phone?: string | null;
  intent: string;
  source?: string | null;
  startUtc: Date;
  endUtc: Date;
  visitorTz: string;
  ownerTz: string;
  meetingTitle: string;
  meetUrl?: string | null;
  tokenVersion?: number;
  // When true, skip the hand-rolled ICS. Set when Google already sent its own
  // native calendar invite so the visitor doesn't end up with two events.
  skipIcs?: boolean;
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function manageUrl(b: BookingEmailPayload): string | null {
  if (typeof b.tokenVersion !== 'number') return null;
  const token = signManageToken({
    bookingId: b.id,
    tokenVersion: b.tokenVersion,
    endUtc: b.endUtc,
  });
  return `${BOOKING_BASE_URL}/booking/${token}/manage`;
}

function formatShort(date: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatLong(date: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

function toIcsDate(d: Date): string {
  return d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

// ─── ICS builder ──────────────────────────────────────────────────────────────

export function buildIcs(b: BookingEmailPayload, method: 'REQUEST' | 'CANCEL' = 'REQUEST'): string {
  const uid = `${b.id}@businessdawg.com`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BusinessDawg//Booking//EN',
    `METHOD:${method}`,
    'BEGIN:VEVENT',
    `UID:${uid}`,
    'SEQUENCE:0',
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(b.startUtc)}`,
    `DTEND:${toIcsDate(b.endUtc)}`,
    `SUMMARY:${escapeIcs(b.meetingTitle)}`,
    `DESCRIPTION:${escapeIcs(b.intent)}`,
    'ORGANIZER;CN=BusinessDawg:mailto:' + ADMIN_INBOX,
    `ATTENDEE;CN=${escapeIcs(b.name)};RSVP=TRUE:mailto:${b.email}`,
    `STATUS:${method === 'CANCEL' ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

// ─── Visitor booking confirmation ──────────────────────────────────────────────

export async function notifyVisitorBookingConfirmed(b: BookingEmailPayload): Promise<void> {
  const firstName = b.name.split(' ')[0] || b.name;
  const visitorLong = formatLong(b.startUtc, b.visitorTz);
  const ownerLong = formatLong(b.startUtc, b.ownerTz);
  const hasMeet = !!b.meetUrl;
  const manage = manageUrl(b);
  const visitorShort = formatShort(b.startUtc, b.visitorTz);
  const subject = `Confirmed: ${b.meetingTitle} — ${visitorShort}`;

  const timeCard = infoCard(`
    <p style="margin:0 0 4px;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#5b6500">Your time</p>
    <p style="margin:0;font-size:16px;font-weight:700;color:#0A0A0A;line-height:1.3">${escapeHtml(visitorLong)}</p>
    <p style="margin:8px 0 0;font-size:13px;color:#5b6500">Our time: ${escapeHtml(ownerLong)}</p>
  `);

  const meetSection = hasMeet
    ? `<p style="margin:0 0 12px;font-size:15px;color:#0A0A0A">Your Google Meet is ready. See you there:</p>
       ${ctaButton('Join Google Meet →', b.meetUrl!)}
       <p style="margin:0 0 20px;font-size:12px;color:#999">Or copy the link: <a href="${b.meetUrl}" style="color:#5b6500;word-break:break-all;text-decoration:none">${escapeHtml(b.meetUrl!)}</a></p>`
    : `<p style="margin:0 0 20px;font-size:15px;color:#555">A Google Meet link is on its way — keep an eye on your inbox.</p>`;

  const manageSection = manage
    ? `<p style="margin:0;font-size:14px;color:#888">Need to change things? <a href="${manage}" style="color:#5b6500;font-weight:600;text-decoration:none">Reschedule or cancel →</a></p>`
    : `<p style="margin:0;font-size:14px;color:#888">Reply to this email to reschedule or cancel.</p>`;

  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#0A0A0A;line-height:1.6">
      Hey ${escapeHtml(firstName)} — your 30-minute call with BusinessDawg is locked in.
    </p>
    ${timeCard}
    ${meetSection}
    ${manageSection}
  `;

  const text = [
    `Hey ${firstName},`,
    '',
    'Your 30-minute call with BusinessDawg is confirmed.',
    '',
    `Your time:  ${visitorLong}`,
    `Our time:   ${ownerLong}`,
    '',
    hasMeet ? `Join here:  ${b.meetUrl}` : 'A Google Meet link is on its way.',
    manage ? `\nManage:     ${manage}` : 'Reply to reschedule or cancel.',
    '',
    '— BusinessDawg',
    BOOKING_BASE_URL,
  ].join('\n');

  const attachments = b.skipIcs
    ? undefined
    : [
        {
          filename: 'invite.ics',
          content: buildIcs(b, 'REQUEST'),
          contentType: 'text/calendar; charset=UTF-8; method=REQUEST',
        },
      ];

  await sendWithRetry(
    {
      from: FROM,
      to: b.email,
      subject,
      text,
      html: emailShell({
        label: '/ Booking Confirmed',
        tone: 'success',
        headline: 'Booked. See you then.',
        body,
      }),
      attachments,
    },
    { type: 'visitor_booking_confirmation', bookingId: b.id, distinctId: b.email },
  );
}

// ─── Admin booking notification ────────────────────────────────────────────────

export async function notifyAdminOfBooking(b: BookingEmailPayload): Promise<void> {
  const ownerShort = formatShort(b.startUtc, b.ownerTz);
  const subject = `New booking: ${b.name} — ${ownerShort}`;
  const adminLink = `${BOOKING_BASE_URL}/admin/bookings/${b.id}`;

  const rows = [
    fieldRow('Name', escapeHtml(b.name)),
    fieldRow(
      'Email',
      `<a href="mailto:${escapeHtml(b.email)}" style="color:#5b6500;text-decoration:none">${escapeHtml(b.email)}</a>`,
    ),
    b.company ? fieldRow('Company / role', escapeHtml(b.company)) : '',
    b.phone ? fieldRow('Phone', escapeHtml(b.phone)) : '',
    fieldRow('When (your tz)', escapeHtml(formatLong(b.startUtc, b.ownerTz))),
    fieldRow('Visitor tz', escapeHtml(formatLong(b.startUtc, b.visitorTz))),
    b.source ? fieldRow('Source', escapeHtml(b.source)) : '',
  ]
    .filter(Boolean)
    .join('');

  const body = `
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin:0 0 20px;border-collapse:collapse">
      ${rows}
    </table>
    <p style="margin:0 0 6px;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#888">Intent</p>
    ${greyCard(escapeHtml(b.intent))}
    ${ctaButton('View in admin →', adminLink)}
  `;

  const text = [
    `${b.name} booked a call — ${ownerShort}`,
    '',
    `Email:  ${b.email}`,
    b.phone ? `Phone:  ${b.phone}` : '',
    b.company ? `Co/role: ${b.company}` : '',
    '',
    `Intent: ${b.intent}`,
    '',
    `Admin link: ${adminLink}`,
  ]
    .filter(Boolean)
    .join('\n');

  await sendWithRetry(
    {
      from: FROM,
      to: ADMIN_INBOX,
      replyTo: b.email,
      subject,
      text,
      html: emailShell({
        label: '/ New Booking',
        tone: 'info',
        headline: `${escapeHtml(b.name)} just booked.`,
        body,
      }),
    },
    { type: 'admin_booking_notification', bookingId: b.id },
  );
}

// ─── Visitor 24h reminder ──────────────────────────────────────────────────────

export async function notifyVisitorBookingReminder(b: BookingEmailPayload): Promise<void> {
  const firstName = b.name.split(' ')[0] || b.name;
  const visitorLong = formatLong(b.startUtc, b.visitorTz);
  const hasMeet = !!b.meetUrl;
  const manage = manageUrl(b);
  const subject = `Tomorrow: your 30-min BusinessDawg call — ${formatShort(b.startUtc, b.visitorTz)}`;

  const meetSection = hasMeet
    ? ctaButton('Join Google Meet →', b.meetUrl!)
    : `<p style="margin:0 0 20px;font-size:14px;color:#555">Your Google Meet link is in the original confirmation email.</p>`;

  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#0A0A0A;line-height:1.6">
      Hey ${escapeHtml(firstName)} — quick heads-up. Your 30-minute BusinessDawg call is tomorrow.
    </p>
    ${infoCard(`<p style="margin:0;font-size:16px;font-weight:700;color:#0A0A0A">${escapeHtml(visitorLong)}</p>`)}
    ${meetSection}
    ${manage ? `<p style="margin:0;font-size:14px;color:#888">Something come up? <a href="${manage}" style="color:#5b6500;font-weight:600;text-decoration:none">Reschedule or cancel →</a></p>` : ''}
  `;

  const text = [
    `Hey ${firstName},`,
    '',
    `Quick reminder — your 30-minute call is tomorrow: ${visitorLong}`,
    '',
    hasMeet ? `Join here: ${b.meetUrl}` : 'Your Meet link is in the original confirmation email.',
    manage ? `\nManage: ${manage}` : '',
    '',
    '— BusinessDawg',
  ]
    .filter(Boolean)
    .join('\n');

  await sendWithRetry(
    {
      from: FROM,
      to: b.email,
      subject,
      text,
      html: emailShell({
        label: "/ Tomorrow's Call",
        tone: 'info',
        headline: 'Quick reminder.',
        body,
      }),
    },
    { type: 'visitor_booking_reminder', bookingId: b.id, distinctId: b.email },
  );
}

// ─── Visitor cancellation ──────────────────────────────────────────────────────

export async function notifyVisitorBookingCancelled(b: BookingEmailPayload): Promise<void> {
  const firstName = b.name.split(' ')[0] || b.name;
  const visitorLong = formatLong(b.startUtc, b.visitorTz);
  const subject = `Cancelled: your BusinessDawg call — ${formatShort(b.startUtc, b.visitorTz)}`;

  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#0A0A0A;line-height:1.6">
      Hey ${escapeHtml(firstName)} — your 30-minute call scheduled for
      <strong>${escapeHtml(visitorLong)}</strong> has been cancelled.
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6">
      If this wasn't intentional, just reply to this email and we'll get a new slot sorted.
    </p>
    ${ctaButton('Book a new slot →', `${BOOKING_BASE_URL}/contact`)}
  `;

  const text = [
    `Hey ${firstName},`,
    '',
    `Your 30-minute call (${visitorLong}) was cancelled.`,
    '',
    "If this wasn't intentional, reply and we'll rebook.",
    '',
    '— BusinessDawg',
  ].join('\n');

  await sendWithRetry(
    {
      from: FROM,
      to: b.email,
      subject,
      text,
      html: emailShell({
        label: '/ Booking Cancelled',
        tone: 'cancel',
        headline: "Your call's off.",
        body,
      }),
      attachments: [
        {
          filename: 'cancel.ics',
          content: buildIcs(b, 'CANCEL'),
          contentType: 'text/calendar; charset=UTF-8; method=CANCEL',
        },
      ],
    },
    { type: 'visitor_booking_cancellation', bookingId: b.id, distinctId: b.email },
  );
}
