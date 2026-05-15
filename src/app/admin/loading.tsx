/**
 * Admin route loading skeleton. App Router renders this automatically while
 * the parallel Prisma fetches in page.tsx resolve. Keeps Tahrim from staring
 * at a blank screen on first paint or when navigating between admin tabs.
 *
 * Intentionally minimal — admin is internal-only, no Lighthouse target, no
 * fancy shimmer animation needed.
 */
export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[color:var(--bd-ink)] px-6 py-12 text-[color:var(--bd-bone)]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-[color:var(--bd-lime)]" />
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
            Loading admin…
          </p>
        </div>
        <div className="space-y-4">
          <div className="h-12 w-1/3 animate-pulse rounded-md bg-white/5" />
          <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
          <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}
