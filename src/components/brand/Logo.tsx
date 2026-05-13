/**
 * BusinessDawg logo — renders the real brand PNG from /public/brand/.
 *
 * Variants:
 *  - default (full): mark + wordmark lockup (`/brand/logo.png`)
 *  - markOnly:        head-only mark (`/brand/logo-mark.png`) — for tight slots, favicons
 *  - compact:         framed pill containing the mark — for legacy slots
 *
 * Sizing is controlled by `className` (e.g. `h-9`). The image keeps its
 * aspect ratio via `width="auto"` + `h-full` styling.
 */

import Image from 'next/image';

type Props = {
  className?: string;
  compact?: boolean;
  markOnly?: boolean;
};

export default function Logo({ className = '', compact = false, markOnly = false }: Props) {
  if (markOnly) {
    return (
      <Image
        src="/brand/logo-mark.png"
        alt="BusinessDawg"
        width={256}
        height={256}
        priority
        className={`h-full w-auto ${className}`}
      />
    );
  }

  if (compact) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-xl bg-[color:var(--bd-ink)] p-1.5 ${className}`}
        aria-label="BusinessDawg"
      >
        <Image
          src="/brand/logo-mark.png"
          alt="BusinessDawg"
          width={64}
          height={64}
          className="h-full w-auto"
        />
      </span>
    );
  }

  // Full lockup (mark + wordmark in a single PNG)
  return (
    <span
      className={`inline-flex items-center leading-none ${className}`}
      aria-label="BusinessDawg"
    >
      <Image
        src="/brand/logo-horizontal.png"
        alt="BusinessDawg"
        width={1564}
        height={400}
        priority
        className="h-full w-auto object-contain"
      />
    </span>
  );
}
