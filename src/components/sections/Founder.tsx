import Image from 'next/image';
import Reveal from '@/components/motion/Reveal';
import { FOUNDER, SITE } from '@/lib/copy';

/**
 * "Brains behind BusinessDawg" — only used on /about, never on home.
 *
 * Layout: 5/7 grid. Left column is the transparent-cutout portrait sitting
 * over a layered decorative SVG (orbit ring, vertical hairline, corner ticks)
 * and a soft aurora glow. Right column is the eyebrow + headline + one-line
 * bio + hook + 3-stat grid from copy.ts.
 */
export default function Founder() {
  return (
    <section className="relative overflow-hidden py-32">
      <div className="bd-section-glow" />
      <div className="relative mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-12">
        {/* Portrait + decorative line art */}
        <Reveal className="md:col-span-5">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
            {/* Aurora glow behind the figure */}
            <div
              aria-hidden
              className="absolute inset-[8%] -z-10 rounded-[40%]"
              style={{
                background:
                  'radial-gradient(closest-side, color-mix(in srgb, var(--bd-lime) 32%, transparent), transparent 70%)',
                filter: 'blur(40px)',
              }}
            />

            {/* Decorative SVG line layer */}
            <svg
              aria-hidden
              viewBox="0 0 400 500"
              className="pointer-events-none absolute inset-0 h-full w-full"
            >
              {/* Vertical hairline behind the head */}
              <line
                x1="200"
                y1="0"
                x2="200"
                y2="120"
                stroke="var(--bd-lime)"
                strokeWidth="1"
                strokeDasharray="3 4"
                opacity="0.6"
              />
              {/* Orbit ring around upper body */}
              <ellipse
                cx="200"
                cy="220"
                rx="170"
                ry="200"
                fill="none"
                stroke="var(--bd-bone)"
                strokeWidth="1"
                opacity="0.12"
              />
              <ellipse
                cx="200"
                cy="220"
                rx="155"
                ry="185"
                fill="none"
                stroke="var(--bd-lime)"
                strokeWidth="1"
                strokeDasharray="2 8"
                opacity="0.35"
              />
              {/* Corner ticks (top-left + top-right) */}
              <path
                d="M 18 38 L 18 18 L 38 18"
                fill="none"
                stroke="var(--bd-lime)"
                strokeWidth="1.5"
                opacity="0.7"
              />
              <path
                d="M 382 38 L 382 18 L 362 18"
                fill="none"
                stroke="var(--bd-lime)"
                strokeWidth="1.5"
                opacity="0.7"
              />
              {/* Corner ticks (bottom-left + bottom-right) */}
              <path
                d="M 18 462 L 18 482 L 38 482"
                fill="none"
                stroke="var(--bd-lime)"
                strokeWidth="1.5"
                opacity="0.7"
              />
              <path
                d="M 382 462 L 382 482 L 362 482"
                fill="none"
                stroke="var(--bd-lime)"
                strokeWidth="1.5"
                opacity="0.7"
              />
              {/* Chest-level horizontal ticks */}
              <line
                x1="0"
                y1="340"
                x2="40"
                y2="340"
                stroke="var(--bd-lime)"
                strokeWidth="1.5"
                opacity="0.7"
              />
              <line
                x1="360"
                y1="340"
                x2="400"
                y2="340"
                stroke="var(--bd-lime)"
                strokeWidth="1.5"
                opacity="0.7"
              />
              {/* Annotation: serial number */}
              <text
                x="22"
                y="498"
                fill="var(--bd-bone)"
                opacity="0.45"
                fontSize="10"
                fontFamily="var(--font-mono, ui-monospace)"
                letterSpacing="2"
              >
                BD-FNDR-01
              </text>
              <text
                x="378"
                y="498"
                textAnchor="end"
                fill="var(--bd-bone)"
                opacity="0.45"
                fontSize="10"
                fontFamily="var(--font-mono, ui-monospace)"
                letterSpacing="2"
              >
                EST. 2026
              </text>
            </svg>

            {/* Transparent cutout portrait */}
            <Image
              src="/founder-cutout.png"
              alt={FOUNDER.name}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-contain"
              priority
            />
          </div>
        </Reveal>

        {/* Copy column */}
        <div className="md:col-span-7">
          <Reveal>
            <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
              / Brains behind BusinessDawg
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="font-display mt-4 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight italic sm:text-5xl">
              I’m Tahrim.{' '}
              <span className="text-[color:var(--bd-lime)]">I build business machines.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-2xl text-lg text-[color:var(--bd-bone)]/80">{FOUNDER.short}</p>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-4 max-w-2xl text-lg text-[color:var(--bd-bone)]/60">{FOUNDER.hook}</p>
          </Reveal>

          <Reveal delay={0.24}>
            <dl className="mt-12 grid gap-4 sm:grid-cols-3">
              {FOUNDER.credibility.map((c) => (
                <div key={c.label} className="bd-card p-5">
                  <dt className="font-display text-2xl font-bold text-[color:var(--bd-lime)] italic md:text-3xl">
                    {c.label}
                  </dt>
                  <dd className="mt-2 text-sm text-[color:var(--bd-bone)]/60">{c.sub}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/60 uppercase">
              <a
                href={SITE.social.linkedin}
                target="_blank"
                rel="noreferrer"
                data-cursor="dawg"
                className="hover:text-[color:var(--bd-lime)]"
              >
                LinkedIn ↗
              </a>
              <a
                href={`mailto:${SITE.social.email}`}
                data-cursor="dawg"
                className="hover:text-[color:var(--bd-lime)]"
              >
                Email ↗
              </a>
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                data-cursor="dawg"
                className="hover:text-[color:var(--bd-lime)]"
              >
                WhatsApp ↗
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
