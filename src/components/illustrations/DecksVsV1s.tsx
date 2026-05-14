/**
 * Talkers/Shippers 01 — Drake-style split.
 * Top: a tilted stack of slide decks (dimmed).
 * Bottom: a browser window pushing a working v1 (lime).
 */
export default function DecksVsV1s({ className = '' }: { className?: string }) {
  const muted = 'rgba(250,250,250,0.42)';
  return (
    <svg
      viewBox="0 0 480 480"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Three pitch decks above a working browser deploying a v1"
    >
      <g opacity="0.85">
        <g transform="rotate(-3 240 80)">
          <rect
            x="110"
            y="60"
            width="260"
            height="42"
            fill="#0A0A0A"
            stroke={muted}
            strokeWidth="2.5"
          />
          <rect x="124" y="74" width="120" height="5" fill={muted} />
          <rect x="124" y="86" width="78" height="5" fill={muted} opacity="0.6" />
        </g>
        <g transform="rotate(4 240 130)">
          <rect
            x="120"
            y="116"
            width="240"
            height="42"
            fill="#0A0A0A"
            stroke={muted}
            strokeWidth="2.5"
          />
          <rect x="134" y="130" width="100" height="5" fill={muted} />
          <rect x="134" y="142" width="60" height="5" fill={muted} opacity="0.6" />
        </g>
        <g transform="rotate(-2 240 180)">
          <rect
            x="130"
            y="170"
            width="220"
            height="42"
            fill="#0A0A0A"
            stroke={muted}
            strokeWidth="2.5"
          />
          <rect x="144" y="184" width="90" height="5" fill={muted} />
          <rect x="144" y="196" width="50" height="5" fill={muted} opacity="0.6" />
        </g>
        <text
          x="380"
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
          y="280"
          width="320"
          height="160"
          fill="#0A0A0A"
          stroke="#C8FF00"
          strokeWidth="3"
          rx="8"
        />
        <circle cx="100" cy="298" r="4" fill="#C8FF00" />
        <circle cx="116" cy="298" r="4" fill="#C8FF00" opacity="0.6" />
        <circle cx="132" cy="298" r="4" fill="#C8FF00" opacity="0.3" />
        <rect
          x="156"
          y="290"
          width="220"
          height="16"
          fill="none"
          stroke="#C8FF00"
          strokeWidth="1.5"
          opacity="0.6"
          rx="3"
        />
        <rect x="100" y="324" width="180" height="6" fill="#C8FF00" />
        <rect x="100" y="338" width="120" height="6" fill="#C8FF00" opacity="0.7" />
        <rect x="100" y="352" width="200" height="6" fill="#C8FF00" opacity="0.5" />
        <rect x="100" y="366" width="90" height="6" fill="#C8FF00" opacity="0.7" />
        <g>
          <rect x="280" y="392" width="100" height="32" fill="#C8FF00" rx="16" />
          <text
            x="330"
            y="413"
            fill="#0A0A0A"
            fontSize="13"
            fontWeight="800"
            fontStyle="italic"
            fontFamily="Geist, sans-serif"
            textAnchor="middle"
          >
            ▶ DEPLOY
          </text>
        </g>
        <text
          x="380"
          y="270"
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
