'use client';

import { motion } from 'framer-motion';
import { EASE } from '@/lib/motion/easing';

export default function KineticText({
  text,
  className = '',
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(' ');
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="kinetic-word" style={{ marginRight: '0.22em' }} aria-hidden>
          <motion.span
            initial={{ y: '110%', rotate: 6 }}
            animate={{ y: '0%', rotate: 0 }}
            transition={{ duration: 0.85, delay: delay + i * 0.07, ease: EASE }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
