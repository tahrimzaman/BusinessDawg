# /public/brand/ — drop the real brand PNGs here

The site code references these paths. Add files with EXACTLY these names:

| Filename | Source pose | Used by |
|---|---|---|
| `logo.png` | Full lockup — pitbull head + "BusinessDawg" wordmark with lime underscore | Navbar, Footer, meta |
| `logo-mark.png` | Head-only mark (sunglasses dawg silhouette) | Favicon, compact slots |
| `mascot-hero.png` | Full-body thumbs-up render (the smiling thumbs-up one) | Hero section |
| `mascot-arms-crossed.png` | (optional) Full-body arms-crossed render | /about side rail |
| `mascot-leaning.png` | (optional) Full-body leaning on desk | /contact |

All PNGs should be on transparent background (or solid black to match the site).

Aspect ratios are read from the file by Next/Image at build — any size works, but a vertical mascot render around 1200×1500 looks crisp on the hero.

Drop the files and rebuild — `pnpm dev` will pick them up immediately.
