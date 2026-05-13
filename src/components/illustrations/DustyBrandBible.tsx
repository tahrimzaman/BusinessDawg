/**
 * Pain 04 — A massive bound brand-guidelines tome, dusty, never opened.
 * Cobwebs in the corner because no one in your company reads it.
 */
export default function DustyBrandBible({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 480"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="A fat dusty book labeled 'Brand Guidelines'"
    >
      {/* shadow */}
      <ellipse cx="240" cy="430" rx="200" ry="14" fill="rgba(200,255,0,0.15)" />

      {/* book cover — main slab */}
      <rect
        x="70"
        y="120"
        width="340"
        height="280"
        fill="#0A0A0A"
        stroke="#C8FF00"
        strokeWidth="4"
      />

      {/* spine (right edge) */}
      <rect x="400" y="120" width="20" height="280" fill="#C8FF00" />

      {/* page edges (top) — many thin lines */}
      <g stroke="#C8FF00" strokeWidth="1" opacity="0.55">
        <line x1="74" y1="116" x2="400" y2="116" />
        <line x1="76" y1="112" x2="402" y2="112" />
        <line x1="78" y1="108" x2="404" y2="108" />
        <line x1="80" y1="104" x2="406" y2="104" />
      </g>

      {/* page edges (bottom) */}
      <g stroke="#C8FF00" strokeWidth="1" opacity="0.55">
        <line x1="74" y1="404" x2="400" y2="404" />
        <line x1="76" y1="408" x2="402" y2="408" />
        <line x1="78" y1="412" x2="404" y2="412" />
      </g>

      {/* "BRAND GUIDELINES" stamped on cover */}
      <text
        x="240"
        y="220"
        fill="#C8FF00"
        fontSize="36"
        fontWeight="900"
        fontFamily="Geist, sans-serif"
        fontStyle="italic"
        textAnchor="middle"
      >
        BRAND
      </text>
      <text
        x="240"
        y="265"
        fill="#C8FF00"
        fontSize="36"
        fontWeight="900"
        fontFamily="Geist, sans-serif"
        fontStyle="italic"
        textAnchor="middle"
      >
        GUIDELINES
      </text>

      {/* "v1.0 · 487 pp" subtitle */}
      <text
        x="240"
        y="300"
        fill="#C8FF00"
        fontSize="13"
        opacity="0.6"
        fontFamily="ui-monospace, monospace"
        textAnchor="middle"
      >
        v1.0 · 487 pp · sealed
      </text>

      {/* corner ornament */}
      <rect x="100" y="150" width="22" height="22" fill="none" stroke="#C8FF00" strokeWidth="2" />
      <rect x="358" y="150" width="22" height="22" fill="none" stroke="#C8FF00" strokeWidth="2" />
      <rect x="100" y="348" width="22" height="22" fill="none" stroke="#C8FF00" strokeWidth="2" />
      <rect x="358" y="348" width="22" height="22" fill="none" stroke="#C8FF00" strokeWidth="2" />

      {/* dust motes */}
      <g fill="#C8FF00" opacity="0.5">
        <circle cx="40" cy="180" r="3" />
        <circle cx="30" cy="220" r="2" />
        <circle cx="50" cy="280" r="2" />
        <circle cx="35" cy="320" r="3" />
        <circle cx="440" cy="200" r="2" />
        <circle cx="448" cy="260" r="3" />
        <circle cx="435" cy="310" r="2" />
      </g>

      {/* cobweb in top-left corner */}
      <g stroke="#C8FF00" strokeWidth="1" fill="none" opacity="0.5">
        <path d="M70 120 L110 150 M70 120 L120 130 M70 120 L100 170" />
        <path d="M75 135 Q95 142 110 150" />
        <path d="M80 150 Q100 156 120 160" />
      </g>
    </svg>
  );
}
