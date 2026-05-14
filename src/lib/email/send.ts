import nodemailer from 'nodemailer';

// Hostinger SMTP. yo@businessdawg.com is set up as a free Business Email
// mailbox on Hostinger; SMTP creds live in env. 100 emails/day cap is plenty
// for lead notifications.
//
// Required env vars:
//   SMTP_HOST  e.g. smtp.hostinger.com
//   SMTP_PORT  465 (SSL) or 587 (STARTTLS)
//   SMTP_USER  full mailbox address (yo@businessdawg.com)
//   SMTP_PASS  mailbox password (NOT a personal password — the mailbox's own)
//   SMTP_FROM  display name + address, e.g. "BusinessDawg <yo@businessdawg.com>"
//   ADMIN_INBOX  where lead notifications land

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
    secure: port === 465, // SSL on 465, STARTTLS on 587
    auth: { user, pass },
  });
  return _transport;
}

const FROM = process.env.SMTP_FROM || 'BusinessDawg <yo@businessdawg.com>';
const ADMIN_INBOX = process.env.ADMIN_INBOX || 'yo@businessdawg.com';

export type ApplicationEmail = {
  name: string;
  email: string;
  role?: string | null;
  portfolio?: string | null;
  note?: string | null;
};

export async function notifyAdminOfApplication(payload: ApplicationEmail): Promise<void> {
  const t = transport();
  if (!t) {
    console.log(
      '[email] SMTP not configured — skipping admin notify for application',
      payload.email,
    );
    return;
  }

  const html = `
    <h2 style="font-family:system-ui;font-weight:800">New BusinessDawg application</h2>
    <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></p>
    ${payload.role ? `<p><strong>Role:</strong> ${escapeHtml(payload.role)}</p>` : ''}
    ${payload.portfolio ? `<p><strong>Portfolio:</strong> <a href="${escapeHtml(payload.portfolio)}">${escapeHtml(payload.portfolio)}</a></p>` : ''}
    ${payload.note ? `<p><strong>Note:</strong><br>${escapeHtml(payload.note).replace(/\n/g, '<br>')}</p>` : ''}
  `;

  await t.sendMail({
    from: FROM,
    to: ADMIN_INBOX,
    subject: `Join: ${payload.name}${payload.role ? ` — ${payload.role}` : ''}`,
    replyTo: payload.email,
    html,
  });
}

export type SubscriberEmail = { email: string; source: string };

export async function notifyAdminOfSubscriber(payload: SubscriberEmail): Promise<void> {
  const t = transport();
  if (!t) {
    console.log(
      '[email] SMTP not configured — skipping admin notify for subscriber',
      payload.email,
    );
    return;
  }
  // Don't spam the inbox on every signup unless explicitly opted in.
  if (process.env.NOTIFY_ON_SUBSCRIBE !== 'true') return;

  await t.sendMail({
    from: FROM,
    to: ADMIN_INBOX,
    subject: `New subscriber: ${payload.email}`,
    html: `<p>New ${escapeHtml(payload.source)} subscriber: <strong>${escapeHtml(payload.email)}</strong></p>`,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
