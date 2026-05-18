'use client';

/**
 * Build log signup form — pinned to the bottom of /built. Lightweight variant
 * of the main `Newsletter` section with build-log-specific copy and
 * `source: 'buildlog'` so signups can be filtered in /admin.
 *
 * Posts to the same `/api/newsletter` endpoint (which already accepts an
 * optional `source` field and dedupes by email).
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from '@/components/motion/Reveal';
import MascotReward from '@/components/brand/MascotReward';
import Honeypot from '@/components/security/Honeypot';

export default function BuildLogSubscribe() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || state === 'loading') return;
    setState('loading');
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const r = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...payload, email, source: 'buildlog' }),
      });
      setState(r.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  return (
    <section className="relative mt-20 overflow-hidden rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] px-6 py-12 md:px-12 md:py-14">
      <div className="bd-section-glow" />
      <div className="relative">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / Subscribe
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-3 text-3xl leading-[1.1] font-bold italic md:text-4xl">
            Get an email when we ship.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-3 max-w-xl text-[color:var(--bd-bone)]/70">
            One short note when something new lands on the log. Roughly weekly. No fluff.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <form
            onSubmit={onSubmit}
            className="relative mt-7 flex max-w-md flex-col items-stretch gap-3 sm:flex-row"
          >
            <Honeypot />
            <label htmlFor="buildlog-email" className="sr-only">
              Email address
            </label>
            <input
              id="buildlog-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              aria-describedby="buildlog-status"
              className="focus-bd h-12 flex-1 rounded-full border border-white/10 bg-black/30 px-5 text-sm text-[color:var(--bd-bone)] placeholder:text-[color:var(--bd-bone)]/65 focus:border-[color:var(--bd-lime)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={state === 'loading' || state === 'done'}
              className="focus-bd inline-flex h-12 items-center justify-center rounded-full bg-[color:var(--bd-lime)] px-6 text-sm font-semibold text-[color:var(--bd-ink)] transition-colors hover:bg-[color:var(--bd-bone)] disabled:opacity-60"
            >
              {state === 'loading' ? 'Sending…' : state === 'done' ? 'Subscribed' : 'Subscribe'}
            </button>
          </form>
        </Reveal>

        <div id="buildlog-status" role="status" aria-live="polite" aria-atomic="true">
          <AnimatePresence>
            {state === 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-8 max-w-xl"
              >
                <MascotReward
                  headline="You’re on the log."
                  sub="We’ll holler when we ship. Once a week, no more."
                />
              </motion.div>
            )}
            {state === 'error' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-5 text-sm text-[color:var(--bd-signal)]"
              >
                Something went sideways. Try again in a sec.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
