'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Mascot from '@/components/brand/Mascot';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70svh] max-w-3xl flex-col items-center justify-center px-6 pt-40 pb-24 text-center">
      <motion.div
        animate={{ rotate: [0, 8, -8, 8, -6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Mascot pose="running" size={140} />
      </motion.div>
      <p className="mt-6 font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
        / 404
      </p>
      <h1 className="font-display mt-3 text-5xl leading-[1.02] font-extrabold tracking-tight italic sm:text-6xl">
        This page got fetched too hard.
      </h1>
      <p className="mt-6 max-w-md text-[color:var(--bd-bone)]/70">
        The dawg is sorry. Pick a working route.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-[color:var(--bd-lime)] px-6 text-sm font-semibold text-[color:var(--bd-ink)]"
      >
        Home →
      </Link>
    </div>
  );
}
