import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import LenisProvider from '@/components/motion/LenisProvider';
import WoofListener from '@/components/motion/WoofListener';
import Navbar from '@/components/sections/Navbar';
import Footer from '@/components/sections/Footer';
import PostHogProvider from '@/components/analytics/PostHogProvider';
import JsonLd from '@/components/seo/JsonLd';

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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/brand/logo-mark.png', type: 'image/png' },
    ],
    apple: '/brand/logo-mark.png',
  },
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
      <body className="text-bone min-h-screen font-sans">
        {/* First-touch capture: remember the landing pathname so booking
            attribution survives same-tab navigation. Runs before hydration. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!sessionStorage.getItem('bd:first-touch'))sessionStorage.setItem('bd:first-touch',location.pathname);}catch(e){}",
          }}
        />
        <PostHogProvider>
          <LenisProvider>
            <Navbar />
            <main className="relative">{children}</main>
            <Footer />
            <WoofListener />
          </LenisProvider>
        </PostHogProvider>
        <JsonLd />
      </body>
    </html>
  );
}
