import type { Metadata } from 'next';

const description =
  'The studio behind BusinessDawg. Founded by operator Tahrim Zaman to build the systems most agencies only talk about: brand, AI workflows, web product, and growth, for founders who actually ship.';

export const metadata: Metadata = {
  title: 'About',
  description,
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About · BusinessDawg',
    description,
    url: 'https://businessdawg.com/about',
    type: 'profile',
  },
  twitter: { card: 'summary_large_image', title: 'About · BusinessDawg', description },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
