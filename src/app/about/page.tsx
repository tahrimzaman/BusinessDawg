'use client';

import Image from 'next/image';
import Reveal from '@/components/motion/Reveal';
import MagneticButton from '@/components/motion/MagneticButton';
import KineticText from '@/components/motion/KineticText';
import PullQuoteMarquee from '@/components/sections/PullQuoteMarquee';
import TalkersVsShippers from '@/components/sections/TalkersVsShippers';
import { SITE, FOUNDER, PULL_QUOTES } from '@/lib/copy';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

function Eyebrow({ label }: { label: string }) {
  return (
    <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
      {label}
    </p>
  );
}

export default function About() {
  return (
    <div className="relative">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://businessdawg.com' },
          { name: 'About', url: 'https://businessdawg.com/about' },
        ]}
      />
      {/* 1 — Hero / intro */}
      <section className="mx-auto max-w-4xl px-6 pt-40 pb-20">
        <Reveal>
          <Image
            src="/brand/logo-vertical.png"
            alt="BusinessDawg — wordmark"
            width={990}
            height={715}
            priority
            className="mx-auto mb-6 h-auto w-32 sm:mb-8 sm:w-40 md:w-44 lg:w-48"
          />
        </Reveal>
        <Reveal delay={0.05}>
          <Eyebrow label="/ Background" />
        </Reveal>
        <h1 className="font-display mt-3 text-5xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl md:text-7xl">
          <KineticText text="AI rewrote everything." />
        </h1>
        <Reveal delay={0.4}>
          <p className="font-display mt-4 text-2xl leading-tight font-bold tracking-tight text-[color:var(--bd-lime)] italic sm:text-3xl">
            Now we build the businesses that ride it.
          </p>
        </Reveal>
        <Reveal delay={0.5}>
          <div className="mt-10 space-y-5 text-lg leading-relaxed text-[color:var(--bd-bone)]/80">
            <p>
              The tools changed. The factories aren&apos;t smoke and steel anymore — they&apos;re
              code, models, automations, content engines. AI rewrote how ideas turn into products,
              how products turn into machines, how machines turn into companies.
            </p>
            <p>
              BusinessDawg is a studio built inside that shift. We don&apos;t write reports about
              it. We don&apos;t pitch decks about it. We build the systems — brand, web, AI
              workflows, growth — that turn the new shift into a real, running business.
            </p>
            <p className="text-[color:var(--bd-bone)]/70">
              There are talkers, and there are shippers. We&apos;re the second kind.
            </p>
          </div>
        </Reveal>
      </section>

      {/* 2 — Talkers vs Shippers (Roast-style scroll-scrub reel) */}
      <TalkersVsShippers />

      {/* 3 — Pull-quote marquee */}
      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <Eyebrow label="/ Loud thoughts" />
          </Reveal>
        </div>
        <div className="mt-6">
          <PullQuoteMarquee quotes={PULL_QUOTES} />
        </div>
      </section>

      {/* 4 — Meet the Dawg (compact card) */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <Reveal>
          <Eyebrow label="/ Meet the Dawg" />
        </Reveal>
        <Reveal delay={0.05}>
          <div className="mt-6 grid items-center gap-8 rounded-3xl border border-[rgba(200,255,0,0.6)] bg-[color:var(--bd-ink)] p-6 shadow-[0_0_24px_rgba(200,255,0,0.18)] sm:p-8 md:grid-cols-[260px_1fr]">
            <div className="relative mx-auto w-[260px] -translate-y-10">
              <div className="relative aspect-[499/898]">
                <Image
                  src="/founder-portrait.png"
                  alt={`${FOUNDER.name}, founder of BusinessDawg`}
                  fill
                  sizes="260px"
                  className="object-contain"
                  style={{
                    filter:
                      'drop-shadow(1px 0 0 rgba(200,255,0,0.7)) drop-shadow(-1px 0 0 rgba(200,255,0,0.7)) drop-shadow(0 1px 0 rgba(200,255,0,0.7)) drop-shadow(0 -1px 0 rgba(200,255,0,0.7)) drop-shadow(0 0 8px rgba(200,255,0,0.18))',
                  }}
                />
              </div>
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight italic sm:text-4xl md:text-5xl">
                {FOUNDER.name}
              </h2>
              <p className="mt-2 font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase sm:text-sm">
                CEO + Founder
              </p>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[color:var(--bd-bone)]/85 sm:text-xl">
                Recently graduated from Khulna University with a BBA — Major in Marketing, Minor in
                Finance. Heading to Hult International Business School in Boston, USA, for a dual
                master&apos;s in Business Analytics &amp; AI and International Marketing. Outside
                the studio, he runs multiple businesses in Faridpur, Bangladesh.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-sm tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
                <a
                  href={SITE.social.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[color:var(--bd-lime)]"
                >
                  LinkedIn ↗
                </a>
                <a
                  href={SITE.social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[color:var(--bd-lime)]"
                >
                  Instagram ↗
                </a>
                <a
                  href={`mailto:${SITE.social.email}`}
                  className="hover:text-[color:var(--bd-lime)]"
                >
                  Email ↗
                </a>
                <a
                  href={`https://wa.me/${SITE.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[color:var(--bd-lime)]"
                >
                  WhatsApp ↗
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 5 — Closing mantra */}
      <section className="mx-auto max-w-6xl px-6 pb-32 text-center">
        <Reveal pace="late">
          <Eyebrow label="/ The motto" />
        </Reveal>
        <Reveal delay={0.08} pace="late">
          <p className="font-display mt-6 text-[clamp(2rem,5vw,5rem)] leading-[1.05] font-extrabold tracking-tight italic">
            We build the <span className="text-[color:var(--bd-lime)]">machine.</span>
            <br />
            You run the business.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-10 inline-flex">
            <MagneticButton href="/contact">Book a Call →</MagneticButton>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
