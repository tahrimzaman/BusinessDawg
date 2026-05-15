'use client';

/**
 * BusinessDawg chatbot — Phase 4 retry (Gemini 2.5 Flash Lite).
 *
 * Two surfaces:
 *  - Inline preview card on the home page (small chat snippet + big CTA).
 *  - Cinematic full-bleed overlay (dim+blur backdrop, lime gradient glow,
 *    mascot avatar with CRT scan-line accent, free-form input, streaming).
 *
 * Pills in the inline preview AND in the overlay are wired to /api/chat —
 * clicking a pill opens the overlay (if closed) and sends that message
 * immediately. Free-form typing also works inside the overlay.
 */

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import Mascot from '@/components/brand/Mascot';
import Reveal from '@/components/motion/Reveal';
import { useFocusTrap } from '@/components/motion/useFocusTrap';
import { EASE } from '@/lib/motion/easing';

type Msg = { role: 'assistant' | 'user'; content: string };

const GREETING: Msg = {
  role: 'assistant',
  content: 'I’m the Dawg. Ask me anything — what we build, how we ship, or how to book Tahrim.',
};

const QUICK_PILLS = [
  'What do you actually build?',
  'How does it work?',
  'Show me the systems',
  'Who is Tahrim?',
  'Can I book a call?',
  'What makes you different?',
];

const INLINE_PILLS = QUICK_PILLS.slice(0, 3);

// Hardcoded responses bypass the API entirely. Matched case-insensitively
// with trailing punctuation stripped, so "Who is Tahrim?" / "who is tahrim"
// / "who is tahrim." all hit the same canned reply.
const HARDCODED_REPLIES: Record<string, string> = {
  'who is tahrim': 'The founder. The Dawg. The REAL Dawg!',
};

