import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import LenisProvider from '@/components/motion/LenisProvider';
import Constellation from '@/components/motion/Constellation';
import WoofListener from '@/components/motion/WoofListener';
import Navbar from '@/components/sections/Navbar';
import Footer from '@/components/sections/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} bg-ink text-bone antialiased`}
    >
      <body className="text-bone min-h-screen font-sans">
        <LenisProvider>
          <Constellation />
          <Navbar />
          <main className="relative">{children}</main>
          <Footer />
          <WoofListener />
        </LenisProvider>
      </body>
    </html>
  );
}
