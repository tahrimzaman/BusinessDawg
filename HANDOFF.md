# BUSINESSDAWG — CLAUDE CODE HANDOFF

> Paste the prompt in Section 2 into a fresh Claude Code session at the project root. Sections 0 and 1 are context for you (Tahrim) — Section 2 is what the agent reads.

---

## 0. HOW TO USE THIS HANDOFF

1. Open a terminal at `/Users/tahrimzaman/Documents/Claude/Projects/Business Dawg`.
2. Run `claude` (or open Claude Code).
3. Paste the prompt below as your first message.
4. **Don't skip the asset prep step** — gather as many items from `PLAN.md` Section 14 as you can before starting, especially the founder photo. The agent will block on these.
5. Watch for the four approval gates. Claude Code is instructed to pause at each.

---

## 1. APPROVAL GATES (RECAP)

Claude Code will stop and ask you before:

1. **Wiring the AI chatbot to a real provider.** You pick which free provider.
2. **Picking the color palette.** You pick A, B, C, or a remix.
3. **Picking the final 3 easter eggs.** You pick from the proposed list.
4. **Spending money on anything.** Default is free tier always.

---

## 2. THE PROMPT (PASTE THIS INTO CLAUDE CODE)

```
You're picking up the BusinessDawg website project. Everything you need is in this repo.

START HERE:
1. Read CLAUDE.md (project rules, locked decisions, approval gates).
2. Read PLAN.md (full build plan — sitemap, section specs, motion system, tech architecture, CMS schema, build phases).
3. Confirm you've read both and summarize: (a) the stack, (b) the four approval gates, (c) what Phase 0 will produce.

WORKING RULES:
- Project instruction: always ask for clarifications when something is ambiguous.
- Default to free / open-source tools.
- Never commit secrets. Use .env.local and document required vars in README.md.
- Ship in branches. Don't push directly to main after the initial scaffold.
- Pause at every approval gate listed in CLAUDE.md Section 3 and PLAN.md Section 12.

ENVIRONMENT BASELINE:
- Node 20 LTS or newer. If `node -v` is older, stop and ask me to upgrade.
- Package manager: pnpm (faster installs, modern Next.js default). If pnpm isn't installed, ask me before installing it globally.
- TypeScript strict mode on.

PRESERVE EXISTING FILES:
This directory already contains CLAUDE.md, PLAN.md, HANDOFF.md, KICKOFF.md, and an /assets/ folder. DO NOT overwrite or delete any of these when scaffolding. If `create-next-app` complains the folder isn't empty, scaffold into a temp folder and move files in, or use the in-place flag — whatever preserves the planning docs.

PHASE 0 — DO THIS NOW:
- Initialize a Next.js 14+ App Router project (TypeScript, Tailwind CSS, ESLint, App Router, `src/` directory: yes, import alias `@/*`) in this directory using pnpm. Use latest stable versions. Don't pick a beta unless it's the documented stable channel.
- Add Prettier with Tailwind plugin. Add a `.prettierrc` and `.prettierignore`.
- Install runtime deps: framer-motion, @react-three/fiber, @react-three/drei, three, lenis (or @studio-freight/lenis), @sanity/client, next-sanity, sanity, @sanity/vision, @sanity/image-url.
- Install dev deps: husky, lint-staged, prettier-plugin-tailwindcss, @types/three.
- Set up Husky + lint-staged so pre-commit runs Prettier + ESLint on staged files.
- Initialize a Sanity project. Ask me first — I'll create the project on sanity.io (name: businessdawg-cms, dataset: production) and give you the project ID. You then scaffold the Sanity Studio mounted at /studio and add env vars to .env.local.
- Create the folder structure exactly as documented in PLAN.md Section 6.
- Add README.md with: project description, prerequisites (Node 20+, pnpm), setup steps, env var list (no values), available scripts, deploy notes for Vercel.
- Add .env.local.example with all required keys (empty values, with one-line comments per key).
- Add a sane .gitignore (Next.js default + .env.local + .next + node_modules + .DS_Store + /sanity/dist).
- Initialize git if not already, stage everything, make the first commit: "chore: scaffold Next.js + Tailwind + motion + Sanity". Then ask me where to push (I'll create a GitHub repo or give you SSH access).

SMOKE TEST (still part of Phase 0):
- Run `pnpm dev`. Confirm localhost:3000 returns a 200 with the Next.js default page (or a minimal placeholder you've already created).
- Run `pnpm build`. Confirm it builds clean with zero errors and no critical warnings.
- Run `pnpm lint`. Confirm zero errors.
- If any of these fail, fix them before reporting Phase 0 complete.

THEN STOP and report:
- Node version + pnpm version detected.
- What you installed and at what versions (paste `pnpm list --depth 0` output).
- What couldn't be done without input from me (likely: Sanity project ID, GitHub repo creation, Vercel link).
- Output of the smoke test (dev / build / lint).
- Confirm you have NOT started Phase 1 yet — the color-palette gate must clear first.

DO NOT:
- Pick a color palette. I'll choose from the three options in PLAN.md Section 1.3.
- Start the chatbot backend.
- Add any paid dependency.
- Create logos or mascots until Phase 1 starts and brand tokens are settled.

ASSET DROP-OFF:
I will be adding files into /assets/inbox/ as I gather them (founder photo, brand assets, etc.). Check that folder at the start of each phase.

When you're done with Phase 0, give me the Phase 0 report and ask me which palette I want before Phase 1 begins.
```

---

## 3. WHAT TO EXPECT FROM CLAUDE CODE

After Phase 0 (~30–60 min of agent time): a working scaffold you can `pnpm dev` and see a default Next.js page, a Sanity studio scaffold at `/studio`, env var documentation, and a clean first commit.

After Phase 1 (~1–2 days of agent + design back-and-forth): brand tokens locked, a `_kit` page showing every UI primitive in the chosen palette and typography, logo SVG and mascot SVG ready.

After Phase 2 (~1–2 days): the site moves. Buttons attract your cursor. Scrolling is buttery. The cursor sprouts a tiny dog on hover.

Phases 3–7: progressively the actual site appears.

---

## 4. FOLLOW-UP PROMPTS YOU'LL LIKELY NEED

When Claude Code asks for the palette:
```
I pick palette [A / B / C]. [Optional: change X to Y.] Proceed to Phase 1.
```

When Claude Code asks for the chatbot provider:
```
Use [Hugging Face Inference API / Groq free tier / Ollama for local dev]. The personality is: confident, slightly smug BusinessDawg mascot. Keep responses short. Refuse anything off-brand or unsafe.
```

When Claude Code asks for the easter eggs:
```
Easter eggs: #1 dog cursor (mandatory), plus [pick 3 from #2–#7 in PLAN.md Section 10].
```

When you drop assets:
```
I just added [photo.jpg / bio.md / etc.] to /assets/inbox/. Use them in [section].
```

---

## 5. IF THINGS GO SIDEWAYS

- **Agent skips a gate:** stop it. Point at `CLAUDE.md` Section 3.
- **Agent spends on something paid:** revert and tell it to use the free alternative.
- **Agent picks a palette on its own:** revert and ask for the three-option proposal again.
- **You change your mind mid-build:** update `CLAUDE.md` first, then tell the agent "re-read CLAUDE.md, the locked decisions changed."

---

*Handoff prepared: 2026-05-13.*
