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
  // Optional long-form fields for expanded /systems/[slug] pages. When present,
  // the system page renders deep sections; otherwise it falls back to the
  // short tagline-and-bullet layout. Phase 4.2 rollout: Growth first, then the
  // other 4 systems get backfilled in follow-up sessions.
  whatItIs?: string[];
  deliverableDetails?: { title: string; description: string; timeline: string }[];
};

export const SYSTEMS: System[] = [
  {
    slug: 'growth',
    name: 'Business Growth Systems',
    shortName: 'Growth',
    tagline: 'Strategy that ships. Funnels that don’t leak.',
    description:
      'GTM, positioning, funnels, and the unsexy ops that actually move revenue. We build the operating cadence so your business runs without you.',
    deliverables: [
      'Positioning + GTM map',
      'Funnel + offer architecture',
      'Weekly growth operating cadence',
    ],
    pricing: { kind: 'custom' },
    accent: '#c8ff00',
    glyph: '↗',
    whatItIs: [
      'Business Growth Systems is not a marketing retainer and not a strategy deck. It is the operating layer that turns positioning, offers, funnels, and weekly ops into a single running machine — one your team operates after we leave.',
      'The engagement starts where most growth projects end: with one number the business has to move, by when, and the bottleneck thesis behind it. From there we scope the smallest system that can move that number reliably, build it in weeks, and hand off the rhythm that keeps it compounding.',
      'It is built for operator-founders and Gen Z teams who have outgrown spreadsheet growth, are tired of agencies that ship decks, and want infrastructure they can run without re-hiring the studio next quarter. If you can name the number that has to move, you are ready for this system.',
    ],
    deliverableDetails: [
      {
        title: 'Positioning + GTM map',
        description:
          'A one-page map naming exactly who the business is for, the offer it leads with, the channels that earn that audience, and the proof points that close them. Built from your existing customer interviews, sales calls, and the audit conversations we run in week one — not from a competitive matrix.',
        timeline: 'Week 1–2',
      },
      {
        title: 'Funnel + offer architecture',
        description:
          'The full path from cold attention to closed revenue: top-of-funnel mechanic, qualifying offer, sales motion, onboarding, and the upgrade path. We ship the architecture as a working funnel, not a slide. The deliverable is the system running in production, instrumented end-to-end.',
        timeline: 'Week 2–5',
      },
      {
        title: 'Weekly growth operating cadence',
        description:
          'The recurring rhythm that keeps the system honest after we leave: weekly review template, dashboard, decision rules, and the meeting structure that turns numbers into next-week actions. Without this, every growth project reverts to a project. With it, it compounds.',
        timeline: 'Week 5–6, ongoing',
      },
    ],
  },
  {
    slug: 'ai-automation',
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
    slug: 'web-product',
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
    slug: 'marketing-infrastructure',
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
    'I’m Tahrim. I run an 8.5-crore-a-month distribution territory in Faridpur, pitched in Boston at Hult Prize Global, and founded BusinessDawg to build what operators actually need.',
  hook: 'BusinessDawg is what happens when an operator gets tired of agencies that have never actually shipped anything.',
  // Medium — /about Founder section, ~140 words across paragraphs
  bio: [
    'I’m Tahrim. I’m 22. I run the Faridpur distribution territory for Akij Food & Beverage and Grameenphone — about 8.5 crore taka a month, 24 people on the ground, 7am retailer briefings, depots, routes, cash flow, the whole machine.',
    'Before all that, I flew to Boston with Team Fortune 501 to represent Bangladesh at Hult Prize Global. Made Top 20 of 5,000+ at Marico’s Over The Wall.',
    'I started BusinessDawg because most agencies want to sell you a logo. I want to sell you the machine.',
  ],
  credibility: [
    { label: '8.5 cr / month', sub: 'Distribution territory I run, day to day.' },
    { label: 'Top 20 of 5,000+', sub: 'Marico Over The Wall · Hult Prize Global, Boston.' },
  ],
};

export const BUILT: {
  slug: string;
  name: string;
  label: string;
  tagline: string;
  metrics: string[];
  stack: string[];
  liveUrl: string;
}[] = [];

// FAQ used on the homepage AND emitted as FAQPage JSON-LD for AI engines.
// Answers follow the chatbot guardrails — no prices, no contracts, real voice.
export const FAQ: { q: string; a: string }[] = [
  {
    q: 'What does BusinessDawg actually build?',
    a: 'Five productized systems: Business Growth, AI Automation, Branding, Web & Product, and Marketing Infrastructure. You can pick one, stack a few, or commission a fully custom build. Every engagement ends with you owning a running machine, not a deck.',
  },
  {
    q: 'Who is BusinessDawg for?',
    a: 'Founders, operators, and startups who want to ship — not commission another strategy report. Most of our clients are Gen Z–led teams or operator-founders running real revenue who need infrastructure to scale.',
  },
  {
    q: 'Where are you based?',
    a: 'The studio runs out of Faridpur and Dhaka, Bangladesh. Founder Tahrim Zaman is heading to Hult International Business School in Boston for a dual master’s in Business Analytics & AI and International Marketing. Clients are global — we work async.',
  },
  {
    q: 'How fast can you ship a v1?',
    a: 'Most v1s land in 2–6 weeks depending on scope. A landing page or brand identity can be live in 10 days. An AI workflow or full product takes longer. We scope honestly on the call.',
  },
  {
    q: 'Do you build internal AI workflows or customer-facing AI?',
    a: 'Both. We wire internal tools and agents that replace the boring stuff your team shouldn’t be doing, and we ship customer-facing AI features inside web products. Whichever moves your business faster.',
  },
  {
    q: 'How much does it cost?',
    a: 'Every engagement is custom and scoped on a 15-minute intro call. We don’t publish prices because the cheapest engagement and the biggest one share zero ingredients — quoting either would lie about the other. Book the call.',
  },
  {
    q: 'Do you work with pre-revenue startups?',
    a: 'Yes, if you’re serious. We don’t take projects from people who want to test the waters with a logo. We take projects from people who want to ship something real this quarter.',
  },
  {
    q: 'Can I hire BusinessDawg for one system only?',
    a: 'Yes. The Systems Stack is designed so you can take exactly what you need. Branding-only, AI-only, web-only — all valid starting points. We’ll tell you on the call if we think you need more.',
  },
  {
    q: 'What’s the difference between BusinessDawg and a traditional agency?',
    a: 'Agencies sell you a deliverable. We sell you a running system. After we hand off, the brand, the workflow, the site — they keep operating without us. That’s the machine in “we build the machine, you run the business.”',
  },
];

export const PULL_QUOTES = [
  'We build the machine. You run the business.',
  'Most agencies want to sell you a logo. We want to sell you the machine.',
  'Built in public. Shipped on purpose.',
  'Branding that doesn’t apologize.',
  'Operators don’t need decks. They need infrastructure.',
];
