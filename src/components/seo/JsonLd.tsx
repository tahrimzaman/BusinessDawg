/**
 * Structured data — helps search engines and AI crawlers understand who and
 * what BusinessDawg is. Renders inline at the bottom of the body.
 */
export default function JsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BusinessDawg',
    url: 'https://businessdawg.com',
    logo: 'https://businessdawg.com/brand/logo-mark.png',
    description:
      'A Gen Z–native business growth system studio. Branding, AI automation, web/product, and growth systems for founders who actually ship.',
    sameAs: ['https://linkedin.com/in/tahrimzaman', 'https://instagram.com/tahrimzaman'],
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
    },
  };

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Tahrim Zaman',
    jobTitle: 'Founder, BusinessDawg',
    url: 'https://businessdawg.com/about',
    sameAs: ['https://linkedin.com/in/tahrimzaman', 'https://instagram.com/tahrimzaman'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
    </>
  );
}
