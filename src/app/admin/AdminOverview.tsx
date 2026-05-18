'use client';

/**
 * Overview tab — the default landing for /admin. Stat cards, funnel,
 * customer-stage pie, recent activity feed, top subscriber sources.
 *
 * Server stats are computed in `src/lib/admin/stats.ts` and passed in
 * via the parent `AdminClient`. Pure presentation here — no fetch logic.
 */

import type { DashboardStats } from '@/lib/admin/stats';
import { FunnelBar, StagePie, StatCard } from './AdminStatCard';

const ACTIVITY_GLYPH: Record<DashboardStats['activity'][number]['type'], string> = {
  booking_created: '◑',
  booking_status: '↻',
  customer_promoted: '★',
  application_received: '⌥',
  subscriber_joined: '✉',
  chat_turn: '💬',
};

const RELATIVE_FMT = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.round(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return RELATIVE_FMT.format(-min, 'minute');
  const hr = Math.round(min / 60);
  if (hr < 24) return RELATIVE_FMT.format(-hr, 'hour');
  const day = Math.round(hr / 24);
  if (day < 30) return RELATIVE_FMT.format(-day, 'day');
  const mo = Math.round(day / 30);
  return RELATIVE_FMT.format(-mo, 'month');
}

export default function AdminOverview({ stats }: { stats: DashboardStats }) {
  const trendCaption = `vs prior ${stats.windowDays}d`;
  const funnelRef = Math.max(1, ...stats.funnel.map((f) => f.count));

  return (
    <div className="grid gap-6">
      {/* KPI ROW — 6 stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label={`Bookings · last ${stats.windowDays}d`}
          value={stats.bookings.current.toLocaleString()}
          glyph="◑"
          trendPct={stats.bookings.trendPct}
          trendCaption={trendCaption}
          series={stats.bookings.series}
          tone="lime"
        />
        <StatCard
          label="Customers"
          value={stats.customers.total.toLocaleString()}
          glyph="★"
          trendCaption={`${stats.customers.byStage.ACTIVE} active · ${stats.customers.byStage.PROSPECT} prospect`}
        />
        <StatCard
          label={`Subscribers · last ${stats.windowDays}d`}
          value={stats.subscribers.current.toLocaleString()}
          glyph="✉"
          trendPct={stats.subscribers.trendPct}
          trendCaption={trendCaption}
          series={stats.subscribers.series}
        />
        <StatCard
          label={`Applications · last ${stats.windowDays}d`}
          value={stats.applications.current.toLocaleString()}
          glyph="⌥"
          trendPct={stats.applications.trendPct}
          trendCaption={trendCaption}
        />
        <StatCard
          label={`Chat turns · last ${stats.windowDays}d`}
          value={stats.chat.current.toLocaleString()}
          glyph="◆"
          trendPct={stats.chat.trendPct}
          trendCaption={`${stats.chat.uniqueIps} unique visitors`}
        />
        <StatCard
          label="Booking show rate"
          value={stats.bookingHealth.showRate != null ? `${stats.bookingHealth.showRate}%` : '—'}
          glyph="↗"
          trendCaption={
            stats.bookingHealth.completed + stats.bookingHealth.noShow > 0
              ? `${stats.bookingHealth.completed} done · ${stats.bookingHealth.noShow} no-show`
              : 'No completed calls yet'
          }
        />
      </div>

      {/* FUNNEL + CUSTOMER PIE */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-6 md:p-7">
          <div className="mb-5 flex items-baseline justify-between">
            <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
              / Funnel · last {stats.windowDays}d
            </p>
            <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/40 uppercase">
              Top to revenue
            </p>
          </div>
          <div className="grid gap-4">
            {stats.funnel.map((f, i) => (
              <FunnelBar
                key={f.label}
                label={f.label}
                count={f.count}
                reference={funnelRef}
                prev={i === 0 ? undefined : stats.funnel[i - 1].count}
              />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-6 md:p-7">
          <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
            / Customer pipeline
          </p>
          <div className="mt-6">
            <StagePie byStage={stats.customers.byStage} />
          </div>
        </div>
      </div>

      {/* ACTIVITY FEED + TOP SOURCES */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-6 md:p-7">
          <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
            / Recent activity
          </p>
          {stats.activity.length === 0 ? (
            <p className="mt-6 text-sm text-[color:var(--bd-bone)]/55">
              No activity yet. As bookings, applications, and chats roll in, they&rsquo;ll show up
              here.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-white/5">
              {stats.activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 py-3">
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full border border-[color:var(--bd-lime)]/30 bg-[color:var(--bd-lime)]/10 font-mono text-xs text-[color:var(--bd-lime)]"
                  >
                    {ACTIVITY_GLYPH[a.type]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[color:var(--bd-bone)]/85">{a.summary}</p>
                    <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/45 uppercase">
                      {relativeTime(a.at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-6 md:p-7">
          <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
            / Subscriber sources · all time
          </p>
          {stats.subscribers.topSources.length === 0 ? (
            <p className="mt-6 text-sm text-[color:var(--bd-bone)]/55">No subscribers yet.</p>
          ) : (
            <ul className="mt-5 grid gap-3">
              {stats.subscribers.topSources.map((s) => {
                const max = Math.max(...stats.subscribers.topSources.map((x) => x.count));
                const pct = max > 0 ? Math.max(4, Math.round((s.count / max) * 100)) : 0;
                return (
                  <li key={s.source}>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="font-mono text-[11px] tracking-widest text-[color:var(--bd-bone)]/70 uppercase">
                        {s.source}
                      </span>
                      <span className="font-display text-sm font-bold text-[color:var(--bd-bone)] italic">
                        {s.count}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-[color:var(--bd-lime)]/70"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
