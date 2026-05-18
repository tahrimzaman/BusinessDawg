/**
 * Brag-stat for the chatbot's offline reply.
 *
 * When Gemini's daily quota is burned through, /api/chat returns 429 with a
 * canned message. The client substitutes a single number into that copy so
 * the line reads as "I got hammered today" rather than "the bot is broken."
 *
 *   number = random(1..50) + today's ChatLog turns + today's PostHog pageviews
 *
 * The random component keeps the number non-deterministic between sessions
 * (so refreshes don't always show the same number) and pads the count when
 * traffic is low. ChatLog count is exact. PostHog pageviews is best-effort
 * — falls back to 0 if PostHog isn't reachable; the random + ChatLog parts
 * still produce a sensible number.
 *
 * Never throws. The caller (/api/chat route) wraps in try/catch and falls
 * back to a random 50–250 if this whole helper errors.
 */

import { prisma } from '@/lib/db/prisma';
import { pageviewsToday } from '@/lib/analytics/posthog-query';

function startOfUtcToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function offlineStat(): Promise<number> {
  const random = 1 + Math.floor(Math.random() * 50);
  const since = startOfUtcToday();

  // PostHog query can take up to a few seconds; cap it so the chatbot 429
  // response stays snappy. If it times out, just use random + ChatLog.
  const visitorsPromise = Promise.race<number>([
    pageviewsToday().catch(() => 0),
    new Promise<number>((resolve) => setTimeout(() => resolve(0), 1500)),
  ]);

  const [chatTurns, visitors] = await Promise.all([
    prisma.chatLog.count({ where: { createdAt: { gte: since } } }).catch(() => 0),
    visitorsPromise,
  ]);

  return random + chatTurns + visitors;
}
