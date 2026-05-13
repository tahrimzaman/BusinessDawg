/**
 * Pain 01 — A teetering stack of agency decks crowned with a fat dollar sign.
 * Stylized lime/black, no fills outside the two-tone system.
 */
export default function DeckPaperStack({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 480"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="A leaning stack of agency pitch decks"
    >
      {/* base shadow */}
      <ellipse cx="240" cy="430" rx="170" ry="14" fill="rgba(200,255,0,0.18)" />

      {/* deck 1 — bottom, tilted right */}
      <g transform="rotate(-2 240 380)">
        <rect
          x="90"
          y="340"
          width="300"
          height="64"
          fill="#0A0A0A"
          stroke="#C8FF00"
          strokeWidth="3"
        />
        <rect x="110" y="358" width="120" height="6" fill="#C8FF00" />
        <rect x="110" y="372" width="80" height="6" fill="#C8FF00" opacity="0.55" />
      </g>

      {/* deck 2 — middle, tilted left */}
      <g transform="rotate(3 240 290)">
        <rect
          x="100"
          y="250"
          width="280"
          height="64"
          fill="#0A0A0A"
          stroke="#C8FF00"
          strokeWidth="3"
        />
        <rect x="120" y="268" width="140" height="6" fill="#C8FF00" />
        <rect x="120" y="282" width="100" height="6" fill="#C8FF00" opacity="0.55" />
      </g>

      {/* deck 3 — top, leaning further right */}
      <g transform="rotate(-5 240 200)">
        <rect
          x="110"
          y="160"
          width="260"
          height="64"
          fill="#0A0A0A"
          stroke="#C8FF00"
          strokeWidth="3"
        />
        <rect x="130" y="178" width="100" height="6" fill="#C8FF00" />
        <rect x="130" y="192" width="60" height="6" fill="#C8FF00" opacity="0.55" />
      </g>

      {/* dollar sign on top */}
      <g transform="translate(190 40) rotate(-8)">
        <text
          x="0"
          y="80"
          fill="#C8FF00"
          fontSize="110"
          fontWeight="900"
          fontStyle="italic"
          fontFamily="Geist, sans-serif"
        >
          $
        </text>
      </g>

      {/* sweat-drop motion marks */}
      <g fill="#C8FF00" opacity="0.65">
        <circle cx="60" cy="120" r="4" />
        <circle cx="42" cy="160" r="3" />
        <circle cx="420" cy="100" r="4" />
        <circle cx="442" cy="140" r="3" />
      </g>
    </svg>
  );
}
