/**
 * Shared Nodemailer transport singleton with explicit timeouts so a slow SMTP
 * handshake fails fast rather than hanging the Node process indefinitely.
 * Both booking.ts and send.ts import from here so credentials and config live
 * in exactly one place.
 */

import nodemailer from 'nodemailer';

export const FROM = process.env.SMTP_FROM || 'BusinessDawg <yo@businessdawg.com>';
export const ADMIN_INBOX = process.env.ADMIN_INBOX || 'yo@businessdawg.com';

let _transport: nodemailer.Transporter | null = null;

export function getTransport(): nodemailer.Transporter | null {
  if (_transport) return _transport;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.error(
      '[CRITICAL][email] SMTP not configured — SMTP_HOST / SMTP_USER / SMTP_PASS missing. No emails will be sent.',
    );
    return null;
  }

  _transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 5_000,
    socketTimeout: 15_000,
  });

  // Verify once on first use — catches bad creds immediately and logs loudly
  // so Hostinger logs surface the problem. Does NOT throw or null the transport
  // so subsequent sendMail attempts still get a real SMTP error rather than a
  // silent skip.
  _transport
    .verify()
    .then(() => {
      console.log('[email] SMTP connection verified OK');
    })
    .catch((err: Error) => {
      console.error('[CRITICAL][email] SMTP verify failed:', err.message);
    });

  return _transport;
}
