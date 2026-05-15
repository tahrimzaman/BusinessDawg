'use client';

import { useEffect, Suspense, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';

/**
 * Initializes PostHog client + auto-tracks page views on route changes.
 *
 * Gracefully no-ops if NEXT_PUBLIC_POSTHOG_KEY is missing (e.g. on local dev
 * without analytics setup, or before Tahrim has provisioned a project).
 *
 * Init is deferred until window 'load' (or 2s idle fallback) so the ~150 KB
 * posthog-js payload never competes with hydration / LCP. Pageviews fired
 * before init are queued and replayed once init completes.
 */

type QueuedPageview = { url: string };
let pendingPageviews: QueuedPageview[] = [];
let posthogReady = false;
let initStarted = false;

function flushQueued() {
  for (const ev of pendingPageviews) {
    posthog.capture('$pageview', { $current_url: ev.url });
  }
  pendingPageviews = [];
}

function tryInit() {
  if (initStarted) return;
  initStarted = true;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  if (typeof window === 'undefined') return;
  if (posthog.__loaded) {
    posthogReady = true;
    flushQueued();
    return;
  }
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    capture_pageview: false, // we capture manually on route changes
    capture_pageleave: true,
    person_profiles: 'always',
    loaded: () => {
      posthogReady = true;
      flushQueued();
    },
  });
}

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    // If the page already loaded by the time we mount (e.g. cached SPA nav),
    // kick init immediately. Otherwise wait for `load` or fall back to idle.
    if (document.readyState === 'complete') {
      tryInit();
      return;
    }

    const onLoad = () => tryInit();
    window.addEventListener('load', onLoad, { once: true });

    type IdleScheduler = (cb: IdleRequestCallback, opts?: { timeout?: number }) => number;
    const ric: IdleScheduler | undefined = (
      window as unknown as { requestIdleCallback?: IdleScheduler }
    ).requestIdleCallback;
    const idleHandle = ric ? ric(() => tryInit(), { timeout: 2000 }) : null;

    return () => {
      window.removeEventListener('load', onLoad);
      const cic = (window as unknown as { cancelIdleCallback?: (h: number) => void })
        .cancelIdleCallback;
      if (idleHandle !== null && cic) cic(idleHandle);
    };
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </>
  );
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // re-render shim so we can re-check posthogReady after the first paint
  const [, force] = useState(0);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (!pathname) return;
    let url = window.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += `?${qs}`;

    if (posthogReady) {
      posthog.capture('$pageview', { $current_url: url });
    } else {
      pendingPageviews.push({ url });
      // Nudge a re-render shortly so we pick up posthogReady toggles cleanly
      // (no-op if init already happened).
      const t = window.setTimeout(() => force((n) => n + 1), 500);
      return () => window.clearTimeout(t);
    }
  }, [pathname, searchParams]);

  return null;
}
