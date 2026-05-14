# BusinessDawg — Backend Setup Guide

Status: **Phase 1+2 backend is fully provisioned and verified locally** (see "Status snapshot" below). This guide documents how each piece was set up so anyone (including future-Tahrim) can re-provision or rotate credentials.

The stack is intentionally lean — only services that are already part of the toolchain or actually free:

| Layer | Service | Cost |
|---|---|---|
| Database | **Neon Postgres** (ap-southeast-1, Singapore) | Free tier, scales to zero |
| Transactional email | **Hostinger SMTP** via `yo@businessdawg.com` mailbox | Included in current hosting plan, 100 emails/day |
| Analytics | **PostHog Cloud** (US region) | Free 1M events/mo |
| CMS (scaffolded, unused) | Sanity | Free 3 users / 10k docs — Phase 3 attempted then reverted 2026-05-14 |
| Chatbot (scaffolded, unused) | Groq Llama 3.1 | Free tier — Phase 4 attempted then reverted 2026-05-14 |

No Resend, no MailerLite, no Supabase. One database, one mailbox, one analytics project.

---

## Status snapshot (2026-05-14)

- ✅ Neon Postgres provisioned (project: `neondb`, region: `ap-southeast-1`)
- ✅ Migration `20260514034108_init` applied (Subscriber + Application tables)
- ✅ Hostinger mailbox `yo@businessdawg.com` created and SMTP verified
- ✅ `notifyAdminOfApplication` delivers a real email to that mailbox
- ✅ PostHog project key wired into `NEXT_PUBLIC_POSTHOG_KEY`
- ✅ `ADMIN_PASSWORD` + `ADMIN_SESSION_SECRET` generated
- ✅ `.env.local` populated; `.env` has `DATABASE_URL` for Prisma CLI
- 🟡 Hostinger production environment vars: **not yet mirrored** — see section 7
- 🟡 Sanity project: scaffolded; Phase 3 wiring attempted on 2026-05-14, reverted due to bugs — needs root-cause + retry
- 🟡 Chatbot: static UI; Phase 4 (Groq streaming) attempted on 2026-05-14, reverted due to bugs — needs root-cause + retry
- ✅ Backend hardened on 2026-05-14: admin session secret fails-closed in production, CSV export capped at 10k rows, SMTP misconfig logs `[CRITICAL]` in production, `/api/join` no longer leaks Zod schema, rate-limit buckets self-prune

---

## 1. Neon Postgres (lead database)

The lead database. Subscribers + applications land here.

1. Account created at <https://console.neon.tech>.
2. Project `neondb`, region `ap-southeast-1` (Singapore — lowest latency to BD/MY/SG visitors and reasonable for global).
3. Pooled connection string (use this, not the direct one — better for serverless):
   ```
   DATABASE_URL="postgresql://neondb_owner:****@ep-jolly-cherry-aok04uq3-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
   ```
4. Pasted into `.env.local` AND `.env` (the latter is read by the Prisma CLI; both must match).
5. Migration applied with `npx prisma migrate dev --name init`.

To verify any time:
```bash
npx prisma migrate status   # → "Database schema is up to date!"
```

To inspect rows quickly:
```bash
node -e 'require("@prisma/client"); const p=new (require("@prisma/client").PrismaClient)(); p.subscriber.findMany({take:5}).then(r=>console.log(r)).finally(()=>p.$disconnect())'
```

Or, in production, log in at `/admin` and use the dashboard.

---

## 2. Hostinger SMTP (transactional email)

The `yo@businessdawg.com` mailbox doubles as the transactional sender. No external email provider needed.

1. Mailbox created via hPanel → Emails → Manage Email Accounts → `yo@businessdawg.com`.
2. SMTP credentials live in `.env.local`:
   ```
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=465              # SSL — Hostinger also supports 587 STARTTLS
   SMTP_USER=yo@businessdawg.com
   SMTP_PASS=****             # the mailbox's own password, not your hPanel account
   SMTP_FROM="BusinessDawg <yo@businessdawg.com>"
   ADMIN_INBOX=yo@businessdawg.com
   NOTIFY_ON_SUBSCRIBE=       # set to "true" to also be pinged on every newsletter signup
   ```
3. Verified locally with `nodemailer.verify()` and a real test send to the mailbox (subject: "BusinessDawg backend wired — Phase 1+2 verification").

If you rotate the mailbox password, update both `.env.local` and the Hostinger Node.js env (section 7) and restart.

Quotas: Hostinger Business plans typically cap at 100 outbound emails / day per mailbox. Plenty for lead notifications. If you ever exceed it, switch to a transactional provider (Resend/Postmark) — the `transport()` factory in [src/lib/email/send.ts](src/lib/email/send.ts) is the only file to swap.

