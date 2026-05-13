/**
 * Pain 02 — A "growth hacker" silhouette with sunglasses, hood, and rising
 * trail-lines pretending to be charts. The chart bars are decoupled from
 * any axis (because the numbers aren't real).
 */
export default function GrowthHackerSilhouette({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 480"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="A growth hacker silhouette next to fake hockey-stick charts"
    >
      {/* base shadow */}
      <ellipse cx="200" cy="430" rx="140" ry="12" fill="rgba(200,255,0,0.15)" />

      {/* head */}
      <circle cx="200" cy="160" r="60" fill="#0A0A0A" stroke="#C8FF00" strokeWidth="3" />

      {/* sunglasses */}
      <rect x="150" y="148" width="44" height="20" rx="2" fill="#C8FF00" />
      <rect x="206" y="148" width="44" height="20" rx="2" fill="#C8FF00" />
      <line x1="194" y1="158" x2="206" y2="158" stroke="#C8FF00" strokeWidth="3" />

      {/* smug grin */}
      <path
        d="M180 188 Q200 200 220 188"
        stroke="#C8FF00"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* hoodie / torso */}
      <path
        d="M120 220 Q200 200 280 220 L300 400 L100 400 Z"
        fill="#0A0A0A"
        stroke="#C8FF00"
        strokeWidth="3"
      />
      <path d="M200 220 L200 400" stroke="#C8FF00" strokeWidth="2" opacity="0.4" />

      {/* fake hockey-stick chart */}
      <g transform="translate(310 80)">
        <line x1="0" y1="0" x2="0" y2="240" stroke="#C8FF00" strokeWidth="2" opacity="0.6" />
        <line x1="0" y1="240" x2="140" y2="240" stroke="#C8FF00" strokeWidth="2" opacity="0.6" />
        {/* the line */}
        <path
          d="M 10 230 L 40 220 L 70 200 L 100 140 L 130 20"
          stroke="#C8FF00"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        {/* arrowhead going up and to the right */}
        <path
          d="M 130 20 L 122 38 M 130 20 L 112 28"
          stroke="#C8FF00"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        {/* "📈" mock */}
        <text
          x="0"
          y="270"
          fill="#C8FF00"
          fontSize="14"
          fontFamily="ui-monospace, monospace"
          opacity="0.6"
        >
          REVENUE (TRUST ME)
        </text>
      </g>

      {/* vapor / smoke clouds */}
      <g fill="#C8FF00" opacity="0.35">
        <circle cx="80" cy="350" r="14" />
        <circle cx="60" cy="370" r="10" />
        <circle cx="100" cy="380" r="8" />
      </g>
    </svg>
  );
}
