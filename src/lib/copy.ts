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
    whatItIs: [
      'AI Automation Systems is not a chatbot, a Zapier rewrite, or a model demo. It is the operating layer that wires the boring work your team should not be doing to the smart work models can actually do reliably — and the human owner who keeps it honest after the prompts drift.',
      'Most AI projects fail because nobody owned the eval loop. We start with the workflow audit — what actually breaks if it stops running — then build the smallest agent or pipeline that can replace it. The agent is the artifact. The eval, the owner, and the fallback behavior are the work.',
      'It is built for studios, ops teams, and operator-founders who want internal tools that work harder than interns and customer-facing AI features that ship without a research team. If you can name three workflows that should be automated, you are ready for this system.',
    ],
    deliverableDetails: [
      {
        title: 'Workflow audit + automation roadmap',
        description:
          'A map of every recurring workflow worth automating, ranked by impact and risk. We sit with your team for a week, watch the boring stuff happen, and write the audit. The output is a prioritized roadmap with effort estimates — not a deck.',
        timeline: 'Week 1–2',
      },
      {
        title: 'Agents + internal tools',
        description:
          'The actual systems we build from the roadmap: LLM-backed agents, internal tools, and Slack- or email-triggered automations. Each one ships with evals, fallback behavior, observability, and a named owner. No demos that die on Tuesday.',
        timeline: 'Week 2–6',
      },
      {
        title: 'LLM-backed pipelines',
        description:
          'Multi-step pipelines for workflows where one agent is not enough — RAG over your docs, structured extraction, classification, summarization. Instrumented, versioned, and handed off with the prompt-eval discipline that keeps them honest.',
        timeline: 'Week 4–8',
      },
    ],
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
    whatItIs: [
      'Branding Systems is not a logo handover and not a 200-page guidelines PDF nobody opens. It is the design language, voice system, and component library that let the brand keep building itself after we leave — so the company looks and sounds like itself across every channel without us in the room.',
      'The engagement starts with a positioning audit: who the brand is for, what it has to say, and what consistency would even mean for it. Then we ship the system — mark, type, color, motion, voice, content templates, the rules — as a working set of components, not a static document.',
      'It is built for founders who want to look like a real company without paying agency rates forever, and for teams who have outgrown a generic template stack and need a brand they can operate. If non-designers on your team will be producing on-brand work, you are ready for this system.',
    ],
    deliverableDetails: [
      {
        title: 'Logo + identity essentials',
        description:
          'Mark, wordmark, supporting variants, and the rationale doc explaining why each decision was made. Built to operate at every size from favicon to billboard. Delivered as a working file set, not a flat PDF.',
        timeline: 'Week 1–3',
      },
      {
        title: 'Design language (type, color, motion)',
        description:
          'The full visual system: type pairing with usage rules, color palette with accessibility ratios, motion guidelines, spacing system, iconography. Codified as design tokens your engineering team can import, not screenshots in a Notion page.',
        timeline: 'Week 2–5',
      },
      {
        title: 'Content + template system',
        description:
          'The components and templates that let non-designers ship on-brand — social, email, presentations, internal docs. Tied to the design language so consistency is the default, not a review process.',
        timeline: 'Week 4–7',
      },
    ],
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
    whatItIs: [
      'Web & Product Systems is the engagement for shipping sites, MVPs, and web products that look like the future and load like yesterday. We do not build sites that take six weeks to add a section. We build sites in Next.js with motion, performance, and CMS-backed copy so your team can edit without us.',
      'Every engagement is scoped to a real outcome — leads, signups, demos, transactions — and built backward from that number. The site is the artifact. The performance, the analytics wiring, the editing workflow, and the deployment pipeline are the work.',
      'It is built for founders shipping their first real site, studios outgrowing template platforms, and operators who want a web product that compounds instead of a brochure that decays. If you have a real outcome the site has to produce, you are ready for this system.',
    ],
    deliverableDetails: [
      {
        title: 'Landing page or full site',
        description:
          'A production Next.js site with motion, brand-correct typography, analytics, SEO baseline (sitemap, structured data, meta), and a CMS-backed content workflow. We ship in weeks, not quarters, and the codebase is yours.',
        timeline: 'Week 1–4',
      },
      {
        title: 'CMS + content workflow',
        description:
          'Sanity (or your choice) wired to the site so your team can edit copy, swap images, and ship updates without us. Schema designed around how the team actually works — not generic block builders. Includes editor training.',
        timeline: 'Week 2–5',
      },
      {
        title: 'Web product or MVP',
        description:
          'Authenticated product surfaces: dashboards, admin panels, embedded tools, full MVPs. Next.js + Postgres + Prisma stack by default, swappable for your existing infra. Shipped with monitoring, error tracking, and a real handoff.',
        timeline: 'Week 4–10',
      },
    ],
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
    whatItIs: [
      'Marketing Infrastructure is the plumbing layer that turns marketing inputs into measurable revenue: analytics, attribution, content engines, paid pipes, lifecycle automation. It is the boring system that lets every other marketing dollar know what worked.',
      'Most teams skip this layer because it is unsexy and ship campaigns on instinct. Then they wonder why the channel mix never matures. We build the instrumentation, the dashboards, and the decision rules first, then plug the channels in — so every dollar after week six is informed.',
      'It is built for founders running real marketing budgets with no idea what is working, studios scaling past the spreadsheet stage, and operator-led teams who want a marketing stack they can actually operate. If you are spending money on channels and cannot say which is working, you are ready for this system.',
    ],
    deliverableDetails: [
      {
        title: 'Analytics + attribution',
        description:
          'PostHog (or your stack of choice), event taxonomy, attribution model, and the dashboards that turn raw events into decisions. UTMs standardized, first-touch and multi-touch wired, and the documentation so the team reads dashboards the same way.',
        timeline: 'Week 1–3',
      },
      {
        title: 'Content engine',
        description:
          'The publishing system that turns thinking into output reliably: editorial calendar, brief templates, distribution checklist, repurposing pipeline, and the cadence that compounds. Built to ship two pieces a week without burning out the team that writes them.',
        timeline: 'Week 2–6',
      },
      {
        title: 'Paid + retention pipes',
        description:
          'The acquisition and lifecycle plumbing: paid channels wired with attribution and creative-testing rhythm, lifecycle automation (email + in-app), winback flows, and the dashboards that show which dollars came back. Instrumented before scaled.',
        timeline: 'Week 3–8',
      },
    ],
  },
];

export const FOUNDER = {
  name: 'Tahrim Zaman',
  // Short — homepage card
  short:
    'I’m Tahrim. I run an 8.5-crore-a-month distribution territory in Faridpur and founded BusinessDawg to build the systems most agencies only talk about.',
  hook: 'BusinessDawg is what happens when an operator gets tired of agencies that have never actually shipped anything.',
  // Medium — /about Founder section, ~140 words across paragraphs
  bio: [
    'I’m Tahrim. I’m 22. I run the Faridpur distribution territory for Akij Food & Beverage and Grameenphone — about 8.5 crore taka a month, 24 people on the ground, 7am retailer briefings, depots, routes, cash flow, the whole machine.',
    'I started BusinessDawg because most agencies want to sell you a logo. I want to sell you the machine.',
  ],
  credibility: [
    { label: '8.5 cr / month', sub: 'Distribution territory I run, day to day.' },
    { label: '24 on the ground', sub: 'Faridpur ops team, daily cadence.' },
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
    a: 'Every engagement is custom and scoped on a 30-minute intro call. We don’t publish prices because the cheapest engagement and the biggest one share zero ingredients — quoting either would lie about the other. Book the call.',
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
