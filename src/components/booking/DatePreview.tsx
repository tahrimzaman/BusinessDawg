'use client';

/**
 * Live preview card under the date grid — shows the hovered/selected day's
 * weekday + date in big type with a small tear-off calendar SVG. Falls back
 * to a "Pick a day →" placeholder when nothing is hovered or selected.
 */

type Props = {
  date: string | null; // 'YYYY-MM-DD' in visitor tz
};

export default function DatePreview({ date }: Props) {
  if (!date) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[color:var(--bd-ink)] p-4">
        <CalendarPage day={null} monthShort={undefined} muted />
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/40 uppercase">
            / Preview
          </p>
          <p className="font-display mt-1 text-lg font-bold text-[color:var(--bd-bone)]/50 italic">
            Pick a day →
          </p>
        </div>
      </div>
    );
  }

  const [y, m, d] = date.split('-').map(Number);
  const dateObj = new Date(y, (m ?? 1) - 1, d ?? 1);
  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const monthLong = dateObj.toLocaleDateString('en-US', { month: 'long' });
  const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[color:var(--bd-lime)]/25 bg-[color:var(--bd-ink)] p-4">
      <CalendarPage day={day} monthShort={monthShort} muted={false} />
      <div className="min-w-0">
        <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-lime)] uppercase">
          / Preview
        </p>
        <p className="font-display mt-1 truncate text-xl font-bold text-[color:var(--bd-bone)] italic sm:text-2xl">
          {weekday}
        </p>
        <p className="text-xs text-[color:var(--bd-bone)]/65 sm:text-sm">
          {monthLong} {day}, {year}
        </p>
      </div>
    </div>
  );
}

function CalendarPage({
  day,
  monthShort,
  muted,
}: {
  day: number | null;
  monthShort: string | undefined;
  muted: boolean;
}) {
  const accent = muted ? 'var(--bd-bone)' : 'var(--bd-lime)';
  const accentOpacity = muted ? 0.35 : 1;
  return (
    <svg
      viewBox="0 0 80 96"
      className="h-20 w-16 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Page body */}
      <rect
        x="6"
        y="14"
        width="68"
        height="78"
        rx="6"
        fill="var(--bd-smoke)"
        stroke={accent}
        strokeOpacity={accentOpacity}
        strokeWidth="1.5"
      />
      {/* Top band */}
      <path
        d="M 6 20 a 6 6 0 0 1 6 -6 h 56 a 6 6 0 0 1 6 6 v 12 h -68 z"
        fill={accent}
        opacity={accentOpacity}
      />
      {/* Binding rings */}
      <line
        x1="22"
        y1="8"
        x2="22"
        y2="18"
        stroke={accent}
        strokeOpacity={accentOpacity}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="58"
        y1="8"
        x2="58"
        y2="18"
        stroke={accent}
        strokeOpacity={accentOpacity}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Month abbreviation */}
      <text
        x="40"
        y="27"
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="800"
        fill="var(--bd-ink)"
        fontFamily="Geist, sans-serif"
        letterSpacing="1"
      >
        {monthShort ? monthShort.toUpperCase() : '--'}
      </text>
      {/* Day number */}
      <text
        x="40"
        y="72"
        textAnchor="middle"
        fontSize="28"
        fontWeight="800"
        fontStyle="italic"
        fill={muted ? 'var(--bd-bone)' : 'var(--bd-bone)'}
        opacity={muted ? 0.4 : 1}
        fontFamily="Geist, sans-serif"
      >
        {day ?? '?'}
      </text>
    </svg>
  );
}
