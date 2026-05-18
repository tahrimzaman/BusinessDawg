import Reveal from '@/components/motion/Reveal';
import MagneticButton from '@/components/motion/MagneticButton';

export default function Recruitment() {
  return (
    <section className="relative overflow-hidden py-14 md:py-20">
      <div className="bd-section-glow" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-16">
        <div className="grid gap-5 md:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col justify-between rounded-3xl border border-white/8 bg-[linear-gradient(135deg,#0a0a0a_0%,#141414_100%)] p-10 md:p-14">
              <div>
                <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
                  For founders
                </p>
                <h3 className="font-display mt-4 text-4xl leading-[1.05] font-bold italic">
                  Have a business to build?
                </h3>
                <p className="mt-4 max-w-md text-[color:var(--bd-bone)]/70">
                  15 minutes. No decks. Tell us what’s leaking and we’ll tell you what to do about
                  it.
                </p>
              </div>
              <div className="mt-10">
                <MagneticButton href="/contact">Book a Call →</MagneticButton>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="flex h-full flex-col justify-between rounded-3xl border border-[color:var(--bd-lime)]/40 bg-[color:var(--bd-lime)] p-10 text-[color:var(--bd-ink)] md:p-14">
              <div>
                <p className="font-mono text-xs tracking-widest text-[color:var(--bd-ink)]/70 uppercase">
                  For talent
                </p>
                <h3 className="font-display mt-4 text-4xl leading-[1.05] font-bold italic">
                  Want to join us?
                </h3>
                <p className="mt-4 max-w-md text-[color:var(--bd-ink)]/80">
                  We hire weirdos with taste. Designers, engineers, growth ops, AI nerds. If that’s
                  you, the door’s open.
                </p>
              </div>
              <div className="mt-10">
                <MagneticButton href="/join" variant="inverse">
                  See open roles →
                </MagneticButton>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
