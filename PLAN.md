# BUSINESSDAWG — BUILD PLAN

> The full plan. Read `CLAUDE.md` first for project rules and locked decisions. This document covers brand system, sitemap, section specs, motion system, tech architecture, CMS schema, and the build phases.

---

## STATE AS OF 2026-05-14 — READ FIRST

This document is the **original spec**. The build has diverged in a few places — go to `SETUP.md` and `CLAUDE.md` for the current source of truth on what's actually live. Highlights of the drift:

- **Stack:** the original spec mentioned React Three Fiber; the current build has **no R3F / Three.js dependency installed**. Hero motion is Framer Motion + Lenis only.
- **CMS (Phase 3 — Sanity):** scaffolded but **not consumed by any page** — Phase 3 wiring was attempted (`b23645b`) and reverted (`4ce0e25`) on 2026-05-14 due to bugs. Page copy currently comes from hardcoded `src/lib/copy.ts`.
- **Chatbot (Phase 4):** **shipped 2026-05-14** — Google Gemini 2.5 Flash Lite via the OpenAI-compatible endpoint, free tier. Inline preview on the home page launches a full-bleed cinematic overlay with streaming, lime gradient glow, mascot scan-line CRT accent, and hardcoded answer for "Who is Tahrim?". System prompt + guardrails in [src/app/api/chat/route.ts](src/app/api/chat/route.ts). The earlier Groq attempt was reverted because the 12k-TPM free cap broke under real use.
- **Email:** Hostinger SMTP via Nodemailer (the original Resend plan was dropped, and MailerLite is not in use). See `SETUP.md` §2.
- **Database:** Neon Postgres via Prisma (migration `20260514034108_init` applied). See `SETUP.md` §1.
- **Sitemap:** `/built` and `/built/[slug]` do **not** exist as routes. The Shadai showcase lives inside `/about` via the `ShadaiShowcase` component. The aspirational sitemap below is preserved for reference.
- **Backend hardening (2026-05-14):** admin session secret fails-closed in production, CSV export capped at 10k rows, SMTP misconfig logs `[CRITICAL]` in production, `/api/join` no longer leaks Zod issues, rate-limit map self-prunes every 5 min.

Everything below this banner is the **original plan**, kept intact for design intent and future-phase reference. Treat it as a vision document, not a status report.

---

## 0. EXECUTIVE SUMMARY

We're building a cinematic, conversion-driven flagship site for BusinessDawg in Next.js 14+ (App Router) with Sanity as CMS, deployed on Vercel. Animation intensity 9/10. Single-founder narrative (Tahrim). Mascot-led brand identity (the BusinessDawg). v1 ships the full vision in one go.

Timeline estimate (if Tahrim is full-time on it): ~4–6 weeks. Faster with disciplined gates.

---

## 1. BRAND IDENTITY SYSTEM

### 1.1 Logo direction

Three concepts to be sketched in `/brand/logo-concepts/` during Phase 1:

