import { Resend } from 'resend';

// Lazily create the Resend client so missing env vars don't crash imports.
let _resend: Resend | null = null;
function resend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

const FROM = process.env.RESEND_FROM || 'BusinessDawg <yo@businessdawg.com>';
const ADMIN_INBOX = process.env.ADMIN_INBOX || 'yo@businessdawg.com';

export type ApplicationEmail = {
  name: string;
  email: string;
  role?: string | null;
  portfolio?: string | null;
  note?: string | null;
};

export async function notifyAdminOfApplication(payload: ApplicationEmail): Promise<void> {
  const client = resend();
  if (!client) {
    console.log(
      '[email] RESEND_API_KEY not set — skipping admin notify for application',
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

  await client.emails.send({
    from: FROM,
    to: ADMIN_INBOX,
    subject: `Join: ${payload.name}${payload.role ? ` — ${payload.role}` : ''}`,
    replyTo: payload.email,
    html,
  });
}

export type SubscriberEmail = { email: string; source: string };

export async function notifyAdminOfSubscriber(payload: SubscriberEmail): Promise<void> {
  const client = resend();
  if (!client) {
    console.log(
      '[email] RESEND_API_KEY not set — skipping admin notify for subscriber',
      payload.email,
    );
    return;
  }
  // Don't spam the inbox on every signup unless explicitly opted in.
  if (process.env.NOTIFY_ON_SUBSCRIBE !== 'true') return;

  await client.emails.send({
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
