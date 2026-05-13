'use client';

import { useState } from 'react';
import Reveal from '@/components/motion/Reveal';

const ROLES = [
  { title: 'Brand designer', tag: 'Remote · contract → hire' },
  { title: 'Full-stack engineer (Next.js)', tag: 'Remote · contract → hire' },
  { title: 'Growth ops / RevOps', tag: 'Remote · part-time' },
  { title: 'AI automation engineer', tag: 'Remote · contract' },
];

export default function Join() {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === 'sending') return;
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    setState('sending');
    try {
      const r = await fetch('/api/join', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setState(r.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 pt-40 pb-24">
      <Reveal>
        <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
          / Join the movement
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="font-display mt-3 text-5xl leading-[1.02] font-extrabold tracking-tight italic sm:text-6xl md:text-7xl">
          We hire weirdos with taste.
        </h1>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mt-6 max-w-2xl text-lg text-[color:var(--bd-bone)]/70">
          The door’s open. Pick a role or pitch your own.
        </p>
      </Reveal>

      <Reveal>
        <div className="mt-16 grid gap-3">
          {ROLES.map((r) => (
            <div
              key={r.title}
              className="flex items-center justify-between rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] px-6 py-5"
            >
              <div>
                <p className="font-display text-2xl font-bold italic">{r.title}</p>
                <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
                  {r.tag}
                </p>
              </div>
              <span className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
                Open
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <form
          onSubmit={onSubmit}
          className="mt-20 grid gap-4 rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)] p-8"
        >
          <h2 className="font-display text-2xl font-bold italic">Apply / pitch us</h2>
          <input
            name="name"
            required
            placeholder="Your name"
            className="h-12 rounded-full border border-white/10 bg-transparent px-5 text-sm focus:border-[color:var(--bd-lime)] focus:outline-none"
          />
          <input
            name="email"
            required
            type="email"
            placeholder="Email"
            className="h-12 rounded-full border border-white/10 bg-transparent px-5 text-sm focus:border-[color:var(--bd-lime)] focus:outline-none"
          />
          <input
            name="role"
            placeholder="Role you want (or invent one)"
            className="h-12 rounded-full border border-white/10 bg-transparent px-5 text-sm focus:border-[color:var(--bd-lime)] focus:outline-none"
          />
          <textarea
            name="note"
            placeholder="Tell us what you’d build here."
            rows={5}
            className="rounded-3xl border border-white/10 bg-transparent p-5 text-sm focus:border-[color:var(--bd-lime)] focus:outline-none"
          />
          <input
            name="portfolio"
            placeholder="Link to work (Figma, GitHub, site, etc.)"
            className="h-12 rounded-full border border-white/10 bg-transparent px-5 text-sm focus:border-[color:var(--bd-lime)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={state === 'sending' || state === 'done'}
            className="inline-flex h-12 w-fit items-center rounded-full bg-[color:var(--bd-lime)] px-6 text-sm font-semibold text-[color:var(--bd-ink)] transition-colors hover:bg-[color:var(--bd-bone)] disabled:opacity-60"
          >
            {state === 'sending'
              ? 'Sending…'
              : state === 'done'
                ? 'Got it — we’ll be in touch'
                : 'Send →'}
          </button>
          {state === 'error' && (
            <p className="text-sm text-[color:var(--bd-signal)]">
              Something went wrong. Try again.
            </p>
          )}
        </form>
      </Reveal>
    </div>
  );
}
