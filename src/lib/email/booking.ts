/**
 * Booking transactional emails — visitor confirmation, visitor cancellation,
 * admin notification — plus a hand-rolled ICS builder so visitors can drop
 * the call straight into Google/Apple/Outlook calendar from the confirmation
 * email. Reuses the Nodemailer transport from send.ts via SMTP_* env vars.
 */

import nodemailer from 'nodemailer';
import { signManageToken } from '@/lib/booking/tokens';

const FROM = process.env.SMTP_FROM || 'BusinessDawg <yo@businessdawg.com>';
const ADMIN_INBOX = process.env.ADMIN_INBOX || 'yo@businessdawg.com';
const BOOKING_BASE_URL = process.env.BOOKING_BASE_URL || 'http://localhost:3000';

let _transport: nodemailer.Transporter | null = null;
function transport(): nodemailer.Transporter | null {
  if (_transport) return _transport;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  _transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return _transport;
}

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
  /** Current tokenVersion — used to mint reschedule/cancel manage links. */
  tokenVersion?: number;
  // When true, omit the hand-rolled ICS attachment. Set this when Google
  // already sent the visitor its native calendar invite to avoid a duplicate.
  skipIcs?: boolean;
};

function manageUrl(b: BookingEmailPayload): string | null {
  if (typeof b.tokenVersion !== 'number') return null;
  const token = signManageToken({
    bookingId: b.id,
    tokenVersion: b.tokenVersion,
    startUtc: b.startUtc,
  });
  return `${BOOKING_BASE_URL}/booking/${token}/manage`;
}

