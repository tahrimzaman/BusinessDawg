/**
 * Structured data — helps search engines and AI crawlers understand who and
 * what BusinessDawg is. The default export renders Organization + Person from
 * the root layout. Named helpers (ServiceJsonLd, FaqJsonLd, BreadcrumbJsonLd)
 * are mounted on specific routes for per-page structured data.
 */

const SAME_AS = ['https://linkedin.com/in/tahrimzaman', 'https://instagram.com/tahrimzaman'];

export default function JsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BusinessDawg',
    url: 'https://businessdawg.com',
    logo: 'https://businessdawg.com/brand/logo-mark.png',
    description:
      'A Gen Z–native business growth system studio. Branding, AI automation, web/product, and growth systems for founders who actually ship.',
    sameAs: SAME_AS,
    knowsAbout: [
      'Brand identity systems',
      'AI automation workflows',
      'Web product development',
      'Growth strategy',
      'Marketing infrastructure',
    ],
    founder: {
      '@type': 'Person',
      name: 'Tahrim Zaman',
      url: 'https://linkedin.com/in/tahrimzaman',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'yo@businessdawg.com',
      contactType: 'sales',
      areaServed: 'Worldwide',
      availableLanguage: ['English', 'Bengali'],
    },
  };

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Tahrim Zaman',
    jobTitle: 'Founder, BusinessDawg',
    url: 'https://businessdawg.com/about',
    sameAs: SAME_AS,
    worksFor: {
      '@type': 'Organization',
      name: 'BusinessDawg',
      url: 'https://businessdawg.com',
    },
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BusinessDawg',
    url: 'https://businessdawg.com',
    publisher: { '@type': 'Organization', name: 'BusinessDawg' },
  };

  return (
    <>
      <Script data={organization} />
      <Script data={person} />
      <Script data={website} />
    </>
  );
}

function Script({ data }: { data: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export function ServiceJsonLd({
  name,
  description,
  url,
  serviceType,
}: {
  name: string;
  description: string;
  url: string;
  serviceType: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url,
    serviceType,
    provider: {
      '@type': 'Organization',
      name: 'BusinessDawg',
      url: 'https://businessdawg.com',
    },
    areaServed: 'Worldwide',
    audience: {
      '@type': 'Audience',
      audienceType: 'Founders, startups, and operators',
    },
  };
  return <Script data={data} />;
}

export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
  return <Script data={data} />;
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
  return <Script data={data} />;
}