1. **Wordmark + ear mark** — bold sans wordmark with one letter (the "g") subtly stylized into a dog ear or snout.
2. **Lockup + mascot icon** — typographic wordmark paired with a separate stylized dog head icon (think Linear's geometry + a friendly grin).
3. **Sticker mark** — circular badge logo, mascot-forward, sticker-pack friendly. Best for social.

Recommendation: ship #2 (lockup + mascot icon) — gives the brand both a serious mark for navbars and a playful character for everything else.

### 1.2 Mascot — "The BusinessDawg"

A stylized dog character. Not realistic, not corporate. Think: Duolingo's owl in attitude, Linear's geometry in execution, late-2010s sticker pack in personality.

**Personality:** confident, slightly smug, knows what it's doing, has been to a few VC pitches.

**Appearances:**
- Custom cursor on hover-y elements (it follows, blinks, occasionally yawns)
- Loading states (running animation)
- 404 page (chasing its tail)
- Chatbot avatar
- Sticker pack for social downloads (post-launch)

### 1.3 Color palette — THREE OPTIONS (TAHRIM PICKS)

All three keep light-mode dominance. Hex values are starting points — final tuning happens in design.

**Option A — Electric**
```
Base       #FAFAF7 (cream white)
Ink        #0A0A0A (near black)
Primary    #B6FF3C (acid lime)
Accent     #2B4BFF (cobalt)
Muted      #E8E6DF (warm grey)
Signal     #FF4D4D (red, for alerts/CTAs)
```
*Vibe:* aggressive, internet-native, dev-coded. Loud.

**Option B — Warm Sunset**
```
Base       #FFF7F0 (off-white peach)
Ink        #1A1410 (warm black)
Primary    #FF7849 (coral)
Accent     #FFC857 (amber)
Muted      #F4E6D9 (sand)
Signal     #E63946 (deep red)
```
*Vibe:* friendly, founder-coded, warm. Less tech-bro, more "your cool older sibling who runs a studio."

**Option C — Optimistic**
```
Base       #FFFFFF (pure white)
Ink        #0B0B0E (ink black)
Primary    #4D8BFF (sky blue)
Accent     #FFE94A (neon yellow)
Muted      #EEF1F7 (cool grey)
Signal     #FF3366 (hot pink)
```
*Vibe:* cheerful, startup energy, high contrast. Most "Gen Z brand on Instagram."

> **Action needed from Tahrim:** Pick A, B, or C. Or say "remix" and tell us what to combine.

### 1.4 Typography

**Display:** General Sans (or Geist Display, or Satoshi). Bold / Extra Bold weights. Tight tracking. Up to 200pt on hero.

**Body:** Inter or Geist Sans. Regular + Medium. Comfortable line height (1.5).

**Mono accent:** JetBrains Mono or Geist Mono — used sparingly for labels, system tags, code-style flourishes.

All free / open-source fonts. No paid licenses.

### 1.5 Motion principles

- **Ease:** `cubic-bezier(0.22, 1, 0.36, 1)` for most transitions (a soft, premium ease-out).
- **Durations:** micro (150ms) for hovers, short (400ms) for reveals, long (900ms) for hero-level kinetic moments.
- **Stagger:** 60–80ms between siblings in any group reveal.
- **Reduce-motion respected.** Users with `prefers-reduced-motion` get crossfades instead of transforms.

---

## 2. SITEMAP

```
/                       Home
/systems                Systems overview
/systems/growth         Business Growth Systems
/systems/ai             AI Automation Systems
/systems/branding       Branding Systems
/systems/web            Web & Product Systems
/systems/marketing      Marketing Infrastructure
/work                   Client portfolio index (concept placeholders in v1)
/work/[slug]            Client case study (placeholder concepts in v1)
/built                  Founder ventures index
/built/shadai           Shadai Ghar — flagship founder venture, real
/about                  Founder + brand story
/join                   Talent / intern recruitment
/contact                Booking + WhatsApp + email
/404                    Custom 404 with mascot
/studio                 Sanity Studio (admin)
```

**Critical separation:** `/work` is for actual client engagements. `/built` is for ventures Tahrim owns. Shadai Ghar lives under `/built` because Tahrim owns Shadai — it's a separate company, not a BusinessDawg client. Don't describe a commercial relationship between BusinessDawg and Shadai on the site. The framing is simply: "another company Tahrim runs."

Future (post-v1, scaffolded but not populated): `/insights` (blog), `/playbook` (free resources).

---

## 3. HOMEPAGE — SECTION-BY-SECTION SPEC

### 3.1 Navbar

Sticky, glass-blur, ~64px tall. Logo left. Center: Systems / Work / About / Join. Right: "Book a Call" magnetic CTA. Mobile: hamburger → full-screen overlay menu with mascot waving.

### 3.2 Hero

- **Headline (kinetic type):** *"We build business machines."*
- **Subhead:** "Branding, AI, web, and growth systems for founders who actually ship."
- **CTAs:** [Book a Call] (primary, magnetic) · [See the systems] (ghost, scrolls down)
- **Background:** R3F scene — slowly rotating low-poly machine made of geometric shapes (gears, blocks, a stylized dog silhouette in the negative space). Particles drift. Cursor causes subtle parallax.
- **Motion:** headline words animate in with stagger + slight rotation. On scroll, hero compresses and pins briefly before releasing.

### 3.3 The Systems Stack

Five cards (one per system), arranged as a vertical or horizontally-scrolling stack. On hover/tap, each card expands to show:
- One-line definition
- 3 deliverables
- "Starter pack" price (visible) OR "Custom build — book a call" (gated)
- Link to `/systems/[slug]`

Cards have a slight 3D tilt on hover (Framer Motion). Background swaps to a system-specific gradient.

**Starter pack pricing** (placeholder — Tahrim to confirm real numbers):
- Branding Systems — Starter from $X (logo + identity essentials)
- Web & Product Systems — Starter from $X (one-page landing)
- AI Automation Systems — Custom only
- Business Growth Systems — Custom only
- Marketing Infrastructure — Custom only

### 3.4 Founder section — "Brains behind BusinessDawg"

- Photo of Tahrim (provided)
- Story-driven copy in first person ("I'm Tahrim. I build business machines because…")
- Three credibility nuggets (years, projects shipped, what I believe)
- Social row: X, LinkedIn, Instagram, GitHub (handles provided)
- Subtle parallax on the photo, mascot peeks from behind a corner

### 3.5 Founder ventures teaser ("What I've built")

Sits right after the founder section. One large featured card:
- **Shadai Ghar** (real, live link) — cinematic preview, hover plays a 3s product reel
- Label: **"Another company I run"** — simple, no commercial-relationship framing
- Subline: short line about Shadai's traction (e.g. "D2C grocery, Faridpur, 500 families in six weeks")

CTA: "See what I've built →" → `/built`

### 3.6 Client portfolio teaser

Three-card row of conceptual client work, each card clearly tagged **"Concept"** so it's not deceptive. Real client case studies replace these as work ships.

CTA: "See client work →" → `/work`

> **Why split:** Shadai is Tahrim's own venture, not a client engagement. Mixing it into the client portfolio would misrepresent it. Showing it under "Founder ventures" — as another thing Tahrim runs, without trying to describe a commercial relationship — keeps things honest and simple.

### 3.7 The chatbot section

Embedded panel — looks like a real chat with the BusinessDawg mascot avatar. Suggested prompts:
- "What do you actually do?"
- "How much for a brand identity?"
- "Can I book Tahrim?"

> **Gate:** Backend wiring requires Tahrim to confirm provider before any code touches it. UI ships as a static mockup until then.

### 3.8 Recruitment teaser

Two-column split:
- **Left — Clients:** "Have a business to build? Book a call." → Cal.com
- **Right — Talent:** "Want to join the movement? We hire weirdos with taste." → `/join`

Distinct visual treatment so the two paths are obvious.

### 3.9 Newsletter capture

One-line headline ("Get the playbook in your inbox.") + email field + button. Hooked into MailerLite free tier. Mascot animation on success.

### 3.10 Footer

Logo + tagline. Sitemap links. Social row. WhatsApp button. Email. Subtle BusinessDawg sleeping at the very bottom (easter egg — click and it wakes up).

---

## 4. SUBPAGE SPECS (CONDENSED)

### `/systems/[slug]`
Hero with system name + tagline. "What it is" → "What you get" → "How we build it" (3-step) → Pricing or "Book a Call" → Related work → Adjacent system suggestion.

### `/work` and `/work/[slug]`
Client engagements only. Case study layout: hero image/video, client + role + outcome + timeline metadata, problem, approach, what we built, results, testimonial slot, next/prev navigation. In v1 these are concept placeholders, each clearly tagged "Concept" until real client case studies ship.

### `/built` and `/built/[slug]`
Founder ventures — separate companies Tahrim runs. v1 features `/built/shadai`.

Case study layout for `/built/shadai`:
- **Header label:** "Another company I run" — simple, no commercial-relationship framing
- Hero with Shadai's branding (not BusinessDawg's), live URL prominent
- Metadata: Tahrim's role (founder + operator), timeline, stack used
- What Shadai is (the business) — D2C grocery, Faridpur, 500 families in 6 weeks, 23-27% margins
- What's behind it — e-commerce platform, Next.js, Postgres, Prisma, payments, image pipeline, email, AI shopping recs, full admin workflows. Described without crediting BusinessDawg explicitly; the work is shown, attribution stays neutral.
- Outcome — traction, plans (10,000 households, ~2 crore EBT/month at maturity)
- Outbound link to Shadai's live site
- Next/prev nav (in v1, only Shadai exists under `/built`, so this is hidden)

