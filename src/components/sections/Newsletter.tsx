'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from '@/components/motion/Reveal';
import MascotReward from '@/components/brand/MascotReward';
import Honeypot from '@/components/security/Honeypot';

export default function Newsletter() {
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
        body: JSON.stringify({ ...payload, email }),
      });
      setState(r.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  return (
    <section className="relative overflow-hidden py-10 md:py-14">
      <div className="bd-section-glow" />
      <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-16">
        <Reveal>
          <div className="mx-auto mb-10 h-px w-24 bg-[color:var(--bd-lime)]/40" />
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / The playbook
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-3 text-4xl leading-[1.05] font-bold tracking-tight italic sm:text-5xl">
            Ship smarter. Get the playbook.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 text-[color:var(--bd-bone)]/60">
            No fluff. The systems we’re building, what’s working, what isn’t. Once or twice a month.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <form
            onSubmit={onSubmit}
            className="relative mx-auto mt-10 flex max-w-md flex-col items-stretch gap-3 sm:flex-row"
          >
            <Honeypot />
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              aria-describedby="newsletter-status"
              className="focus-bd h-12 flex-1 rounded-full border border-white/10 bg-[color:var(--bd-smoke)] px-5 text-sm text-[color:var(--bd-bone)] placeholder:text-[color:var(--bd-bone)]/65 focus:border-[color:var(--bd-lime)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={state === 'loading' || state === 'done'}
              className="focus-bd inline-flex h-12 items-center justify-center rounded-full bg-[color:var(--bd-lime)] px-6 text-sm font-semibold text-[color:var(--bd-ink)] transition-colors hover:bg-[color:var(--bd-bone)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state === 'loading'
                ? 'Firing it off…'
                : state === 'done'
                  ? 'You’re in'
                  : 'Subscribe'}
            </button>
          </form>
        </Reveal>

        {state !== 'done' && (
          <Reveal delay={0.2}>
            <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {['EST. 2026', '0 PROMOS · 0 FLUFF', '2× / MONTH MAX'].map((label) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[color:var(--bd-lime)]/30 bg-transparent px-4 py-5 font-mono text-[11px] tracking-widest text-[color:var(--bd-bone)]/70 uppercase"
                >
                  {label}
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* aria-live region so screen readers announce success/failure without
            stealing focus. polite = wait for current speech to finish. */}
        <div id="newsletter-status" role="status" aria-live="polite" aria-atomic="true">
          <AnimatePresence>
            {state === 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-auto mt-10 max-w-2xl text-left"
              >
                <MascotReward
                  headline="You’re in."
                  sub="Email stashed. Expect the goods. Once or twice a month, no fluff."
                />
              </motion.div>
            )}
            {state === 'error' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 text-sm text-[color:var(--bd-signal)]"
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
