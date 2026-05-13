'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * DriftingBlobs — ambient atmospheric layer.
 * Soft lime radial blobs that drift in slow infinite loops behind everything.
 * Sits at -z-20, below Constellation (-z-10) but above html bg.
 * Reduced motion: static positions, no drift.
 */
const BLOBS = [
  { x: '8%', y: '12%', size: 520, dx: 80, dy: 50, dur: 22 },
  { x: '78%', y: '20%', size: 640, dx: -90, dy: 70, dur: 28 },
  { x: '20%', y: '55%', size: 460, dx: 60, dy: -50, dur: 19 },
  { x: '85%', y: '62%', size: 520, dx: -70, dy: -60, dur: 24 },
  { x: '45%', y: '80%', size: 700, dx: 100, dy: -40, dur: 30 },
] as const;

export default function DriftingBlobs() {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            left: b.x,
            top: b.y,
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--bd-lime) 12%, transparent) 0%, transparent 65%)',
            filter: 'blur(60px)',
            willChange: 'transform',
          }}
          animate={reduced ? undefined : { x: [0, b.dx, 0], y: [0, b.dy, 0] }}
          transition={{
            duration: b.dur,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
