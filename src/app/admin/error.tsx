'use client';

/**
 * Admin route error boundary. Catches any throw inside the admin segment
 * (Prisma query failures, missing env vars, etc.) and shows a recovery UI
 * instead of Next's default error page.
 *
 * Required to be a client component per Next App Router docs. Receives the
 * caught Error and a `reset` thunk that retries the segment.
 */
import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface in the browser console so Tahrim can grab the digest when
    // filing a bug — the server-side structured log will have the matching
    // requestId.
    console.error('[admin] error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[color:var(--bd-ink)] px-6 py-16 text-[color:var(--bd-bone)]">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs tracking-widest text-[color:var(--bd-signal)] uppercase">
          / Admin error
        </p>
        <h1 className="font-display mt-4 text-4xl font-bold tracking-tight italic">
          Something broke back here.
        </h1>
        <p className="mt-4 text-[color:var(--bd-bone)]/65">
          The admin page hit an error while loading. Try again, or check the server logs for the
          matching request ID.
        </p>

        {error.digest ? (
          <p className="mt-4 font-mono text-xs text-[color:var(--bd-bone)]/50">
            digest: {error.digest}
          </p>
        ) : null}

        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="focus-bd inline-flex h-12 items-center justify-center rounded-full bg-[color:var(--bd-lime)] px-6 text-sm font-semibold text-[color:var(--bd-ink)] transition-colors hover:bg-[color:var(--bd-bone)]"
          >
            Try again
          </button>
          <a
            href="/admin/login"
            className="focus-bd inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-medium text-[color:var(--bd-bone)] transition-colors hover:border-[color:var(--bd-lime)]/60 hover:text-[color:var(--bd-lime)]"
          >
            Back to login
          </a>
        </div>
      </div>
    </div>
  );
}
