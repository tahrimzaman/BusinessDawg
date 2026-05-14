import Reveal from '@/components/motion/Reveal';
import MagneticButton from '@/components/motion/MagneticButton';
import Faq from '@/components/sections/Faq';
import { FaqJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { FAQ } from '@/lib/copy';

const description =
  'Answers to the questions we keep getting at BusinessDawg — what we build, who we work with, where we are, how fast we ship.';

export const metadata = {
  title: 'FAQ',
  description,
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ — BusinessDawg',
    description,
    url: 'https://businessdawg.com/faq',
    type: 'website' as const,
  },
  twitter: { card: 'summary_large_image' as const, title: 'FAQ — BusinessDawg', description },
};

export default function FaqPage() {
  return (
    <>
      <FaqJsonLd items={FAQ} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://businessdawg.com' },
          { name: 'FAQ', url: 'https://businessdawg.com/faq' },
        ]}
      />
      <div className="mx-auto max-w-5xl px-6 pt-40 pb-12">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / FAQ
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-display mt-3 text-5xl leading-[1.02] font-extrabold tracking-tight italic sm:text-6xl md:text-7xl">
            Stuff people keep asking.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-2xl text-lg text-[color:var(--bd-bone)]/70">
            Quick answers. If yours isn’t here, hit Book a Call or WhatsApp — Tahrim picks up.
          </p>
        </Reveal>
      </div>
      <Faq
        items={FAQ}
        eyebrow="/ Everything we get asked"
        heading="The questions we keep getting."
      />
      <section className="mx-auto max-w-5xl px-6 pb-32">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-[color:var(--bd-lime)]/30 bg-[color:var(--bd-lime)]/5 p-8">
          <div>
            <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
              Didn’t find it?
            </p>
            <p className="font-display mt-2 text-2xl font-bold italic">Book the dawg.</p>
          </div>
          <MagneticButton href="/contact">Book a Call →</MagneticButton>
        </div>
      </section>
    </>
  );
}
