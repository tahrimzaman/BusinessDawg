/**
 * Server-side PostHog client.
 *
 * No-ops gracefully if `POSTHOG_KEY` (server) isn't set, so local dev and
 * any environment that wants to opt out of server analytics just... doesn't
 * configure the env var. Same approach as the client-side PostHogProvider.
 *
 * We use `posthog-node` — its API is similar to `posthog-js` but it batches
 * events and flushes on a timer (default 30s) or on shutdown. For Hostinger
 * Node (persistent process), the batching means a burst of bookings doesn't
 * issue one HTTP request per event.
 *
 * Distinct ID strategy: use `email` when we have one (booking creator, lead
 * submitter), otherwise the `ipHash`/`requestId`. Tahrim can later identify
 * these anonymous events when the same email shows up client-side.
 */

import { PostHog } from 'posthog-node';
import { log } from '@/lib/log/logger';

let _client: PostHog | null = null;
let _initAttempted = false;

function getClient(): PostHog | null {
  if (_client) return _client;
  if (_initAttempted) return null;
  _initAttempted = true;

  const key = process.env.POSTHOG_KEY;
  if (!key) {
    // Not configured — silently no-op. We only log the *first* time we'd have
    // captured an event, not at every site startup, so the logs aren't noisy.
    return null;
  }

  _client = new PostHog(key, {
    host: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
    flushAt: 20, // batch up to 20 events
    flushInterval: 10_000, // ...or flush every 10s, whichever comes first
  });
  log('info', 'posthog.server.initialized', {});
  return _client;
}

/**
 * Fire a server-side event. distinctId should be stable per user when
 * possible — email, or a hashed IP fallback for anonymous events.
 *
 * Never throws. PostHog failures are logged but don't break the request flow.
 */
export function capture(
  event: string,
  distinctId: string,
  properties: Record<string, unknown> = {},
): void {
  const client = getClient();
  if (!client) return;
  try {
    client.capture({ event, distinctId, properties });
  } catch (err) {
    log('error', 'posthog.capture.failed', {
      event,
      errorMessage: (err as Error)?.message,
    });
  }
}

/**
 * Flush pending events. Call from process shutdown handlers if you want to
 * guarantee delivery. Hostinger's Node lifecycle on redeploy doesn't run
 * graceful shutdown reliably — accept that some last-second events may be
 * lost; the next deploy will replay nothing.
 */
export async function shutdown(): Promise<void> {
  if (_client) {
    await _client.shutdown();
    _client = null;
    _initAttempted = false;
  }
}
