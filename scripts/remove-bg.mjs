/**
 * One-time background removal for /public/founder.png.
 *
 * Strategy: luminance-based alpha. The source has a near-pure-white studio
 * backdrop, so we threshold pixels by perceived luminance — bright pixels
 * become transparent with a soft falloff so hair/edges feather instead of
 * crunching to a hard line.
 *
 * This is intentionally a static script, not a build step. Run once with:
 *
 *   node scripts/remove-bg.mjs
 *
 * The output (public/founder-cutout.png) is committed.
 */

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, '..', 'public', 'founder.png');
const OUT = join(__dirname, '..', 'public', 'founder-cutout.png');

// Luminance bounds for the alpha ramp. Pixels with luminance >= HARD_WHITE
// become fully transparent; pixels with luminance <= SOFT_EDGE stay fully
// opaque; everything between gets a smooth alpha falloff.
const HARD_WHITE = 240;
const SOFT_EDGE = 215;

async function main() {
  const img = sharp(SRC).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data); // copy so we mutate freely

  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const lum = r * 0.299 + g * 0.587 + b * 0.114;

    let alpha;
    if (lum >= HARD_WHITE) alpha = 0;
    else if (lum <= SOFT_EDGE) alpha = 255;
    else alpha = Math.round(255 * (1 - (lum - SOFT_EDGE) / (HARD_WHITE - SOFT_EDGE)));

    out[i + 3] = alpha;
  }

  await sharp(out, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toFile(OUT);

  console.log(`✓ wrote ${OUT} (${info.width}×${info.height})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
