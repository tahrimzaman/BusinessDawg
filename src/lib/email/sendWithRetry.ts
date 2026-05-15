/**
 * sendWithRetry — Nodemailer `sendMail` with automatic retry and outbox fallback.
 *
 * Why this exists: before this, every email site was `await t.sendMail(...)`
 * inside a `void ... .catch(console.error)`. A transient SMTP hiccup (Hostinger
 * resetting the connection, brief DNS flap, etc.) lost the email permanently
 * and the visitor never knew.
 *
 * Strategy:
 *  1. Attempt up to 3 sends, with jittered backoff between (0, ~500ms, ~2s).
 *     The existing transport already enforces hard timeouts per attempt
 *     (connection 10s, greeting 5s, socket 15s) so a single hung attempt
 *     can't gobble all three slots.
 *  2. On final failure, persist an `EmailOutbox` row with `status='unsent'`
 *     so admin can retry from /admin/email-debug.
 *  3. Fire a PostHog server event so failures show up in the funnel.
 *
 * We never throw — callers can `await sendWithRetry(...)` without try/catch.
 * The return value tells them whether to consider the send "live".
 */

import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { getTransport } from './transport';
import { prisma } from '@/lib/db/prisma';
import { log } from '@/lib/log/logger';
import { capture } from '@/lib/analytics/posthog-server';

export type SendMailOptions = Parameters<
  NonNullable<ReturnType<typeof getTransport>>['sendMail']
>[0];

export type SendContext = {
  /** Logical event type, used in PostHog + outbox row context. */
  type:
    | 'visitor_booking_confirmation'
    | 'admin_booking_notification'
    | 'visitor_booking_cancellation'
    | 'visitor_booking_reminder'
    | 'visitor_booking_reschedule'
    | 'admin_subscriber_notification'
    | 'visitor_subscribed_welcome'
    | 'admin_application_notification'
    | 'visitor_application_receipt';
  bookingId?: string;
  distinctId?: string;
};

export type SendResult =
  | { ok: true; messageId: string | undefined; attempts: number }
  | { ok: false; outboxId: string | null; attempts: number; lastError: string };

const MAX_ATTEMPTS = 3;

function backoffMs(attempt: number): number {
  // attempt is 1-indexed. 1 → 0ms (immediate), 2 → ~500ms + jitter, 3 → ~2s + jitter.
  const base = attempt === 1 ? 0 : attempt === 2 ? 500 : 2000;
  const jitter = Math.floor(Math.random() * 300);
  return base + jitter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function sendWithRetry(opts: SendMailOptions, ctx: SendContext): Promise<SendResult> {
  const transport = getTransport();
  // No SMTP configured at all — write directly to outbox, no point retrying.
  if (!transport) {
    const row = await writeOutbox(opts, ctx, 0, 'SMTP not configured');
    capture('email_send_failed', ctx.distinctId || 'system', {
      type: ctx.type,
      reason: 'smtp_not_configured',
      bookingId: ctx.bookingId,
    });
    return { ok: false, outboxId: row, attempts: 0, lastError: 'SMTP not configured' };
  }

  let lastError = 'unknown';
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) await sleep(backoffMs(attempt));
    try {
      const info = (await transport.sendMail(opts)) as SMTPTransport.SentMessageInfo;
      log('info', 'email.sent', {
        type: ctx.type,
        bookingId: ctx.bookingId,
        attempts: attempt,
        messageId: info.messageId,
      });
      // Don't fire a PostHog event on the happy path for every email — too
      // noisy. We track conversions at the API-route layer instead.
      return { ok: true, messageId: info.messageId, attempts: attempt };
    } catch (err) {
      lastError = (err as Error)?.message ?? String(err);
      log('warn', 'email.attempt.failed', {
        type: ctx.type,
        bookingId: ctx.bookingId,
        attempt,
        errorMessage: lastError,
      });
    }
  }

  // All attempts exhausted — persist for manual replay.
  const row = await writeOutbox(opts, ctx, MAX_ATTEMPTS, lastError);
  capture('email_send_failed', ctx.distinctId || 'system', {
    type: ctx.type,
    bookingId: ctx.bookingId,
    attempts: MAX_ATTEMPTS,
    lastError,
  });
  log('error', 'email.send.gave_up', {
    type: ctx.type,
    bookingId: ctx.bookingId,
    outboxId: row,
    lastError,
  });
  return { ok: false, outboxId: row, attempts: MAX_ATTEMPTS, lastError };
}

async function writeOutbox(
  opts: SendMailOptions,
  ctx: SendContext,
  attempts: number,
  lastError: string,
): Promise<string | null> {
  try {
    // `opts.to` can be a string, an array, or an object — normalize to string.
    const to = Array.isArray(opts.to)
      ? opts.to.map((x) => (typeof x === 'string' ? x : x.address)).join(', ')
      : typeof opts.to === 'string'
        ? opts.to
        : opts.to?.address || '';
    const subject = String(opts.subject || '');
    const bodyHtml = typeof opts.html === 'string' ? opts.html : '';
    const bodyText = typeof opts.text === 'string' ? opts.text : null;

    const row = await prisma.emailOutbox.create({
      data: {
        to,
        subject,
        bodyHtml,
        bodyText,
        attempts,
        lastError,
        status: 'unsent',
        context: { type: ctx.type, bookingId: ctx.bookingId ?? null },
      },
    });
    return row.id;
  } catch (err) {
    // If we can't even persist the failure, we've already lost the email —
    // log loudly so it lands in Hostinger's stream.
    log('error', 'email.outbox.write_failed', {
      type: ctx.type,
      bookingId: ctx.bookingId,
      errorMessage: (err as Error)?.message ?? String(err),
    });
    return null;
  }
}
