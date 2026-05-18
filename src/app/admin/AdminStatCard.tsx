/**
 * Visual primitives for the admin dashboard. Static SVG over animation —
 * weighty, scannable, dashboard-feel. No external chart library.
 *
 * Exports:
 *   - StatCard   : big italic number + glyph + sparkline + trend delta
 *   - Sparkline  : 30-day line chart as a pure SVG path
 *   - FunnelBar  : single horizontal proportional bar with label + count
 *   - StagePie   : conic-gradient pie for customer stage distribution
 */

type StatCardProps = {
  label: string;
  value: number | string;
  glyph?: string;
  trendPct?: number | null;
  trendCaption?: string;
  series?: { day: string; count: number }[];
  tone?: 'lime' | 'neutral';
};

export function StatCard({
  label,
  value,
  glyph,
  trendPct,
  trendCaption,
  series,
  tone = 'neutral',
}: StatCardProps) {
  const trendUp = trendPct != null && trendPct > 0;
  const trendDown = trendPct != null && trendPct < 0;
  return (
    <div
      className={[
        'relative h-full overflow-hidden rounded-3xl border p-6 transition-colors',
        tone === 'lime'
          ? 'border-[color:var(--bd-lime)]/40 bg-[color:var(--bd-smoke)] hover:border-[color:var(--bd-lime)]/70'
          : 'border-white/8 bg-[color:var(--bd-smoke)] hover:border-[color:var(--bd-lime)]/40',
      ].join(' ')}
    >
      {/* Corner glyph — matches the role-card pattern from /join */}
      {glyph && (
        <span
          aria-hidden
          className="font-display pointer-events-none absolute -top-4 -right-2 text-[7rem] leading-none font-bold text-[color:var(--bd-lime)]/8 italic select-none"
        >
          {glyph}
        </span>
      )}
      <div className="relative">
        <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
          {label}
        </p>
        <p className="font-display mt-3 text-5xl font-extrabold tracking-tight text-[color:var(--bd-bone)] italic">
          {value}
        </p>
        {(trendPct != null || trendCaption) && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            {trendPct != null && (
              <span
                className={[
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase',
                  trendUp
                    ? 'bg-[color:var(--bd-lime)]/15 text-[color:var(--bd-lime)]'
                    : trendDown
                      ? 'bg-[color:var(--bd-signal)]/15 text-[color:var(--bd-signal)]'
                      : 'bg-white/5 text-[color:var(--bd-bone)]/65',
                ].join(' ')}
              >
                <span aria-hidden>{trendUp ? '↑' : trendDown ? '↓' : '·'}</span>
                {Math.abs(trendPct)}%
              </span>
            )}
            {trendCaption && (
              <span className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
                {trendCaption}
              </span>
            )}
          </div>
        )}
        {series && series.length > 0 && (
          <div className="mt-4">
            <Sparkline series={series} />
          </div>
        )}
      </div>
    </div>
  );
}

type SparkProps = {
  series: { day: string; count: number }[];
  width?: number;
  height?: number;
  stroke?: string;
};

export function Sparkline({
  series,
  width = 240,
  height = 44,
  stroke = 'var(--bd-lime)',
}: SparkProps) {
  if (series.length === 0) return null;
  const max = Math.max(1, ...series.map((s) => s.count));
  const stepX = width / Math.max(1, series.length - 1);
  const points = series.map((s, i) => {
    const x = i * stepX;
    const y = height - (s.count / max) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label={`Last ${series.length} days trend`}
    >
      <defs>
        <linearGradient id="sparkfill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkfill)" />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

type FunnelBarProps = {
  label: string;
  count: number;
  // The reference value used to compute the bar width (usually the top of funnel).
  reference: number;
  // The previous stage count, used to compute the step conversion %.
  prev?: number;
};

export function FunnelBar({ label, count, reference, prev }: FunnelBarProps) {
  const pct = reference > 0 ? Math.max(2, Math.round((count / reference) * 100)) : 0;
  const stepPct = prev && prev > 0 ? Math.round((count / prev) * 100) : null;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/70 uppercase">
          {label}
        </span>
        <span className="font-display text-sm font-bold text-[color:var(--bd-bone)] italic">
          {count.toLocaleString()}
          {stepPct != null && (
            <span className="ml-2 font-mono text-[10px] font-normal tracking-widest text-[color:var(--bd-bone)]/45 uppercase">
              {stepPct}% of prev
            </span>
          )}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-[color:var(--bd-lime)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

type StagePieProps = {
  byStage: { PROSPECT: number; ACTIVE: number; DELIVERED: number; CHURNED: number };
};

const STAGE_CONFIG: { key: keyof StagePieProps['byStage']; label: string; color: string }[] = [
  { key: 'PROSPECT', label: 'Prospect', color: '#f59e0b' },
  { key: 'ACTIVE', label: 'Active', color: 'var(--bd-lime)' },
  { key: 'DELIVERED', label: 'Delivered', color: '#a3a3a3' },
  { key: 'CHURNED', label: 'Churned', color: 'var(--bd-signal, #ef4444)' },
];

export function StagePie({ byStage }: StagePieProps) {
  const total = Object.values(byStage).reduce((a, b) => a + b, 0);
  // Build a conic-gradient string. Each stage gets a slice proportional to
  // its share. Falls back to a flat-grey ring if there are no customers yet.
  let cursor = 0;
  const stops: string[] = [];
  if (total === 0) {
    stops.push('rgba(255,255,255,0.06) 0deg 360deg');
  } else {
    for (const s of STAGE_CONFIG) {
      const slice = (byStage[s.key] / total) * 360;
      if (slice <= 0) continue;
      stops.push(`${s.color} ${cursor.toFixed(2)}deg ${(cursor + slice).toFixed(2)}deg`);
      cursor += slice;
    }
  }
  const gradient = `conic-gradient(${stops.join(', ')})`;

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-32 w-32 flex-none">
        <div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ background: gradient }}
        />
        {/* Inner mask = donut */}
        <div aria-hidden className="absolute inset-3 rounded-full bg-[color:var(--bd-smoke)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-3xl font-extrabold text-[color:var(--bd-bone)] italic">
            {total}
          </p>
          <p className="font-mono text-[9px] tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
            Total
          </p>
        </div>
      </div>
      <ul className="grid gap-2">
        {STAGE_CONFIG.map((s) => (
          <li key={s.key} className="flex items-center gap-3 text-sm">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: s.color }}
            />
            <span className="font-mono text-[11px] tracking-widest text-[color:var(--bd-bone)]/70 uppercase">
              {s.label}
            </span>
            <span className="font-display ml-auto text-sm font-bold text-[color:var(--bd-bone)] italic">
              {byStage[s.key]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
