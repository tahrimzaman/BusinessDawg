'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { EASE } from '@/lib/motion/easing';
import { paceDuration, type Pace } from '@/lib/motion/timing';
import { useTweaks } from '@/lib/dev/tweaks';

export default function Reveal({
  children,
  delay = 0,
  y = 32,
  pace = 'normal',
  className,
  as: As = 'div',
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  pace?: Pace;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'span' | 'li' | 'p' | 'h1' | 'h2' | 'h3' | 'header';
}) {
  const MotionTag = motion[As] as typeof motion.div;
  const reduced = useReducedMotion();
  const tweaks = useTweaks();
  const base = paceDuration(pace);
  const duration = reduced ? 0.2 : base * tweaks.pace;

  return (
    <MotionTag
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -5% 0px' }}
      transition={{ duration, delay: reduced ? 0 : delay, ease: EASE }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
