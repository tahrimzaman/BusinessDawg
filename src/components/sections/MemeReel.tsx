'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import MagneticButton from '@/components/motion/MagneticButton';
import DeckPaperStack from '@/components/illustrations/DeckPaperStack';
import GrowthHackerSilhouette from '@/components/illustrations/GrowthHackerSilhouette';
import ChatGPTPromptWindow from '@/components/illustrations/ChatGPTPromptWindow';
import DustyBrandBible from '@/components/illustrations/DustyBrandBible';
import { EASE } from '@/lib/motion/easing';

type Panel = {
  kind: 'pain' | 'punch';
  eyebrow: string;
  headline: string;
  headlineLime: string;
  body: string;
  Illustration?: React.ComponentType<{ className?: string }>;
  image?: { src: string; alt: string };
};

const PANELS: Panel[] = [
  {
    kind: 'pain',
    eyebrow: '/ pain 01',
    headline: 'They sold you a deck.',
    headlineLime: "Where's the product?",
    body: 'Most agencies want to sell you a logo. We want to sell you the machine.',
    Illustration: DeckPaperStack,
  },
  {
    kind: 'pain',
    eyebrow: '/ pain 02',
    headline: 'They promised growth.',
    headlineLime: 'Delivered tweets.',
    body: 'Growth hackers sell vibes. We ship the funnels and own the result.',
    Illustration: GrowthHackerSilhouette,
  },
  {
    kind: 'pain',
    eyebrow: '/ pain 03',
    headline: 'Their AI strategy is a',
    headlineLime: '$20 prompt.',
    body: "Real AI infrastructure isn't a ChatGPT browser tab. We wire the boring stuff to the smart stuff.",
    Illustration: ChatGPTPromptWindow,
  },
  {
    kind: 'pain',
    eyebrow: '/ pain 04',
    headline: '100 pages of brand guidelines',
    headlineLime: 'no one will read.',
    body: "Branding that doesn't apologize. Living systems, not bookshelf decoration.",
    Illustration: DustyBrandBible,
  },
  {
    kind: 'punch',
    eyebrow: '/ the solution',
    headline: 'We build the machine.',
    headlineLime: 'You run the business.',
    body: 'One studio. Five systems. Stop getting sold. Start getting shipped.',
    image: { src: '/brand/mascot-pos-2.png', alt: 'BusinessDawg mascot — arms crossed' },
  },
];

const TOTAL = PANELS.length;

/**
 * Half-tone grain overlay — sits over each illustration with mix-blend-mode
 * to add the gritty internet-native treatment. Pre-baked SVG noise via data URI.
 */
const GRAIN_BG =
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.78  0 0 0 0 1  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/**
 * Horizontal scroll-scrub meme reel. Section is 500vh tall; inner sticky
 * track translates left by -80% of 500vw (= -400vw) as scroll progresses,
 * advancing one panel per viewport of vertical scroll. Reduced motion =
 * vertical stack.
 */
export default function MemeReel() {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <section className="relative">
        {PANELS.map((p, i) => (
          <div
            key={i}
            className="relative flex min-h-screen items-center justify-center px-6 py-24"
          >
            <PanelContent panel={p} index={i} stacked />
          </div>
        ))}
      </section>
    );
  }

  return <HorizontalReel />;
}

function HorizontalReel() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // 5 panels at 100vw each = 500vw total inner width.
  // -80% of that = -400vw, leaving the 5th panel filling the viewport at end.
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-80%']);

  return (
    <section ref={ref} className="relative" style={{ height: `${TOTAL * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* lime atmospheric glow behind the whole reel */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, color-mix(in srgb, var(--bd-lime) 8%, transparent), transparent 75%)',
          }}
        />

        <motion.div style={{ x }} className="flex h-full w-[500vw]">
          {PANELS.map((p, i) => (
            <div key={i} className="flex h-full w-screen shrink-0 items-center">
              <PanelContent panel={p} index={i} />
            </div>
          ))}
        </motion.div>

        {/* progress indicator */}
        <ProgressIndicator scrollYProgress={scrollYProgress} />
      </div>
    </section>
  );
}

function ProgressIndicator({
  scrollYProgress,
}: {
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  return (
    <div className="pointer-events-none absolute right-0 bottom-8 left-0 mx-auto flex max-w-7xl items-center gap-4 px-6">
      <span className="font-mono text-[11px] tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
        / The roast
      </span>
      <div className="relative h-px flex-1 bg-white/10">
        <motion.div
          className="absolute inset-y-0 left-0 bg-[color:var(--bd-lime)]"
          style={{ width }}
        />
      </div>
      <span className="font-mono text-[11px] tracking-widest text-[color:var(--bd-lime)] uppercase">
        05 panels
      </span>
    </div>
  );
}

function PanelContent({
  panel,
  index,
  stacked = false,
}: {
  panel: Panel;
  index: number;
  stacked?: boolean;
}) {
  const idx = `0${index + 1}`;
  return (
    <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 lg:grid-cols-12 lg:gap-12 lg:px-12">
      {/* Left — illustration / image */}
      <motion.div
        initial={{ opacity: 0, x: stacked ? 0 : -40, y: stacked ? 30 : 0 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, margin: '-20%' }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative mx-auto w-full max-w-[480px] lg:col-span-5"
      >
        <div className="relative aspect-square w-full">
          {panel.Illustration && <panel.Illustration className="h-full w-full" />}
          {panel.image && (
            <Image
              src={panel.image.src}
              alt={panel.image.alt}
              fill
              sizes="(min-width: 1024px) 35vw, 80vw"
              className="object-contain object-bottom"
            />
          )}
          {/* half-tone grain overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: GRAIN_BG,
              backgroundSize: '200px 200px',
            }}
          />
        </div>
      </motion.div>

      {/* Right — copy */}
      <div className="lg:col-span-7">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase"
        >
          {panel.eyebrow}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="font-display mt-4 text-5xl leading-[1.02] font-extrabold tracking-tight text-[color:var(--bd-bone)] italic md:text-6xl lg:text-7xl"
        >
          {panel.headline}
          <br />
          <span className="text-[color:var(--bd-lime)]">{panel.headlineLime}</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
          className="mt-6 max-w-xl text-xl text-[color:var(--bd-bone)]/70"
        >
          {panel.body}
        </motion.p>

        {panel.kind === 'punch' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20%' }}
            transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <MagneticButton href="/contact">Book a Call →</MagneticButton>
            <span className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
              30 min · straight talk
            </span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-20%' }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-12 flex items-center gap-3"
        >
          <span aria-hidden className="inline-block h-px w-12 bg-[color:var(--bd-lime)]" />
          <span className="font-mono text-[11px] tracking-widest text-[color:var(--bd-bone)]/40 uppercase">
            {idx} / 0{TOTAL}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
