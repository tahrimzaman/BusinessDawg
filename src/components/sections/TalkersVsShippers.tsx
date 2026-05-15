'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import MagneticButton from '@/components/motion/MagneticButton';
import DecksVsV1s from '@/components/illustrations/DecksVsV1s';
import RoadmapsVsReleases from '@/components/illustrations/RoadmapsVsReleases';
import ReportsVsWorkflows from '@/components/illustrations/ReportsVsWorkflows';
import LogosVsLivingSystems from '@/components/illustrations/LogosVsLivingSystems';
import StakeholdersVsRevenue from '@/components/illustrations/StakeholdersVsRevenue';
import { EASE } from '@/lib/motion/easing';

type Panel =
  | {
      kind: 'compare';
      eyebrow: string;
      talker: string;
      shipper: string;
      body: string;
      Illustration: React.ComponentType<{ className?: string }>;
    }
  | {
      kind: 'punch';
      eyebrow: string;
      headline: string;
      headlineLime: string;
      body: string;
      image: { src: string; alt: string };
    };

const PANELS: Panel[] = [
  {
    kind: 'compare',
    eyebrow: '/ 01',
    talker: 'Pitch decks',
    shipper: 'Working v1s',
    body: 'They presented. We pushed to main.',
    Illustration: DecksVsV1s,
  },
  {
    kind: 'compare',
    eyebrow: '/ 02',
    talker: 'Quarterly roadmaps',
    shipper: 'Weekly releases',
    body: 'Roadmaps rot. Shipping compounds.',
    Illustration: RoadmapsVsReleases,
  },
  {
    kind: 'compare',
    eyebrow: '/ 03',
    talker: 'Reports about AI',
    shipper: 'Workflows that use AI',
    body: 'Anyone can write the slide. We wire the agent.',
    Illustration: ReportsVsWorkflows,
  },
  {
    kind: 'compare',
    eyebrow: '/ 04',
    talker: 'Logos',
    shipper: 'Living systems',
    body: 'A logo is the cover. We build the book that runs.',
    Illustration: LogosVsLivingSystems,
  },
  {
    kind: 'compare',
    eyebrow: '/ 05',
    talker: 'Stakeholder alignment',
    shipper: 'Customer revenue',
    body: 'Meetings about meetings. We chase real money.',
    Illustration: StakeholdersVsRevenue,
  },
  {
    kind: 'punch',
    eyebrow: '/ the move',
    headline: 'We build the machine.',
    headlineLime: 'You run the business.',
    body: 'One studio. Pick a system. Pick five. Pick none and we still ship.',
    image: { src: '/brand/mascot-meme.webp', alt: 'BusinessDawg mascot' },
  },
];

const TOTAL = PANELS.length;

const GRAIN_BG =
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.78  0 0 0 0 1  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

function useIsBelowLg() {
  const [below, setBelow] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 1023.99px)');
    const update = () => setBelow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return below;
}

function StackedReel() {
  return (
    <section className="relative">
      {PANELS.map((p, i) => (
        <div key={i} className="relative flex min-h-screen items-center justify-center px-6 py-24">
          <PanelContent panel={p} index={i} stacked />
        </div>
      ))}
    </section>
  );
}