### `/about`
Long-form founder narrative. Manifesto. Values (3–5). What we believe. What we don't do. Press / mentions slot (empty for now).

### `/join`
Open roles or "Always hiring weirdos with taste" + application form (Sanity-backed or Formspree free tier). Tone: anti-corporate careers page.

### `/contact`
Cal.com embed. WhatsApp button. Email. Office hours note. Mascot illustration.

### `/404`
Mascot chasing tail. "This page got fetched too hard." Link home.

---

## 5. MOTION SYSTEM (TECHNICAL)

- **Smooth scroll:** Lenis with default config, paused for `prefers-reduced-motion`.
- **Reveals:** Framer Motion `useInView` + variants for fade-up-stagger.
- **Magnetic buttons:** custom hook tracking pointer offset → translate button by `pointer * 0.2`, capped at 12px.
- **Cursor:** custom DOM element following pointer with spring-damped follow. Replaces system cursor on `cursor-hover` data-attribute elements with mascot variant.
- **Kinetic type:** SplitType + Framer Motion stagger.
- **3D:** R3F + Drei. Single canvas in hero, mounted once, suspended on route changes.
- **Page transitions:** App Router `template.tsx` with a fade+slide overlay.

---

## 6. TECH ARCHITECTURE

```
app/
  (marketing)/
    page.tsx                 Home
    systems/[slug]/page.tsx
    work/[slug]/page.tsx
    about/page.tsx
    join/page.tsx
    contact/page.tsx
  api/
    chat/route.ts            (gated — see Approval Gate #1)
    newsletter/route.ts      MailerLite proxy
    join/route.ts            Application submission
  layout.tsx                 Root layout with Lenis + cursor
  template.tsx               Page transition wrapper
  not-found.tsx              Custom 404
components/
  ui/                        Buttons, inputs, cards
  brand/                     Logo, mascot, kinetic-type
  motion/                    Reveal, magnetic, cursor
  three/                     Hero R3F scene, materials
  sections/                  Home page sections
lib/
  sanity/                    Client + queries
  analytics/                 Plausible loader (post-v1)
sanity/                      Sanity Studio config
public/
  fonts/                     Self-hosted woff2
  mascot/                    Mascot SVG / Lottie variants
```

