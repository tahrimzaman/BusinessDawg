'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { EASE, DURATION } from '@/lib/motion/easing';

export default function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as: As = 'div',
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'span' | 'li' | 'p' | 'h1' | 'h2' | 'h3' | 'header';
}) {
  const MotionTag = motion[As] as typeof motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: DURATION.short, delay, ease: EASE }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
