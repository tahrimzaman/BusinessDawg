#!/usr/bin/env node
/**
 * Build per-post Open Graph cards as static PNGs.
 *
 * Why static instead of next/og at runtime: Hostinger's Node 22 sandbox
 * doesn't permit the WASM instantiation that @vercel/og (Satori + Resvg)
 * needs at module load. A crash-loop ensued. Generating PNGs offline with
 * `sharp` produces the same end result, with zero runtime risk — they're
 * just files in public/og/ served like any other static asset.
 *
 * Re-run when journal posts are added or titles change:
 *   npm run og:build
 *
 * Output: public/og/<slug>.png (1200×630, ~25–60 KB each)
 */

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'public', 'og');

// ---- Read the hardcoded JOURNAL array via a quick regex parse ----
// We could `import()` the .ts source but that'd force TS tooling here. The
// regex is tight enough — each entry has a unique `slug`/`title`/`kicker`
// triple and we only need those three fields per card.
const journalSrc = readFileSync(resolve(ROOT, 'src/lib/journal.ts'), 'utf8');

function extract(field, src) {
  // Match `field: 'value'` OR `field: "value"`, allowing single-quoted
  // strings with escaped chars (the typesetter's curly apostrophes show up).
  const re = new RegExp(`${field}:\\s*(?:'((?:\\\\.|[^'\\\\])*)'|"((?:\\\\.|[^"\\\\])*)")`, 'g');
  const out = [];
  let m;
  while ((m = re.exec(src))) {
    out.push((m[1] ?? m[2]).replace(/\\'/g, "'"));
  }
  return out;
}

const slugs = extract('slug', journalSrc);
const titles = extract('title', journalSrc);
const kickers = extract('kicker', journalSrc);

// First match of each is the type alias (`slug: string`) — skip it.
if (slugs[0] === 'string') slugs.shift();
if (titles[0] === 'string') titles.shift();
if (kickers[0] === 'string') kickers.shift();

if (slugs.length !== titles.length || slugs.length !== kickers.length) {
  console.error(
    `Field count mismatch: slugs=${slugs.length} titles=${titles.length} kickers=${kickers.length}. Check the regex against journal.ts.`,
  );
  process.exit(1);
}
if (slugs.length === 0) {
  console.error('No posts found in src/lib/journal.ts');
  process.exit(1);
}

// ---- SVG card builder ----
const WIDTH = 1200;
const HEIGHT = 630;
const PAD = 72;

// Brand palette (matches CLAUDE.md §2 locked design system).
const INK = '#0A0A0A';
const BONE = '#FAFAFA';
const LIME = '#C8FF00';
const MUTED = '#7a7a7a';

// XML-escape: SVG body needs `<` `>` `&` escaped, plus quotes inside attrs.
function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Greedy word-wrap into at most `maxLines` lines without exceeding `maxChars`
// per line. Returns an array of line strings. The exact pixel width is
// approximate (we can't measure font metrics from Node + librsvg cleanly),
// but tuning maxChars at title-font-size ≈ 80px gives ~17–22 chars per line
// at the chosen font size.
function wrap(text, maxChars, maxLines) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const candidate = cur ? `${cur} ${w}` : w;
    if (candidate.length <= maxChars) {
      cur = candidate;
    } else {
      if (cur) lines.push(cur);
      cur = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (cur) lines.push(cur);
  // Truncate the last line if we ran out of room.
  if (lines.length === maxLines) {
    const remaining = words.slice(lines.join(' ').split(/\s+/).length).join(' ');
    if (remaining) {
      const last = lines[maxLines - 1];
      if (last.length + 1 + remaining.length > maxChars) {
        lines[maxLines - 1] = last.replace(/\s*\S+$/, '') + ' …';
      }
    }
  }
  return lines;
}

function buildSvg({ title, kicker }) {
  const titleLines = wrap(title, 22, 3);
  // Scale font size down as line count grows so 3-line titles still fit.
  const titleFontSize = titleLines.length === 1 ? 96 : titleLines.length === 2 ? 84 : 72;
  const titleLineHeight = Math.round(titleFontSize * 1.05);
  const titleBlockHeight = titleFontSize + titleLineHeight * (titleLines.length - 1);
  // Center the title block vertically between the eyebrow band and footer.
  const titleStartY = Math.round((HEIGHT - titleBlockHeight) / 2 + titleFontSize * 0.85);

  const titleTspans = titleLines
    .map((line, i) => {
      const dy = i === 0 ? 0 : titleLineHeight;
      return `<tspan x="${PAD}" dy="${dy}">${esc(line)}</tspan>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${INK}"/>

  <!-- Lime accent bar + kicker -->
  <rect x="${PAD}" y="${PAD + 18}" width="64" height="4" fill="${LIME}"/>
  <text x="${PAD + 84}" y="${PAD + 26}" fill="${LIME}" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="22" letter-spacing="3" font-weight="600">/ ${esc(kicker.toUpperCase())}</text>

  <!-- Title (italic bold, multi-line) -->
  <text x="${PAD}" y="${titleStartY}" fill="${BONE}" font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif" font-size="${titleFontSize}" font-weight="800" font-style="italic" letter-spacing="-1.5">
    ${titleTspans}
  </text>

  <!-- Footer brand -->
  <text x="${PAD}" y="${HEIGHT - PAD}" fill="${BONE}" font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif" font-size="34" font-weight="700" font-style="italic" letter-spacing="-0.5">BusinessDawg</text>
  <text x="${PAD + 270}" y="${HEIGHT - PAD - 4}" fill="${MUTED}" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="22" letter-spacing="2" font-weight="500">BUSINESSDAWG.COM</text>
</svg>`;
}

// ---- Render each post ----
mkdirSync(OUT_DIR, { recursive: true });

for (let i = 0; i < slugs.length; i++) {
  const slug = slugs[i];
  const title = titles[i];
  const kicker = kickers[i];
  const svg = buildSvg({ title, kicker });
  const outPath = resolve(OUT_DIR, `${slug}.png`);
  // Density 1.0 = render the SVG at its declared viewBox size. PNG output
  // is 1200×630, which is the canonical OG card size.
  await sharp(Buffer.from(svg), { density: 96 }).png({ compressionLevel: 9 }).toFile(outPath);
  console.log(`✓ ${slug}.png  (kicker: "${kicker}", title len: ${title.length})`);
}

console.log(`\nDone. ${slugs.length} OG card(s) written to public/og/`);
