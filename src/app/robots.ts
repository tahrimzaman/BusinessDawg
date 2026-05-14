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
  const restricted = ['/studio', '/api', '/admin'];
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: restricted },
      ...aiCrawlers.map((userAgent) => ({ userAgent, allow: '/', disallow: restricted })),
    ],
    sitemap: 'https://businessdawg.com/sitemap.xml',
    host: 'https://businessdawg.com',
  };
}
