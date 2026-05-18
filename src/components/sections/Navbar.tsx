'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from '@/components/brand/Logo';
import MagneticButton from '@/components/motion/MagneticButton';

const LINKS = [
  { href: '/systems', label: 'Systems' },
  { href: '/built', label: 'Built' },
  { href: '/journal', label: 'Journal' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/join', label: 'Join' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[backdrop-filter,background-color,border-color] duration-300 ${
        scrolled
          ? 'border-b border-white/5 bg-[color:var(--bd-ink)]/70 backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          aria-label="BusinessDawg home"
          onClick={() => setOpen(false)}
          className="focus-bd group flex items-center gap-2 text-[color:var(--bd-bone)] transition-transform hover:scale-[1.02]"
        >
          <Logo className="h-9 md:h-11" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="focus-bd text-sm font-medium text-[color:var(--bd-bone)]/70 transition-colors hover:text-[color:var(--bd-lime)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <MagneticButton href="/contact">Book a Call →</MagneticButton>
        </div>

        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
          className="focus-bd rounded-full border border-white/10 px-3 py-2 text-xs tracking-widest text-[color:var(--bd-bone)]/80 uppercase md:hidden"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="md:hidden">
          <nav
            aria-label="Mobile"
            className="flex flex-col gap-4 border-t border-white/5 bg-[color:var(--bd-ink)]/95 px-6 py-6 backdrop-blur-lg"
          >
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="focus-bd text-2xl font-semibold text-[color:var(--bd-bone)] italic hover:text-[color:var(--bd-lime)]"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="focus-bd mt-2 inline-flex h-12 w-fit items-center rounded-full bg-[color:var(--bd-lime)] px-5 text-sm font-semibold text-[color:var(--bd-ink)]"
            >
              Book a Call →
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
