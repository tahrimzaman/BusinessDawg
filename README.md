# BusinessDawg Web

The cinematic, motion-heavy flagship site for BusinessDawg — a Gen Z–native business growth studio.

Built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, React Three Fiber, Lenis, and Sanity.

## Prerequisites

- Node 20 LTS or newer (`node -v`)
- pnpm (`pnpm -v`) — install with `corepack enable && corepack prepare pnpm@latest --activate` or the standalone installer at https://pnpm.io/installation

## Setup

```bash
pnpm install
cp .env.local.example .env.local
# Fill in env vars (see below).
pnpm dev
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
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build locally |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier write |
| `pnpm format:check` | Prettier check (CI) |

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

Vercel free tier. Push to `main` → Vercel builds → previews per PR. Add all env vars from `.env.local.example` to the Vercel project settings.

## Project docs

- `CLAUDE.md` — locked decisions, brand rules, approval gates
- `PLAN.md` — full build plan
- `KICKOFF.md` — start-of-build checklist
- `HANDOFF.md` — Claude Code kickoff prompt

These are the source of truth. Read them before touching anything.

---

Built by humans. Shipped on purpose.