function hardcodedReplyFor(text: string): string | null {
  const key = text
    .trim()
    .toLowerCase()
    .replace(/[?.!,;:]+$/g, '');
  return HARDCODED_REPLIES[key] ?? null;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Lock body scroll while the cinematic overlay is open. Restore on close.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Auto-scroll the message list as content streams in.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming, open]);

  // Focus the input on overlay open. Restore focus to the trigger on close —
  // but NOT on initial mount, or the browser auto-scrolls to the trigger and
  // the page lands on the chatbot section instead of the hero.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const id = window.setTimeout(() => inputRef.current?.focus(), 120);
      return () => window.clearTimeout(id);
    }
    if (wasOpen.current) {
      triggerRef.current?.focus();
    }
  }, [open]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || isStreaming) return;

      const history = messages;
      const userMsg: Msg = { role: 'user', content: text };
      const next: Msg[] = [...history, userMsg];

      setMessages([...next, { role: 'assistant', content: '' }]);
      setInput('');
      setIsStreaming(true);

      const setLastAssistant = (content: string) => {
        setMessages((prev) => {
          const copy = prev.slice();
          copy[copy.length - 1] = { role: 'assistant', content };
          return copy;
        });
      };

      // Short-circuit hardcoded replies before hitting the API. Fake the
      // streaming feel so it doesn't break the rhythm of the conversation.
      const canned = hardcodedReplyFor(text);
      if (canned) {
        await new Promise<void>((resolve) => {
          let i = 0;
          const step = () => {
            if (i >= canned.length) {
              resolve();
              return;
            }
            i = Math.min(i + 2, canned.length);
            setLastAssistant(canned.slice(0, i));
            window.setTimeout(step, 22);
          };
          step();
        });
        setIsStreaming(false);
        return;
      }

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: next }),
        });

        if (!res.ok || !res.body) {
          const fallback =
            res.status === 429
              ? 'Slow down dawg — getting hammered. Try again in a sec, or hit the Book a Call button.'
              : res.status === 503
                ? 'My brain isn’t plugged in yet. Hit the Book a Call button and Tahrim will sort you out.'
                : 'Something broke on my end. Hit the Book a Call button or WhatsApp Tahrim — he’ll get you sorted.';
          setLastAssistant(fallback);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setLastAssistant(acc);
        }
        if (!acc) {
          setLastAssistant(
            'Honestly dawg, I don’t have a clean answer for that one. Hit the Book a Call button or WhatsApp Tahrim — he’ll get you sorted.',
          );
        }
      } catch (err) {
        console.error('[Chatbot] stream error', err);
        setLastAssistant(
          'Network hiccup on my end. Hit the Book a Call button or WhatsApp Tahrim — he’ll get you sorted.',
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, messages],
  );

  // Inline preview pill click → open overlay AND send immediately.
  const launchAndAsk = useCallback(
    (text: string) => {
      setOpen(true);
      // Send after open transition so the message list scroll is visible.
      window.setTimeout(() => void send(text), 80);
    },
    [send],
  );

  // Overlay pill click → just prefill the input (user reviews + sends).
  const prefill = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  return (
    <>
      <section className="relative py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          <Reveal>
            <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
              / Ask the dawg
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-display mt-3 max-w-3xl text-4xl leading-[1.05] font-bold tracking-tight italic sm:text-5xl">
              Have questions? Ask the dawg.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-4 max-w-3xl text-base text-[color:var(--bd-bone)]/65">
              Or{' '}
              <Link
                href="/faq"
                className="text-[color:var(--bd-lime)] underline-offset-4 hover:underline"
              >
                skim the FAQ →
              </Link>
            </p>
          </Reveal>

          <div className="mt-10 grid items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
            <Reveal delay={0.1} className="lg:col-span-7">
              <div className="glass relative overflow-hidden rounded-3xl">
                <div className="flex items-center gap-3 border-b border-white/8 px-6 py-4">
                  <Mascot pose="idle" size={36} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Dawg</p>
                    <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
                      Live · Gemini 2.5 Flash Lite
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--bd-lime)] shadow-[0_0_8px_var(--bd-lime)]" />
                    <span className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
                      Online
                    </span>
                  </span>
                </div>

                <div className="space-y-3 px-6 py-6">
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[80%] rounded-2xl bg-white/5 px-4 py-3 text-sm text-[color:var(--bd-bone)]">
                      {GREETING.content}
                    </div>
                  </motion.div>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-white/8 px-6 py-4">
                  {INLINE_PILLS.map((q) => (
                    <button
                      key={q}
                      onClick={() => launchAndAsk(q)}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-[color:var(--bd-bone)]/80 transition-colors hover:border-[color:var(--bd-lime)]/60 hover:text-[color:var(--bd-lime)]"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <div className="border-t border-white/8 px-6 py-5">
                  <button
                    ref={triggerRef}
                    onClick={() => setOpen(true)}
                    className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--bd-lime)] px-6 text-sm font-semibold text-[color:var(--bd-ink)] transition-all hover:bg-[color:var(--bd-bone)] sm:w-auto"
                  >
                    Talk to the dawg
                    <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </Reveal>

            <div className="relative h-[420px] w-full lg:col-span-5 lg:h-auto">
              <div className="relative h-full min-h-[420px] w-full">
                <Image
                  src="/brand/mascot-talk.webp"
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

      <AnimatePresence>
        {open ? (
          <CinematicOverlay
            messages={messages}
            input={input}
            isStreaming={isStreaming}
            scrollRef={scrollRef}
            inputRef={inputRef}
            onClose={() => setOpen(false)}
            onPill={prefill}
            onSend={() => void send(input)}
            onInputChange={setInput}
            onInputKey={onInputKey}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

// ---------------------------------------------------------------------------
// Cinematic full-bleed overlay
// ---------------------------------------------------------------------------

type OverlayProps = {
  messages: Msg[];
  input: string;
  isStreaming: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onClose: () => void;
  onPill: (text: string) => void;
  onSend: () => void;
  onInputChange: (value: string) => void;
  onInputKey: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

function CinematicOverlay({
  messages,
  input,
  isStreaming,
  scrollRef,
  inputRef,
  onClose,
  onPill,
  onSend,
  onInputChange,
  onInputKey,
}: OverlayProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  // Trap Tab focus inside the panel while open. Esc + focus-on-open +
  // focus-restore-on-close are already wired in the parent component.
  useFocusTrap(true, panelRef);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chatbot-title"
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: EASE }}
    >
      {/* Backdrop — click to close */}
      <button
        type="button"
        aria-label="Close chat"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/80 backdrop-blur-xl"
      />

      {/* Animated lime gradient glow behind the panel */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="h-[640px] w-[760px] max-w-[95vw] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--bd-lime) 30%, transparent) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* Panel */}
      <motion.div
        ref={panelRef}
        className="bd-cinematic-panel relative z-10 mx-3 flex h-[88vh] w-full max-w-[720px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)]/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6),0_0_0_1px_color-mix(in_srgb,var(--bd-lime)_25%,transparent)] backdrop-blur-2xl sm:mx-0 sm:h-[78vh]"
        initial={{ y: 24, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 16, scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.28, ease: EASE }}
      >
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
          <div className="bd-scanline-avatar relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[color:var(--bd-ink)]">
            <Mascot pose="idle" size={36} />
          </div>
          <div className="flex-1">
            <p id="chatbot-title" className="text-sm font-semibold">
              Dawg
            </p>
            <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
              {isStreaming ? 'Thinking…' : 'Live · ready when you are'}
            </p>
          </div>
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                isStreaming
                  ? 'animate-pulse bg-[color:var(--bd-lime)] shadow-[0_0_10px_var(--bd-lime)]'
                  : 'bg-[color:var(--bd-lime)] shadow-[0_0_8px_var(--bd-lime)]'
              }`}
            />
            <span className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
              {isStreaming ? 'Streaming' : 'Online'}
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[color:var(--bd-bone)]/70 transition-colors hover:border-[color:var(--bd-lime)]/60 hover:text-[color:var(--bd-lime)]"
          >
            ×
          </button>
        </header>

        {/* Message list */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-[color:var(--bd-lime)] text-[color:var(--bd-ink)]'
                    : 'bg-white/5 text-[color:var(--bd-bone)]'
                }`}
              >
                {m.content || (isStreaming && i === messages.length - 1 ? <Cursor /> : null)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick-pick pills */}
        <div className="flex flex-wrap gap-2 border-t border-white/8 px-5 py-3">
          {QUICK_PILLS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onPill(q)}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-[color:var(--bd-bone)]/80 transition-colors hover:border-[color:var(--bd-lime)]/60 hover:text-[color:var(--bd-lime)]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="border-t border-white/8 px-5 py-4">
          <label htmlFor="chatbot-input" className="sr-only">
            Ask the dawg a question
          </label>
          <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[color:var(--bd-ink)]/60 px-3 py-2 focus-within:border-[color:var(--bd-lime)]/60">
            <textarea
              id="chatbot-input"
              ref={inputRef}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onInputKey}
              rows={1}
              placeholder="Ask the dawg anything…"
              className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-[color:var(--bd-bone)] placeholder:text-[color:var(--bd-bone)]/65 focus:outline-none"
              maxLength={1500}
              disabled={isStreaming}
            />
            <button
              type="button"
              onClick={onSend}
              disabled={isStreaming || !input.trim()}
              className="focus-bd inline-flex h-9 items-center rounded-full bg-[color:var(--bd-lime)] px-4 text-sm font-semibold text-[color:var(--bd-ink)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>
          <p className="mt-2 px-1 font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
            Enter to send · Shift+Enter for newline · Esc closes
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Cursor() {
  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-1.5 translate-y-[2px] animate-pulse bg-[color:var(--bd-bone)]/70"
    />
  );
}
