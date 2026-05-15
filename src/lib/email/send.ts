/**
 * Admin notification emails (application, subscriber) plus new visitor
 * auto-reply emails (newsletter welcome, application receipt). All use
 * emailShell() from template.ts for consistent on-brand layout.
 */

import { getTransport, FROM, ADMIN_INBOX } from './transport';
import { emailShell, escapeHtml, greyCard, ctaButton, fieldRow } from './template';

const BOOKING_BASE_URL = process.env.BOOKING_BASE_URL || 'https://businessdawg.com';

// ─── Admin: new intern application ────────────────────────────────────────────

export type ApplicationEmail = {
  name: string;
  email: string;
  role?: string | null;
  portfolio?: string | null;
  note?: string | null;
};

export async function notifyAdminOfApplication(payload: ApplicationEmail): Promise<void> {
  const t = getTransport();
  if (!t) return;

  const rows = [
    fieldRow('Name', escapeHtml(payload.name)),
    fieldRow(
      'Email',
      `<a href="mailto:${escapeHtml(payload.email)}" style="color:#5b6500;text-decoration:none">${escapeHtml(payload.email)}</a>`,
    ),
    payload.role ? fieldRow('Role', escapeHtml(payload.role)) : '',
    payload.portfolio
      ? fieldRow(
          'Portfolio',
          `<a href="${escapeHtml(payload.portfolio)}" style="color:#5b6500;text-decoration:none;word-break:break-all">${escapeHtml(payload.portfolio)}</a>`,
        )
      : '',
  ]
    .filter(Boolean)
    .join('');

  const body = `
    <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="margin:0 0 20px;border-collapse:collapse">
      ${rows}
    </table>
    ${
      payload.note
        ? `<p style="margin:0 0 6px;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#888">Note</p>
         ${greyCard(escapeHtml(payload.note))}`
        : ''
    }
  `;

  const subject = `New application: ${payload.name}${payload.role ? ` — ${payload.role}` : ''}`;

  const info = await t.sendMail({
    from: FROM,
    to: ADMIN_INBOX,
    replyTo: payload.email,
    subject,
    html: emailShell({
      label: '/ New Application',
      tone: 'info',
      headline: `${escapeHtml(payload.name)} wants in.`,
      body,
    }),
    text: [
      `${payload.name} just applied${payload.role ? ` for ${payload.role}` : ''}.`,
      '',
      `Email: ${payload.email}`,
      payload.portfolio ? `Portfolio: ${payload.portfolio}` : '',
      payload.note ? `\nNote:\n${payload.note}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  });
  console.log('[email] admin application notification sent | msgId:', info.messageId);
}

// ─── Admin: new newsletter subscriber ─────────────────────────────────────────

export type SubscriberEmail = { email: string; source: string };

export async function notifyAdminOfSubscriber(payload: SubscriberEmail): Promise<void> {
  const t = getTransport();
  if (!t) return;

  // Suppressed unless explicitly opted in — avoids inbox spam on every signup.
  if (process.env.NOTIFY_ON_SUBSCRIBE !== 'true') return;

  const body = `
    <p style="margin:0;font-size:15px;color:#0A0A0A;line-height:1.6">
      <strong>${escapeHtml(payload.email)}</strong> just signed up via
      <strong>${escapeHtml(payload.source)}</strong>.
    </p>
  `;

  const info = await t.sendMail({
    from: FROM,
    to: ADMIN_INBOX,
    subject: `New subscriber: ${payload.email}`,
    html: emailShell({ label: '/ New Subscriber', tone: 'info', headline: '+1 subscriber.', body }),
    text: `${payload.email} signed up via ${payload.source}.`,
  });
  console.log('[email] admin subscriber notification sent | msgId:', info.messageId);
}

// ─── Visitor: newsletter welcome ───────────────────────────────────────────────

export async function notifyVisitorSubscribed(email: string): Promise<void> {
  const t = getTransport();
  if (!t) return;

  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#0A0A0A;line-height:1.6">
      You're on the BusinessDawg list.
    </p>
    <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.6">
      No fluff — just the good stuff on growth, builds, and business systems.
      We'll drop in when we have something worth saying.
    </p>
    ${ctaButton('See what we build →', BOOKING_BASE_URL)}
  `;

  const info = await t.sendMail({
    from: FROM,
    to: email,
    subject: "You're in — BusinessDawg list",
    html: emailShell({
      label: '/ Welcome to the Pack',
      tone: 'success',
      headline: "You're in.",
      body,
    }),
    text: [
      "You're on the BusinessDawg list.",
      '',
      "No fluff — just the good stuff on growth, builds, and business systems. We'll drop in when we have something worth saying.",
      '',
      `— BusinessDawg`,
      BOOKING_BASE_URL,
    ].join('\n'),
  });
  console.log('[email] newsletter welcome sent to', email, '| msgId:', info.messageId);
}

// ─── Visitor: application acknowledgement ─────────────────────────────────────

export type ApplicationReceiptPayload = {
  name: string;
  email: string;
  role?: string | null;
};

export async function notifyVisitorApplicationReceived(
  payload: ApplicationReceiptPayload,
): Promise<void> {
  const t = getTransport();
  if (!t) return;

  const firstName = payload.name.split(' ')[0] || payload.name;
  const roleText = payload.role ? ` for ${payload.role}` : '';

  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#0A0A0A;line-height:1.6">
      Hey ${escapeHtml(firstName)} — we got your application${escapeHtml(roleText)}.
    </p>
    <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.6">
      We'll review it and get back to you within a week. In the meantime,
      check out what we're building.
    </p>
    ${ctaButton('businessdawg.com →', BOOKING_BASE_URL)}
  `;

  const info = await t.sendMail({
    from: FROM,
    to: payload.email,
    subject: `Got your application${roleText} — BusinessDawg`,
    html: emailShell({
      label: '/ Application Received',
      tone: 'success',
      headline: 'Got it. Talk soon.',
      body,
    }),
    text: [
      `Hey ${firstName},`,
      '',
      `We got your application${roleText}. We'll review it and get back to you within a week.`,
      '',
      `Check out what we're building: ${BOOKING_BASE_URL}`,
      '',
      '— BusinessDawg',
    ].join('\n'),
  });
  console.log('[email] application receipt sent to', payload.email, '| msgId:', info.messageId);
}
