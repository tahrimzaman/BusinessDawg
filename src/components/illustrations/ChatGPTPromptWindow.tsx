/**
 * Pain 03 — A browser window with a single ChatGPT prompt
 * "be a marketing expert" and a $20 price tag. The whole AI strategy.
 */
export default function ChatGPTPromptWindow({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 480"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="A browser window showing a single ChatGPT prompt that says 'be a marketing expert'"
    >
      {/* drop shadow */}
      <rect x="60" y="100" width="360" height="280" rx="6" fill="rgba(200,255,0,0.08)" />

      {/* window frame */}
      <rect
        x="50"
        y="90"
        width="360"
        height="280"
        rx="6"
        fill="#0A0A0A"
        stroke="#C8FF00"
        strokeWidth="3"
      />

      {/* chrome bar */}
      <rect
        x="50"
        y="90"
        width="360"
        height="34"
        rx="6"
        fill="#0A0A0A"
        stroke="#C8FF00"
        strokeWidth="3"
      />
      <circle cx="74" cy="107" r="5" fill="#C8FF00" />
      <circle cx="92" cy="107" r="5" fill="#C8FF00" opacity="0.55" />
      <circle cx="110" cy="107" r="5" fill="#C8FF00" opacity="0.35" />

      {/* URL */}
      <rect
        x="140"
        y="98"
        width="240"
        height="18"
        rx="9"
        fill="#0A0A0A"
        stroke="#C8FF00"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <text
        x="156"
        y="111"
        fill="#C8FF00"
        fontSize="11"
        fontFamily="ui-monospace, monospace"
        opacity="0.7"
      >
        chat.example.com
      </text>

      {/* prompt label */}
      <text
        x="76"
        y="170"
        fill="#C8FF00"
        fontSize="13"
        fontFamily="ui-monospace, monospace"
        opacity="0.6"
      >
        &gt; You
      </text>

      {/* the prompt */}
      <text
        x="76"
        y="220"
        fill="#FAFAFA"
        fontSize="26"
        fontFamily="Geist, sans-serif"
        fontStyle="italic"
        fontWeight="700"
      >
        be a marketing
      </text>
      <text
        x="76"
        y="252"
        fill="#FAFAFA"
        fontSize="26"
        fontFamily="Geist, sans-serif"
        fontStyle="italic"
        fontWeight="700"
      >
        expert
      </text>

      {/* cursor blink line */}
      <rect x="222" y="230" width="2" height="26" fill="#C8FF00" />

      {/* send button area */}
      <rect
        x="76"
        y="320"
        width="308"
        height="36"
        rx="18"
        fill="#0A0A0A"
        stroke="#C8FF00"
        strokeWidth="2"
      />
      <circle cx="362" cy="338" r="11" fill="#C8FF00" />
      <path d="M357 338 L364 333 L364 343 Z" fill="#0A0A0A" />

      {/* $20 price tag floating */}
      <g transform="translate(330 30) rotate(8)">
        <rect x="0" y="0" width="100" height="44" rx="6" fill="#C8FF00" />
        <text
          x="50"
          y="30"
          fill="#0A0A0A"
          fontSize="22"
          fontFamily="Geist, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          textAnchor="middle"
        >
          $20/mo
        </text>
      </g>
    </svg>
  );
}
