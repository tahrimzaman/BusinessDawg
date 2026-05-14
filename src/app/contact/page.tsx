import Reveal from '@/components/motion/Reveal';
import MagneticButton from '@/components/motion/MagneticButton';
import DawgAvatar from '@/components/brand/DawgAvatar';
import CalEmbed from '@/components/booking/CalEmbed';
import { SITE } from '@/lib/copy';

const description =
  'Book a 15-minute call with BusinessDawg. No decks — tell us what’s leaking and we’ll tell you what to do about it. WhatsApp, email, and Cal.com booking all open.';

export const metadata = {
  title: 'Contact',
  description,
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact — BusinessDawg',
    description,
    url: 'https://businessdawg.com/contact',
    type: 'website' as const,
  },
  twitter: { card: 'summary_large_image' as const, title: 'Contact — BusinessDawg', description },
};

export default function Contact() {
  const calSrc = `https://cal.com/${SITE.cal}?embed=true&theme=dark`;

  return (
    <div className="mx-auto max-w-6xl px-6 pt-40 pb-24">
      <Reveal>
        <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
          / Contact
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="font-display mt-3 text-5xl leading-[1.02] font-extrabold tracking-tight italic sm:text-6xl md:text-7xl">
          Book the dawg.
        </h1>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mt-6 max-w-2xl text-lg text-[color:var(--bd-bone)]/70">
          15 minutes. No decks. Tell us what’s leaking and we’ll tell you what to do about it.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-8 md:grid-cols-12">
        <Reveal className="md:col-span-8">
          <CalEmbed src={calSrc} />
        </Reveal>

        <Reveal delay={0.06} className="md:col-span-4">
          <div className="rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)] p-6">
            <DawgAvatar size={96} />
            <p className="font-display mt-4 text-2xl font-bold italic">Or message us.</p>
            <div className="mt-6 flex flex-col gap-3">
              <MagneticButton href={`https://wa.me/${SITE.whatsapp}`}>WhatsApp →</MagneticButton>
              <MagneticButton href={`mailto:${SITE.social.email}`} variant="ghost">
                Email →
              </MagneticButton>
            </div>
            <p className="mt-6 font-mono text-[11px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
              Office hours · GMT+6 · most days 10–18
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
