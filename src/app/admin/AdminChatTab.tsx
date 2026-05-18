'use client';

/**
 * Chat tab — browse the ChatLog audit table. Top stat row + recent
 * questions list. No mutations; this is read-only intelligence.
 *
 * Use cases:
 *   - See what visitors are actually asking (FAQ pipeline)
 *   - Audit for jailbreak attempts (correlated with ipHash)
 *   - Spot conversion opportunities (questions that mention pricing,
 *     timelines, specific services)
 */

import { useEffect, useMemo, useState } from 'react';
import { StatCard } from './AdminStatCard';

export type ChatLogRow = {
  id: string;
  ipHash: string | null;
  model: string;
  historyLen: number;
  totalChars: number;
  lastUserMessage: string;
  createdAt: string;
};

const DAY_MS = 86_400_000;
const TS_FMT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export default function AdminChatTab({ rows }: { rows: ChatLogRow[] }) {
  const [query, setQuery] = useState('');
  // `now` lives in state with a lazy initializer so the bucket counters
  // don't churn on every render and we don't violate react-hooks/purity by
  // calling Date.now() during render. A 1-min interval keeps "today" honest
  // if the tab is left open across midnight.
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    let today = 0;
    let week = 0;
    let month = 0;
    const ips = new Set<string>();
    let charsSum = 0;
    for (const r of rows) {
      const t = new Date(r.createdAt).getTime();
      const age = now - t;
      if (age < DAY_MS) today++;
      if (age < 7 * DAY_MS) week++;
      if (age < 30 * DAY_MS) month++;
      if (r.ipHash) ips.add(r.ipHash);
      charsSum += r.totalChars;
    }
    return {
      today,
      week,
      month,
      uniqueIps: ips.size,
      avgChars: rows.length > 0 ? Math.round(charsSum / rows.length) : 0,
    };
  }, [rows, now]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.lastUserMessage.toLowerCase().includes(q) ||
        r.model.toLowerCase().includes(q) ||
        (r.ipHash ?? '').toLowerCase().includes(q),
    );
  }, [rows, query]);

  return (
    <div className="grid gap-6">
      {/* Stat row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Chats · today"
          value={stats.today.toLocaleString()}
          glyph="💬"
          tone="lime"
        />
        <StatCard label="Chats · last 7d" value={stats.week.toLocaleString()} glyph="◐" />
        <StatCard
          label="Chats · last 30d"
          value={stats.month.toLocaleString()}
          glyph="◆"
          trendCaption={`${stats.uniqueIps} unique visitors`}
        />
        <StatCard
          label="Avg message size"
          value={`${stats.avgChars}c`}
          glyph="⌥"
          trendCaption={`${rows.length} total turns stored`}
        />
      </div>

      {/* Search bar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search messages, model, IP hash…"
          className="h-10 w-full max-w-md rounded-full border border-white/10 bg-[color:var(--bd-smoke)] px-4 text-sm focus:border-[color:var(--bd-lime)] focus:outline-none"
        />
        <p className="text-xs text-[color:var(--bd-bone)]/55">
          {filtered.length} of {rows.length} turn{rows.length === 1 ? '' : 's'}
        </p>
      </div>

      {/* Recent messages */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)]">
        {filtered.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-[color:var(--bd-bone)]/65">
            {rows.length === 0
              ? 'No chat turns yet. The chatbot writes a row per visitor message — try it from the homepage.'
              : 'No turns match.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/8 bg-black/20 text-left font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Turns</th>
                  <th className="px-4 py-3">Visitor</th>
                  <th className="px-4 py-3">Model</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-white/5 align-top last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[color:var(--bd-bone)]/65">
                      {TS_FMT.format(new Date(r.createdAt))}
                    </td>
                    <td className="max-w-xl px-4 py-3">
                      <p className="line-clamp-3 whitespace-pre-wrap text-[color:var(--bd-bone)]/85">
                        {r.lastUserMessage}
                      </p>
                      <p className="mt-1 font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/45 uppercase">
                        {r.totalChars}c
                      </p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[color:var(--bd-bone)]/70">
                      {r.historyLen}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
                      {r.ipHash ? r.ipHash.slice(0, 10) + '…' : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
                      {r.model}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
