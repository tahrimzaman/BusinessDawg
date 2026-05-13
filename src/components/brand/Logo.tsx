/** BusinessDawg wordmark + mascot-ear glyph. Italic bold sans with a dog-ear flick on the 'g'. */
export default function Logo({
  className = '',
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-label="BusinessDawg">
        <rect width="48" height="48" rx="12" fill="currentColor" />
        <path
          d="M14 18 v18 a4 4 0 0 0 4 4 h12 a4 4 0 0 0 4 -4 v-6 h-8 v3 h2"
          fill="none"
          stroke="var(--bd-ink)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="30" cy="12" r="4" fill="var(--bd-ink)" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 360 48" className={className} aria-label="BusinessDawg">
      <text
        x="0"
        y="36"
        fill="currentColor"
        style={{
          fontFamily: 'var(--font-display, system-ui)',
          fontWeight: 800,
          fontStyle: 'italic',
          fontSize: 36,
          letterSpacing: '-0.02em',
        }}
      >
        BusinessDawg
      </text>
      <circle cx="346" cy="14" r="5" fill="var(--bd-lime)" />
    </svg>
  );
}
