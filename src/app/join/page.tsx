'use client';

/**
 * /join — the studio's hiring + referral page.
 *
 * Tone is non-negotiable: dawg voice. Short, confident, no hedging, no founder
 * name-drops. Visual character carried by the mascot, not by long copy.
 *
 * Layout: hero (with mascot) → roles → how we work + profit share → process →
 * "not for you" callout → application form → WhatsApp referral block → FAQ.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import Reveal from '@/components/motion/Reveal';
import MagneticButton from '@/components/motion/MagneticButton';
import DawgAvatar from '@/components/brand/DawgAvatar';
import Mascot from '@/components/brand/Mascot';
import Honeypot from '@/components/security/Honeypot';
import MascotReward from '@/components/brand/MascotReward';
import { BreadcrumbJsonLd, JobPostingJsonLd } from '@/components/seo/JsonLd';
import { SITE } from '@/lib/copy';

// Two satellite stickers that orbit the spinning badge with a slow bobbing
// motion. Kept to two so the headline stays dominant; more = visual clutter.
const HERO_SATELLITES: {
  label: string;
  rotate: number;
  tone: 'lime' | 'dark' | 'bone';
  // Where the sticker sits relative to the badge container (percentages).
  top: string;
  left: string;
  // Animation offset so the two stickers don't bob in sync.
  delay: number;
}[] = [
  { label: 'Profit share', rotate: -8, tone: 'lime', top: '4%', left: '-8%', delay: 0 },
  { label: 'Remote OK', rotate: 6, tone: 'bone', top: '70%', left: '78%', delay: 0.8 },
];

// Marquee — infinite scrolling strip under the hero. Duplicated content gives
// the seamless wrap; framer translates the whole row by -50% over 30s.
const MARQUEE_ITEMS = [
  'Now hiring',
  'Profit share',
  'Remote OK',
  'No decks',
  'Built in public',
  '10% referral',
  'Weirdos welcome',
  'No timesheets',
  'Pitch your own role',
];

type Role = {
  title: string;
  tag: string;
  pitch: string;
  // Big glyph rendered in the card corner — the visual hit per role. Kept
  // intentionally graphic / symbolic, not literal.
  glyph: string;
};

const ROLES: Role[] = [
  {
    title: 'Brand designer',
    tag: 'Remote · contract → hire',
    pitch: 'You build identity systems that survive a year of execution. Not concepts. Not PDFs.',
    glyph: '◐',
  },
  {
    title: 'Full-stack engineer (Next.js)',
    tag: 'Remote · contract → hire',
    pitch:
      'You ship Next.js products end-to-end. Scope, build, document, hand off. No babysitting.',
    glyph: '⌥',
  },
  {
    title: 'Growth ops / RevOps',
    tag: 'Remote · part-time',
    pitch: 'You build dashboards founders actually open. Weekly cadence. No quarterly recap decks.',
    glyph: '↗',
  },
  {
    title: 'AI automation engineer',
    tag: 'Remote · contract',
    pitch:
      'You wire LLM agents that run in production. Evals included. Demos are not the deliverable.',
    glyph: '◆',
  },
];

const PROCESS = [
  { num: '01', title: 'Apply', body: 'Fill the form. Portfolio link if you have one.' },
  {
    num: '02',
    title: '72-hour reply',
    body: 'Every application gets read. Check spam if you don’t hear back.',
  },
  {
    num: '03',
    title: 'Interview',
    body: '30 minutes. Tools, scope, comp all get nailed down here.',
  },
  { num: '04', title: 'Contract → start', body: 'Sign, kick off, ship.' },
];

const FAQ = [
  {
    q: 'How does the pay work?',
    a: 'Profit share per project. We agree the cut before each engagement. Paid when the client pays — bKash, Payoneer, cash, whichever works.',
  },
  {
    q: 'Are you hiring globally?',
    a: 'Bangladesh studio. Hiring globally. Remote-first. We work with whoever ships.',
  },
  {
    q: 'How long is a contract?',
    a: 'Project-based. Some engagements are 2 weeks, some are 2 months. We don’t hold anyone past the scope.',
  },
  {
    q: 'Is there a test project?',
    a: 'No. We interview. We trust our instincts and yours.',
  },
  {
    q: 'No role fits me — can I still apply?',
    a: 'Pitch your own. There’s a field on the form for exactly that.',
  },
  {
    q: 'When will I hear back?',
    a: 'Within 72 hours. If not, check spam first — then ping us on WhatsApp.',
  },
];

const JOB_DATE_POSTED = '2026-05-15';
const WA_REFERRAL_MESSAGE = 'Yo — I want to refer someone to BusinessDawg.';

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

  const whatsappHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(WA_REFERRAL_MESSAGE)}`;

  return (
    <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://businessdawg.com' },
          { name: 'Join', url: 'https://businessdawg.com/join' },
        ]}
      />
      {ROLES.map((r) => (
        <JobPostingJsonLd
          key={r.title}
          title={r.title}
          description={`${r.pitch} ${r.tag}.`}
          datePosted={JOB_DATE_POSTED}
        />
      ))}

      {/* HERO — sticker stack + marquee. Playful, not generic. */}
      <section className="relative">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
          <div>
            <Reveal>
              <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
                / Join the pack
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-display mt-3 text-4xl leading-[1.02] font-extrabold tracking-tight italic sm:text-6xl md:text-7xl">
                We hire weirdos with taste.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-lg text-[color:var(--bd-bone)]/75">
                Built by operators. For operators. Pick a role. Or pitch your own.
              </p>
            </Reveal>
          </div>

          {/* Spinning circular badge — record-label / seal-of-approval vibe.
              Text wraps around the perimeter on an SVG textPath and rotates
              endlessly; a big italic glyph sits centered inside, counter-
              rotated so it stays upright. Two sticker satellites bob nearby
              for playful asymmetry. Hidden on small screens to protect the
              headline; surfaces from md: up. */}
          <div className="relative hidden h-64 w-64 flex-none md:block lg:h-80 lg:w-80">
            {/* Soft lime halo behind everything */}
            <div
              aria-hidden
              className="absolute -inset-6 rounded-full bg-[color:var(--bd-lime)]/15 blur-2xl"
            />

            {/* Slow background pulse so the disc feels alive */}
            <motion.div
              aria-hidden
              className="absolute inset-3 rounded-full border border-[color:var(--bd-lime)]/30"
              animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
            />

            {/* Spinning text ring */}
            <motion.svg
              viewBox="0 0 200 200"
              className="absolute inset-0 h-full w-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
              aria-hidden
            >
              <defs>
                <path
                  id="join-badge-circle"
                  d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
                  fill="none"
                />
              </defs>
              <text
                style={{
                  fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
                  fontSize: '12px',
                  letterSpacing: '0.32em',
                  fill: 'var(--bd-lime)',
                  textTransform: 'uppercase',
                }}
              >
                <textPath href="#join-badge-circle">
                  Now hiring · Weirdos welcome · Now hiring · Weirdos welcome ·
                </textPath>
              </text>
            </motion.svg>

            {/* Center — DawgAvatar, the same treated mark used on /contact's
                right side. Carries the lime gradient ring + breathing halo
                built in. Rocks subtly inside the spinning ring around it. */}
            <motion.div
              aria-hidden
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
            >
              <DawgAvatar size={132} />
            </motion.div>

            {/* Satellite stickers — bob gently in place around the badge */}
            {HERO_SATELLITES.map((s) => (
              <motion.div
                key={s.label}
                className="absolute"
                style={{ top: s.top, left: s.left }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: [0, -6, 0] }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.3 + s.delay },
                  y: { duration: 3.5, ease: 'easeInOut', repeat: Infinity, delay: s.delay },
                }}
                aria-hidden
              >
                <span
                  className={[
                    'inline-block rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-widest whitespace-nowrap uppercase shadow-[0_10px_28px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:scale-[1.06] hover:rotate-0',
                    s.tone === 'lime'
                      ? 'border-[color:var(--bd-lime)] bg-[color:var(--bd-lime)] text-[color:var(--bd-ink)]'
                      : s.tone === 'bone'
                        ? 'border-[color:var(--bd-bone)]/25 bg-[color:var(--bd-bone)] text-[color:var(--bd-ink)]'
                        : 'border-[color:var(--bd-lime)]/40 bg-[color:var(--bd-ink)] text-[color:var(--bd-bone)]',
                  ].join(' ')}
                  style={{ transform: `rotate(${s.rotate}deg)` }}
                >
                  {s.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Infinite marquee — lime bar under the hero, motion glue for the
            whole section. The list is duplicated so the -50% translate wraps
            seamlessly with no visible jump. */}
        <Reveal delay={0.15}>
          <div className="mt-12 overflow-hidden rounded-full border border-[color:var(--bd-lime)]/40 bg-[color:var(--bd-lime)]/10 py-3">
            <motion.div
              className="flex w-max gap-10 font-mono text-xs tracking-widest whitespace-nowrap text-[color:var(--bd-lime)] uppercase"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
            >
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                <span key={i} className="flex items-center gap-10">
                  <span aria-hidden>🐾</span>
                  <span>{item}</span>
                </span>
              ))}
            </motion.div>
          </div>
        </Reveal>
      </section>

      {/* OPEN ROLES — short, no "Open" badge, no detail bloat */}
      <section className="mt-20">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
            / Hiring
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-3 text-3xl leading-[1.1] font-bold tracking-tight italic md:text-5xl">
            What we&rsquo;re hiring for.
          </h2>
        </Reveal>
        {/* 2x2 trading-card grid. Each card carries an oversized glyph in the
            corner as the visual hit, a tag pill, and the pitch line.
            Hover lifts + lime border. */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {ROLES.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.05}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--bd-lime)]/50 hover:shadow-[0_20px_50px_-20px_rgba(200,255,0,0.25)]">
                {/* Massive corner glyph — the visual signature per role */}
                <span
                  aria-hidden
                  className="font-display pointer-events-none absolute -top-4 -right-2 text-[10rem] leading-none font-bold text-[color:var(--bd-lime)]/10 italic transition-all duration-500 group-hover:scale-110 group-hover:text-[color:var(--bd-lime)]/20"
                >
                  {r.glyph}
                </span>
                <div className="relative">
                  <span className="inline-flex items-center rounded-full border border-[color:var(--bd-lime)]/30 bg-[color:var(--bd-lime)]/10 px-3 py-1 font-mono text-[10px] tracking-widest text-[color:var(--bd-lime)] uppercase">
                    {r.tag}
                  </span>
                  <p className="font-display mt-4 text-2xl leading-[1.1] font-bold italic md:text-3xl">
                    {r.title}
                  </p>
                  <p className="mt-4 text-[color:var(--bd-bone)]/75">{r.pitch}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW WE WORK — absorbs the profit-share copy */}
      <section className="mt-20">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
            / The deal
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-3 text-3xl leading-[1.1] font-bold tracking-tight italic md:text-5xl">
            How it works.
          </h2>
        </Reveal>
        {/* Each card carries a huge typographic anchor on the left — % for
            profit share, ∞ for flexible/remote. The glyph IS the visual; copy
            lives on the right, no wall of text. */}
        <div className="mt-8 grid gap-4">
          <Reveal>
            <div className="grid items-center gap-6 rounded-3xl border border-[color:var(--bd-lime)]/40 bg-[color:var(--bd-smoke)] p-7 md:grid-cols-[auto_1fr] md:gap-10 md:p-10">
              <div
                aria-hidden
                className="font-display text-[7rem] leading-none font-bold text-[color:var(--bd-lime)] italic md:text-[9rem]"
              >
                %
              </div>
              <div>
                <p className="font-display text-2xl font-bold italic md:text-3xl">
                  Profit share, not salary.
                </p>
                <p className="mt-3 max-w-2xl text-[color:var(--bd-bone)]/75">
                  Your cut is tied to what ships. We agree the share before each engagement. Paid
                  when the client pays. No timesheets. No bullshit.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="grid items-center gap-6 rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-7 md:grid-cols-[auto_1fr] md:gap-10 md:p-10">
              <div
                aria-hidden
                className="font-display text-[7rem] leading-none font-bold text-[color:var(--bd-lime)] italic md:text-[9rem]"
              >
                ∞
              </div>
              <div>
                <p className="font-display text-2xl font-bold italic md:text-3xl">
                  Remote. Flexible. Async by default.
                </p>
                <p className="mt-3 max-w-2xl text-[color:var(--bd-bone)]/75">
                  We match how you work. Tools, cadence, and meeting rhythm get figured out in the
                  interview. We don&rsquo;t impose.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PROCESS — 4 steps, tight copy */}
      <section className="mt-20">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
            / The process
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-3 text-3xl leading-[1.1] font-bold tracking-tight italic md:text-5xl">
            Four steps. No mystery.
          </h2>
        </Reveal>
        {/* Connected path — each step is a big numbered circle; a dotted lime
            line threads them together. Horizontal on desktop, vertical on
            mobile. Reads as a journey, not a list of cards. */}
        <div className="relative mt-10">
          {/* Dotted spine — vertical on mobile (left edge), horizontal on
              desktop (centered through the row of circles). Positioned
              absolutely so it sits under the circles. */}
          <div
            aria-hidden
            className="absolute top-7 left-7 hidden h-px w-[calc(100%-3.5rem)] border-t-2 border-dashed border-[color:var(--bd-lime)]/35 lg:block"
          />
          <div
            aria-hidden
            className="absolute top-0 bottom-0 left-7 w-px border-l-2 border-dashed border-[color:var(--bd-lime)]/35 lg:hidden"
          />

          <div className="relative grid gap-8 lg:grid-cols-4 lg:gap-6">
            {PROCESS.map((p, i) => (
              <Reveal key={p.num} delay={i * 0.06}>
                <div className="relative flex gap-5 lg:block">
                  {/* Numbered node — solid lime disc, oversized italic number */}
                  <div className="relative flex h-14 w-14 flex-none items-center justify-center rounded-full bg-[color:var(--bd-lime)] shadow-[0_0_0_6px_var(--bd-ink)]">
                    <span className="font-display text-lg font-extrabold text-[color:var(--bd-ink)] italic">
                      {p.num}
                    </span>
                  </div>
                  <div className="flex-1 lg:mt-5">
                    <p className="font-display text-xl font-bold italic md:text-2xl">{p.title}</p>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-[color:var(--bd-bone)]/70">
                      {p.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* NOT FOR YOU IF — tight callout, mascot vibe */}
      <section className="mt-20">
        <Reveal>
          <div className="grid items-center gap-8 rounded-3xl border border-[color:var(--bd-lime)]/30 bg-[linear-gradient(135deg,#0a0a0a_0%,#141414_100%)] p-8 md:grid-cols-[1fr_auto] md:p-12">
            <div>
              <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
                / Not for you if
              </p>
              <p className="font-display mt-3 max-w-3xl text-2xl leading-[1.15] font-bold italic md:text-4xl">
                AI scares you.
              </p>
              <p className="mt-3 max-w-xl text-[color:var(--bd-bone)]/70">
                The whole studio runs on it. We even train clients up. We can&rsquo;t train the room
                you walk into.
              </p>
            </div>
            <div aria-hidden className="hidden justify-self-end md:block">
              <Mascot pose="thinking" size={120} />
            </div>
          </div>
        </Reveal>
      </section>

      {/* APPLICATION FORM */}
      <section id="apply" className="mt-20 scroll-mt-24">
        <Reveal>
          {state === 'done' ? (
            <MascotReward
              headline="We've got you."
              sub="We read every application. Expect a reply within 72 hours — check spam first if it doesn't show."
            />
          ) : (
            <form
              onSubmit={onSubmit}
              className="relative grid gap-4 rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)] p-8"
            >
              <div>
                <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
                  / Apply
                </p>
                <h2 className="font-display mt-2 text-2xl font-bold italic md:text-3xl">
                  Apply, or pitch us a role.
                </h2>
              </div>
              <Honeypot />
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
                placeholder="Role from above, or pitch your own (optional)"
                className="h-12 rounded-full border border-white/10 bg-transparent px-5 text-sm focus:border-[color:var(--bd-lime)] focus:outline-none"
              />
              <textarea
                name="note"
                placeholder="Tell us what you'd build here. Optional."
                rows={4}
                className="rounded-3xl border border-white/10 bg-transparent p-5 text-sm focus:border-[color:var(--bd-lime)] focus:outline-none"
              />
              <input
                name="portfolio"
                placeholder="Link to work — Figma, GitHub, site, IG. Optional."
                className="h-12 rounded-full border border-white/10 bg-transparent px-5 text-sm focus:border-[color:var(--bd-lime)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={state === 'sending'}
                className="inline-flex h-12 w-fit items-center rounded-full bg-[color:var(--bd-lime)] px-6 text-sm font-semibold text-[color:var(--bd-ink)] transition-colors hover:bg-[color:var(--bd-bone)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state === 'sending' ? 'Firing it off…' : 'Send →'}
              </button>
              {state === 'error' && (
                <p role="alert" className="text-sm text-[color:var(--bd-signal)]">
                  Something tripped on the way out. Give it another shot.
                </p>
              )}
            </form>
          )}
        </Reveal>
      </section>

      {/* WHATSAPP REFERRAL — lime card, mascot, no founder name */}
      <section className="mt-12">
        <Reveal>
          <div className="grid items-center gap-8 overflow-hidden rounded-3xl border border-[color:var(--bd-lime)]/40 bg-[color:var(--bd-lime)] p-8 text-[color:var(--bd-ink)] md:grid-cols-[1fr_auto] md:p-12">
            <div>
              <p className="font-mono text-xs tracking-widest text-[color:var(--bd-ink)]/70 uppercase">
                / Refer a founder
              </p>
              <h2 className="font-display mt-3 max-w-2xl text-3xl leading-[1.1] font-bold italic md:text-5xl">
                Know a founder who needs us?
              </h2>
              <p className="mt-4 max-w-xl text-[color:var(--bd-ink)]/85">
                Send them our way. If they sign, you get{' '}
                <span className="font-bold">10% of project value</span>. Paid when they pay — bKash,
                Payoneer, cash. No dashboard. Just DM us on WhatsApp.
              </p>
              <div className="mt-7">
                <MagneticButton href={whatsappHref} variant="inverse">
                  DM us on WhatsApp →
                </MagneticButton>
              </div>
            </div>
            <div aria-hidden className="hidden justify-self-end md:block">
              <Mascot pose="waving" size={140} />
            </div>
          </div>
        </Reveal>
      </section>

      {/* FAQ — tight answers, no name-drops */}
      <section className="mt-20">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
            / FAQ
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display mt-3 text-3xl leading-[1.1] font-bold tracking-tight italic md:text-5xl">
            Things you&rsquo;ll ask anyway.
          </h2>
        </Reveal>
        <div className="mt-8 divide-y divide-white/8 overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)]">
          {FAQ.map((f, i) => (
            <Reveal key={i} delay={i * 0.03}>
              <details className="group p-6 md:p-7">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--bd-lime)]">
                  <span className="font-display text-lg font-bold italic md:text-xl">{f.q}</span>
                  <span
                    aria-hidden
                    className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl text-[color:var(--bd-bone)]/75">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
