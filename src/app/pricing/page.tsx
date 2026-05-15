import Reveal from '@/components/motion/Reveal';
import MagneticButton from '@/components/motion/MagneticButton';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const description =
  'BusinessDawg engagements are custom-scoped on a 15-minute call. We don’t publish prices because every system is sized to its outcome — here is how we actually quote, what affects the scope, and what you will know before you sign.';

export const metadata = {
  title: 'Pricing',
  description,
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing — BusinessDawg',
    description,
    url: 'https://businessdawg.com/pricing',
    type: 'website' as const,
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Pricing — BusinessDawg',
    description,
  },
};

export default function PricingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://businessdawg.com' },
          { name: 'Pricing', url: 'https://businessdawg.com/pricing' },
        ]}
      />
      <article className="mx-auto max-w-3xl px-6 pt-40 pb-24">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / Pricing
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-display mt-4 text-4xl leading-[1.05] font-extrabold tracking-tight italic sm:text-5xl md:text-6xl">
            We don&rsquo;t publish prices. We publish how we price.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-8 text-xl leading-relaxed text-[color:var(--bd-bone)]/85">
            BusinessDawg engagements are custom-scoped on a 15-minute call. We don&rsquo;t publish
            numbers because the cheapest engagement and the biggest one share zero ingredients —
            quoting either would lie about the other. What we can publish is how we actually quote,
            what affects the scope, and exactly what you will know before you sign.
          </p>
        </Reveal>

        <section className="mt-20">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight italic md:text-3xl">
              Why no public prices
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mt-5 space-y-5 text-lg leading-relaxed text-[color:var(--bd-bone)]/80">
              <p>
                A landing page that ships in two weeks and a full web product with AI workflows that
                ships in twelve do not belong on the same price sheet. Listing &ldquo;starting at
                $X&rdquo; would either over-quote the small engagement or under-quote the big one.
                Both options cost the operator-founder real money.
              </p>
              <p>
                We also do not run a productized retainer model where the price is the same every
                month regardless of what shipped. That model is fine for some studios. It is not
                ours. Our engagements end. The hand-off ends them.
              </p>
              <p>
                Hiding the number is not a sales tactic. It is an accuracy tactic. The number we
                quote on the call will be the number on the SOW.
              </p>
            </div>
          </Reveal>
        </section>

        <section className="mt-20">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight italic md:text-3xl">
              How we quote
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mt-5 space-y-5 text-lg leading-relaxed text-[color:var(--bd-bone)]/80">
              <p>
                Every engagement starts with a 15-minute call. No decks. We ask for the outcome you
                need, the timeline you have, and the bottleneck you think the engagement is pointing
                at. By the end of that call we either tell you which system from the Systems Stack
                fits, propose a custom scope built on one or two systems as the anchor, or tell you
                honestly that we are not the right studio for what you need.
              </p>
              <p>
                After the call, we send a written scope within 48 hours: outcome, deliverables,
                timeline, price, and what hand-off looks like. If you sign, the engagement starts
                that week. If you do not, the call cost nothing.
              </p>
            </div>
          </Reveal>
        </section>

        <section className="mt-20">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight italic md:text-3xl">
              What affects the price
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-5 text-lg leading-relaxed text-[color:var(--bd-bone)]/80">
              Four variables move the number. Naming them upfront lets you self-scope before the
              call.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="mt-6 space-y-3 text-lg leading-relaxed text-[color:var(--bd-bone)]/80">
              {[
                'Scope depth — a brand identity is a different shape than a full marketing infrastructure rollout. One system is cheaper than three. Productized is cheaper than custom.',
                'Timeline pressure — a 4-week engagement compresses what a 10-week one absorbs. Compression has a price; so does patience. We quote both.',
                'Hand-off complexity — engagements that include team training, runbooks, and live operating support cost more than engagements that hand off a static doc set. We default to real hand-off.',
                'Ownership of stack — using your existing tools is cheaper than us picking and configuring new ones. Migration work earns its scope.',
              ].map((line, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-2 inline-block h-1.5 w-1.5 flex-none rounded-full bg-[color:var(--bd-lime)]"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        <section className="mt-20">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight italic md:text-3xl">
              What you will know before you sign
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <ul className="mt-6 space-y-3 text-lg leading-relaxed text-[color:var(--bd-bone)]/80">
              {[
                'The outcome the engagement is scoped to move — the specific number, by the specific date.',
                'The deliverables, named explicitly and ordered by week.',
                'The price — fixed for the scope, not estimate-to-actual.',
                'The hand-off — what artifacts you own, what training is included, and the day we leave.',
                'The escape — what happens if the engagement is not working at the halfway review. We do not lock teams into engagements that have stopped shipping.',
              ].map((line, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-2 inline-block h-1.5 w-1.5 flex-none rounded-full bg-[color:var(--bd-lime)]"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        <section className="mt-20">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight italic md:text-3xl">
              Productized first. Custom on top.
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mt-5 space-y-5 text-lg leading-relaxed text-[color:var(--bd-bone)]/80">
              <p>
                The Systems Stack is five productized systems. Each one is sized to a known shape:
                outcome, timeline, deliverables, hand-off. Productized engagements are quoted at the
                call.
              </p>
              <p>
                When the work is genuinely multi-system or genuinely deep, we scope a custom
                engagement built on one or two productized systems as the anchor. The custom work
                earns its scope from the proven shape underneath. Custom engagements are still
                quoted fixed-price — we just need a longer call (30 minutes) to scope them.
              </p>
              <p>
                If you are not sure which one you need, that is the call. We will name it with you.
              </p>
            </div>
          </Reveal>
        </section>

        <Reveal>
          <div className="mt-20 rounded-3xl border border-[color:var(--bd-lime)]/30 bg-[color:var(--bd-lime)]/5 p-8 md:p-10">
            <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
              Scoped on a call
            </p>
            <p className="font-display mt-2 text-2xl font-bold italic md:text-3xl">
              Find out what your system would actually cost.
            </p>
            <p className="mt-3 max-w-xl text-[color:var(--bd-bone)]/70">
              15 minutes. No decks. You leave the call with a clear sense of scope, timeline, and
              whether the engagement is worth booking. The call itself is free.
            </p>
            <div className="mt-6">
              <MagneticButton href="/contact">Book the call →</MagneticButton>
            </div>
          </div>
        </Reveal>
      </article>
    </>
  );
}
