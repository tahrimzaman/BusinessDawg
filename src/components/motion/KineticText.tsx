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
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="kinetic-word" style={{ marginRight: spacing }} aria-hidden>
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
  );
}
