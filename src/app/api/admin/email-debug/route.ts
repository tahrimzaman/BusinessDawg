/**
 * GET /api/admin/email-debug — admin-gated SMTP diagnostic. Shows whether
 * each SMTP env var is present (without leaking the password), verifies the
 * SMTP connection, and optionally fires a test email to ADMIN_INBOX when
 * called with `?send=1`. Use this when bookings/newsletter signups stop
 * delivering emails — the response tells us exactly which layer is broken.
 */

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { isAuthed } from '@/lib/admin/auth';

export const runtime = 'nodejs';

type Diag = {
  envPresence: {
    SMTP_HOST: boolean;
    SMTP_PORT: string;
    SMTP_USER: boolean;
    SMTP_PASS: boolean;
    SMTP_FROM: boolean;
    ADMIN_INBOX: boolean;
    SMTP_USER_value: string;
    SMTP_HOST_value: string;
  };
  verify: { ok: boolean; error: string | null; timeMs: number };
  testSend?: { ok: boolean; error: string | null; messageId: string | null; timeMs: number };
};

export async function GET(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const shouldSend = url.searchParams.get('send') === '1';

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const adminInbox = process.env.ADMIN_INBOX || 'yo@businessdawg.com';
  const from = process.env.SMTP_FROM || 'BusinessDawg <yo@businessdawg.com>';

  const diag: Diag = {
    envPresence: {
      SMTP_HOST: !!host,
      SMTP_PORT: String(port),
      SMTP_USER: !!user,
      SMTP_PASS: !!pass,
      SMTP_FROM: !!process.env.SMTP_FROM,
      ADMIN_INBOX: !!process.env.ADMIN_INBOX,
      // Show the user/host so we can confirm they're what we expect (not the password).
      SMTP_USER_value: user || '(missing)',
      SMTP_HOST_value: host || '(missing)',
    },
    verify: { ok: false, error: null, timeMs: 0 },
  };

  if (!host || !user || !pass) {
    diag.verify.error = 'SMTP env vars missing — cannot create transport';
    return NextResponse.json(diag, { status: 200 });
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 5_000,
    socketTimeout: 15_000,
  });

  const verifyStart = Date.now();
  try {
    await transport.verify();
    diag.verify.ok = true;
  } catch (err) {
    diag.verify.error = err instanceof Error ? err.message : String(err);
  }
  diag.verify.timeMs = Date.now() - verifyStart;

  if (shouldSend && diag.verify.ok) {
    const sendStart = Date.now();
    const testSend: Diag['testSend'] = { ok: false, error: null, messageId: null, timeMs: 0 };
    try {
      const info = await transport.sendMail({
        from,
        to: adminInbox,
        subject: `SMTP diagnostic test — ${new Date().toISOString()}`,
        text: `If you can read this, SMTP outbound delivery works.\n\nTimestamp: ${new Date().toISOString()}`,
        html: `<p style="font-family:system-ui">If you can read this, SMTP outbound delivery works.</p><p style="color:#888;font-size:12px">${new Date().toISOString()}</p>`,
      });
      testSend.ok = true;
      testSend.messageId = info.messageId || null;
    } catch (err) {
      testSend.error = err instanceof Error ? err.message : String(err);
    }
    testSend.timeMs = Date.now() - sendStart;
    diag.testSend = testSend;
  }

  return NextResponse.json(diag, { status: 200 });
}