function MobileCarouselReel() {
  return (
    <section className="relative">
      <div
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        data-lenis-prevent
      >
        {PANELS.map((p, i) => (
          <div
            key={i}
            className="flex min-h-screen w-screen shrink-0 snap-center snap-always items-center px-6 py-20"
          >
            <PanelContent panel={p} index={i} stacked />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TalkersVsShippers() {
  const reduced = useReducedMotion();
  const belowLg = useIsBelowLg();

  if (reduced) return <StackedReel />;
  if (belowLg) return <MobileCarouselReel />;
  return <HorizontalReel />;
}

function HorizontalReel() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const endPct = ((TOTAL - 1) / TOTAL) * 100;
  const x = useTransform(scrollYProgress, [0, 1], ['0%', `-${endPct}%`]);

  return (
    <section ref={ref} className="relative" style={{ height: `${TOTAL * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, color-mix(in srgb, var(--bd-lime) 8%, transparent), transparent 75%)',
          }}
        />

        <motion.div style={{ x, width: `${TOTAL * 100}vw` }} className="flex h-full">
          {PANELS.map((p, i) => (
            <div key={i} className="flex h-full w-screen shrink-0 items-center">
              <PanelContent panel={p} index={i} />
            </div>
          ))}
        </motion.div>

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
      <span className="font-mono text-[11px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
        / Talkers vs Shippers
      </span>
      <div className="relative h-px flex-1 bg-white/10">
        <motion.div
          className="absolute inset-y-0 left-0 bg-[color:var(--bd-lime)]"
          style={{ width }}
        />
      </div>
      <span className="font-mono text-[11px] tracking-widest text-[color:var(--bd-lime)] uppercase">
        0{TOTAL} panels
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
    <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 lg:grid-cols-12 lg:gap-12 lg:px-16">
      {/* Left — illustration / image */}
      <motion.div
        initial={stacked ? false : { opacity: 0, x: -40 }}
        whileInView={stacked ? undefined : { opacity: 1, x: 0 }}
        viewport={stacked ? undefined : { once: true, margin: '-20%' }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative mx-auto w-full max-w-[480px] lg:col-span-5"
      >
        <div className="relative aspect-square w-full">
          {panel.kind === 'compare' && <panel.Illustration className="h-full w-full" />}
          {panel.kind === 'punch' && (
            <Image
              src={panel.image.src}
              alt={panel.image.alt}
              fill
              sizes="(min-width: 1024px) 35vw, 80vw"
              className="scale-[1.3] object-contain object-bottom"
              style={{ transformOrigin: 'bottom center' }}
            />
          )}
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
          initial={stacked ? false : { opacity: 0, y: 12 }}
          whileInView={stacked ? undefined : { opacity: 1, y: 0 }}
          viewport={stacked ? undefined : { once: true, margin: '-20%' }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase"
        >
          {panel.eyebrow}
        </motion.p>

        {panel.kind === 'compare' ? (
          <motion.h2
            initial={stacked ? false : { opacity: 0, y: 16 }}
            whileInView={stacked ? undefined : { opacity: 1, y: 0 }}
            viewport={stacked ? undefined : { once: true, margin: '-20%' }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="font-display mt-4 text-3xl leading-[1.05] font-bold tracking-tight italic sm:text-4xl md:text-5xl lg:text-6xl"
          >
            <span className="block text-[color:var(--bd-bone)]/45 line-through decoration-[color:var(--bd-bone)]/30">
              × {panel.talker}
            </span>
            <span className="block text-[color:var(--bd-lime)]">✓ {panel.shipper}</span>
          </motion.h2>
        ) : (
          <motion.h2
            initial={stacked ? false : { opacity: 0, y: 16 }}
            whileInView={stacked ? undefined : { opacity: 1, y: 0 }}
            viewport={stacked ? undefined : { once: true, margin: '-20%' }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="font-display mt-4 text-3xl leading-[1.02] font-bold tracking-tight text-[color:var(--bd-bone)] italic sm:text-4xl md:text-5xl lg:text-6xl"
          >
            {panel.headline}
            <br />
            <span className="text-[color:var(--bd-lime)]">{panel.headlineLime}</span>
          </motion.h2>
        )}

        <motion.p
          initial={stacked ? false : { opacity: 0, y: 16 }}
          whileInView={stacked ? undefined : { opacity: 1, y: 0 }}
          viewport={stacked ? undefined : { once: true, margin: '-20%' }}
          transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
          className="mt-6 max-w-xl text-base text-[color:var(--bd-bone)]/70 sm:text-lg md:text-xl"
        >
          {panel.body}
        </motion.p>

        {panel.kind === 'punch' && (
          <motion.div
            initial={stacked ? false : { opacity: 0, y: 16 }}
            whileInView={stacked ? undefined : { opacity: 1, y: 0 }}
            viewport={stacked ? undefined : { once: true, margin: '-20%' }}
            transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <MagneticButton href="/contact">Book a Call →</MagneticButton>
            <span className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
              30 min · straight talk
            </span>
          </motion.div>
        )}

        <motion.div
          initial={stacked ? false : { opacity: 0 }}
          whileInView={stacked ? undefined : { opacity: 1 }}
          viewport={stacked ? undefined : { once: true, margin: '-20%' }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-12 flex items-center gap-3"
        >
          <span aria-hidden className="inline-block h-px w-12 bg-[color:var(--bd-lime)]" />
          <span className="font-mono text-[11px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
            {idx} / 0{TOTAL}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
