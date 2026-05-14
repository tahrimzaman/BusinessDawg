/**
 * Circled brand-mark avatar — used as the "we're answering the door" mark on
 * the /contact card and reusable wherever the studio needs a strong identity
 * cue (chatbot, footer, 404 etc.). Wraps /brand/icon.jpg in a circle with a
 * lime-to-transparent gradient ring and a soft breathing halo.
 */

import Image from 'next/image';

type Props = {
  size?: number;
  className?: string;
};

export default function DawgAvatar({ size = 96, className = '' }: Props) {
  return (
    <div
      role="img"
      aria-label="BusinessDawg"
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Breathing lime halo */}
      <span
        aria-hidden
        className="bd-breathe-glow pointer-events-none absolute -inset-3 rounded-full"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 50% 50%, color-mix(in srgb, var(--bd-lime) 32%, transparent) 0%, transparent 70%)',
          filter: 'blur(10px)',
        }}
      />

      {/* Lime-to-transparent gradient outline (outer ring) */}
      <span
        aria-hidden
        className="absolute -inset-[2px] rounded-full"
        style={{
          background:
            'linear-gradient(135deg, var(--bd-lime) 0%, color-mix(in srgb, var(--bd-lime) 40%, transparent) 45%, transparent 75%)',
        }}
      />

      {/* Image content circle — masks the outer ring so it reads as a stroke */}
      <span className="absolute inset-[2px] block overflow-hidden rounded-full bg-[color:var(--bd-ink)]">
        <Image
          src="/brand/icon-avatar.jpg"
          alt=""
          fill
          sizes={`${size}px`}
          priority={false}
          aria-hidden
          className="object-cover"
        />
      </span>
    </div>
  );
}
