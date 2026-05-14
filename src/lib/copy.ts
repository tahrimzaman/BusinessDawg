/**
 * Static fallback content for v1. CMS overrides via Sanity when wired.
 */

export const SITE = {
  name: 'BusinessDawg',
  tagline: 'We build business machines.',
  hero: {
    headline: 'We build business machines.',
    sub: 'Branding, AI, web, and growth systems for founders who actually ship.',
  },
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801733955555',
  cal: process.env.NEXT_PUBLIC_CAL_USERNAME || 'tahrim',
  social: {
    linkedin: 'https://linkedin.com/in/tahrimzaman',
    instagram: 'https://instagram.com/tahrimzaman',
    email: 'yo@businessdawg.com',
  },
};

export type System = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  deliverables: string[];
  pricing: { kind: 'custom' };
  accent: string;
  glyph: string;
};

export const SYSTEMS: System[] = [
  {
    slug: 'growth',
    name: 'Business Growth Systems',
    shortName: 'Growth',
    tagline: 'Strategy that ships. Funnels that don’t leak.',
    description:
      'GTM, positioning, funnels, and the unsexy ops that actually move revenue. We build the operating cadence so the business runs whether or not you’re in the room.',
    deliverables: [
      'Positioning + GTM map',
      'Funnel + offer architecture',
      'Weekly growth operating cadence',
    ],
    pricing: { kind: 'custom' },
    accent: '#c8ff00',
    glyph: '↗',
  },
  {
    slug: 'ai',
    name: 'AI Automation Systems',
    shortName: 'AI',
    tagline: 'Internal tools that work harder than your interns.',
    description:
      'Workflows, agents, internal tooling. We wire the boring stuff to the smart stuff so your team stops doing what software should already be doing.',
    deliverables: [
      'Workflow audit + automation roadmap',
      'Agents + internal tools',
      'LLM-backed pipelines',
    ],
    pricing: { kind: 'custom' },
    accent: '#c8ff00',
    glyph: '◇',
  },
  {
    slug: 'branding',
    name: 'Branding Systems',
    shortName: 'Branding',
    tagline: 'Branding that doesn’t apologize.',
    description:
      'Identity, design language, content systems. We don’t hand you a logo. We hand you the rules and the components that let the brand keep building itself.',
    deliverables: [
      'Logo + identity essentials',
      'Design language (type, color, motion)',
      'Content + template system',
    ],
    pricing: { kind: 'custom' },
    accent: '#c8ff00',
    glyph: '◐',
  },
  {
    slug: 'web',
    name: 'Web & Product Systems',
    shortName: 'Web',
    tagline: 'Sites and MVPs that look like the future and load like yesterday.',
    description:
      'Sites, MVPs, e-commerce, internal apps. We ship in Next.js with motion, performance, and CMS-backed copy so you can edit without us.',
    deliverables: ['Landing page or full site', 'CMS + content workflow', 'Web product or MVP'],
    pricing: { kind: 'custom' },
    accent: '#c8ff00',
    glyph: '◼',
  },
  {
    slug: 'marketing',
    name: 'Marketing Infrastructure',
    shortName: 'Marketing',
    tagline: 'The plumbing behind the brand.',
    description:
      'Analytics, content engines, paid pipes. The instruments and channels that let you measure what works and pour money into the things that do.',
    deliverables: ['Analytics + attribution', 'Content engine', 'Paid + retention pipes'],
    pricing: { kind: 'custom' },
    accent: '#c8ff00',
    glyph: '⌁',
  },
];

export const FOUNDER = {
  name: 'Tahrim Zaman',
  // Short — homepage card
  short:
    'I’m Tahrim. I run an 8.5-crore-a-month distribution territory in Faridpur, operate Shadai Ghar — BusinessDawg’s flagship build — and pitched in Boston at Hult Prize Global.',
  hook: 'BusinessDawg is what happens when an operator gets tired of agencies that have never actually shipped anything.',
  // Medium — /about Founder section, ~140 words across paragraphs
  bio: [
    'I’m Tahrim. I’m 22. I run the Faridpur distribution territory for Akij Food & Beverage and Grameenphone — about 8.5 crore taka a month, 24 people on the ground, 7am retailer briefings, depots, routes, cash flow, the whole machine.',
    'I also operate Shadai Ghar — a direct-to-consumer grocery in Faridpur that BusinessDawg designed and built end-to-end. 500 families in six weeks, 23–27% gross margins. It’s the studio’s flagship build and my proof that the systems we sell actually run on real revenue.',
    'Before all that, I flew to Boston with Team Fortune 501 to represent Bangladesh at Hult Prize Global. Made Top 20 of 5,000+ at Marico’s Over The Wall.',
    'I started BusinessDawg because most agencies want to sell you a logo. I want to sell you the machine.',
  ],
  credibility: [
    { label: '8.5 cr / month', sub: 'Distribution territory I run, day to day.' },
    { label: '500 families', sub: 'Shadai Ghar from zero to traction in 6 weeks.' },
    { label: 'Top 20 of 5,000+', sub: 'Marico Over The Wall · Hult Prize Global, Boston.' },
  ],
};

export const BUILT = [
  {
    slug: 'shadai',
    name: 'Shadai Ghar',
    label: 'A BusinessDawg build',
    tagline:
      'D2C grocery for Faridpur households. Designed, built, and shipped end-to-end by BusinessDawg.',
    metrics: ['500 families in 6 weeks', '23–27% gross margin', 'Targeting 10,000 households'],
    stack: ['Next.js', 'Postgres', 'Prisma', 'Payments', 'AI recs'],
    liveUrl: 'https://www.shadaighar.com',
  },
];

export const PULL_QUOTES = [
  'We build the machine. You run the business.',
  'Most agencies want to sell you a logo. We want to sell you the machine.',
  'Built in public. Shipped on purpose.',
  'Branding that doesn’t apologize.',
  'Operators don’t need decks. They need infrastructure.',
];
