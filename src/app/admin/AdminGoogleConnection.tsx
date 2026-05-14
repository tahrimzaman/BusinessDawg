'use client';

/**
 * Google Calendar connection card — sits at the top of /admin. Three states:
 * disconnected (red, "Connect Google Calendar →"), connected fresh (green),
 * stale (amber, "Token > 5 days old, reconnect soon"). Surfaces the URL
 * query hash from the callback (e.g. ?google=connected) as a transient
 * banner so the admin sees the OAuth round-trip result.
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export type GoogleConnectionState = {
  status: 'disconnected' | 'connected' | 'not_configured';
  ownerEmail: string | null;
  lastRefreshAt: string | null;
  ageDays: number | null;
};

const MESSAGES: Record<string, { tone: 'good' | 'warn' | 'bad'; text: string }> = {
  connected: { tone: 'good', text: 'Google Calendar connected.' },
  not_configured: {
    tone: 'warn',
    text: 'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing in .env.local.',
  },
  missing_code: { tone: 'bad', text: 'Google sent us back without a code. Try again.' },
  no_refresh_token: {
    tone: 'warn',
    text: 'Connected but Google did not issue a refresh token. Revoke access at myaccount.google.com → security and retry.',
  },
  exchange_failed: {
    tone: 'bad',
    text: 'Google rejected the code exchange. Re-check GOOGLE_CLIENT_SECRET.',
  },
  access_denied: { tone: 'bad', text: 'You denied access on the Google consent screen.' },
};

export default function AdminGoogleConnection({ initial }: { initial: GoogleConnectionState }) {
  const router = useRouter();
  const params = useSearchParams();
  const [busy, setBusy] = useState<'connect' | 'disconnect' | null>(null);

  // Derived from URL — no local state needed, so no setState-in-effect.
  const flashCode = params.get('google');
  const flashMsg = flashCode ? (MESSAGES[flashCode] ?? null) : null;

  // Side effect: strip the query param after first paint and refresh on success.
  useEffect(() => {
    if (!flashCode) return;
    const url = new URL(window.location.href);
    url.searchParams.delete('google');
    window.history.replaceState({}, '', url.toString());
    if (flashCode === 'connected') router.refresh();
  }, [flashCode, router]);

  async function disconnect() {
    if (busy) return;
    if (
      !confirm(
        'Disconnect Google Calendar? Future bookings will lose auto-Meet-link generation until you reconnect.',
      )
    )
      return;
    setBusy('disconnect');
    try {
      const res = await fetch('/api/admin/google/disconnect', { method: 'POST' });
      if (!res.ok) throw new Error('disconnect failed');
      router.refresh();
    } catch (err) {
      setFlashMsg({ tone: 'bad', text: err instanceof Error ? err.message : 'failed' });
    } finally {
      setBusy(null);
    }
  }

  const { status, ownerEmail, lastRefreshAt, ageDays } = initial;
  const stale = status === 'connected' && (ageDays ?? 0) >= 5;
  const red = status === 'disconnected' || status === 'not_configured';

  const dotClass = red
    ? 'bg-[color:var(--bd-signal)]'
    : stale
      ? 'bg-amber-400'
      : 'bg-[color:var(--bd-lime)]';

  return (
    <div
      className={
        'mb-6 rounded-2xl border p-4 ' +
        (red
          ? 'border-[color:var(--bd-signal)]/30 bg-[color:var(--bd-signal)]/5'
          : stale
            ? 'border-amber-500/30 bg-amber-500/5'
            : 'border-[color:var(--bd-lime)]/25 bg-[color:var(--bd-lime)]/5')
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className={`relative flex h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
            / Google Calendar
          </p>
          {status === 'not_configured' ? (
            <p className="mt-1 text-sm text-[color:var(--bd-bone)]">
              <strong>Not configured.</strong> Bookings still work — visitors get a &ldquo;Meet link
              to follow&rdquo; message. Set <code>GOOGLE_CLIENT_ID</code> and{' '}
              <code>GOOGLE_CLIENT_SECRET</code> in <code>.env.local</code> to enable auto Meet
              links.
            </p>
          ) : status === 'disconnected' ? (
            <p className="mt-1 text-sm text-[color:var(--bd-bone)]">
              <strong>Disconnected.</strong> Connect your Google account so each booking generates a
              fresh Meet link automatically.
            </p>
          ) : (
            <p className="mt-1 text-sm text-[color:var(--bd-bone)]">
              Connected as{' '}
              <strong className="text-[color:var(--bd-bone)]">
                {ownerEmail || 'your Google account'}
              </strong>
              {lastRefreshAt ? ` · refreshed ${formatAgo(lastRefreshAt)}` : ''}
              {stale && (
                <span className="ml-2 text-amber-300">
                  Token is {ageDays} days old — reconnect soon (Testing-mode caps at 7 days).
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {status === 'connected' ? (
            <>
              <a
                href="/api/admin/google/auth"
                className="inline-flex h-9 items-center rounded-full border border-white/10 bg-white/5 px-4 font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)] uppercase hover:border-[color:var(--bd-lime)] hover:text-[color:var(--bd-lime)]"
              >
                Reconnect
              </a>
              <button
                type="button"
                onClick={disconnect}
                disabled={busy === 'disconnect'}
                className="inline-flex h-9 items-center rounded-full border border-[color:var(--bd-signal)]/40 bg-[color:var(--bd-signal)]/10 px-4 font-mono text-[10px] tracking-widest text-[color:var(--bd-signal)] uppercase hover:bg-[color:var(--bd-signal)]/20 disabled:opacity-50"
              >
                {busy === 'disconnect' ? 'Disconnecting…' : 'Disconnect'}
              </button>
            </>
          ) : status === 'disconnected' ? (
            <a
              href="/api/admin/google/auth"
              className="inline-flex h-9 items-center rounded-full bg-[color:var(--bd-lime)] px-4 font-mono text-[10px] tracking-widest text-[color:var(--bd-ink)] uppercase hover:bg-[color:var(--bd-bone)]"
            >
              Connect Google Calendar →
            </a>
          ) : null}
        </div>
      </div>
      {flashMsg && (
        <p
          className={
            'mt-3 rounded-xl px-3 py-2 text-xs ' +
            (flashMsg.tone === 'good'
              ? 'bg-[color:var(--bd-lime)]/10 text-[color:var(--bd-lime)]'
              : flashMsg.tone === 'warn'
                ? 'bg-amber-500/10 text-amber-300'
                : 'bg-[color:var(--bd-signal)]/10 text-[color:var(--bd-signal)]')
          }
        >
          {flashMsg.text}
        </p>
      )}
    </div>
  );
}

function formatAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
