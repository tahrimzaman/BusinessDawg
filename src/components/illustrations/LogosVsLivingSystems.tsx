/**
 * Talkers/Shippers 04 — Drake-style split.
 * Top: a static logo placeholder in a frame (dimmed).
 * Bottom: an EKG-style pulse line + MRR-up chip (lime). No $ amounts.
 */
export default function LogosVsLivingSystems({ className = '' }: { className?: string }) {
  const muted = 'rgba(250,250,250,0.42)';
  return (
    <svg
      viewBox="0 0 480 480"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="A static logo placeholder above a live EKG pulse line"
    >
      <g opacity="0.9">
        <rect
          x="120"
          y="50"
          width="240"
          height="170"
          fill="#0A0A0A"
          stroke={muted}
          strokeWidth="2.5"
        />
        <line x1="120" y1="50" x2="360" y2="220" stroke={muted} strokeWidth="1" opacity="0.35" />
        <line x1="360" y1="50" x2="120" y2="220" stroke={muted} strokeWidth="1" opacity="0.35" />
        <circle cx="240" cy="120" r="34" fill="none" stroke={muted} strokeWidth="2.5" />
        <rect x="206" y="110" width="68" height="20" fill={muted} opacity="0.3" />
        <text
          x="240"
          y="178"
          fill={muted}
          fontSize="11"
          fontFamily="Geist Mono, ui-monospace"
          letterSpacing="2"
          textAnchor="middle"
        >
          LOGO_v37_FINAL.AI
        </text>
        <text
          x="240"
          y="198"
          fill={muted}
          fontSize="9"
          fontFamily="Geist Mono, ui-monospace"
          letterSpacing="2"
          textAnchor="middle"
          opacity="0.6"
        >
          148 PAGE GUIDELINES
        </text>
        <text
          x="430"
          y="40"
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
        <line x1="60" y1="370" x2="420" y2="370" stroke="#C8FF00" strokeWidth="1" opacity="0.2" />
        <line x1="60" y1="340" x2="420" y2="340" stroke="#C8FF00" strokeWidth="1" opacity="0.15" />
        <line x1="60" y1="400" x2="420" y2="400" stroke="#C8FF00" strokeWidth="1" opacity="0.15" />

        <path
          d="M 60 380 L 100 380 L 110 380 L 120 360 L 135 420 L 150 305 L 165 400 L 180 380 L 220 380 L 230 350 L 245 410 L 260 290 L 275 400 L 290 380 L 360 380 L 370 360 L 380 380 L 420 380"
          fill="none"
          stroke="#C8FF00"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="260" cy="290" r="6" fill="#C8FF00" />

        <g transform="translate(310 290)">
          <rect x="0" y="0" width="86" height="32" fill="#C8FF00" rx="16" />
          <text
            x="43"
            y="21"
            fill="#0A0A0A"
            fontSize="13"
            fontWeight="800"
            fontStyle="italic"
            fontFamily="Geist, sans-serif"
            textAnchor="middle"
          >
            ↑ MRR
          </text>
        </g>

        <text
          x="60"
          y="430"
          fill="#C8FF00"
          fontSize="10"
          fontFamily="Geist Mono, ui-monospace"
          letterSpacing="2"
          opacity="0.7"
        >
          LIVE METRICS
        </text>
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
