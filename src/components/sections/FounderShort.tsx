import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import { FOUNDER } from '@/lib/copy';

/**
 * Homepage founder card — ~50 word intro. Lives between SystemsStack and
 * Chatbot so visitors know who's behind the work before they engage.
 * The longer founder narrative lives on /about (Founder.tsx).
 */
export default function FounderShort() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-12">
        <Reveal className="md:col-span-4">
          <div className="relative mx-auto aspect-square w-full max-w-xs">
            <div
              aria-hidden
              className="absolute inset-[6%] -z-10 rounded-[40%]"
              style={{
                background:
                  'radial-gradient(closest-side, color-mix(in srgb, var(--bd-lime) 28%, transparent), transparent 70%)',
                filter: 'blur(36px)',
              }}
            />
            <Image
              src="/founder-cutout.png"
              alt={FOUNDER.name}
              fill
              sizes="(min-width: 768px) 30vw, 60vw"
              className="object-contain"
            />
          </div>
        </Reveal>
        <div className="md:col-span-8">
          <Reveal>
            <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
              / Behind the studio
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="font-display mt-3 max-w-2xl text-3xl leading-[1.05] font-extrabold tracking-tight italic sm:text-4xl md:text-5xl">
              I’m Tahrim.{' '}
              <span className="text-[color:var(--bd-lime)]">Operator turned builder.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-2xl text-lg text-[color:var(--bd-bone)]/75">{FOUNDER.short}</p>
          </Reveal>
          <Reveal delay={0.18}>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/70 uppercase hover:text-[color:var(--bd-lime)]"
            >
              Full story ↗
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
