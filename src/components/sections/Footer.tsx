'use client';

import Link from 'next/link';
import { useState } from 'react';
import Logo from '@/components/brand/Logo';
import Mascot from '@/components/brand/Mascot';
import { SITE } from '@/lib/copy';

const COL_PRODUCT = [{ href: '/systems', label: 'Systems' }];
const COL_STUDIO = [
  { href: '/about', label: 'About' },
  { href: '/join', label: 'Join' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer() {
  const [awake, setAwake] = useState(false);
  const [stretched, setStretched] = useState(false);

  return (
    <footer className="relative overflow-hidden border-t border-white/8 bg-[color:var(--bd-ink)]">
      {/* soft lime glow at top edge */}
      <div className="bd-section-glow" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo className="h-14 md:h-16" />
          <p className="font-display mt-8 max-w-md text-3xl leading-[1.05] font-bold italic">
            We build the machine.{' '}
            <span className="text-[color:var(--bd-lime)]">You run the business.</span>
          </p>
          <div className="mt-8 flex flex-wrap gap-3 font-mono text-xs tracking-widest uppercase">
            <a
              href={SITE.social.linkedin}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 px-3 py-1.5 hover:text-[color:var(--bd-lime)]"
            >
              LinkedIn
            </a>
            <a
              href={SITE.social.instagram}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 px-3 py-1.5 hover:text-[color:var(--bd-lime)]"
            >
              Instagram
            </a>
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 px-3 py-1.5 hover:text-[color:var(--bd-lime)]"
            >
              WhatsApp
            </a>
            <a
              href={`mailto:${SITE.social.email}`}
              className="rounded-full border border-white/10 px-3 py-1.5 hover:text-[color:var(--bd-lime)]"
            >
              Email
            </a>
          </div>
        </div>

        <div className="md:col-span-3">
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
            Product
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {COL_PRODUCT.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-[color:var(--bd-bone)]/70 hover:text-[color:var(--bd-lime)]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
            Studio
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {COL_STUDIO.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-[color:var(--bd-bone)]/70 hover:text-[color:var(--bd-lime)]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Easter egg: sleeping mascot. Click to wake, click again to stretch. */}
      <div className="border-t border-white/5 px-6 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p className="font-mono text-[11px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
            © {new Date().getFullYear()} BusinessDawg · Built by humans. Shipped on purpose.
          </p>
          <button
            aria-label="Wake the dawg"
            onClick={() => {
              if (!awake) setAwake(true);
              else setStretched((s) => !s);
            }}
            className="relative inline-flex"
            style={{
              transform: stretched ? 'scale(1.18)' : undefined,
              transition: 'transform 0.4s var(--bd-ease-out)',
            }}
          >
            <Mascot pose={awake ? (stretched ? 'waving' : 'idle') : 'sleeping'} size={56} />
          </button>
        </div>
      </div>
    </footer>
  );
}
