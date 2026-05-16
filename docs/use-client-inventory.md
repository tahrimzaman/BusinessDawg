# `'use client'` Inventory & Perf Notes

**Date:** 2026-05-16 (audit follow-up, MED-priority commit 5)
**Baseline:** 43 `'use client'` files in `src/`. Goal of this pass: classify every one, ship the obvious server-flips, and leave a clear next-action list.

## Methodology

Each file was scored on five client-only signals: `useState`/`useReducer`, `useEffect`/`useLayoutEffect`/`useSyncExternalStore`, `framer-motion` imports, DOM event handlers (`onClick`, `onChange`, etc.), and direct browser-API access (`window`, `document`, `localStorage`, `navigator`). Files with zero hits across all five are candidates for server-rendering.

Classification key:

- **NEEDED** — has client state, effects, framer-motion, or browser APIs. Cannot become a server component without rewriting behaviour.
- **SPLITTABLE** — the file itself has no client APIs; the `'use client'` directive is only there because of an old habit or because the file imports client components. Flipping to server saves the React payload for the static shell while client islands inside continue to hydrate normally.
- **REVISITABLE** — only minor client work (e.g. a single event handler). Worth a closer look in a future pass: could the interactive bit be extracted into a tiny child island so the parent stays server-rendered?

## Two safe flips landed in this commit

| File | Why it's safe |
|---|---|
| `src/app/about/page.tsx` | Page-level shell. All interactivity is in imported client components (Reveal, KineticText, MagneticButton, PullQuoteMarquee, TalkersVsShippers). Verified the SSR HTML still contains the founder bio, motto, and pull-quote eyebrow after the flip. |
| `src/components/sections/PullQuoteMarquee.tsx` | The marquee animation is pure CSS keyframes (`bd-marquee` in `globals.css`); pause-on-hover is `group-hover`. No React state, effects, or handlers. |

These two reduce the count from **43 → 41**.

## Full inventory

| # | File | Classification | Signals | Notes |
|---|---|---|---|---|
| 1 | `src/app/about/page.tsx` | ✅ **SERVER (flipped)** | none | Done in this commit. |
| 2 | `src/app/admin/AdminAvailabilityPanel.tsx` | NEEDED | state=6, handlers=21 | Form + state. |
| 3 | `src/app/admin/AdminBookingsTable.tsx` | NEEDED | state=5, handlers=6 | Table interactions. |
| 4 | `src/app/admin/AdminClient.tsx` | NEEDED | state=4, handlers=8 | Admin shell. |
| 5 | `src/app/admin/AdminCustomersTable.tsx` | NEEDED | state=3, handlers=7 | Table interactions. |
| 6 | `src/app/admin/AdminGoogleConnection.tsx` | NEEDED | state=3, effect=2, browser=2 | OAuth status. |
| 7 | `src/app/admin/bookings/[id]/BookingDetailClient.tsx` | NEEDED | state=5, handlers=9 | Detail editor. |
| 8 | `src/app/admin/customers/[id]/CustomerDetailClient.tsx` | NEEDED | state=14, handlers=12 | Heavy editor. |
| 9 | `src/app/admin/error.tsx` | NEEDED | effect=2 | Next error boundary requires client. |
| 10 | `src/app/admin/login/page.tsx` | NEEDED | state=4, handlers=2 | Form. |
| 11 | `src/app/join/page.tsx` | REVISITABLE | state=2, handlers=1 | The form itself is interactive; the surrounding page chrome (eyebrows, hero copy, role descriptions) could be split into a server shell + a `<JoinForm>` client island. **Next pass.** |
| 12 | `src/app/not-found.tsx` | NEEDED | framer-motion | 404 mini-game easter-egg lives here. |
| 13 | `src/components/analytics/PostHogProvider.tsx` | NEEDED | state=2, effect=3, browser=6 | Provider with deferred init. |
| 14 | `src/components/booking/BookingFlow.tsx` | NEEDED | state=9, effect=3, browser=6 | Orchestrator. |
| 15 | `src/components/booking/BookingForm.tsx` | NEEDED | state=2, handlers=7 | Form. |
| 16 | `src/components/booking/BookingSuccess.tsx` | REVISITABLE | handlers=1 | A single click handler. Already inside BookingFlow's client tree so no real perf delta from flipping — keep as-is. |
| 17 | `src/components/booking/Calendar.tsx` | NEEDED | state=2, handlers=5 | Date picker. |
| 18 | `src/components/booking/ClockPreview.tsx` | NEEDED | framer-motion | Animated clock face. |
| 19 | `src/components/booking/DatePreview.tsx` | REVISITABLE | none | Purely presentational. Already inside BookingFlow's client tree — flipping to server is meaningless without lifting it out of that tree first. |
| 20 | `src/components/booking/ManageBooking.tsx` | NEEDED | state=9, handlers=7 | Reschedule/cancel flow. |
| 21 | `src/components/booking/SlotList.tsx` | REVISITABLE | handlers=3 | Same story as DatePreview — inside the client tree. |
| 22 | `src/components/brand/MascotReward.tsx` | NEEDED | framer-motion | Reward animation. |
| 23 | `src/components/dev/TweakPanel.tsx` | NEEDED | state=2, effect=2, browser=1 | Dev-only (skipped in prod). |
| 24 | `src/components/games/DawgGame.tsx` | NEEDED | state=7, effect=5, browser=7 | The 404 game. |
| 25 | `src/components/motion/DawgRail.tsx` | NEEDED | state=3, effect=2, framer-motion | Scroll progress rail. |
| 26 | `src/components/motion/KineticText.tsx` | NEEDED | framer-motion | Per-character stagger. |
| 27 | `src/components/motion/LenisProvider.tsx` | NEEDED | effect=2, browser=5 | Smooth-scroll provider. |
| 28 | `src/components/motion/MagneticButton.tsx` | NEEDED | effect=2, framer-motion | Magnetic pull. |
| 29 | `src/components/motion/Reveal.tsx` | NEEDED | framer-motion | Scroll-triggered reveal. |
| 30 | `src/components/motion/WoofListener.tsx` | NEEDED | state=2, effect=2, browser=6 | Easter-egg key listener. |
| 31 | `src/components/motion/useFocusTrap.ts` | NEEDED | effect=2, browser=3 | Hook. |
| 32 | `src/components/sections/Chatbot.tsx` | NEEDED | state=5, effect=5, framer-motion | Streaming chat UI. |
| 33 | `src/components/sections/ClosingCTA.tsx` | NEEDED | framer-motion | Animated CTA. |
| 34 | `src/components/sections/Faq.tsx` | NEEDED | state=2, framer-motion | Accordion. |
| 35 | `src/components/sections/Footer.tsx` | REVISITABLE | state=3, handlers=1 | Footer has a Konami-style state (awake/stretched) for an easter-egg paw print. Could be split into `<FooterShell>` (server: links, logo, copy) + `<FooterDawg>` (client: the awake state). **Worth a small win next pass.** |
| 36 | `src/components/sections/Hero.tsx` | NEEDED | effect=2, framer-motion, browser=6 | Hero parallax + mascot. |
| 37 | `src/components/sections/MemeReel.tsx` | NEEDED | state=2, effect=2, framer-motion | Scroll-driven reel. |
| 38 | `src/components/sections/Navbar.tsx` | NEEDED | state=3, effect=2, handlers=4, browser=3 | Menu state + scroll listener. |
| 39 | `src/components/sections/Newsletter.tsx` | NEEDED | state=3, handlers=2, framer-motion | Form. |
| 40 | `src/components/sections/PullQuoteMarquee.tsx` | ✅ **SERVER (flipped)** | none | Done in this commit. |
| 41 | `src/components/sections/SystemsStack.tsx` | NEEDED | state=2, framer-motion | Hover-active card state. |
| 42 | `src/components/sections/TalkersVsShippers.tsx` | NEEDED | state=2, effect=2, framer-motion | Scroll-scrub reel. |
| 43 | `src/components/security/Honeypot.tsx` | NEEDED | effect=2 | Sets timestamp on mount for the bot check. |

