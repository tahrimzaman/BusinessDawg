/**
 * Principle 03 — "Operators first."
 * Hardhat above a CRT terminal running `$ ./ship --now`. Stamp at corner:
 * "BUILT, NOT BRIEFED".
 */
export default function PrincipleOperatorIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="A hardhat above a terminal running ship --now"
    >
      {/* Hardhat dome */}
      <path d="M 70 80 A 50 44 0 0 1 170 80 Z" fill="#0A0A0A" stroke="#C8FF00" strokeWidth="2.5" />
      {/* Hardhat brim */}
      <rect
        x="56"
        y="78"
        width="128"
        height="12"
        rx="3"
        fill="#0A0A0A"
        stroke="#C8FF00"
        strokeWidth="2.5"
      />
      {/* Hardhat center ridge */}
      <line x1="120" y1="38" x2="120" y2="78" stroke="#C8FF00" strokeWidth="1.5" opacity="0.6" />
      {/* BD mark on the front */}
      <rect x="106" y="56" width="28" height="14" rx="2" fill="#C8FF00" />
      <text
        x="120"
        y="67"
        fill="#0A0A0A"
        fontSize="10"
        fontWeight="800"
        fontStyle="italic"
        fontFamily="Geist, sans-serif"
        textAnchor="middle"
      >
        BD
      </text>

      {/* Terminal window */}
      <rect
        x="38"
        y="110"
        width="164"
        height="74"
        rx="6"
        fill="#0A0A0A"
        stroke="#C8FF00"
        strokeWidth="2"
      />
      {/* Title bar */}
      <line x1="38" y1="126" x2="202" y2="126" stroke="#C8FF00" strokeWidth="1" opacity="0.5" />
      {/* Traffic-light dots */}
      <circle cx="50" cy="118" r="2.5" fill="#C8FF00" />
      <circle cx="60" cy="118" r="2.5" fill="#C8FF00" opacity="0.6" />
      <circle cx="70" cy="118" r="2.5" fill="#C8FF00" opacity="0.3" />
      {/* Prompt line */}
      <text x="50" y="152" fill="#C8FF00" fontSize="11" fontFamily="Geist Mono, ui-monospace">
        $ ./ship --now
      </text>
      {/* Output line */}
      <text
        x="50"
        y="170"
        fill="#C8FF00"
        fontSize="10"
        fontFamily="Geist Mono, ui-monospace"
        opacity="0.7"
      >
        ✓ live in prod
      </text>

      {/* BUILT, NOT BRIEFED stamp */}
      <g transform="rotate(-6 168 208)">
        <rect
          x="120"
          y="198"
          width="100"
          height="20"
          rx="3"
          fill="#0A0A0A"
          stroke="#C8FF00"
          strokeWidth="1.5"
        />
        <text
          x="170"
          y="212"
          fill="#C8FF00"
          fontSize="9"
          fontFamily="Geist Mono, ui-monospace"
          letterSpacing="2"
          textAnchor="middle"
        >
          BUILT, NOT BRIEFED
        </text>
      </g>
    </svg>
  );
}
