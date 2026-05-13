/**
 * BusinessDawg logo — mascot mark (sunglasses dawg) + italic wordmark.
 *
 * Why this exists in HTML+SVG instead of a single SVG <text>:
 *  - SVG <text> renders in a fallback font until web fonts load, which made
 *    the wordmark invisible on first paint and gave the impression the logo
 *    was missing from the nav. Using HTML text means it always renders with
 *    the page font (Geist), and the mascot mark is its own SVG.
 */

type Props = {
  className?: string;
  /** Icon-only — for favicons, footer, mobile collapses. */
  compact?: boolean;
  /** Hide the wordmark, show only the mascot mark with current sizing. */
  markOnly?: boolean;
};

function MascotMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {/* head */}
      <circle cx="24" cy="26" r="14" fill="var(--bd-bone)" />
      {/* ears */}
      <path d="M11 14 L9 26 L18 22 Z" fill="var(--bd-grey-900)" />
      <path d="M37 14 L39 26 L30 22 Z" fill="var(--bd-grey-900)" />
      {/* sunglasses bar */}
      <rect x="11" y="24" width="26" height="4" rx="2" fill="var(--bd-lime)" />
      {/* lenses */}
      <circle cx="17" cy="26" r="3.2" fill="var(--bd-ink)" />
      <circle cx="31" cy="26" r="3.2" fill="var(--bd-ink)" />
      {/* nose */}
      <circle cx="24" cy="34" r="2" fill="var(--bd-ink)" />
      {/* highlight */}
      <circle cx="18" cy="25" r="0.7" fill="var(--bd-lime)" />
    </svg>
  );
}

export default function Logo({ className = '', compact = false, markOnly = false }: Props) {
  if (compact) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-xl bg-[color:var(--bd-bone)] ${className}`}
        aria-label="BusinessDawg"
      >
        <MascotMark className="h-full w-full p-1" />
      </span>
    );
  }

  if (markOnly) {
    return <MascotMark className={className} aria-label="BusinessDawg" />;
  }

  return (
    <span
      className={`inline-flex items-center gap-2.5 leading-none ${className}`}
      aria-label="BusinessDawg"
    >
      <MascotMark className="h-full w-auto shrink-0" />
      <span
        className="font-display font-extrabold tracking-tight text-current italic"
        style={{
          fontSize: '1.1em',
          letterSpacing: '-0.02em',
        }}
      >
        Business<span className="text-[color:var(--bd-lime)]">Dawg</span>
      </span>
    </span>
  );
}
