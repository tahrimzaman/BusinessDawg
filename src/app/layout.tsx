import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import nextDynamic from 'next/dynamic';
import Script from 'next/script';
import './globals.css';
import LenisProvider from '@/components/motion/LenisProvider';
import WoofListener from '@/components/motion/WoofListener';
import Navbar from '@/components/sections/Navbar';
import Footer from '@/components/sections/Footer';
import PostHogProvider from '@/components/analytics/PostHogProvider';
import JsonLd from '@/components/seo/JsonLd';

// TweakPanel ships only outside production. In prod the import resolves to a
// no-op component, so the panel's JS chunk never lands in the client bundle.
const TweakPanel =
  process.env.NODE_ENV === 'production'
    ? () => null
    : nextDynamic(() => import('@/components/dev/TweakPanel'));

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://businessdawg.com'),
  title: {
    default: 'BusinessDawg — We build business machines.',
    template: '%s — BusinessDawg',
  },
  description:
    'Branding, AI, web, and growth systems for founders who actually ship. A Gen Z–native business growth studio.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'BusinessDawg — We build business machines.',
    description: 'Branding, AI, web, and growth systems for founders who actually ship.',
    url: 'https://businessdawg.com',
    siteName: 'BusinessDawg',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} bg-ink text-bone antialiased`}
    >
      <head>
        {/* LCP preloads — the Hero mascot is the largest contentful paint candidate.
            Hoisting them off the parser's discovery path shaves DNS/connection wait
            and gives the browser a head start before React hydrates. */}
        <link
          rel="preload"
          as="image"
          href="/brand/mascot-pos-1.webp"
          type="image/webp"
          fetchPriority="high"
        />
        <link rel="preload" as="image" href="/brand/logo-vertical.webp" type="image/webp" />
      </head>
      <body className="text-bone min-h-screen font-sans">
        {/* First-touch capture: remember the landing pathname so booking
            attribution survives same-tab navigation. `beforeInteractive` runs
            before hydration so the value is set in time for any client code
            that reads it. Routed through next/script (over raw <script
            dangerouslySetInnerHTML>) so a future CSP can grant a nonce and
            keep `script-src 'self'` instead of needing `unsafe-inline`. */}
        <Script id="bd-first-touch" strategy="beforeInteractive">
          {`try{if(!sessionStorage.getItem('bd:first-touch'))sessionStorage.setItem('bd:first-touch',location.pathname);}catch(e){}`}
        </Script>
        <PostHogProvider>
          <LenisProvider>
            <Navbar />
            <main className="relative">{children}</main>
            <Footer />
            <WoofListener />
          </LenisProvider>
        </PostHogProvider>
        <TweakPanel />
        <JsonLd />
      </body>
    </html>
  );
}
