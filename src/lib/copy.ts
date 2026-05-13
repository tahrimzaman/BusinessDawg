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
    email: 'tahrimzaman4@gmail.com',
  },
};

export type System = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  deliverables: string[];
  pricing: { kind: 'starter'; from: string } | { kind: 'custom' };
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
    pricing: { kind: 'starter', from: '$2,500' },
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
    pricing: { kind: 'starter', from: '$3,500' },
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
  short: 'I’m Tahrim. I run two distribution businesses and now I run BusinessDawg.',
  hook: 'BusinessDawg is what happens when an operator gets tired of agencies that have never actually shipped anything.',
  credibility: [
    { label: '2× Distribution', sub: 'Territories I operate, day to day.' },
    { label: 'Top 20 of 5,000+', sub: 'Hult Prize Global, Boston.' },
    {
      label: 'Hult MSc Scholar',
      sub: 'Khulna Uni BBA → Hult MSc (Sept 2027), full scholarship.',
    },
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
  },
];

export const PULL_QUOTES = [
  'We build the machine. You run the business.',
  'Most agencies want to sell you a logo. We want to sell you the machine.',
  'Built in public. Shipped on purpose.',
  'Branding that doesn’t apologize.',
  'Operators don’t need decks. They need infrastructure.',
];
