'use client';

/**
 * Admin Traffic tab — reads anonymous visitor data from PostHog HogQL.
 *
 * All data is fetched server-side in `AdminTrafficData` (the wrapping server
 * component below) and passed in as props. The window toggle re-fetches by
 * calling `/api/admin/traffic?window=<w>` which proxies to the same helpers.
 *
 * Renders the "Wire your PostHog read-key" CTA if `configured` is false.
 */

import { useState } from 'react';
import { FunnelBar, Sparkline, StatCard } from './AdminStatCard';

export type TrafficWindow = 'today' | '30d' | 'all';

export type TrafficData = {
  configured: boolean;
  window: TrafficWindow;
  pageviews: number;
  uniqueVisitors: number;
  sessions: number;
  pageviewsByDay: { day: string; count: number }[];
  topPages: { path: string; count: number }[];
  topClicks: { label: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  topUtm: { source: string; count: number }[];
  funnel: {
    visitedSite: number;
    visitedAbout: number;
    visitedJoin: number;
    visitedContact: number;
    clickedBook: number;
  };
  recentVisitors: RecentVisitor[];
};

export type RecentVisitor = {
  timestamp: string;
  distinctId: string;
  city: string | null;
  country: string | null;
  countryCode: string | null;
  os: string | null;
  browser: string | null;
  device: string | null;
  referrer: string | null;
  landingPath: string | null;
  pageviews: number;
};

export default function AdminTrafficTab({ initial }: { initial: TrafficData }) {
  const [data, setData] = useState<TrafficData>(initial);
  const [loading, setLoading] = useState(false);
  const window = data.window;

  // Event-driven fetch — React 19 lint forbids setState inside effects, so
  // the toggle re-fetches inline on click. The button click is a real user
  // interaction so there's no race vs an effect cleanup either.
  async function switchWindow(next: TrafficWindow) {
    if (next === data.window || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/traffic?window=${next}`);
      const d = (await res.json()) as TrafficData;
      setData(d);
    } catch {
      // Leave the previous window's data on-screen if the fetch fails —
      // better than wiping the dashboard for a transient error.
    } finally {
      setLoading(false);
    }
  }

  if (!data.configured) {
    return <UnconfiguredCTA />;
  }

  return (
    <div className="space-y-6">
      {/* Window toggle */}
      <div className="flex flex-wrap items-center gap-2">
        {(['today', '30d', 'all'] as const).map((w) => (
          <button
            key={w}
            onClick={() => void switchWindow(w)}
            className={`rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors ${
              window === w
                ? 'border-[color:var(--bd-lime)] bg-[color:var(--bd-lime)]/10 text-[color:var(--bd-lime)]'
                : 'border-white/10 text-[color:var(--bd-bone)]/65 hover:border-[color:var(--bd-lime)]/40'
            }`}
          >
            {w === 'today' ? 'Today' : w === '30d' ? 'Last 30 days' : 'All time'}
          </button>
        ))}
        {loading && (
          <span className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
            Loading…
          </span>
        )}
      </div>

      {/* Volume overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Pageviews"
          value={fmtNum(data.pageviews)}
          glyph="◉"
          series={data.pageviewsByDay}
          tone="lime"
        />
        <StatCard label="Unique visitors" value={fmtNum(data.uniqueVisitors)} glyph="●" />
        <StatCard label="Sessions" value={fmtNum(data.sessions)} glyph="◇" />
      </div>

      {/* Funnel */}
      <Section title="Conversion funnel">
        <div className="space-y-3">
          <FunnelBar
            label="Visited site"
            count={data.funnel.visitedSite}
            reference={data.funnel.visitedSite}
          />
          <FunnelBar
            label="Visited About"
            count={data.funnel.visitedAbout}
            reference={data.funnel.visitedSite}
            prev={data.funnel.visitedSite}
          />
          <FunnelBar
            label="Visited Join"
            count={data.funnel.visitedJoin}
            reference={data.funnel.visitedSite}
            prev={data.funnel.visitedSite}
          />
          <FunnelBar
            label="Visited Contact"
            count={data.funnel.visitedContact}
            reference={data.funnel.visitedSite}
            prev={data.funnel.visitedSite}
          />
          <FunnelBar
            label="Clicked Book a Call"
            count={data.funnel.clickedBook}
            reference={data.funnel.visitedSite}
            prev={data.funnel.visitedContact}
          />
        </div>
      </Section>

      {/* Top breakdowns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Top pages">
          <BarList items={data.topPages.map((p) => ({ label: p.path, count: p.count }))} />
        </Section>
        <Section title="Top clicks">
          <BarList items={data.topClicks.map((c) => ({ label: c.label, count: c.count }))} />
        </Section>
        <Section title="Top referrers">
          <BarList items={data.topReferrers.map((r) => ({ label: r.referrer, count: r.count }))} />
        </Section>
        <Section title="Top UTM sources">
          <BarList items={data.topUtm.map((u) => ({ label: u.source, count: u.count }))} />
        </Section>
      </div>

      {/* Sparkline standalone — bigger view of the daily pageviews shape */}
      <Section title="Pageviews by day">
        {data.pageviewsByDay.length === 0 ? (
          <Empty>No pageview data yet.</Empty>
        ) : (
          <div className="px-2">
            <Sparkline series={data.pageviewsByDay} height={120} />
          </div>
        )}
      </Section>

      {/* Visitor table */}
      <Section title={`Recent visitors · ${data.recentVisitors.length}`}>
        {data.recentVisitors.length === 0 ? (
          <Empty>No visitor data yet — events take a few minutes to ingest.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/8 bg-black/20 text-left font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3">Browser / OS</th>
                  <th className="px-4 py-3">Landing</th>
                  <th className="px-4 py-3">Referrer</th>
                  <th className="px-4 py-3 text-right">Views</th>
                </tr>
              </thead>
              <tbody>
                {data.recentVisitors.map((v) => (
                  <tr
                    key={v.distinctId}
                    className="border-b border-white/5 align-top last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[color:var(--bd-bone)]/60">
                      {fmtRelative(v.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      {v.countryCode && (
                        <span className="mr-1.5" aria-hidden>
                          {flagEmoji(v.countryCode)}
                        </span>
                      )}
                      {[v.city, v.country].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-[color:var(--bd-bone)]/70">{v.device || '—'}</td>
                    <td className="px-4 py-3 text-[color:var(--bd-bone)]/70">
                      {[v.browser, v.os].filter(Boolean).join(' / ') || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[color:var(--bd-bone)]/70">
                      {v.landingPath || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[color:var(--bd-bone)]/60">
                      {v.referrer || 'direct'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{v.pageviews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}

function UnconfiguredCTA() {
  return (
    <div className="rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-10 text-center">
      <p className="font-display text-2xl font-bold text-[color:var(--bd-bone)] italic">
        PostHog read-key not configured
      </p>
      <p className="mx-auto mt-3 max-w-xl text-sm text-[color:var(--bd-bone)]/65">
        Traffic analytics pull from PostHog. Add{' '}
        <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs">
          POSTHOG_PERSONAL_API_KEY
        </code>{' '}
        and{' '}
        <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs">
          POSTHOG_PROJECT_ID
        </code>{' '}
        to your environment. The key needs the{' '}
        <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs">query:read</code>{' '}
        scope only.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-6">
      <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function BarList({ items }: { items: { label: string; count: number }[] }) {
  if (!items.length) return <Empty>No data.</Empty>;
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="space-y-2">
      {items.map((it) => {
        const pct = Math.max(3, Math.round((it.count / max) * 100));
        return (
          <li
            key={it.label}
            className="relative overflow-hidden rounded-xl bg-white/[0.03] px-3 py-2"
          >
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 bg-[color:var(--bd-lime)]/10"
              style={{ width: `${pct}%` }}
            />
            <div className="relative flex items-center justify-between gap-3 text-xs">
              <span className="truncate font-mono text-[color:var(--bd-bone)]/80">{it.label}</span>
              <span className="font-mono text-[color:var(--bd-bone)] tabular-nums">
                {fmtNum(it.count)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-2 py-6 text-center text-sm text-[color:var(--bd-bone)]/55">{children}</p>;
}

function fmtNum(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString('en-US');
}

function fmtRelative(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '—';
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

function flagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '';
  const cc = countryCode.toUpperCase();
  const A = 0x1f1e6;
  return String.fromCodePoint(A + cc.charCodeAt(0) - 65, A + cc.charCodeAt(1) - 65);
}
