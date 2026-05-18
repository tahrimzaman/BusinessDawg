/**
 * /contact — book a 30-min call. Self-hosted booking flow as of Phase 6;
 * the old Cal.com iframe has been retired in favor of /api/booking +
 * /admin/availability. The flow fetches live slots server-side so the
 * page renders fully populated on first paint and degrades to a "no
 * slots" message if availability isn't configured yet.
 */

import { headers } from 'next/headers';
import Reveal from '@/components/motion/Reveal';
import MagneticButton from '@/components/motion/MagneticButton';
import DawgAvatar from '@/components/brand/DawgAvatar';
import BookingFlow from '@/components/booking/BookingFlow';
import type { Slot } from '@/components/booking/SlotList';
import { SITE } from '@/lib/copy';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const description =
  'Book a free 30-minute call with BusinessDawg. No decks — tell us what’s leaking and we’ll tell you what to do about it. WhatsApp, email, and instant calendar booking all open.';

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

export const dynamic = 'force-dynamic';

async function fetchSlots(): Promise<{ slots: Slot[]; ownerTz: string }> {
  const h = await headers();
  const host = h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  try {
    const res = await fetch(`${proto}://${host}/api/booking/availability`, {
      cache: 'no-store',
    });
    if (!res.ok) return { slots: [], ownerTz: 'Asia/Dhaka' };
    const json = (await res.json()) as { slots: Slot[]; ownerTz: string };
    return { slots: json.slots ?? [], ownerTz: json.ownerTz ?? 'Asia/Dhaka' };
  } catch {
    return { slots: [], ownerTz: 'Asia/Dhaka' };
  }
}

export default async function Contact() {
  const { slots, ownerTz } = await fetchSlots();

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://businessdawg.com' },
          { name: 'Contact', url: 'https://businessdawg.com/contact' },
        ]}
      />
      <Reveal>
        <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
          / Contact
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="font-display mt-3 text-4xl leading-[1.02] font-extrabold tracking-tight italic sm:text-6xl md:text-7xl">
          Book the dawg.
        </h1>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mt-6 max-w-2xl text-lg text-[color:var(--bd-bone)]/70">
          30 minutes. Free. No decks. Tell us what’s leaking and we’ll tell you what to do about it.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-8 md:grid-cols-12">
        <Reveal className="min-w-0 md:col-span-8">
          {slots.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)] p-8 text-center text-sm text-[color:var(--bd-bone)]/70">
              No slots available right now. Hit WhatsApp or email and we’ll find a time.
            </div>
          ) : (
            <BookingFlow slots={slots} ownerTz={ownerTz} />
          )}
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
