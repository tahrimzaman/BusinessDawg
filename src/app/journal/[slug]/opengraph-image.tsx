/**
 * Per-post Open Graph image. Renders a 1200×630 social card on demand using
 * Next's ImageResponse — server-rendered, edge-cached, no external service.
 *
 * Why bother: the default OG image (set in src/app/layout.tsx) is the same
 * brand card for every page. With one card per post, when a post gets shared
 * on Twitter/LinkedIn/Slack the preview shows that post's title in lime on
 * the BusinessDawg palette — much higher click-through than a generic card.
 *
 * The font and palette match the site's locked design system (CLAUDE.md §2):
 *   ink #0A0A0A · bone #FAFAFA · lime #C8FF00
 *
 * Static export-friendly: this file participates in `generateStaticParams`
 * so each post's OG image is baked at build time. No /api hop at request time.
 */

import { ImageResponse } from 'next/og';
import { getPostBySlug, JOURNAL } from '@/lib/journal';

export const runtime = 'nodejs';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

// Bake one image per slug at build. Mirrors generateStaticParams in page.tsx.
export function generateStaticParams() {
  return JOURNAL.map((p) => ({ slug: p.slug }));
}

export default async function OG({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  // Defensive fallback: if a stale build references a removed slug, fall
  // back to a neutral card instead of throwing during static generation.
  const title = post?.title ?? 'BusinessDawg';
  const kicker = post?.kicker ?? 'Journal';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0A0A0A',
        padding: 72,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Eyebrow + lime accent bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 64, height: 4, background: '#C8FF00' }} />
        <div
          style={{
            color: '#C8FF00',
            fontSize: 18,
            fontFamily: 'monospace',
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          {`/ ${kicker}`}
        </div>
      </div>

      {/* Title — italic display, big */}
      <div
        style={{
          color: '#FAFAFA',
          fontSize: title.length > 60 ? 72 : 88,
          fontWeight: 800,
          fontStyle: 'italic',
          lineHeight: 1.05,
          letterSpacing: -1.5,
          display: 'flex',
        }}
      >
        {title}
      </div>

      {/* Footer: brand mark */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <div
          style={{
            color: '#FAFAFA',
            fontSize: 28,
            fontWeight: 700,
            fontStyle: 'italic',
            letterSpacing: -0.5,
          }}
        >
          BusinessDawg
        </div>
        <div
          style={{
            color: '#7a7a7a',
            fontSize: 18,
            fontFamily: 'monospace',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          businessdawg.com
        </div>
      </div>
    </div>,
    { ...size },
  );
}