function formatTime(date: Date, tz: string): string {
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
  // YYYYMMDDTHHMMSSZ — UTC
  const iso = d.toISOString();
  return iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** Hand-rolled ICS for the booking. method=REQUEST → calendar invite. */
export function buildIcs(b: BookingEmailPayload, method: 'REQUEST' | 'CANCEL' = 'REQUEST'): string {
  const uid = `${b.id}@businessdawg.com`;
  const lines = [
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
  ];
  return lines.join('\r\n');
}

const SHELL_STYLE =
  'font-family:system-ui,-apple-system,sans-serif;color:#0A0A0A;line-height:1.5;max-width:560px;margin:0 auto;padding:0 16px';

export async function notifyVisitorBookingConfirmed(b: BookingEmailPayload): Promise<void> {
  const t = transport();
  if (!t) {
    console.log('[email] SMTP not configured — skipping visitor confirmation for', b.email);
    return;
  }

  const visitorWhen = formatTime(b.startUtc, b.visitorTz);
  const visitorLong = formatLong(b.startUtc, b.visitorTz);
  const ownerLong = formatLong(b.startUtc, b.ownerTz);
  const subject = `Confirmed: ${b.meetingTitle} — ${visitorWhen}`;

  const hasMeet = !!b.meetUrl;
  const manage = manageUrl(b);

  const text = [
    `Hey ${b.name.split(' ')[0] || b.name},`,
    '',
    `Your 15-minute call with BusinessDawg is locked in.`,
    '',
    `Your time:   ${visitorLong}`,
    `Our time:    ${ownerLong}`,
    '',
    hasMeet
      ? `Join here:   ${b.meetUrl}`
      : 'A Google Meet link will follow shortly so it lives on your calendar.',
    manage
      ? `\nManage:      ${manage}`
      : 'Reply to this email if you need to reschedule or cancel.',
    '',
    '— BusinessDawg',
    `${BOOKING_BASE_URL}`,
  ].join('\n');

  const meetBlock = hasMeet
    ? `<p style="margin:0 0 12px">Join the call here:</p>
       <p style="margin:0 0 24px"><a href="${b.meetUrl}" style="display:inline-block;padding:12px 20px;background:#C8FF00;color:#0A0A0A;text-decoration:none;border-radius:999px;font-weight:700">Join Google Meet →</a></p>
       <p style="margin:0 0 12px;font-size:13px;color:#555">If the button doesn't work: <a href="${b.meetUrl}" style="color:#5b6500;word-break:break-all">${escapeHtml(b.meetUrl!)}</a></p>`
    : `<p style="margin:0 0 12px">A Google Meet link will follow shortly so it lives on your calendar.</p>`;

  const html = `
    <div style="${SHELL_STYLE}">
      <p style="font-size:14px;letter-spacing:1px;color:#5b6500;text-transform:uppercase;margin:24px 0 8px">/ Booking confirmed</p>
      <h1 style="font-size:28px;font-weight:800;font-style:italic;margin:0 0 16px;color:#0A0A0A">Booked. See you then.</h1>
      <p style="margin:0 0 12px">Hey ${escapeHtml(b.name.split(' ')[0] || b.name)} —</p>
      <p style="margin:0 0 24px">Your 15-minute call with BusinessDawg is locked in.</p>
      <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;margin:0 0 24px">
        <tr>
          <td style="padding:14px 16px;background:#F4FFB8;border-radius:12px">
            <p style="margin:0 0 6px;font-size:12px;letter-spacing:1px;color:#5b6500;text-transform:uppercase">Your time</p>
            <p style="margin:0;font-weight:700;font-size:16px">${escapeHtml(visitorLong)}</p>
            <p style="margin:8px 0 0;font-size:13px;color:#5b6500">Our time: ${escapeHtml(ownerLong)}</p>
          </td>
        </tr>
      </table>
      ${meetBlock}
      ${
        manage
          ? `<p style="margin:0 0 24px;font-size:14px;color:#555">Need to change anything? <a href="${manage}" style="color:#5b6500;font-weight:600">Reschedule or cancel →</a></p>`
          : '<p style="margin:0 0 24px;font-size:14px;color:#555">Reply to this email if you need to reschedule or cancel.</p>'
      }
      <p style="margin:32px 0 0;font-size:14px;color:#555">— BusinessDawg<br/><a href="${BOOKING_BASE_URL}" style="color:#5b6500">${BOOKING_BASE_URL.replace(/^https?:\/\//, '')}</a></p>
    </div>
  `;

  const attachments = b.skipIcs
    ? undefined
    : [
        {
          filename: 'invite.ics',
          content: buildIcs(b, 'REQUEST'),
          contentType: 'text/calendar; charset=UTF-8; method=REQUEST',
        },
      ];

  await t.sendMail({
    from: FROM,
    to: b.email,
    subject,
    text,
    html,
    attachments,
  });
}

export async function notifyAdminOfBooking(b: BookingEmailPayload): Promise<void> {
  const t = transport();
  if (!t) {
    console.log('[email] SMTP not configured — skipping admin notify for booking', b.id);
    return;
  }

  const ownerWhen = formatTime(b.startUtc, b.ownerTz);
  const subject = `New booking: ${b.name} — ${ownerWhen}`;
  const link = `${BOOKING_BASE_URL}/admin/bookings/${b.id}`;

  const fieldRows = [
    ['Name', b.name],
    ['Email', `<a href="mailto:${escapeHtml(b.email)}">${escapeHtml(b.email)}</a>`],
    b.company ? ['Company / role', escapeHtml(b.company)] : null,
    b.phone ? ['Phone', escapeHtml(b.phone)] : null,
    [
      'When',
      `${formatLong(b.startUtc, b.ownerTz)} (visitor: ${formatLong(b.startUtc, b.visitorTz)})`,
    ],
    b.source ? ['Source', escapeHtml(b.source)] : null,
  ]
    .filter(Boolean)
    .map((row) => row as [string, string]);

  const html = `
    <div style="${SHELL_STYLE}">
      <p style="font-size:14px;letter-spacing:1px;color:#5b6500;text-transform:uppercase;margin:24px 0 8px">/ New booking</p>
      <h1 style="font-size:24px;font-weight:800;margin:0 0 16px">${escapeHtml(b.name)} booked you</h1>
      <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;margin:0 0 24px">
        ${fieldRows
          .map(
            ([label, value]) =>
              `<tr>
                <td style="padding:6px 0;vertical-align:top;width:130px;font-size:13px;color:#777">${escapeHtml(label)}</td>
                <td style="padding:6px 0;vertical-align:top;font-size:14px">${value}</td>
              </tr>`,
          )
          .join('')}
      </table>
      <p style="font-size:13px;color:#777;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px">Intent</p>
      <div style="background:#f5f5f5;border-radius:12px;padding:14px 16px;margin:0 0 24px;white-space:pre-wrap">${escapeHtml(b.intent)}</div>
      <p style="margin:24px 0 0"><a href="${link}" style="display:inline-block;padding:12px 20px;background:#C8FF00;color:#0A0A0A;text-decoration:none;border-radius:999px;font-weight:700">View in admin →</a></p>
    </div>
  `;

  const text = [
    `${b.name} booked you for ${ownerWhen} (owner tz).`,
    '',
    `Email: ${b.email}`,
    b.phone ? `Phone: ${b.phone}` : '',
    b.company ? `Company / role: ${b.company}` : '',
    '',
    `Intent: ${b.intent}`,
    '',
    `Open in admin: ${link}`,
  ]
    .filter(Boolean)
    .join('\n');

  await t.sendMail({
    from: FROM,
    to: ADMIN_INBOX,
    replyTo: b.email,
    subject,
    text,
    html,
  });
}

export async function notifyVisitorBookingReminder(b: BookingEmailPayload): Promise<void> {
  const t = transport();
  if (!t) return;
  const visitorLong = formatLong(b.startUtc, b.visitorTz);
  const subject = `Tomorrow: 15-min BusinessDawg call — ${formatTime(b.startUtc, b.visitorTz)}`;
  const manage = manageUrl(b);
  const hasMeet = !!b.meetUrl;
  const text = [
    `Heads up, ${b.name.split(' ')[0] || b.name} —`,
    '',
    `Quick reminder: your 15-minute call is tomorrow.`,
    '',
    `Your time:  ${visitorLong}`,
    '',
    hasMeet ? `Join here:  ${b.meetUrl}` : 'A Google Meet link will follow shortly.',
    manage ? `\nManage:     ${manage}` : '',
    '',
    '— BusinessDawg',
  ]
    .filter(Boolean)
    .join('\n');
  const meetBlock = hasMeet
    ? `<p style="margin:0 0 24px"><a href="${b.meetUrl}" style="display:inline-block;padding:12px 20px;background:#C8FF00;color:#0A0A0A;text-decoration:none;border-radius:999px;font-weight:700">Join Google Meet →</a></p>`
    : '<p style="margin:0 0 24px;font-size:14px;color:#555">Your Google Meet link is in the original confirmation email.</p>';
  const html = `
    <div style="${SHELL_STYLE}">
      <p style="font-size:14px;letter-spacing:1px;color:#5b6500;text-transform:uppercase;margin:24px 0 8px">/ Tomorrow's call</p>
      <h1 style="font-size:24px;font-weight:800;margin:0 0 16px">Quick reminder.</h1>
      <p style="margin:0 0 20px">Your 15-minute BusinessDawg call is tomorrow at <strong>${escapeHtml(visitorLong)}</strong>.</p>
      ${meetBlock}
      ${manage ? `<p style="margin:0 0 20px;font-size:14px;color:#555">Something come up? <a href="${manage}" style="color:#5b6500;font-weight:600">Reschedule or cancel →</a></p>` : ''}
      <p style="margin:32px 0 0;font-size:14px;color:#555">— BusinessDawg</p>
    </div>
  `;
  await t.sendMail({ from: FROM, to: b.email, subject, text, html });
}

export async function notifyVisitorBookingCancelled(b: BookingEmailPayload): Promise<void> {
  const t = transport();
  if (!t) return;
  const visitorLong = formatLong(b.startUtc, b.visitorTz);
  const subject = `Cancelled: 15-min BusinessDawg call — ${formatTime(b.startUtc, b.visitorTz)}`;
  const text = [
    `Hey ${b.name.split(' ')[0] || b.name},`,
    '',
    `Heads up — your 15-minute call (${visitorLong}) was cancelled.`,
    '',
    `If this wasn't intentional, hit reply and we'll get a new slot booked.`,
    '',
    '— BusinessDawg',
  ].join('\n');
  const html = `
    <div style="${SHELL_STYLE}">
      <p style="font-size:14px;letter-spacing:1px;color:#a02020;text-transform:uppercase;margin:24px 0 8px">/ Booking cancelled</p>
      <h1 style="font-size:24px;font-weight:800;margin:0 0 16px">Your call was cancelled.</h1>
      <p style="margin:0 0 12px">Hey ${escapeHtml(b.name.split(' ')[0] || b.name)} —</p>
      <p style="margin:0 0 16px">Your 15-minute call scheduled for <strong>${escapeHtml(visitorLong)}</strong> was cancelled.</p>
      <p style="margin:0 0 24px;font-size:14px;color:#555">If this wasn't intentional, just reply to this email and we'll rebook.</p>
      <p style="margin:32px 0 0;font-size:14px;color:#555">— BusinessDawg</p>
    </div>
  `;
  await t.sendMail({
    from: FROM,
    to: b.email,
    subject,
    text,
    html,
    attachments: [
      {
        filename: 'cancel.ics',
        content: buildIcs(b, 'CANCEL'),
        contentType: 'text/calendar; charset=UTF-8; method=CANCEL',
      },
    ],
  });
}
