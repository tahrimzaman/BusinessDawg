import Reveal from '@/components/motion/Reveal';
import Mascot from '@/components/brand/Mascot';
import { FOUNDER, SITE } from '@/lib/copy';

export default function Founder() {
  return (
    <section className="relative py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / Brains behind BusinessDawg
          </p>
          <div className="relative mt-6 aspect-[4/5] overflow-hidden rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)]">
            {/* Founder photo placeholder — drop /assets/inbox/Founder Photo.png into /public/founder.jpg to swap */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#c8ff0033,transparent_60%),linear-gradient(135deg,#141414,#0a0a0a)]" />
            <div className="absolute top-4 right-4 rounded-full border border-white/10 bg-black/60 px-3 py-1 font-mono text-[10px] tracking-widest text-white/70 uppercase">
              Tahrim Zaman · Founder
            </div>
            <div className="absolute right-4 bottom-4">
              <Mascot pose="thinking" size={96} />
            </div>
          </div>
        </Reveal>

        <div className="md:col-span-7">
          <Reveal>
            <h2 className="font-display max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight italic sm:text-5xl">
              I’m Tahrim.{' '}
              <span className="text-[color:var(--bd-lime)]">I build business machines.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 max-w-2xl text-lg text-[color:var(--bd-bone)]/80">{FOUNDER.short}</p>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-4 max-w-2xl text-lg text-[color:var(--bd-bone)]/60">{FOUNDER.hook}</p>
          </Reveal>

          <Reveal delay={0.2}>
            <dl className="mt-12 grid gap-6 sm:grid-cols-3">
              {FOUNDER.credibility.map((c) => (
                <div key={c.label} className="border-t border-white/10 pt-4">
                  <dt className="font-display text-2xl font-bold text-[color:var(--bd-lime)] italic md:text-3xl">
                    {c.label}
                  </dt>
                  <dd className="mt-2 text-sm text-[color:var(--bd-bone)]/60">{c.sub}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.28}>
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
