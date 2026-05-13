/**
 * The BusinessDawg mascot — stylized bulldog with lime sunglasses.
 * Multiple poses. SVG so it scales + animates cheaply.
 */
type Pose = 'idle' | 'running' | 'sleeping' | 'waving' | 'thinking';

export default function Mascot({
  pose = 'idle',
  className = '',
  size = 96,
}: {
  pose?: Pose;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      aria-label={`BusinessDawg mascot, ${pose} pose`}
    >
      <defs>
        <linearGradient id="dawg-lime" x1="0" x2="1">
          <stop offset="0" stopColor="#c8ff00" />
          <stop offset="1" stopColor="#a4d900" />
        </linearGradient>
      </defs>
      {pose === 'sleeping' ? <SleepingDawg /> : null}
      {pose === 'idle' ? <IdleDawg /> : null}
      {pose === 'running' ? <RunningDawg /> : null}
      {pose === 'waving' ? <WavingDawg /> : null}
      {pose === 'thinking' ? <ThinkingDawg /> : null}
    </svg>
  );
}

function Head() {
  return (
    <g>
      {/* head */}
      <rect
        x="28"
        y="28"
        width="64"
        height="50"
        rx="20"
        fill="#f5f5f0"
        stroke="#0a0a0a"
        strokeWidth="3"
      />
      {/* ears */}
      <path d="M30 36 L22 22 L38 30 Z" fill="#0a0a0a" />
      <path d="M90 36 L98 22 L82 30 Z" fill="#0a0a0a" />
      {/* sunglasses */}
      <rect
        x="34"
        y="44"
        width="52"
        height="14"
        rx="4"
        fill="url(#dawg-lime)"
        stroke="#0a0a0a"
        strokeWidth="2.5"
      />
      <line x1="58" y1="44" x2="62" y2="58" stroke="#0a0a0a" strokeWidth="2.5" />
      {/* snout */}
      <rect
        x="48"
        y="60"
        width="24"
        height="16"
        rx="8"
        fill="#fafafa"
        stroke="#0a0a0a"
        strokeWidth="2.5"
      />
      <circle cx="60" cy="66" r="3.2" fill="#0a0a0a" />
      <path
        d="M52 72 Q60 78 68 72"
        stroke="#0a0a0a"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

function IdleDawg() {
  return (
    <g>
      <Head />
      {/* body */}
      <rect
        x="36"
        y="74"
        width="48"
        height="28"
        rx="10"
        fill="#f5f5f0"
        stroke="#0a0a0a"
        strokeWidth="3"
      />
      {/* legs */}
      <rect
        x="40"
        y="98"
        width="8"
        height="14"
        rx="3"
        fill="#f5f5f0"
        stroke="#0a0a0a"
        strokeWidth="2.5"
      />
      <rect
        x="72"
        y="98"
        width="8"
        height="14"
        rx="3"
        fill="#f5f5f0"
        stroke="#0a0a0a"
        strokeWidth="2.5"
      />
    </g>
  );
}

function RunningDawg() {
  return (
    <g>
      <Head />
      <rect
        x="32"
        y="74"
        width="52"
        height="26"
        rx="10"
        fill="#f5f5f0"
        stroke="#0a0a0a"
        strokeWidth="3"
      />
      {/* lifted legs */}
      <rect
        x="36"
        y="98"
        width="8"
        height="10"
        rx="3"
        fill="#f5f5f0"
        stroke="#0a0a0a"
        strokeWidth="2.5"
        transform="rotate(-25 40 103)"
      />
      <rect
        x="76"
        y="98"
        width="8"
        height="10"
        rx="3"
        fill="#f5f5f0"
        stroke="#0a0a0a"
        strokeWidth="2.5"
        transform="rotate(25 80 103)"
      />
      {/* motion lines */}
      <path
        d="M14 80 L24 80 M14 90 L22 90"
        stroke="#c8ff00"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  );
}

function SleepingDawg() {
  return (
    <g>
      <rect
        x="20"
        y="60"
        width="84"
        height="34"
        rx="16"
        fill="#f5f5f0"
        stroke="#0a0a0a"
        strokeWidth="3"
      />
      <path d="M22 68 L14 56 L30 62 Z" fill="#0a0a0a" />
      <rect
        x="28"
        y="68"
        width="52"
        height="12"
        rx="4"
        fill="url(#dawg-lime)"
        stroke="#0a0a0a"
        strokeWidth="2.5"
      />
      <path
        d="M86 70 Q92 76 86 82"
        stroke="#0a0a0a"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <text x="80" y="40" fontSize="22" fontStyle="italic" fontWeight="700" fill="#c8ff00">
        Z
      </text>
      <text x="92" y="28" fontSize="14" fontStyle="italic" fontWeight="700" fill="#c8ff00">
        z
      </text>
    </g>
  );
}

function WavingDawg() {
  return (
    <g>
      <Head />
      <rect
        x="36"
        y="74"
        width="48"
        height="26"
        rx="10"
        fill="#f5f5f0"
        stroke="#0a0a0a"
        strokeWidth="3"
      />
      {/* waving paw */}
      <g transform="translate(86 70) rotate(-30)">
        <rect
          x="0"
          y="0"
          width="10"
          height="22"
          rx="4"
          fill="#f5f5f0"
          stroke="#0a0a0a"
          strokeWidth="2.5"
        />
      </g>
      <rect
        x="40"
        y="98"
        width="8"
        height="14"
        rx="3"
        fill="#f5f5f0"
        stroke="#0a0a0a"
        strokeWidth="2.5"
      />
      <rect
        x="72"
        y="98"
        width="8"
        height="14"
        rx="3"
        fill="#f5f5f0"
        stroke="#0a0a0a"
        strokeWidth="2.5"
      />
    </g>
  );
}

function ThinkingDawg() {
  return (
    <g>
      <Head />
      <rect
        x="36"
        y="74"
        width="48"
        height="26"
        rx="10"
        fill="#f5f5f0"
        stroke="#0a0a0a"
        strokeWidth="3"
      />
      <rect
        x="40"
        y="98"
        width="8"
        height="14"
        rx="3"
        fill="#f5f5f0"
        stroke="#0a0a0a"
        strokeWidth="2.5"
      />
      <rect
        x="72"
        y="98"
        width="8"
        height="14"
        rx="3"
        fill="#f5f5f0"
        stroke="#0a0a0a"
        strokeWidth="2.5"
      />
      <circle cx="98" cy="34" r="9" fill="#c8ff00" stroke="#0a0a0a" strokeWidth="2" />
      <text x="94" y="38" fontSize="11" fontWeight="800" fill="#0a0a0a">
        ?
      </text>
      <circle cx="92" cy="46" r="3" fill="#c8ff00" stroke="#0a0a0a" strokeWidth="1.5" />
    </g>
  );
}
