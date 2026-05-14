# BusinessDawg Web

The cinematic, motion-heavy flagship site for BusinessDawg — a Gen Z–native business growth studio.

Built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, React Three Fiber, Lenis, and Sanity.

## Prerequisites

- Node 20 LTS or newer (`node -v`)
- npm 10+ (`npm -v`)

## Setup

```bash
npm install
cp .env.local.example .env.local
# Fill in env vars (see below).
npm run dev
```

The site runs at http://localhost:3000. Sanity Studio at http://localhost:3000/studio.

## Environment variables

| Key | Purpose | Required for |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID | CMS reads/writes |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset (default `production`) | CMS |
| `SANITY_API_TOKEN` | Server-only read token | CMS server queries |
| `MAILERLITE_API_KEY` | Newsletter integration | `/api/newsletter` |
| `MAILERLITE_GROUP_ID` | List/group target | Newsletter |
| `NEXT_PUBLIC_CAL_USERNAME` | Cal.com booking slug | `/contact` embed |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Click-to-chat number | Footer + contact |

Chatbot vars are gated behind Approval Gate #1 (see `CLAUDE.md`). Don't add a provider until approved.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Run the production build locally |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check (CI) |

## Folder structure

```
src/
  app/                      Next.js App Router pages + layouts
    (marketing)/            Marketing routes (home, systems, work, built, ...)
    api/                    Route handlers (newsletter, chat-gated, join)
    studio/                 Sanity Studio mount
  components/
    ui/                     Buttons, inputs, cards
    brand/                  Logo, mascot, kinetic-type
    motion/                 Lenis provider, magnetic, reveal, cursor
    three/                  R3F hero scene + materials
    sections/               Homepage sections
  lib/
    sanity/                 Client + GROQ queries
    motion/                 Easing tokens + hooks
  styles/                   Globals + design tokens
sanity/                     Sanity Studio config (schemas)
public/
  fonts/                    Self-hosted woff2
  mascot/                   Mascot SVG variants
```

## Deploying

**Production: https://businessdawg.com** — hosted on Hostinger Business Web Hosting (Node.js 22, managed Next.js).

- Push to `main` → Hostinger auto-deploys from the `BusinessDawg` GitHub repo
- Build: `npm run build` (Hostinger Settings → Build and output settings → Package manager: `npm`)
- Root directory: `./`, Output directory: `.next`
- Env vars: managed via hPanel → Websites → businessdawg.com → Environment variables (never committed)
- DNS: apex + www both point to Hostinger (`82.25.87.124`); SSL + CDN handled by Hostinger
- Server features: SSR, `next/image` optimization (sharp), `/api` routes — all preserved

Note: `package-lock.json` is the source of truth; pnpm files are intentionally absent. Hostinger's pnpm symlink layout breaks esbuild's postinstall on shared hosting, so we use npm.

## Project docs

- `CLAUDE.md` — locked decisions, brand rules, approval gates
- `PLAN.md` — full build plan
- `KICKOFF.md` — start-of-build checklist
- `HANDOFF.md` — Claude Code kickoff prompt

These are the source of truth. Read them before touching anything.

---

Built by humans. Shipped on purpose.
