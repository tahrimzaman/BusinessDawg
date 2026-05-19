'use client';

/**
 * Root-level error boundary for the App Router. Catches anything that escapes
 * a nested error.tsx boundary — e.g. a render error in the root layout. Per
 * Next docs this file MUST render its own <html> and <body>, because at this
 * point the root layout itself may have failed.
 *
 * Reports the error to Sentry on mount. Without this, root-level crashes
 * fall to Next's default error page and never reach Sentry.
 */
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          background: '#0A0A0A',
          color: '#FAFAFA',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: 560, textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 12,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#ff6b6b',
              margin: 0,
            }}
          >
            / Site error
          </p>
          <h1
            style={{
              fontStyle: 'italic',
              fontWeight: 800,
              fontSize: 'clamp(28px, 6vw, 48px)',
              lineHeight: 1.05,
              margin: '16px 0 0',
            }}
          >
            Something broke. We&apos;re on it.
          </h1>
          <p style={{ color: 'rgba(250,250,250,0.65)', marginTop: 16 }}>
            This error was reported automatically. Try reloading. If it sticks, hit us up at{' '}
            <a href="mailto:yo@businessdawg.com" style={{ color: '#C8FF00' }}>
              yo@businessdawg.com
            </a>
            .
          </p>
          {/* Plain <a> on purpose — global-error catches root-layout failures,
              so we can't trust next/link to render. A hard navigation back
              home is the right recovery here. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            style={{
              display: 'inline-block',
              marginTop: 32,
              padding: '12px 24px',
              borderRadius: 999,
              background: '#C8FF00',
              color: '#0A0A0A',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: 14,
            }}
          >
            Back to home →
          </a>
        </div>
      </body>
    </html>
  );
}