Env vars (documented in `README.md`, never committed):
```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_TOKEN=
MAILERLITE_API_KEY=
NEXT_PUBLIC_CAL_USERNAME=
# Chatbot vars added only after Approval Gate #1
```

---

## 7. SANITY CMS SCHEMA (v1)

- **system** — name, slug, tagline, description, deliverables[], starter pack (price, included[], optional: hidden), gallery[], CTA type (price | book), order
- **case_study** — title, slug, client, role, timeline, problem (block content), approach (block content), outcome (block content), gallery[], live URL, is_concept (bool). **Client work only.**
- **founder_venture** — name, slug, tagline, owner_role (e.g. "Founder + Operator"), timeline, stack[], business_description, build_description, outcome (block content), gallery[], live URL. **Tahrim's own companies, shown as parallel ventures with no commercial-relationship framing.** First entry: Shadai Ghar.
- **founder_block** — bio, story, credibility[] (label + value), socials[]
- **values** — title, body
- **role** — title, description, location (remote/hybrid), is_open
- **settings** — global tagline, footer copy, social handles

Studio mounts at `/studio`. Free tier sufficient.

---

## 8. INTEGRATIONS

| Service | Use | Tier | Status |
|---|---|---|---|
| Vercel | Hosting | Free | Set up Phase 0 |
| Sanity | CMS | Free | Set up Phase 1 |
| Cal.com | Booking | Free / self-host | Embedded Phase 4 |
| MailerLite | Newsletter | Free (≤1000 subs) | Wired Phase 4 |
| Plausible / PostHog | Analytics | Free trial / open source | Optional v1.1 |
| AI chatbot provider | Chatbot | Free (Hugging Face / Groq / Ollama) | **Gated — Approval Gate #1** |
| WhatsApp Click-to-Chat | Lead | Free (link) | Wired Phase 4 |

---

## 9. COPY LIBRARY (STARTER DRAFTS)

**Hero headline:** *"We build business machines."*

**Hero sub:** "Branding, AI, web, and growth systems for founders who actually ship."

**Systems intro:** "Five systems. One studio. Stack them however your business needs."

**Founder open:** "I'm Tahrim. I started BusinessDawg because most agencies are stuck in 2014 and most founders don't have time to wait for them to catch up."

**Recruitment line:** "We hire weirdos with taste. If that's you, the door's open."

**Footer line:** "Built by humans. Shipped by machines."

**404:** "This page got fetched too hard. The dawg is sorry."

---

## 10. EASTER EGG PROPOSALS (TAHRIM PICKS 3)

1. **Dog cursor** *(already locked in)* — cursor turns into a tiny mascot on hover-y elements.
2. **Konami code** — ↑↑↓↓←→←→BA triggers a confetti rain of mini mascots.
3. **Type "woof"** anywhere on the homepage → mascot pops up center-screen for 2s.
4. **Triple-click the logo** → logo briefly turns into a sticker-bombed version.
5. **Idle for 60s** → mascot walks across the bottom of the screen, sniffs, leaves.
6. **Footer sleeping mascot** — click to wake, click again to make it stretch.
7. **Scroll to bottom of `/about` really fast** → "okay, calm down" text appears.

> **Action needed from Tahrim:** pick 3 from #2–#7 (the cursor is mandatory).

---

