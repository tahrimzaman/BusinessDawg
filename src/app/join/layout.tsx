import type { Metadata } from 'next';

const description =
  'BusinessDawg hires weirdos with taste. Open roles for brand designers, full-stack engineers, growth operators, and AI automation engineers — remote, contract-to-hire.';

export const metadata: Metadata = {
  title: 'Join the studio',
  description,
  alternates: { canonical: '/join' },
  openGraph: {
    title: 'Join — BusinessDawg',
    description,
    url: 'https://businessdawg.com/join',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Join — BusinessDawg', description },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
