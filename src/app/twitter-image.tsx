import OgImage from './opengraph-image';

// Twitter uses the same image as OpenGraph. These segment-config exports must
// be inlined (Next can't statically parse re-exports).
export const runtime = 'edge';
export const alt = 'BusinessDawg — We build business machines.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
  return OgImage();
}
