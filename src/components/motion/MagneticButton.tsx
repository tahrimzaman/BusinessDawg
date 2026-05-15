'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'inverse';
};

const SPRING = { stiffness: 250, damping: 18, mass: 0.6 };

export default function MagneticButton({
  children,
  className = '',
  href,
  onClick,
  variant = 'primary',
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);

  // Coarse pointers (touch) never trigger the magnetic pull anyway. The
  // gate lives in a ref because flipping it does not change the rendered
  // output — only whether the per-event work inside onMove is skipped — so
  // a re-render would be wasted, and `setState`-in-effect is a React 19 /
  // Next 16 lint error anyway.
  const enableMagnetRef = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    enableMagnetRef.current = !coarse && !reducedMotion;
  }, []);

  const onMove = (e: React.PointerEvent) => {
    if (!enableMagnetRef.current) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(Math.max(-12, Math.min(12, dx * 0.2)));
    y.set(Math.max(-10, Math.min(10, dy * 0.2)));
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const base =
    'inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold tracking-tight transition-colors';
  const styles =
    variant === 'primary'
      ? 'bg-[color:var(--bd-lime)] text-[color:var(--bd-ink)] hover:bg-[color:var(--bd-bone)]'
      : variant === 'inverse'
        ? 'bg-[color:var(--bd-ink)] text-[color:var(--bd-bone)] hover:bg-[color:var(--bd-smoke)]'
        : 'border border-[color:var(--bd-bone)]/20 text-[color:var(--bd-bone)] hover:border-[color:var(--bd-lime)]/80 hover:text-[color:var(--bd-lime)]';

  const Inner = (
    <motion.span
      ref={(el) => {
        ref.current = el;
      }}
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={onClick}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </motion.span>
  );

  const focusRing =
    'rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bd-lime)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bd-ink)]';

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel="noreferrer"
        className={focusRing}
      >
        {Inner}
      </a>
    );
  }
  return Inner;
}
