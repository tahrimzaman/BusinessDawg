'use client';

/** Live chatbot UI wired to Groq + Llama 3.3 70B Versatile via /api/chat. */

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState, FormEvent } from 'react';
import Mascot from '@/components/brand/Mascot';
import Reveal from '@/components/motion/Reveal';
import { EASE } from '@/lib/motion/easing';

type Msg = { role: 'assistant' | 'user'; content: string };

const QUICK_FILLS = ['What do you build?', 'How much for a brand?', 'Can I book Tahrim?'];

const GREETING: Msg = {
  role: 'assistant',
  content:
    'I’m the BusinessDawg. Ask me anything — what we build, how we ship, or how to book Tahrim.',
};

export default function Chatbot() {
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || isStreaming) return;

    const next: Msg[] = [...messages, { role: 'user', content: clean }];
    setMessages(next);
    setInput('');
    setIsStreaming(true);
    // Reserve a slot for the assistant's streamed reply.
    setMessages((m) => [...m, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok || !res.body) {
        const fallback =
          res.status === 429
            ? 'Whoa — slow down, you’re asking faster than I can answer. Try again in a sec.'
            : 'Something broke on my end. Try again, or hit the Book a Call button if you need a human.';
        setMessages((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = { role: 'assistant', content: fallback };
          return copy;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = { role: 'assistant', content: acc };
          return copy;
        });
      }
    } catch (err) {
      console.error('[Chatbot] stream error', err);
      setMessages((m) => {
        const copy = m.slice();
        copy[copy.length - 1] = {
          role: 'assistant',
          content: 'Lost the connection. Try again in a moment.',
        };
        return copy;
      });
    } finally {
      setIsStreaming(false);
      // Keep focus on the input for fast follow-ups.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <section className="relative py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / Ask the dawg
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-3 max-w-3xl text-4xl leading-[1.05] font-bold tracking-tight italic sm:text-5xl">
            Talk to the BusinessDawg.
          </h2>
        </Reveal>

        <div className="mt-10 grid items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="glass flex h-full flex-col overflow-hidden rounded-3xl">
              <div className="flex items-center gap-3 border-b border-white/8 px-6 py-4">
                <Mascot pose="idle" size={36} />
                <div>
                  <p className="text-sm font-semibold">BusinessDawg</p>
                  <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/40 uppercase">
                    Live · powered by Llama 3.3
                  </p>
                </div>
              </div>

              <div
                ref={scrollRef}
                className="flex max-h-[420px] min-h-[280px] flex-1 flex-col gap-3 overflow-y-auto px-6 py-6"
              >
                {messages.map((m, i) => {
                  const isStreamingThisOne =
                    isStreaming && i === messages.length - 1 && m.role === 'assistant';
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                          m.role === 'user'
                            ? 'bg-[color:var(--bd-lime)] text-[color:var(--bd-ink)]'
                            : 'bg-white/5 text-[color:var(--bd-bone)]'
                        }`}
                      >
                        {m.content}
                        {isStreamingThisOne && m.content.length === 0 && <TypingDots />}
                        {isStreamingThisOne && m.content.length > 0 && (
                          <span className="ml-1 inline-block h-3 w-1 -translate-y-px animate-pulse bg-[color:var(--bd-lime)] align-middle" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 border-t border-white/8 px-6 py-3">
                {QUICK_FILLS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setInput(q);
                      inputRef.current?.focus();
                    }}
                    disabled={isStreaming}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-[color:var(--bd-bone)]/80 transition-colors hover:border-[color:var(--bd-lime)]/60 hover:text-[color:var(--bd-lime)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <form
                onSubmit={onSubmit}
                className="flex items-center gap-2 border-t border-white/8 px-4 py-3"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isStreaming}
                  maxLength={1500}
                  placeholder="Ask me anything about BD…"
                  aria-label="Message the BusinessDawg"
                  className="flex-1 rounded-full border border-white/10 bg-[color:var(--bd-ink)]/40 px-4 py-2.5 text-sm text-[color:var(--bd-bone)] transition-colors outline-none placeholder:text-[color:var(--bd-bone)]/40 focus:border-[color:var(--bd-lime)]/60 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isStreaming || input.trim().length === 0}
                  className="rounded-full bg-[color:var(--bd-lime)] px-5 py-2.5 text-sm font-semibold text-[color:var(--bd-ink)] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                >
                  Send
                </button>
              </form>
            </div>
          </Reveal>

          <div className="relative h-[420px] w-full lg:col-span-5 lg:h-auto">
            <div className="relative h-full min-h-[420px] w-full">
              <Image
                src="/brand/mascot-talk.png"
                alt="BusinessDawg mascot — talking"
                fill
                sizes="(min-width: 1024px) 40vw, 80vw"
                className="object-contain object-bottom"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 align-middle" aria-label="thinking">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--bd-lime)] [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--bd-lime)] [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--bd-lime)]" />
    </span>
  );
}
