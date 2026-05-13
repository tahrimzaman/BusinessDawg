'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import MagneticButton from '@/components/motion/MagneticButton';
import Reveal from '@/components/motion/Reveal';
import { EASE } from '@/lib/motion/easing';
import { TIMING } from '@/lib/motion/timing';
import { SITE } from '@/lib/copy';
import { useTweaks } from '@/lib/dev/tweaks';

/**
 * Closing section (home). Pos 3 mascot anchored bottom-right,
 * left side carries the final headline + CTAs. Last word on the page
 * before the footer.
 */
export default function ClosingCTA() {
  const reduced = useReducedMotion();
  const tweaks = useTweaks();
  const dur = (reduced ? 0.2 : TIMING.revealLate) * (reduced ? 1 : tweaks.pace);

  return (
    <section className="relative isolate flex min-h-[90vh] items-end overflow-hidden pt-32 md:min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 80% 70%, color-mix(in srgb, var(--bd-lime) 14%, transparent), transparent 60%)',
        }}
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-end gap-10 px-6 pb-12 lg:grid-cols-12">
        {/* Copy */}
        <div className="relative z-10 lg:col-span-6">
          <Reveal>
            <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
              / Last word
            </p>
          </Reveal>
          <Reveal delay={0.05} pace="late">
            <h2 className="font-display mt-4 text-5xl leading-[0.95] font-extrabold tracking-tight italic sm:text-6xl md:text-7xl lg:text-[7rem]">
              Build the
              <br />
              <span className="text-[color:var(--bd-lime)]">machine.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-xl text-lg text-[color:var(--bd-bone)]/70">
              Book a 30-min call. We&rsquo;ll tell you straight up if BusinessDawg is the right fit.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <MagneticButton href="/contact">Book a call →</MagneticButton>
              <Link
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                data-cursor="dawg"
                className="inline-flex h-12 items-center rounded-full border border-white/15 px-6 text-sm font-semibold text-[color:var(--bd-bone)] transition-colors hover:border-[color:var(--bd-lime)] hover:text-[color:var(--bd-lime)]"
              >
                WhatsApp ↗
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Mascot Pos 3 — anchored to bottom */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: dur, ease: EASE }}
          className="relative h-[55vh] w-full lg:col-span-6 lg:h-[78vh]"
        >
          <Image
            src="/brand/mascot-pos-3.png"
            alt="BusinessDawg mascot — sitting"
            fill
            sizes="(min-width: 1024px) 50vw, 80vw"
            className="object-contain object-bottom"
          />
        </motion.div>
      </div>
    </section>
  );
}