## 11. ACCESSIBILITY & PERFORMANCE

- Respect `prefers-reduced-motion` everywhere.
- All interactive elements keyboard-reachable. Focus rings visible.
- Color contrast: WCAG AA on body text minimum. Some hero kinetic type may bend the rule for stylistic moments — must have an accessible fallback nearby.
- Lighthouse target: ≥80 mobile, ≥90 desktop.
- Image strategy: `next/image`, AVIF preferred, lazy by default, eager only on hero.
- 3D hero: degrade to static SVG on low-power devices (detect via `navigator.hardwareConcurrency`).

---

## 12. BUILD PHASES

### Phase 0 — Foundation (Day 1–2)
- Next.js + TS + Tailwind scaffold
- Lenis, Framer Motion, R3F installed
- ESLint, Prettier, Husky pre-commit
- Vercel project linked
- Sanity project initialized, studio mounted at `/studio`
- Repo on GitHub, `main` protected

### Phase 1 — Brand system + design tokens (Day 3–5)
- **Gate: Tahrim picks color palette.**
- Logo concept built as SVG (concept #2 from Section 1.1)
- Mascot SVG drafted in 3 poses (idle, running, sleeping)
- Tailwind config tokens (colors, fonts, spacing scale, easings)
- Storybook-lite page (`/_kit`) showing buttons, type, cards in isolation

### Phase 2 — Motion primitives (Day 6–8)
- Smooth scroll wired
- Magnetic button component
- Reveal component
- Custom cursor with mascot variant
- Page transition template
- Kinetic type component

### Phase 3 — Homepage build (Day 9–14)
- Hero (incl. R3F scene)
- Systems Stack
- Founder section
- Portfolio teaser
- Chatbot panel (static UI only — see Gate #1)
- Recruitment teaser
- Newsletter (wired to MailerLite)
- Footer (incl. sleeping mascot easter egg)

### Phase 4 — Subpages + CMS wiring (Day 15–21)
- Sanity schemas live, data flowing
- 5 system pages
- Work index + Shadai case study + 2 concept placeholders
- About, Join, Contact
- 404
- Cal.com embed live
- WhatsApp click-to-chat live

### Phase 5 — Easter eggs + polish (Day 22–25)
- **Gate: Tahrim picks final 3 easter eggs.**
- Easter eggs implemented
- Reduce-motion audit
- Lighthouse pass
- Accessibility pass (keyboard, screen reader spot-check)
- Copy polish pass

### Phase 6 — Chatbot wiring (only after Gate #1)
- **Gate: Tahrim confirms provider.**
- API route + provider client
- Personality prompt + safety guardrails
- Rate limiting on the API route
- Frontend wired to live backend

### Phase 7 — Launch
- Domain DNS pointed at Vercel
- OG images generated per page
- Sitemap.xml + robots.txt
- Newsletter test send
- Soft-launch on Tahrim's socials

---

## 13. POST-LAUNCH ROADMAP (v1.1 → v2)

- Analytics (Plausible or PostHog)
- `/insights` blog populated from Sanity
- `/playbook` lead magnet (free PDFs gated behind email)
- Dark mode
- Sticker pack download page
- Case study expansions as new work ships
- A/B test on hero headline

---

## 14. THINGS WE STILL NEED FROM TAHRIM

| # | Item | Blocks |
|---|---|---|
| 1 | Founder photo (high res, 2–3 options) | Phase 3 founder section |
| 2 | ~~Founder bio / story~~ — **DONE** (see `/assets/inbox/founder-bio.md`, short + medium + long versions) | Phase 3 founder section |
| 3 | Social handles (X, LinkedIn, Instagram, GitHub, others) | Phase 3 + footer |
| 4 | Shadai live URL | Phase 4 case study |
| 5 | Shadai screenshots / mockups | Phase 4 case study |
| 6 | Shadai write-up (role, outcome, what was built) | Phase 4 case study |
| 7 | Final color palette pick (A / B / C / remix) | Phase 1 |
| 8 | Final 3 easter eggs from the list | Phase 5 |
| 9 | AI chatbot provider confirmation | Phase 6 |
| 10 | Starter pack prices for Branding + Web (or confirm "from $X") | Phase 3 |
| 11 | Domain confirmation + DNS access | Phase 7 |
| 12 | MailerLite account + API key | Phase 4 |
| 13 | Cal.com username | Phase 4 |
| 14 | WhatsApp number for click-to-chat | Phase 4 |

---

*Plan locked: 2026-05-13. Read `HANDOFF.md` for the Claude Code kickoff prompt.*
