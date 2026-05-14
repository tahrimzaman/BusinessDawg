# BusinessDawg Web

The cinematic, motion-heavy flagship site for BusinessDawg — a Gen Z–native business growth studio.

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, and Lenis. Prisma → Neon Postgres for lead capture, Nodemailer → Hostinger SMTP for transactional email, PostHog for analytics, and Sanity (currently scaffolded but unused — see SETUP.md and CLAUDE.md for status).

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

Full list and example values live in `.env.local.example`. The required ones:

| Key | Purpose | Required for |
|---|---|---|
| `DATABASE_URL` | Neon Postgres pooled connection | Lead capture, `/admin` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Hostinger SMTP (yo@businessdawg.com) | Lead notification emails |
| `SMTP_FROM` / `ADMIN_INBOX` | Sender + admin recipient | Lead notification emails |
| `ADMIN_PASSWORD` | Admin dashboard password | `/admin` login |
| `ADMIN_SESSION_SECRET` | HMAC secret for admin cookie | `/admin` session (fails closed in production if missing) |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | Analytics | Page + event tracking |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` / `SANITY_API_TOKEN` | Sanity (scaffolded, unused post-Phase 3 revert) | `/studio` mount |
| `NEXT_PUBLIC_CAL_USERNAME` | Cal.com booking slug | `/contact` embed |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Click-to-chat number | Footer + contact |
| `NOTIFY_ON_SUBSCRIBE` | Opt-in admin email on every newsletter signup | Optional |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth for Calendar + Meet | Optional — booking system falls back to "Meet link to follow" if missing |
| `GOOGLE_REDIRECT_URI` / `GOOGLE_OWNER_CALENDAR_ID` | OAuth callback + which calendar to write to | Defaults to `localhost:3000/api/admin/google/callback` + `primary` |
| `BOOKING_BASE_URL` | Used in transactional emails for `/admin/bookings/[id]` deep-links + the visitor `/booking/[token]/manage` link | Optional, defaults to `http://localhost:3000` |
| `CRON_SECRET` | Bearer token Vercel Cron sends to `/api/booking/reminders`. Generate with `openssl rand -base64 32` | Required in production for daily reminder cron. Dev allows localhost without it. |

Chatbot vars (`GROQ_API_KEY`, `GROQ_MODEL`) are present in `.env.local` but unused — Phase 4 (Groq-backed streaming chat) was reverted on 2026-05-14 and the chatbot is currently a static scripted UI. See Approval Gate #1 in `CLAUDE.md`.

### Google Calendar setup (booking system)

One-time setup if you want auto-generated Google Meet links on every booking. Bookings still work without it — visitor email says "Meet link to follow" and the admin sees a "Needs Meet link" badge.

1. [console.cloud.google.com](https://console.cloud.google.com) → create a new project (e.g. `businessdawg-booking`).
2. **APIs & Services → Library** → enable **Google Calendar API**.
3. **OAuth consent screen** → External → app name `BusinessDawg Booking` → support email = your Gmail. Scope: `https://www.googleapis.com/auth/calendar.events`. Add your Gmail as a **Test user**.
4. **Credentials → Create credentials → OAuth 2.0 Client ID → Web application**:
   - Authorized JavaScript origin: `http://localhost:3000`
   - Authorized redirect URI: `http://localhost:3000/api/admin/google/callback`
5. Paste the client ID + secret into `.env.local` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`). Restart the dev server.
6. Visit `/admin` → click **Connect Google Calendar** in the status card at the top.

The refresh token in OAuth Testing mode expires every 7 days. Reconnect from `/admin` when the connection-status badge turns amber. To skip the weekly chore, submit the app for Google Verification (4–6 wk review) once you're ready.

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
    page.tsx                Home
    about/                  Founder + Shadai showcase
    systems/                Systems landing + [slug] detail
    contact/                Cal.com embed + WhatsApp
    join/                   Talent application form
    admin/                  Password-gated lead dashboard (+ /login)
    studio/[[...tool]]/     Sanity Studio mount
    api/
      join/                 POST — talent application capture
      newsletter/           POST — newsletter subscribe
      admin/login           POST — password → cookie session
      admin/logout          POST — clear cookie
      admin/export          GET  — CSV of subscribers or applications
  components/
    ui/                     Buttons, inputs, cards
    brand/                  Logo, mascot, kinetic-type
    motion/                 Lenis provider, magnetic, reveal, cursor
    sections/               Page sections (Hero, Chatbot, Navbar, ...)
    booking/                Cal.com embed wrapper
    analytics/              PostHog provider
    security/               Honeypot, etc.
    seo/                    Meta tags, structured data
  lib/
    copy.ts                 Hardcoded content (Sanity not consumed post-revert)
    sanity/                 Client + GROQ queries (scaffolded, unused)
    db/                     Prisma client singleton
    email/                  Nodemailer → Hostinger SMTP
    admin/                  Auth (cookie, timing-safe compare)
    security/               Rate limiter + helpers
    motion/                 Easing tokens
prisma/                     Schema + migrations (Neon Postgres)
sanity/                     Sanity Studio schemas
public/
  brand/                    Logo + mascot poses
  fonts/                    (empty — fonts not yet self-hosted; Phase 1 design)
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
