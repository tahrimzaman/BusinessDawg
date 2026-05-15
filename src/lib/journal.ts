/**
 * Journal posts. Hardcoded for v1 — same pattern as SYSTEMS, FAQ in copy.ts.
 * Sanity wiring is deferred (previous attempt was reverted; we'll re-attempt
 * cleanly in a later phase).
 *
 * Each post is rendered as long-form on /journal/[slug] with Article JSON-LD
 * for Google / AI overview citation. Keep authors at "Tahrim Zaman" for now —
 * if/when guest posts ship, add an `author` enum.
 */

export type JournalPost = {
  slug: string;
  title: string;
  // ~155 char meta description; complete sentence, keyword-rich.
  excerpt: string;
  // ISO date (YYYY-MM-DD). Used for JSON-LD datePublished + sort.
  publishedAt: string;
  // Estimated read time in minutes — surfaced on the index card.
  readingTime: number;
  // Section anchors emitted as H2s in the body. Each item is one section.
  // `heading` becomes the H2, `paragraphs` are the body, `list` is an optional
  // bullet list rendered after the paragraphs.
  sections: {
    heading: string;
    paragraphs: string[];
    list?: string[];
  }[];
  // Short kicker shown above the H1 — eyebrow text.
  kicker: string;
  // 1–2 sentence intro shown right under the H1, before the first section.
  lede: string;
};

