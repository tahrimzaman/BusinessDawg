# BUSINESSDAWG — KICKOFF CHECKLIST

> The literal step-by-step to start the build. If you only read one file, read this one.

---

## STEP 1 — PRE-FLIGHT (~5 minutes)

Have these ready before you open Claude Code. If you don't have one, mark it "later" and Claude Code will pause and ask.

| Item | What you need | Have it? |
|---|---|---|
| Node 20+ | Run `node -v` in your terminal. If it says v18 or older, install Node 20 LTS from nodejs.org first. | ☐ |
| pnpm | Run `pnpm -v`. If "command not found", say yes when Claude Code asks to install it globally. | ☐ |
| Sanity account | Free, free, free. Sign up at sanity.io. Don't create a project yet — Claude Code will walk you through it. | ☐ |
| Vercel account | Free. Sign up at vercel.com. Connect it to your GitHub account during signup. | ☐ |
| GitHub | A blank repo named `businessdawg-web` (or whatever you prefer). Don't initialize it with README — leave it empty. | ☐ |
| Domain | Confirm the exact spelling. Have it accessible (registrar login) for when we point DNS at Vercel in Phase 7. | ☐ |
| Cal.com account | Free. Sign up at cal.com. Pick a username — that becomes your booking URL slug. | ☐ later OK |
| MailerLite account | Free up to 1000 subs. Sign up at mailerlite.com. | ☐ later OK |
| Founder photo | Drop a high-res photo (2-3 options) into `/assets/inbox/`. | ☐ later OK |
| ~~Portfolio assets~~ | Deferred — no portfolio routes ship until Tahrim has client work to display. | ☐ later |

Anything marked "later OK" can wait — Claude Code only needs them when it reaches the phase that uses them.

---

## STEP 2 — OPEN A TERMINAL AT THE PROJECT FOLDER

Open Terminal (Mac), and run:

```
cd "/Users/tahrimzaman/Documents/Claude/Projects/Business Dawg"
```

Confirm you're in the right place:

```
ls
```

You should see `CLAUDE.md`, `PLAN.md`, `HANDOFF.md`, `KICKOFF.md`, and the `assets` folder.

---

## STEP 3 — START CLAUDE CODE

In that same terminal, run:

```
claude
```

(Or open the Claude Code app and select this folder.)

Wait for Claude Code to load.

---

## STEP 4 — PASTE THE KICKOFF PROMPT

Open `HANDOFF.md` and copy the entire prompt block in Section 2 (between the triple backticks).

Paste it as your first message to Claude Code.

Hit enter. Walk away for ~30 seconds while it reads `CLAUDE.md` and `PLAN.md`.

---

## STEP 5 — WATCH FOR THE FIRST PAUSE

Claude Code will read both planning docs and then summarize. After the summary, it will start Phase 0 (scaffolding). It will pause when it needs:

**Sanity project ID** — at this point, in a separate browser tab:
1. Go to sanity.io/manage
2. Click "Create new project"
3. Name it `businessdawg-cms`, dataset `production`, visibility public
4. Copy the Project ID it gives you
5. Paste it into Claude Code and say "go"

**GitHub repo** — when it asks where to push:
1. Create the empty repo on github.com (no README, no .gitignore)
2. Copy the SSH URL (looks like `git@github.com:yourname/businessdawg-web.git`)
3. Paste it into Claude Code and say "push to this"

---

## STEP 6 — PHASE 0 SHOULD COMPLETE IN ~30 MINUTES

When Claude Code finishes Phase 0, it will report:
- What it installed (versions)
- Smoke test results (`pnpm dev`, `pnpm build`, `pnpm lint`)
- That it has not started Phase 1 yet

**At this point, the site doesn't look like anything yet.** That's correct. You should be able to run `pnpm dev` locally and see a blank Next.js page. Phase 0 is plumbing.

---

## STEP 7 — UNLOCK PHASE 1 (BRAND TOKENS)

Claude Code will ask: "Which color palette — A, B, or C?"

Open `PLAN.md` Section 1.3, look at the three palettes (Electric / Warm Sunset / Optimistic), pick one. Reply with:

```
I pick palette [A / B / C]. Proceed to Phase 1.
```

If you want a remix, say:

```
Remix palette [A]: change [accent color] to [hex / description]. Otherwise as proposed. Proceed to Phase 1.
```

---

## STEP 8 — FOLLOW-UP PROMPTS (USE WHEN NEEDED)

Reusable replies for the other approval gates. Paste-ready.

**When Claude Code asks for chatbot provider (Phase 6):**

```
Use [Hugging Face Inference API / Groq free tier / Ollama for local dev].
Personality: confident, slightly smug BusinessDawg mascot.
Keep responses short. Refuse anything off-brand or unsafe.
```

**When Claude Code asks for the final 3 easter eggs (Phase 5):**

```
Easter eggs: #1 dog cursor (mandatory) + [pick 3 from #2–#7 in PLAN.md Section 10].
```

**When you drop new assets into /assets/inbox/:**

```
I just added [filename] to /assets/inbox/. Use it in [section].
```

---

## STEP 9 — IF SOMETHING GOES SIDEWAYS

| Problem | What to do |
|---|---|
| Claude Code skips an approval gate | Stop it. Say "you skipped Approval Gate #X in CLAUDE.md Section 3. Revert and ask first." |
| Claude Code tries to install a paid tool | Stop. Say "free tier only. Find a free alternative or ask me." |
| Claude Code picks the color palette unilaterally | Revert. Say "I never approved a palette. Show me the three options again and wait." |
| `pnpm dev` won't start | Read the terminal error. Paste it into Claude Code. It can debug. |
| Sanity Studio at /studio shows an auth error | Make sure your Sanity account email matches the one you used to create the project. |
| You want to change a locked decision | Edit `CLAUDE.md` first. Then tell Claude Code "re-read CLAUDE.md — locked decisions changed." |

---

## STEP 10 — DAILY RHYTHM (PHASES 1–7)

Most days, you'll do this:

1. Open the terminal at the project folder, run `claude`.
2. Say "continue from where we left off."
3. Claude Code summarizes where it is, you confirm or course-correct.
4. It builds. You answer questions when it pauses.
5. At the end, say "summarize progress, then commit and push."

Most phases take 1–3 sessions. The build phases (3, 4) take the longest because they're where the actual pages get built.

---

## STEP 11 — LAUNCH

Phase 7 is the last phase. Claude Code will:
- Help you point DNS from your registrar to Vercel
- Generate OG images
- Set up sitemap.xml + robots.txt
- Run a final smoke test
- Tell you it's ready

You then post on socials. Done.

---

*Kickoff prepared: 2026-05-13. If anything in this checklist drifts from reality, update it and tell me so I can fix it for future sessions.*