---

## 3. PostHog (analytics)

Lead-gen attribution. Funnels, replays, events.

1. Project created at <https://us.posthog.com>.
2. Project API key (`phc_…`) pasted into `.env.local` as `NEXT_PUBLIC_POSTHOG_KEY`.
3. `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com` (US region).
4. [PostHogProvider](src/components/analytics/PostHogProvider.tsx) is mounted in [app/layout.tsx](src/app/layout.tsx) and auto-tracks pageviews on route changes.

Next: add custom events for `cta_click` (Book a Call), `newsletter_submit`, `join_submit`. Done as part of Phase 3+ polish.

---

## 4. Admin (/admin lead dashboard)

Password-gated viewer for the lead DB.

1. Pick a long random password (e.g. `openssl rand -base64 24`). Already generated and in `.env.local` as `ADMIN_PASSWORD`.
2. Pick a separate long random session secret. Already generated as `ADMIN_SESSION_SECRET`.
3. Visit `/admin` → redirected to `/admin/login` → enter password → 7-day session cookie.
4. Dashboard shows: search, Applications + Subscribers tables, CSV export per tab, logout.

Auth implementation: [src/lib/admin/auth.ts](src/lib/admin/auth.ts) (HMAC-SHA256 of password + secret, timing-safe compare, cookie path `/` so /api/admin/* shares the same session).

---

## 5. Custom email mailbox (yo@businessdawg.com)

Already set up in section 2 — the same mailbox is used for SMTP sending. To read replies:

- Hostinger Webmail: <https://hpanel.hostinger.com/> → Emails → Webmail
- Or set up IMAP on your phone / desktop
- Or forward to `tahrimzaman4@gmail.com` (Webmail → Forwarders) so everything lands in one inbox

---

## 6. Sanity CMS (scaffolded; Phase 3 reverted 2026-05-14)

Schemas + Studio mount already exist in the repo (`sanity/schemas/`, `/studio` route). The Sanity client and GROQ queries live in [src/lib/sanity/](src/lib/sanity/). Phase 3 wired the Systems and Shadai showcase pages to Sanity with a hardcoded fallback (`b23645b`) but was reverted (`4ce0e25`) the same day due to bugs — content currently comes from [src/lib/copy.ts](src/lib/copy.ts) (hardcoded). Before re-attempting, diff the revert and root-cause why the fallback path didn't hold up.

When we re-wire Phase 3, the only env vars needed are:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=
```

Project to be created at <https://www.sanity.io/manage> with `tahrimzaman4@gmail.com`. Free plan covers everything we need.

---

## 7. Pushing to Hostinger (production env vars)

When you're ready to ship Phase 1+2 to production:

1. hPanel → Hosting → `businessdawg.com` → Node.js → Settings → Environment Variables.
2. Mirror **every variable** from `.env.local`:
   ```
   DATABASE_URL=<neon pooled url>
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=465
   SMTP_USER=yo@businessdawg.com
   SMTP_PASS=<mailbox password>
   SMTP_FROM=BusinessDawg <yo@businessdawg.com>
   ADMIN_INBOX=yo@businessdawg.com
   ADMIN_PASSWORD=<your password>
   ADMIN_SESSION_SECRET=<your secret>
   NEXT_PUBLIC_POSTHOG_KEY=<phc_key>
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   NEXT_PUBLIC_CAL_USERNAME=tahrim
   NEXT_PUBLIC_WHATSAPP_NUMBER=8801733955555
   ```
3. Hit "Restart App" — required for new env to take effect.
4. (Migration already applied from local; no action needed on Hostinger for the DB.)

### Verification on prod

```bash
# Should return ok:true and create a real Neon row
curl -X POST https://businessdawg.com/api/newsletter \
  -H 'content-type: application/json' \
  -d '{"email":"prod-smoke@example.com"}'

# Should email yo@businessdawg.com + create a Neon row
curl -X POST https://businessdawg.com/api/join \
  -H 'content-type: application/json' \
  -d '{"name":"Prod Smoke","email":"prod@example.com","note":"hello"}'
```

Then `/admin` on prod, log in, confirm both rows appear in the dashboard, export both CSVs, and the test email shows up in `yo@businessdawg.com`.

---

## Rotating credentials

| If you rotate… | Change in |
|---|---|
| Neon DB password | `.env.local`, `.env`, Hostinger Node env, restart |
| Hostinger mailbox password | `.env.local`, Hostinger Node env, restart |
| PostHog project (new key) | `.env.local`, Hostinger Node env, restart |
| Admin password | `.env.local`, Hostinger Node env, restart (existing sessions invalidated) |
| Admin session secret | Same as above (existing sessions invalidated) |
