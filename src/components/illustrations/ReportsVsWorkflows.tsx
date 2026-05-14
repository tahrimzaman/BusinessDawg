/**
 * Talkers/Shippers 03 — Drake-style split.
 * Top: a bound "STATE OF AI 2026" report (dimmed).
 * Bottom: a node-and-edge workflow graph wiring an agent (lime).
 */
export default function ReportsVsWorkflows({ className = '' }: { className?: string }) {
  const muted = 'rgba(250,250,250,0.42)';
  return (
    <svg
      viewBox="0 0 480 480"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="A bound AI report above a working agent workflow graph"
    >
      <g opacity="0.9">
        <g transform="rotate(-4 240 130)">
          <rect
            x="160"
            y="40"
            width="170"
            height="200"
            fill="#0A0A0A"
            stroke={muted}
            strokeWidth="2.5"
          />
          <rect x="160" y="40" width="14" height="200" fill={muted} opacity="0.2" />
          <line x1="174" y1="40" x2="174" y2="240" stroke={muted} strokeWidth="1.5" opacity="0.6" />
          <text
            x="252"
            y="100"
            fill={muted}
            fontSize="14"
            fontWeight="800"
            fontStyle="italic"
            fontFamily="Geist, sans-serif"
            textAnchor="middle"
            letterSpacing="1"
          >
            STATE OF AI
          </text>
          <text
            x="252"
            y="124"
            fill={muted}
            fontSize="14"
            fontWeight="800"
            fontStyle="italic"
            fontFamily="Geist, sans-serif"
            textAnchor="middle"
            letterSpacing="1"
          >
            2026
          </text>
          <line
            x1="186"
            y1="146"
            x2="318"
            y2="146"
            stroke={muted}
            strokeWidth="1.5"
            opacity="0.5"
          />
          <rect x="190" y="162" width="118" height="5" fill={muted} opacity="0.5" />
          <rect x="190" y="176" width="90" height="5" fill={muted} opacity="0.5" />
          <rect x="190" y="190" width="110" height="5" fill={muted} opacity="0.5" />
          <rect x="190" y="204" width="70" height="5" fill={muted} opacity="0.5" />
          <text
            x="252"
            y="226"
            fill={muted}
            fontSize="9"
            fontFamily="Geist Mono, ui-monospace"
            letterSpacing="2"
            textAnchor="middle"
            opacity="0.65"
          >
            148 PAGES
          </text>
        </g>
        <text
          x="430"
          y="32"
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
        <line x1="120" y1="320" x2="200" y2="320" stroke="#C8FF00" strokeWidth="2" />
        <line x1="240" y1="320" x2="320" y2="320" stroke="#C8FF00" strokeWidth="2" />
        <line x1="220" y1="340" x2="220" y2="400" stroke="#C8FF00" strokeWidth="2" />
        <line x1="160" y1="340" x2="160" y2="400" stroke="#C8FF00" strokeWidth="2" />
        <line x1="280" y1="340" x2="280" y2="400" stroke="#C8FF00" strokeWidth="2" />

        <polygon points="200,316 208,320 200,324" fill="#C8FF00" />
        <polygon points="320,316 328,320 320,324" fill="#C8FF00" />
        <polygon points="216,400 220,408 224,400" fill="#C8FF00" />
        <polygon points="156,400 160,408 164,400" fill="#C8FF00" />
        <polygon points="276,400 280,408 284,400" fill="#C8FF00" />

        <circle cx="100" cy="320" r="22" fill="#0A0A0A" stroke="#C8FF00" strokeWidth="2.5" />
        <text
          x="100"
          y="324"
          fill="#C8FF00"
          fontSize="11"
          fontFamily="Geist Mono, ui-monospace"
          textAnchor="middle"
        >
          IN
        </text>

        <rect x="200" y="304" width="40" height="32" fill="#C8FF00" rx="3" />
        <text
          x="220"
          y="324"
          fill="#0A0A0A"
          fontSize="11"
          fontWeight="800"
          fontStyle="italic"
          fontFamily="Geist, sans-serif"
          textAnchor="middle"
        >
          agent
        </text>

        <circle cx="340" cy="320" r="22" fill="#0A0A0A" stroke="#C8FF00" strokeWidth="2.5" />
        <text
          x="340"
          y="324"
          fill="#C8FF00"
          fontSize="11"
          fontFamily="Geist Mono, ui-monospace"
          textAnchor="middle"
        >
          OUT
        </text>

        <circle cx="160" cy="420" r="18" fill="#0A0A0A" stroke="#C8FF00" strokeWidth="2" />
        <circle cx="220" cy="420" r="18" fill="#0A0A0A" stroke="#C8FF00" strokeWidth="2" />
        <circle cx="280" cy="420" r="18" fill="#0A0A0A" stroke="#C8FF00" strokeWidth="2" />

        <text
          x="430"
          y="242"
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
