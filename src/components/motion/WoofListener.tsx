'use client';

/** Easter egg: type "woof" anywhere on the homepage and the mascot pops center-screen. */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Mascot from '@/components/brand/Mascot';

export default function WoofListener() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let buf = '';
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      buf = (buf + e.key.toLowerCase()).slice(-4);
      if (buf === 'woof') {
        setShow(true);
        setTimeout(() => setShow(false), 2000);
        buf = '';
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-3xl bg-[color:var(--bd-ink)]/70 px-8 py-6 backdrop-blur-md">
            <Mascot pose="waving" size={140} />
            <p className="mt-2 text-center font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
              woof
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
