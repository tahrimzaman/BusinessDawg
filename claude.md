# BUSINESSDAWG — PROJECT INSTRUCTIONS

> Source of truth for anyone (or any agent) working on the BusinessDawg website. This file is read on every session. If a decision conflicts with anything in chat, **this file wins** unless the user explicitly overrides it.

---

## 1. WHAT WE'RE BUILDING

A cinematic, motion-heavy, lead-generating website for **BusinessDawg** — a Gen Z–native business growth studio offering branding, AI automation, web/product, and growth-consulting systems.

This is **not** a traditional agency site. It's an internet-native flagship that should feel like a startup product launch every time you scroll.

**Founder:** Tahrim Zaman (solo founder, face of the brand).

---

## 2. LOCKED DECISIONS

These are settled. Do not re-debate without explicit approval from Tahrim.

| Area | Decision |
|---|---|
| Stack | Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion + React Three Fiber + Lenis (smooth scroll) |
| Hosting | Vercel free tier |
| Domain | `businessdawg.com` (or similar) — owned by Tahrim |
| CMS | Sanity (free tier, headless) |
| Pricing display | Hybrid — public starter pack price, custom systems gated behind "Book a Call" |
| Booking | Cal.com embed (free, open source) |
| Newsletter | MailerLite free tier |
| Brand identity | Logo + mascot provided by Tahrim (see `/assets/inbox/BusinessDawg Logo.png`). Site design derived from these. |
| Mascot | Yes — stylized bulldog with lime sunglasses (already drawn, see logo). Used across cursor moments, loaders, 404, chatbot avatar, and a sticker pack. Additional poses (running, sleeping, waving, thinking) generated in Phase 1 in the same style. |
| Typography | Italic bold sans display (to match wordmark energy) + clean sans body. Geist Sans is the recommended pairing — free, open-source, has both italic and non-italic. |
| Color palette | **LOCKED — derived from logo.** Black base (#0A0A0A), white primary text (#FAFAFA), lime accent (#C8FF00 approx). Full system in `PLAN.md` Section 1.3. |
| Light vs dark | **Dark mode dominant.** Black base, white text, lime accents. The logo is built for a dark environment and the site matches it. Light mode optional post-v1. |
| Easter eggs | BusinessDawg cursor (dog cursor on hover-y elements) + 3 others, picked by Tahrim from a proposed list |
| Scope for v1 | Full vision — every section, all motion, all 3D |
| Animation intensity | 9/10 — push it |

---

## 3. APPROVAL GATES (DO NOT SKIP)

Claude Code **must pause and ask** before doing any of the following:

1. ~~**Wiring the AI chatbot.**~~ **RESOLVED 2026-05-14.** Provider: **Google Gemini 2.5 Flash Lite** via the OpenAI-compatible endpoint. Free tier (1M TPM / 15 RPM / 1500 RPD) covers expected traffic. The earlier Groq attempt was reverted because Groq's 12k-TPM free cap broke under real use. Chatbot is live on the home page with an inline preview + full-bleed cinematic overlay; system prompt and guardrails in [src/app/api/chat/route.ts](src/app/api/chat/route.ts) — never quote prices, 1–3 sentence Gen Z voice, "I don't know" → Book a Call / WhatsApp punt.
2. **Picking the final 3 easter eggs.** Propose ~6, let Tahrim pick.
3. **Spending money on anything** (paid Sanity tier, paid fonts, premium 3D assets, etc.). Default is always free tier.
4. **Generating additional mascot poses.** The base mascot exists in the logo. New poses (running, sleeping, waving, thinking) should match the existing style — sample 2–3 directions for Tahrim to approve before producing a full set.

~~Picking the final color palette~~ — RESOLVED. Palette is derived from the logo and locked. See `PLAN.md` Section 1.3.

---

## 4. BRAND PERSONALITY & VOICE

**Feels like:** friendly, confident, creative, slightly rebellious, internet-native, future-focused, highly intelligent but never corporate.

**Voice rules:**
- Conversational, human, Gen Z–fluent.
- Playful, never childish. Wit, not jokes-for-jokes-sake.
- Confident assertions over hedging. ("We build systems." not "We aim to provide solutions.")
- Short sentences. Punchy. No filler.
- Avoid: synergy, leverage, solutions, cutting-edge, world-class, robust, scalable (as adjectives), "passionate about", "in today's world".
- Embrace: build, ship, system, machine, growth, real, fast, alive.

**Tagline anchor:** *"We build business machines."*

---

## 5. POSITIONING

> BusinessDawg is a modern **business growth system studio**.

Five productized systems (the "Systems Stack"):
1. **Business Growth Systems** — strategy, funnels, GTM
2. **AI Automation Systems** — workflows, agents, internal tooling
3. **Branding Systems** — identity, design language, content
4. **Web & Product Systems** — sites, MVPs, e-commerce
5. **Marketing Infrastructure** — analytics, content engines, paid

Each system is a productized offering, not a service line.

---

## 6. TARGET AUDIENCE

Primary: Gen Z entrepreneurs, startup founders, SaaS builders.
Secondary: modern local + global businesses, personal brands, digital-first companies.
Geography: global / internet-native. Not region-locked.

---

## 7. PRIMARY GOALS (in priority order)

1. Generate leads (book calls, inquiries, WhatsApp).
2. Build founder-led credibility for Tahrim.
3. Position BusinessDawg as a futuristic growth studio.
4. Recruit interns / collaborators.
5. Showcase systems in a productized way.

---

## 8. DESIGN DIRECTION

- **Dark mode dominant.** Black base, white text, lime accents. Matches the logo's native environment. Light mode is optional v2.
- Explosive, energetic, cinematic — but legible.
- UI mix: dark glassmorphism (frosted black on lime-glow) + subtle brutalist accents + floating UI + lime gradient transitions + 3D/particles.
- Lime is the accent, not the background. Use it for CTAs, key headlines, hover states, the mascot's signature, and one or two large kinetic moments per page. Don't carpet the site in it.
- Type leads. Imagery supports. Motion glues.

---

## 9. MOTION SYSTEM (NON-NEGOTIABLE)

The site must feel alive. Required:

- Smooth scrolling (Lenis).
- Scroll-triggered reveals (Framer Motion + IntersectionObserver).
- Cursor distortion / custom cursor (with mascot moments).
- Magnetic buttons on primary CTAs.
- Hover micro-interactions on every interactive element.
- Parallax depth layers in hero and section transitions.
- Page transition animations.
- Interactive 3D in hero (R3F).
- Animated typography (kinetic type on key headlines).
- Funny loading microcopy.
- Hidden easter eggs (see Approval Gate #3).

Performance budget: LCP < 2.5s on mid-tier mobile. Motion must not destroy Lighthouse scores below 80.

---

## 10. SITEMAP

Detailed in `PLAN.md`. High level:

- `/` — Home (hero, systems, recruitment teaser, chatbot, CTAs)
- `/systems/[slug]` — Per-system deep page (5 total). Slugs: `growth`, `ai-automation`, `branding`, `web-product`, `marketing-infrastructure`.
- `/about` — Founder + brand story
- `/join` — Talent/intern recruitment
- `/contact` — Booking + WhatsApp + email
- `/404` — Custom with mascot
- `/studio` — Sanity Studio (CMS admin)

**No public portfolio yet.** A `/built` or `/work` route will ship later, once Tahrim has client work to display. Until then, do not invent case studies, testimonials, or client logos. The chatbot is configured to punt portfolio questions to Book a Call / WhatsApp.

---

## 11. COPYWRITING TONE EXAMPLES

✅ "We build the machine. You run the business."
✅ "Branding that doesn't apologize."
✅ "Your funnel is leaking. We'll patch it."
✅ "Built in public. Shipped on purpose."
❌ "Welcome to BusinessDawg, your trusted partner in growth."
❌ "We leverage cutting-edge AI to deliver scalable solutions."

---

## 12. UX OUTCOMES

After visiting, users should feel: *"this feels like the future"*, *"I need this team"*, *"this brand actually gets it"*. Mix: curiosity + excitement + trust.

---

## 13. OPEN ITEMS (NEEDED FROM TAHRIM)

Tracked in `PLAN.md` Section 14. Includes: founder photo, founder bio, brand social handles (when they exist), final easter-egg picks. Portfolio assets queued for later — no client work to show yet.

---

## 14. WORKING RULES FOR ANY AGENT

- **Always ask for clarifications** when something is ambiguous. Project rule.
- Prefer free / open-source tools by default.
- Never commit secrets. Use `.env.local` and document required vars in `README.md`.
- Document every component with a one-line purpose comment.
- Ship in branches, not on `main` after the initial scaffold.
- Pause at the Approval Gates listed in Section 3.

---

*Last updated: 2026-05-15 — Prior founder-venture references and `/built` route plans removed from the site, code, and project docs. No public portfolio until Tahrim has client work to display. System slugs renamed to multi-word for long-tail SEO (`ai-automation`, `web-product`, `marketing-infrastructure`). SEO refresh: home canonical, full-name titles on system pages, JobPosting JSON-LD on /join, BreadcrumbList on /about, /join, /contact, FAQ JSON-LD deduplicated to /faq only, /booking added to robots disallow, descriptive image alts. Backend Phase 1+2 in progress: Neon Postgres + Prisma + Resend lead capture, custom /admin viewer, PostHog analytics, all pricing hidden behind "Book a Call", custom email yo@businessdawg.com, 404 mini-game easter egg.*
