'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef } from 'react';

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

  const onMove = (e: React.PointerEvent) => {
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

  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
        {Inner}
      </a>
    );
  }
  return Inner;
}
