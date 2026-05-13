'use client';

/** Easter egg: after 60s of mouse idleness, the mascot walks across the bottom of the screen. */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Mascot from '@/components/brand/Mascot';

export default function IdleWalkBy() {
  const [walking, setWalking] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setWalking(true), 60_000);
    };
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, []);

  return (
    <AnimatePresence>
      {walking && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed bottom-2 left-0 z-[60]"
          initial={{ x: '-15vw' }}
          animate={{ x: '115vw' }}
          transition={{ duration: 12, ease: 'linear' }}
          onAnimationComplete={() => setWalking(false)}
        >
          <Mascot pose="running" size={64} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
