/**
 * Seed the BuildLogEntry table with the 10 backfill drafts (see plan file:
 * ~/.claude/plans/tell-me-where-you-re-radiant-graham.md → "Backfill drafts").
 *
 * Idempotent on slug — re-running updates body/date/image/published in place
 * instead of duplicating rows. Two entries get picsum.photos placeholders so
 * the visual layout shows both with-image and text-only cards.
 *
 * Usage:
 *   set -a && source .env.local && set +a
 *   npx tsx scripts/seed-buildlog.ts
 */

import { prisma } from '../src/lib/db/prisma';

type SeedEntry = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD, will be pinned to noon UTC for clean sorting
  body: string;
  imageUrl?: string;
  imageAlt?: string;
};

const ENTRIES: SeedEntry[] = [
  {
    slug: 'launched-businessdawg-com',
    title: 'Launched businessdawg.com',
    date: '2026-04-29',
    body: `We're live. Dark mode, lime accent, mascot in the corner.

Flag's planted. The rest of this page is everything we've shipped since.`,
  },
  {
    slug: 'custom-booking-wheel',
    title: 'Custom booking wheel, not Cal.com',
    date: '2026-05-02',
    body: `Built our own booking system from scratch instead of dropping in a Cal.com embed. Five layers of double-booking protection because the worst thing a studio can do is confirm a call and then cancel it.

If you book a 30-min discovery call, that slot is yours. No "actually we double-booked you" emails. Ever.`,
  },
  {
    slug: 'chatbot-is-live',
    title: 'The BusinessDawg chatbot is live',
    date: '2026-05-05',
    body: `The dawg now answers questions in the corner. Gemini-powered. Gen Z voice. Will never quote a price — every pricing question gets punted to Book a Call.

It's also instructed to say "I don't know" when it doesn't. We'd rather it admit ignorance than make things up.`,
  },
  {
    slug: 'admin-panel-shipped',
    title: 'Admin panel that actually does the job',
    date: '2026-05-07',
    body: `Built /admin — lead pipeline, booking management, customer stages, availability rules, all in one screen.

No Notion. No spreadsheet. No "I'll get back to you in a few days" because something fell through the cracks. The whole operation runs from one tab.`,
  },
  {
    slug: 'killed-hostinger-captcha',
    title: 'Killed the Hostinger CAPTCHA gate',
    date: '2026-05-10',
    body: `Hostinger's edge was throwing a reCAPTCHA challenge at every first-time visitor. Real people were bouncing before they even saw the hero.

Turned it off at the CDN layer. Site loads clean now. The lesson: your infra defaults are conversion-hostile until you check.`,
    // Placeholder — swap with a real screenshot of the Hostinger CDN settings panel
    imageUrl: 'https://picsum.photos/seed/buildlog-captcha/1200/680',
    imageAlt: 'Placeholder screenshot — swap with the Hostinger CDN settings panel',
  },
  {
    slug: 'senior-dev-self-audit',
    title: 'Audited our own site like a senior dev would',
    date: '2026-05-12',
    body: `Ran a full audit on the site through the lens of a senior engineer. Found 12 things to fix — security hardening, missing CTAs, observability gaps, email reliability.

Fixed all 12 in three days, shipped across four PRs. The site you're looking at right now is the post-audit version.`,
  },
  {
    slug: 'sentry-is-watching',
    title: 'Sentry is watching',
    date: '2026-05-14',
    body: `Wired up Sentry across the whole stack — client, server, edge middleware. If anything breaks for a visitor, we know within 60 seconds.

Source maps upload on every build so we get readable stack traces, not minified gibberish. Errors get routed through a tunnel so ad blockers can't drop them.`,
  },
  {
    slug: 'sticky-cta-pricing',
    title: 'Sticky CTA on the pricing page',
    date: '2026-05-15',
    body: `The old /pricing made you scroll 2000px before you could act. That's hostile.

New version: a magnetic Book-a-Call button shows up the second you land. If you came here to talk, you can talk.`,
    // Placeholder — swap with a real before/after of /pricing
    imageUrl: 'https://picsum.photos/seed/buildlog-pricing/1200/680',
    imageAlt: 'Placeholder screenshot — swap with a before/after of the /pricing CTA',
  },
  {
    slug: 'email-reliability-layer',
    title: 'Email reliability layer',
    date: '2026-05-16',
    body: `Built a retry queue and a dead-letter outbox for every transactional email — booking confirmations, reminders, admin pings.

A single Resend outage no longer means a customer never gets their confirmation. Failures land in the outbox, get retried, and surface in admin if they need manual replay.`,
  },
  {
    slug: 'chatbot-jailbreak-hardening',
    title: 'Chatbot jailbreak hardening',
    date: '2026-05-17',
    body: `Tightened the chatbot's system prompt to refuse persona switches, "pretend you're DAN", role-play, and any attempt to leak the system prompt.

Also added a chat audit log — every turn writes to the DB so we can see what visitors are actually asking. Future FAQ content is hiding in that table.`,
  },
];

(async () => {
  let created = 0;
  let updated = 0;
  for (const e of ENTRIES) {
    // Pin to noon UTC so the date sorts cleanly and never flips a day under
    // viewer timezone conversions.
    const date = new Date(`${e.date}T12:00:00.000Z`);
    const existing = await prisma.buildLogEntry.findUnique({ where: { slug: e.slug } });
    await prisma.buildLogEntry.upsert({
      where: { slug: e.slug },
      create: {
        slug: e.slug,
        title: e.title,
        date,
        body: e.body,
        imageUrl: e.imageUrl ?? null,
        imageAlt: e.imageAlt ?? null,
        loomUrl: null,
        published: true,
      },
      update: {
        title: e.title,
        date,
        body: e.body,
        imageUrl: e.imageUrl ?? null,
        imageAlt: e.imageAlt ?? null,
        published: true,
      },
    });
    if (existing) updated++;
    else created++;
  }
  console.log(
    `Seeded ${ENTRIES.length} entries (${created} new, ${updated} updated) — visit http://localhost:3000/built`,
  );
  await prisma.$disconnect();
})();
