'use client';

/** Static chatbot UI. Backend wiring is GATED until Tahrim picks a provider (CLAUDE.md §3 Gate #1). */

import { motion } from 'framer-motion';
import { useState } from 'react';
import Mascot from '@/components/brand/Mascot';
import Reveal from '@/components/motion/Reveal';
import { EASE } from '@/lib/motion/easing';

const SUGGESTED = [
  'What do you actually do?',
  'How much for a brand identity?',
  'Can I book Tahrim?',
];

const SCRIPTED: Record<string, string> = {
  'What do you actually do?':
    'We build business machines — branding, AI automation, web & product, and growth systems. Stacked together, they turn inputs into customers into cash. Want a tour?',
  'How much for a brand identity?':
    'Branding starter pack opens from $2,500 for the essentials. Bigger systems get scoped on a call.',
  'Can I book Tahrim?':
    'Yes. The Book a Call button on every page goes straight to his calendar. 15-min slots, no decks required.',
};

export default function Chatbot() {
  const [messages, setMessages] = useState<{ from: 'dawg' | 'you'; text: string }[]>([
    { from: 'dawg', text: 'I’m the BusinessDawg. Ask me anything.' },
  ]);

  const ask = (q: string) => {
    setMessages((m) => [...m, { from: 'you', text: q }]);
    setTimeout(() => {
      const reply = SCRIPTED[q] ?? 'Drop your question in. We’ll come back fast.';
      setMessages((m) => [...m, { from: 'dawg', text: reply }]);
    }, 500);
  };

  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-5xl px-6 lg:px-32">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / Ask the dawg
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-3 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight italic sm:text-5xl">
            Talk to the BusinessDawg.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass mt-10 overflow-hidden rounded-3xl">
            <div className="flex items-center gap-3 border-b border-white/8 px-6 py-4">
              <Mascot pose="idle" size={36} />
              <div>
                <p className="text-sm font-semibold">BusinessDawg</p>
                <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/40 uppercase">
                  Static preview · live wiring gated
                </p>
              </div>
            </div>

            <div className="space-y-3 px-6 py-6">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className={`flex ${m.from === 'you' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      m.from === 'you'
                        ? 'bg-[color:var(--bd-lime)] text-[color:var(--bd-ink)]'
                        : 'bg-white/5 text-[color:var(--bd-bone)]'
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-white/8 px-6 py-4">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-[color:var(--bd-bone)]/80 transition-colors hover:border-[color:var(--bd-lime)]/60 hover:text-[color:var(--bd-lime)]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
