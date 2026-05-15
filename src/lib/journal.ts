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