export const JOURNAL: JournalPost[] = [
  {
    slug: 'productized-vs-custom-agency-engagement',
    title: 'Productized vs custom agency engagement: which one are you actually buying',
    excerpt:
      'Productized agency engagements ship predictable scope on a fixed clock. Custom engagements ship depth on an open one. Most teams pick the wrong model and pay for it twice. Here is the operator-level distinction.',
    publishedAt: '2026-05-15',
    readingTime: 6,
    kicker: 'Field notes / Engagement models',
    lede: 'Productized agency engagements ship predictable scope on a fixed clock. Custom engagements ship depth on an open one. Both are valid. Most teams pick the wrong model — and pay for it twice, in cash and in calendar.',
    sections: [
      {
        heading: 'The one-line version',
        paragraphs: [
          'Productized means the scope, the timeline, and the deliverable are defined before you sign. You are buying a known shape. Custom means the scope is defined after a discovery period, by the team you hired to define it. You are buying a process, not a deliverable.',
          'Both can produce great work. The mistake is buying one model thinking you are buying the other.',
        ],
      },
      {
        heading: 'What productized actually means',
        paragraphs: [
          'A productized engagement has a fixed scope, a fixed clock, and a fixed deliverable. The agency has run this exact shape 30 times before, so they can quote it, ship it, and hand it off without renegotiating mid-engagement. The work is real. The scope discipline is the product.',
        ],
        list: [
          'Scope is written in concrete deliverables, not abstract goals',
          'Timeline is fixed (2 weeks, 6 weeks, etc.) and the team works backward from it',
          'Price is named upfront, even if it is custom-quoted per engagement',
          'The agency owns scope creep — extra work either gets cut or quoted as a separate engagement',
          'Hand-off is part of the engagement, not an afterthought',
        ],
      },
      {
        heading: 'What custom actually means',
        paragraphs: [
          'A custom engagement starts with a discovery phase. Discovery is real work — but it is also the agency figuring out what to build, on your dime. The scope, timeline, and price emerge from discovery, not before it. The depth is the product.',
        ],
        list: [
          'Discovery phase is paid (sometimes called "audit", "strategy sprint", "intake")',
          'Scope is written after discovery, in a phase 2 SOW',
          'Timeline expands as discovery surfaces complexity',
          'Price is "estimate to actual" — final cost is known at the end',
          'Hand-off is usually negotiated separately',
        ],
      },
      {
        heading: 'When productized is the right call',
        paragraphs: [
          'Productized wins when the work is concentrated, the team has run the shape before, and you do not have unlimited calendar to spend defining what to build.',
        ],
        list: [
          'You can describe the deliverable in one sentence (a brand identity, a landing page, an automation workflow). The shape is known.',
          'You have a deadline that is real — not "Q3" but "August 15".',
          'You have done this kind of engagement before and you know what you are buying.',
          'Your business needs the output more than the team needs to learn alongside the agency.',
        ],
      },
      {
        heading: 'When custom is the right call',
        paragraphs: [
          'Custom wins when the work is genuinely new for the agency too, when the depth required is more than any productized scope can fit, or when the discovery itself is what you are buying.',
        ],
        list: [
          'The work touches multiple systems and you do not yet know which one is the bottleneck.',
          'You are buying expertise more than execution — you want the agency in the room rethinking the company with you.',
          'Your domain is so specific that a productized scope would miss the point.',
          'You have the calendar (and the budget) to absorb discovery without it stalling the business.',
        ],
      },
      {
        heading: 'Why most engagements should start productized',
        paragraphs: [
          'Even when the work is eventually going to be custom, starting with a productized engagement is almost always the right move. A 2-week productized audit will tell you whether the bigger custom engagement is worth scoping. It is a small bet that produces a clear decision. It costs less than the discovery phase of a custom engagement would have cost, and it leaves you with a deliverable either way.',
          'This is also how agencies should sell. The productized first engagement is the test. The custom second engagement, if it ships, is the trust. Skipping the test and going straight to custom is how engagements turn into Notion graveyards.',
        ],
      },
      {
        heading: 'Red flags either direction',
        paragraphs: [
          'A productized engagement that promises "fully custom outcomes" is selling a contradiction. The whole point of productized is that the scope is fixed. If the agency negotiates scope on every call, you bought custom and got billed productized.',
          'A custom engagement that cannot tell you what the deliverable will look like at the end of discovery is selling you the discovery, not the engagement. Discovery is the easiest part to bill and the hardest part to verify. If the only proof of work is a deck at the end of phase one, the engagement has not shipped anything yet.',
        ],
      },
      {
        heading: 'How BusinessDawg engagements work',
        paragraphs: [
          'BusinessDawg sells productized systems. Five of them. Each one has a fixed scope, a fixed shape, and a hand-off package. We will write the SOW before you sign, not after. We name the deliverable and the cadence on the intro call.',
          'When the work is genuinely custom — multiple systems in one engagement, real depth required, hybrid that pulls from three of the five — we scope that custom build on top of one or two productized systems as the anchor. The custom work earns its scope. The productized work proves it can ship.',
          'If you are trying to decide whether what you need is productized or custom, book the 15-minute call. We will tell you honestly.',
        ],
      },
    ],
  },
  {
    slug: 'brand-studio-vs-growth-studio-whats-the-difference',
    title: 'Brand studio vs growth studio: what is the difference',
    excerpt:
      'Brand studios make you look real. Growth studios make you move money. Most teams need both, in the right order. Here is the operator-level distinction and how to tell which you actually need first.',
    publishedAt: '2026-05-15',
    readingTime: 7,
    kicker: 'Field notes / Positioning',
    lede: 'Brand studios make you look real. Growth studios make you move money. Most teams need both — in the right order, with the right shape underneath. Picking wrong burns a quarter and the budget that came with it. Here is the operator-level distinction.',
    sections: [
      {
        heading: 'The one-line version',
        paragraphs: [
          'A brand studio designs how the company is perceived. A growth studio designs how the company compounds revenue. Both are real disciplines. Both are valuable. They are not interchangeable, and almost nobody is honest about which one they actually are.',
          'You can tell which you are talking to in two minutes. Brand studios open with "what is your story". Growth studios open with "what is your bottleneck". Same energy, different question. Different engagement.',
        ],
      },
      {
        heading: 'What a brand studio actually does',
        paragraphs: [
          'A brand studio ships the system that makes a company look and sound like itself. Logo, typography, color, motion language, voice, tone, content templates, the rules that let the brand keep building itself after the studio leaves. The deliverable is consistency at scale. The hard part is taste plus systems thinking.',
        ],
        list: [
          'Visual identity (mark, type, color, motion)',
          'Voice + tone system (how the brand sounds across every channel)',
          'Component library or design system (so the brand survives a year of execution)',
          'Content templates (so non-designers ship on-brand without breaking it)',
          'Brand guidelines doc (the source of truth everyone on the team uses)',
        ],
      },
      {
        heading: 'What a growth studio actually does',
        paragraphs: [
          'A growth studio ships the operating cadence that turns inputs into revenue, week after week. Strategy, positioning, funnel architecture, lifecycle, pricing, retention, the unsexy ops that compound. The deliverable is a running system the founder owns after the engagement ends. The hard part is honest scoping plus operator instinct.',
        ],
        list: [
          'Positioning + GTM thesis (who you are for, what you charge, why now)',
          'Funnel + offer architecture (the path from cold to closed)',
          'Operating cadence (weekly rhythm, dashboards, decision points)',
          'Lifecycle / retention system (how a customer becomes a second purchase)',
          'Hand-off package (the playbook the team runs after the studio is gone)',
        ],
      },
      {
        heading: 'Where the two overlap (and where it gets confusing)',
        paragraphs: [
          'The overlap is real and it is where most teams get sold the wrong thing. A "brand refresh" that improves conversion is doing growth work. A "growth retainer" that tightens the positioning is doing brand work. The disciplines touch. The deliverables blur.',
          'The right way to think about it: brand is upstream of growth, and growth is downstream of brand. If the brand is wrong, growth tactics will look like they are working until they are not — because you attracted the wrong customer. If the growth thesis is wrong, brand work will look like progress until the revenue number does not move. Both directions, the same answer: the work depends on the layer below being honest.',
        ],
      },
      {
        heading: 'How to tell which you need first',
        paragraphs: [
          'There are three honest tests. None of them require a sales call. All of them require you to be specific.',
        ],
        list: [
          'If your problem is "people do not believe we are real yet" — you need brand work. Logo, type, site, voice. Get to "this looks like a real company" before you scale anything.',
          'If your problem is "people believe we are real but nobody is buying" — you need growth work. Funnel, offer, positioning, pricing. Fix the bottleneck before you spend on more reach.',
          'If your problem is "we have customers but the brand is holding back what we charge" — you need brand work pretending to be growth work. Reposition the offer, then re-skin the company to match.',
        ],
      },
      {
        heading: 'Red flags either direction',
        paragraphs: [
          'A brand studio that promises growth outcomes is selling a deliverable it cannot ship. Logos do not move revenue alone. A growth studio that opens with a "discovery phase" instead of a bottleneck thesis is selling time. Time is not a thesis.',
          'A studio that calls itself both and cannot tell you in one sentence which discipline is the lead capability is hedging. Hedging is the agency move. You do not need an agency. You need an operator-shaped studio with one discipline they actually run and one they support.',
        ],
      },
      {
        heading: 'How BusinessDawg sits on this map',
        paragraphs: [
          'BusinessDawg is a growth studio that ships branding as one of five systems, not the other way around. Branding Systems is in the stack because brand is upstream of growth and we cannot ship the system below it if the brand layer is broken. But the engagement is always scoped to a revenue outcome, not a logo deliverable.',
          'If you are deciding between hiring a brand studio and hiring a growth studio, the honest first step is naming the layer the business is actually stuck at. Book the call. We will name it with you in 15 minutes, or tell you which kind of studio you actually need (even if it is not us).',
        ],
      },
    ],
  },
  {
    slug: 'when-to-hire-an-ai-automation-agency-vs-build-in-house',
    title: 'When to hire an AI automation agency vs build in-house',
    excerpt:
      'AI automation is the cheapest hire most teams will ever make and the most expensive mistake most teams will ever ship. Here is how to decide which side of that you are on.',
    publishedAt: '2026-05-15',
    readingTime: 7,
    kicker: 'Field notes / AI Automation',
    lede: 'AI automation is the cheapest hire most teams will ever make and the most expensive mistake most teams will ever ship. The decision is not "agency or in-house" — it is "do you have the operating shape to absorb either one yet." Here is the operator-level frame.',
    sections: [
      {
        heading: 'The actual question (it is not the one you think)',
        paragraphs: [
          'Founders ask "should we hire an AI agency or build in-house?" The real question is "do we have a workflow worth automating, and a person who will own it after the model gets dumber next quarter?" Both answers are yes or both are no. Almost never one of each.',
          'AI automation projects do not fail because of model choice. They fail because nobody owns the eval loop, the prompts drift, the upstream data shifts, and six months later the team is back to the spreadsheet they were trying to leave. Agency or in-house, you need the same operating shape underneath.',
        ],
      },
      {
        heading: 'When to hire an agency',
        paragraphs: [
          'Hire an agency when the work is concentrated, the deadline is real, and the team will inherit a system, not a black box. The agency is bringing pattern-matching from N other clients and a delivery cadence you have not built yet. That is the value. Not the model. Not the prompt.',
        ],
        list: [
          'You have 1–3 specific workflows in mind, not "use AI more". Specific = "categorize 800 support tickets a week", not "improve support".',
          'There is a person on your team who will own the output the day after handoff. Not "we will figure it out". A named person, with calendar time, who already runs adjacent ops.',
          'You need to move in weeks, not quarters. Agencies amortize delivery infrastructure across clients — they are faster on cold starts than your first hire will be.',
          'The work is wide (multiple integrations, multiple models, prompt-eval discipline) but not deep (you do not need a six-month research bet).',
        ],
      },
      {
        heading: 'When to hire in-house',
        paragraphs: [
          'Hire in-house when AI is going to be inside the product, not bolted onto ops. Or when the work is so deep that a quarter of ramp pays for itself in the second quarter. Or when no agency on earth understands your domain well enough to ship without you re-explaining the business every Tuesday.',
        ],
        list: [
          'AI is a customer-facing feature, not an internal tool. Features need iteration, telemetry, support, and product instinct. Agencies can prototype features; teams ship them.',
          'Your domain is so specific that the prompt has to encode tribal knowledge no outsider can absorb in a 6-week engagement.',
          'You are already running enough volume that one full-time hire is cheaper than an agency retainer at the same scope. Math, not vibes.',
          'You expect to be doing this work for two-plus years. Anything shorter, the agency was the right call.',
        ],
      },
      {
        heading: 'The hybrid play (the one most teams should actually run)',
        paragraphs: [
          'The under-discussed answer is "agency first, internal second." You bring in an agency to build the first system, ship it, and document the operating cadence — channels, evals, prompt versioning, fallback behavior, owner. Then you hire one person whose first month is shadowing that handoff. By month three, the agency is gone, the internal hire owns the system, and you skipped the cold-start tax both options charge separately.',
          'This works because agency-built systems plus a real internal owner are dramatically cheaper than either path alone. The agency does not stay forever, and the internal hire does not start from a blank Jira board.',
        ],
      },
      {
        heading: 'Red flags either way',
        paragraphs: [
          'Three patterns mean the engagement is going to leak no matter which side you pick. Same three for agency or in-house.',
        ],
        list: [
          'No eval loop. If the only quality signal is "the team thinks it looks fine", you are not running an AI system, you are running an AI demo. Demos do not survive a Tuesday in production.',
          'No fallback behavior. What happens when the model returns garbage, the API rate-limits, or the upstream changes a field name? If the answer is "we have not thought about that", the system has not been shipped yet, only built.',
          'No owner after launch. Every AI automation needs a human who notices when output quality drifts. Without an owner, the drift is invisible until the customer complains.',
        ],
      },
      {
        heading: 'The 90-day decision frame',
        paragraphs: [
          'If you can name the workflow, name the owner, name the deadline, and name the success metric in one sentence each — hire the agency. You will save three months of ramp.',
          'If you can do all of that AND you are betting on AI as a long-term internal capability inside the product — hire both. Agency for sprint one, internal hire shadowing from week three, full handoff by week twelve.',
          'If you cannot name those four things — do not hire anyone yet. Spend a week scoping. The scoping is the work.',
        ],
      },
      {
        heading: 'How BusinessDawg runs AI automation engagements',
        paragraphs: [
          'We open every engagement by asking the four questions above. If you can answer them, we scope a system. If you cannot, we tell you that scoping is the next step — not buying the engagement. Either way, the call is 15 minutes and we do not pitch with decks.',
          'If you are trying to figure out whether AI automation belongs in your studio yet, book the call. We will frame it honestly, or tell you why nobody can.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-scope-a-growth-system',
    title: 'How to scope a growth system',
    excerpt:
      'Most growth projects leak because the scope was wrong before anyone wrote a brief. Here is the operator-level template for scoping a growth system that actually ships.',
    publishedAt: '2026-05-15',
    readingTime: 8,
    kicker: 'Field notes / Scoping',
    lede: 'Most "growth projects" leak before anyone writes a line of code. Not because the team is bad — because the scope was wrong the day it was signed. Here is how an operator scopes one that actually ships.',
    sections: [
      {
        heading: 'Why scoping fails (the 3-line version)',
        paragraphs: [
          'A growth project fails for one of three reasons. The buyer scoped a deliverable instead of an outcome. The seller agreed because deliverables are easier to bill. Both sides forgot that revenue does not care what shipped, only what compounded.',
          'A growth system is not a campaign. It is not a redesign. It is not a launch. It is the operating cadence that turns inputs into revenue, week after week, without a hero week saving the quarter. If your scope reads like a deliverable list, you scoped a campaign and called it a system.',
        ],
      },
      {
        heading: 'The 3 questions you answer before the brief',
        paragraphs: [
          'Before any agency, freelancer, or in-house hire writes a brief, the founder has to answer three questions out loud. Skipping any of them is why the engagement turns into a Notion graveyard six weeks in.',
        ],
        list: [
          'What is the one number that has to move in 90 days, and what is it today? Not "MRR up". A specific number, a specific delta, a specific date. "Demo bookings from 12 a month to 40 by August 15."',
          'What has to be true for that number to move? Channels. Offers. Onboarding. Pricing. Pipeline. One of those — usually only one — is the bottleneck. If you cannot name it, you are not ready to scope yet, you are ready to audit.',
          'Who owns the number after the project ends? If the answer is "the agency", you are renting growth. If the answer is "nobody yet, we need to hire", scope a system you can operate, not a team you cannot afford.',
        ],
      },
      {
        heading: 'The 5-part scope template',
        paragraphs: [
          'A real growth-system scope has five parts. Anything less and the engagement will drift. Anything more and you are scoping a thesis, not a system.',
        ],
        list: [
          'Outcome — the specific number, the specific delta, the specific date. One line.',
          'Bottleneck thesis — one paragraph naming the single biggest leak the engagement targets, and what evidence backs that call. If you cannot write this, the engagement is premature.',
          'Inputs you control — the levers the team will actually move: channels, offers, lifecycle, pricing, copy, ops cadence. Be specific. "Improve marketing" is not a lever.',
          'Operating cadence — how the team meets, what they review, what they ship. Weekly is the minimum unit. If the project does not produce a recurring rhythm, it produced a deck.',
          'Hand-off — the artifact, dashboard, playbook, or hire-package the founder owns when the engagement ends. Without hand-off, every system reverts to a project.',
        ],
      },
      {
        heading: 'Red flags in scopes you should reject',
        paragraphs: [
          'Three patterns show up in bad growth scopes, every single time. Spotting them is cheaper than discovering them on month two.',
        ],
        list: [
          '"Discovery phase" with no fixed deliverable — translation: the team has not decided what they are doing yet and you are paying them to figure it out.',
          'Channel-named retainers — "SEO retainer", "paid retainer". Channels are tactics. Tactics serve theses. A scope that starts at the channel level has skipped the thesis.',
          'No success metric, or a vanity one — "we will improve brand awareness" is not scoping, it is wishing. If the scope cannot fail, the scope cannot succeed.',
        ],
      },
      {
        heading: 'What "done" actually looks like',
        paragraphs: [
          'A growth system is done when three things are true. The outcome number moved (or moved most of the way, with a credible explanation of the gap). The operating cadence runs without the original team in the room. The founder can repeat the play with the next bottleneck without re-buying the engagement.',
          'Anything short of that and you bought a project, not a system. Which is fine — projects have a place. But name them honestly, scope them tighter, and price them lower. Do not call a campaign a system, and do not pay system money for one.',
        ],
      },
      {
        heading: 'How BusinessDawg scopes a growth system',
        paragraphs: [
          'We open every engagement with a 15-minute call. No deck. We name the outcome, the bottleneck thesis, and the cadence in that call, or we tell you the engagement is not ready yet. We charge the same way: outcome, scope, ship.',
          'If your growth feels like it should be working and is not — book the call. We will scope it honestly, or tell you why nobody can.',
        ],
      },
    ],
  },
];

export function getPostBySlug(slug: string): JournalPost | undefined {
  return JOURNAL.find((p) => p.slug === slug);
}
