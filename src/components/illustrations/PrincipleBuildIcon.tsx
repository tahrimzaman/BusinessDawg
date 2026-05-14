/**
 * Principle 01 — "We don't consult. We build."
 * A browser window pushing a v1, with a tiny "× NO DECKS" stamp.
 */
export default function PrincipleBuildIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="A browser window deploying a v1"
    >
      {/* Browser frame */}
      <rect
        x="22"
        y="46"
        width="196"
        height="130"
        rx="10"
        fill="#0A0A0A"
        stroke="#C8FF00"
        strokeWidth="2.5"
      />
      {/* Title bar separator */}
      <line x1="22" y1="68" x2="218" y2="68" stroke="#C8FF00" strokeWidth="1.5" opacity="0.6" />
      {/* Traffic-light dots */}
      <circle cx="36" cy="57" r="3" fill="#C8FF00" />
      <circle cx="48" cy="57" r="3" fill="#C8FF00" opacity="0.6" />
      <circle cx="60" cy="57" r="3" fill="#C8FF00" opacity="0.3" />
      {/* Address bar */}
      <rect
        x="76"
        y="51"
        width="130"
        height="12"
        rx="3"
        fill="none"
        stroke="#C8FF00"
        strokeWidth="1.2"
        opacity="0.55"
      />
      {/* Code-line rects (decreasing widths) */}
      <rect x="36" y="84" width="124" height="6" rx="1" fill="#C8FF00" />
      <rect x="36" y="98" width="84" height="6" rx="1" fill="#C8FF00" opacity="0.7" />
      <rect x="36" y="112" width="140" height="6" rx="1" fill="#C8FF00" opacity="0.55" />
      <rect x="36" y="126" width="62" height="6" rx="1" fill="#C8FF00" opacity="0.7" />
      {/* DEPLOY pill button */}
      <rect x="138" y="146" width="66" height="22" rx="11" fill="#C8FF00" />
      <text
        x="171"
        y="161"
        fill="#0A0A0A"
        fontSize="10"
        fontWeight="800"
        fontStyle="italic"
        fontFamily="Geist, sans-serif"
        textAnchor="middle"
      >
        ▶ DEPLOY
      </text>
      {/* × NO DECKS stamp */}
      <g transform="rotate(-8 168 200)">
        <rect
          x="138"
          y="190"
          width="74"
          height="20"
          rx="3"
          fill="#0A0A0A"
          stroke="#C8FF00"
          strokeWidth="1.5"
        />
        <text
          x="175"
          y="204"
          fill="#C8FF00"
          fontSize="9"
          fontFamily="Geist Mono, ui-monospace"
          letterSpacing="2"
          textAnchor="middle"
        >
          × NO DECKS
        </text>
      </g>
    </svg>
  );
}
