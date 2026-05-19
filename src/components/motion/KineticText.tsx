'use client';

import { motion } from 'framer-motion';
import { EASE } from '@/lib/motion/easing';

export default function KineticText({
  text,
  className = '',
  delay = 0,
  spacing = '0.22em',
}: {
  text: string;
  className?: string;
  delay?: number;
  spacing?: string;
}) {
  const words = text.split(' ');
  // Accessibility: per-word spans are split for the kinetic-type animation, which
  // would otherwise be read letter-by-letter (or with stray spacing) by screen
  // readers. The old approach put `aria-label={text}` on the outer <span>, which
  // axe flags as `aria-prohibited-attr` (bare <span> can't carry aria-label).
  // The accessible pattern: hide the animated children from AT, and surface the
  // full text via a visually-hidden plain <span> alongside.
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={i} className="kinetic-word" style={{ marginRight: spacing }}>
            <motion.span
              initial={{ y: '110%', rotate: 6 }}
              animate={{ y: '0%', rotate: 0 }}
              transition={{ duration: 0.5, delay: delay + i * 0.04, ease: EASE }}
            >
              {w}
            </motion.span>
          </span>
        ))}
      </span>
    </span>
  );
}