## Tally

- ✅ **SERVER (flipped this commit):** 2
- ⚠️ **REVISITABLE (next pass candidates):** 5 — `/join/page`, `Footer`, `BookingSuccess`, `DatePreview`, `SlotList`
- 🔒 **NEEDED:** 36

## Perf signal

A proper Lighthouse run needs headless Chrome and a production build. We don't have that pipeline yet (open LOW item in the audit). What's reasonable to measure from `npm run dev`:

| Metric | Before flips | After flips | Notes |
|---|---|---|---|
| `GET /about` HTML | n/a | 200 | Confirmed founder name, motto, and pull-quote eyebrow are present in SSR HTML (not just hydrated client-side). |
| `GET /` HTML bytes | — | 118 KB | Dev-mode HTML (production will be smaller after minify + tree-shake). |
| `GET /` fetch ms | — | 111 ms | Local loopback, dev server. Not a representative client number. |

These are dev-server numbers and don't substitute for a Lighthouse run. The proper move next is to add a `npm run lh` Lighthouse-CI script and store a baseline JSON in `docs/perf-baseline-*.json` (this is in the LOW-priority audit list).

## Action plan for the next pass

1. **`/join/page`** — extract the form into `<JoinForm />` client island, keep the page server-rendered. ~30 min, real win.
2. **`Footer`** — split into `<FooterShell>` (server) + `<FooterDawg>` (client). ~20 min, small win on every page.
3. **Add a Lighthouse-CI workflow** — get real numbers before chasing more flips. ~45 min.
4. Inside the booking tree (`DatePreview`, `SlotList`, `BookingSuccess`) — only worth flipping if BookingFlow itself is restructured. Not a quick win.

The remaining 36 `NEEDED` files genuinely require client behaviour. The motion-heavy ones (Reveal, KineticText, MagneticButton, Hero, etc.) are the design language of the site — splitting them would mean breaking the cinematic feel CLAUDE.md §9 calls for. Leave alone.
