/**
 * Principle 02 — "AI is the new factory floor."
 * An agent node graph with inputs flowing into a central agent and outputs
 * flowing out. Tiny "+1 ROBOT" stamp.
 */
export default function PrincipleAgentIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="An AI agent node graph wiring inputs to outputs"
    >
      {/* Inputs (left side) */}
      <g stroke="#C8FF00" strokeWidth="2">
        <line x1="20" y1="90" x2="80" y2="118" />
        <line x1="20" y1="120" x2="80" y2="120" />
        <line x1="20" y1="150" x2="80" y2="122" />
      </g>
      {/* Input arrowheads */}
      <g fill="#C8FF00">
        <polygon points="78,114 90,118 78,122" />
        <polygon points="78,116 90,120 78,124" />
        <polygon points="78,118 90,122 78,126" />
      </g>
      {/* Input source dots */}
      <g fill="#0A0A0A" stroke="#C8FF00" strokeWidth="2">
        <circle cx="20" cy="90" r="5" />
        <circle cx="20" cy="120" r="5" />
        <circle cx="20" cy="150" r="5" />
      </g>

      {/* Central AGENT node */}
      <rect x="90" y="100" width="60" height="40" rx="8" fill="#C8FF00" />
      <text
        x="120"
        y="125"
        fill="#0A0A0A"
        fontSize="14"
        fontWeight="800"
        fontStyle="italic"
        fontFamily="Geist, sans-serif"
        textAnchor="middle"
      >
        agent
      </text>

      {/* Outputs (right side) */}
      <g stroke="#C8FF00" strokeWidth="2">
        <line x1="160" y1="118" x2="220" y2="90" />
        <line x1="160" y1="120" x2="220" y2="120" />
        <line x1="160" y1="122" x2="220" y2="150" />
      </g>
      {/* Output endpoints */}
      <g fill="#C8FF00">
        <circle cx="220" cy="90" r="5" />
        <circle cx="220" cy="120" r="5" />
        <circle cx="220" cy="150" r="5" />
      </g>

      {/* Factory floor — dashed base line */}
      <line
        x1="30"
        y1="180"
        x2="210"
        y2="180"
        stroke="#C8FF00"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        opacity="0.5"
      />

      {/* +1 ROBOT stamp */}
      <g transform="rotate(6 178 50)">
        <rect
          x="148"
          y="36"
          width="74"
          height="20"
          rx="3"
          fill="#0A0A0A"
          stroke="#C8FF00"
          strokeWidth="1.5"
        />
        <text
          x="185"
          y="50"
          fill="#C8FF00"
          fontSize="9"
          fontFamily="Geist Mono, ui-monospace"
          letterSpacing="2"
          textAnchor="middle"
        >
          + 1 ROBOT
        </text>
      </g>
    </svg>
  );
}
