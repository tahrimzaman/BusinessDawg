/**
 * Talkers/Shippers 05 — Drake-style split.
 * Top: an empty stakeholder conference table (dimmed).
 * Bottom: a revenue up-arrow over a row of customer heads (lime). No $ amounts.
 */
export default function StakeholdersVsRevenue({ className = '' }: { className?: string }) {
  const muted = 'rgba(250,250,250,0.42)';
  return (
    <svg
      viewBox="0 0 480 480"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="An empty stakeholder meeting table above a row of paying customers"
    >
      <g opacity="0.9">
        <ellipse
          cx="240"
          cy="140"
          rx="148"
          ry="56"
          fill="#0A0A0A"
          stroke={muted}
          strokeWidth="2.5"
        />
        <ellipse
          cx="240"
          cy="140"
          rx="110"
          ry="34"
          fill="none"
          stroke={muted}
          strokeWidth="1"
          opacity="0.5"
        />

        <g fill="#0A0A0A" stroke={muted} strokeWidth="2">
          <rect x="225" y="60" width="30" height="22" rx="3" />
          <rect x="100" y="120" width="22" height="30" rx="3" />
          <rect x="358" y="120" width="22" height="30" rx="3" />
          <rect x="160" y="186" width="30" height="22" rx="3" />
          <rect x="290" y="186" width="30" height="22" rx="3" />
        </g>

        <g fill={muted}>
          <circle cx="240" cy="46" r="6" />
          <circle cx="90" cy="135" r="6" />
          <circle cx="390" cy="135" r="6" />
          <circle cx="175" cy="220" r="6" />
          <circle cx="305" cy="220" r="6" />
        </g>

        <text
          x="240"
          y="146"
          fill={muted}
          fontSize="10"
          fontFamily="Geist Mono, ui-monospace"
          letterSpacing="2"
          textAnchor="middle"
        >
          STAKEHOLDER SYNC
        </text>
        <text
          x="430"
          y="34"
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
        y1="252"
        x2="420"
        y2="252"
        stroke="#C8FF00"
        strokeWidth="1"
        strokeDasharray="3 6"
        opacity="0.4"
      />

      <g>
        <line x1="240" y1="430" x2="240" y2="300" stroke="#C8FF00" strokeWidth="6" />
        <polygon points="218,310 240,278 262,310" fill="#C8FF00" />

        <line x1="80" y1="430" x2="400" y2="430" stroke="#C8FF00" strokeWidth="1" opacity="0.4" />

        <g transform="translate(120 415)">
          <circle cx="0" cy="-10" r="14" fill="#0A0A0A" stroke="#C8FF00" strokeWidth="2.5" />
          <path
            d="M -16 14 Q -16 -2 0 -2 Q 16 -2 16 14 Z"
            fill="#0A0A0A"
            stroke="#C8FF00"
            strokeWidth="2.5"
          />
        </g>
        <g transform="translate(200 415)">
          <circle cx="0" cy="-10" r="14" fill="#0A0A0A" stroke="#C8FF00" strokeWidth="2.5" />
          <path
            d="M -16 14 Q -16 -2 0 -2 Q 16 -2 16 14 Z"
            fill="#0A0A0A"
            stroke="#C8FF00"
            strokeWidth="2.5"
          />
        </g>
        <g transform="translate(280 415)">
          <circle cx="0" cy="-10" r="14" fill="#0A0A0A" stroke="#C8FF00" strokeWidth="2.5" />
          <path
            d="M -16 14 Q -16 -2 0 -2 Q 16 -2 16 14 Z"
            fill="#0A0A0A"
            stroke="#C8FF00"
            strokeWidth="2.5"
          />
        </g>
        <g transform="translate(360 415)">
          <circle cx="0" cy="-10" r="14" fill="#0A0A0A" stroke="#C8FF00" strokeWidth="2.5" />
          <path
            d="M -16 14 Q -16 -2 0 -2 Q 16 -2 16 14 Z"
            fill="#0A0A0A"
            stroke="#C8FF00"
            strokeWidth="2.5"
          />
        </g>

        <g transform="translate(330 280)">
          <rect x="0" y="0" width="78" height="30" fill="#C8FF00" rx="15" />
          <text
            x="39"
            y="20"
            fill="#0A0A0A"
            fontSize="13"
            fontWeight="800"
            fontStyle="italic"
            fontFamily="Geist, sans-serif"
            textAnchor="middle"
          >
            + REV
          </text>
        </g>

        <text
          x="430"
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
