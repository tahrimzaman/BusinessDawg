import type { MetadataRoute } from 'next';

// Default rule covers every crawler. AI-engine bots are then named explicitly
// so the studio is visibly opted-in for GEO discovery (some engines treat the
// absence of a named rule as ambiguous).
const aiCrawlers = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Bytespider',
];

export default function robots(): MetadataRoute.Robots {
  // /monitoring is the Sentry tunnel route (set via withSentryConfig in
  // next.config.ts) — internal pipe for client-side error events, not a
  // real page. Disallow so it never appears in search results.
  const restricted = ['/studio', '/api', '/admin', '/booking', '/monitoring'];
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: restricted },
      ...aiCrawlers.map((userAgent) => ({ userAgent, allow: '/', disallow: restricted })),
    ],
    sitemap: 'https://businessdawg.com/sitemap.xml',
    host: 'https://businessdawg.com',
  };
}
