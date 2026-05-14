/**
 * Talkers/Shippers 02 — Drake-style split.
 * Top: a 4-cell Q1-Q4 calendar of empty quarters (dimmed).
 * Bottom: a terminal pushing real releases (lime).
 */
export default function RoadmapsVsReleases({ className = '' }: { className?: string }) {
  const muted = 'rgba(250,250,250,0.42)';
  return (
    <svg
      viewBox="0 0 480 480"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="An empty quarterly roadmap above a terminal shipping releases"
    >
      <g opacity="0.9">
        <g>
          <rect
            x="90"
            y="60"
            width="76"
            height="68"
            fill="#0A0A0A"
            stroke={muted}
            strokeWidth="2.5"
          />
          <text
            x="128"
            y="76"
            fill={muted}
            fontSize="10"
            fontFamily="Geist Mono, ui-monospace"
            letterSpacing="2"
            textAnchor="middle"
          >
            Q1
          </text>
          <rect x="102" y="92" width="52" height="4" fill={muted} opacity="0.6" />
          <rect x="102" y="104" width="36" height="4" fill={muted} opacity="0.5" />
        </g>
        <g>
          <rect
            x="178"
            y="60"
            width="76"
            height="68"
            fill="#0A0A0A"
            stroke={muted}
            strokeWidth="2.5"
          />
          <text
            x="216"
            y="76"
            fill={muted}
            fontSize="10"
            fontFamily="Geist Mono, ui-monospace"
            letterSpacing="2"
            textAnchor="middle"
          >
            Q2
          </text>
          <rect x="190" y="92" width="52" height="4" fill={muted} opacity="0.5" />
        </g>
        <g>
          <rect
            x="266"
            y="60"
            width="76"
            height="68"
            fill="#0A0A0A"
            stroke={muted}
            strokeWidth="2.5"
          />
          <text
            x="304"
            y="76"
            fill={muted}
            fontSize="10"
            fontFamily="Geist Mono, ui-monospace"
            letterSpacing="2"
            textAnchor="middle"
          >
            Q3
          </text>
          <text
            x="304"
            y="110"
            fill={muted}
            fontSize="22"
            fontWeight="700"
            fontFamily="Geist, sans-serif"
            textAnchor="middle"
          >
            ?
          </text>
        </g>
        <g>
          <rect
            x="354"
            y="60"
            width="76"
            height="68"
            fill="#0A0A0A"
            stroke={muted}
            strokeWidth="2.5"
          />
          <text
            x="392"
            y="76"
            fill={muted}
            fontSize="10"
            fontFamily="Geist Mono, ui-monospace"
            letterSpacing="2"
            textAnchor="middle"
          >
            Q4
          </text>
          <text
            x="392"
            y="110"
            fill={muted}
            fontSize="22"
            fontWeight="700"
            fontFamily="Geist, sans-serif"
            textAnchor="middle"
          >
            ?
          </text>
        </g>
        <rect
          x="90"
          y="148"
          width="340"
          height="48"
          fill="none"
          stroke={muted}
          strokeWidth="2"
          strokeDasharray="4 6"
          opacity="0.7"
        />
        <text
          x="260"
          y="178"
          fill={muted}
          fontSize="13"
          fontFamily="Geist Mono, ui-monospace"
          letterSpacing="2"
          textAnchor="middle"
        >
          ROADMAP 2026
        </text>
        <text
          x="430"
          y="50"
          fill={muted}
          fontSize="11"
          fontFamily="Geist Mono, ui-monospace"
          letterSpacing="2"
          textAnchor="end"
        >
          × TALKER
        </text>
      </g>

      <line
        x1="60"
        y1="240"
        x2="420"
        y2="240"
        stroke="#C8FF00"
        strokeWidth="1"
        strokeDasharray="3 6"
        opacity="0.4"
      />

      <g>
        <rect
          x="80"
          y="270"
          width="320"
          height="170"
          fill="#0A0A0A"
          stroke="#C8FF00"
          strokeWidth="3"
          rx="6"
        />
        <rect
          x="80"
          y="270"
          width="320"
          height="22"
          fill="#0A0A0A"
          stroke="#C8FF00"
          strokeWidth="3"
        />
        <circle cx="95" cy="281" r="3.5" fill="#C8FF00" />
        <circle cx="108" cy="281" r="3.5" fill="#C8FF00" opacity="0.6" />
        <circle cx="121" cy="281" r="3.5" fill="#C8FF00" opacity="0.3" />
        <text
          x="240"
          y="287"
          fill="#C8FF00"
          fontSize="10"
          fontFamily="Geist Mono, ui-monospace"
          letterSpacing="2"
          textAnchor="middle"
          opacity="0.7"
        >
          ~/businessdawg
        </text>

        <text
          x="98"
          y="318"
          fill="#C8FF00"
          fontSize="13"
          fontFamily="Geist Mono, ui-monospace"
          letterSpacing="1"
        >
          &gt; git push origin main
        </text>
        <text
          x="98"
          y="346"
          fill="#C8FF00"
          fontSize="13"
          fontFamily="Geist Mono, ui-monospace"
          letterSpacing="1"
        >
          &gt; deploy v0.4
        </text>
        <text
          x="98"
          y="374"
          fill="#C8FF00"
          fontSize="13"
          fontFamily="Geist Mono, ui-monospace"
          letterSpacing="1"
          opacity="0.85"
        >
          &gt; live ✓
        </text>
        <rect x="98" y="394" width="10" height="14" fill="#C8FF00" />
        <text
          x="430"
          y="260"
          fill="#C8FF00"
          fontSize="11"
          fontFamily="Geist Mono, ui-monospace"
          letterSpacing="2"
          textAnchor="end"
        >
          ✓ SHIPPER
        </text>
      </g>
    </svg>
  );
}
