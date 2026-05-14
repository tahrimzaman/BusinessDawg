# BusinessDawg — Backend Setup Guide

Everything needed to take the Phase 1+2 backend live on Hostinger. Each section is a one-time setup that produces an env var you'll add to both `.env.local` (for local dev) and Hostinger hPanel (for prod).

> **Order:** these can be done in parallel. Section 1 (Neon) is the highest priority because the production join/newsletter endpoints will 500 without it.

---

## 1. Neon Postgres (lead database)

Why: stores every join application + newsletter signup. Production source of truth.

1. Go to <https://console.neon.tech/sign-up> and sign up with `tahrimzaman4@gmail.com`. Free tier is fine.
2. **Create project:**
   - Name: `businessdawg`
   - Region: closest to Hostinger (likely `aws-eu-central-1` or `ap-southeast-1`)
   - Postgres version: 16 (latest)
3. **Copy connection string** from the dashboard. Looks like: `postgresql://USER:PASSWORD@ep-xxx.aws.neon.tech/businessdawg?sslmode=require`
4. **Switch Prisma to Postgres:**
   - Open `prisma/schema.prisma`
   - Change `provider = "sqlite"` → `provider = "postgresql"`
   - Save
5. **Update env vars** (locally first):
   ```
   DATABASE_URL="postgresql://...neon.tech/businessdawg?sslmode=require"
   ```
6. **Generate the prod migration** locally:
   ```bash
   npx prisma migrate dev --name init
   ```
   This applies the schema to Neon. Re-running `npx prisma migrate deploy` from Hostinger will apply migrations there too.

---

## 2. Resend (transactional email)

Why: emails you when someone applies or (optionally) subscribes. Single API key, generous free tier (3k/mo).

1. Sign up at <https://resend.com> with `tahrimzaman4@gmail.com`. Free tier is fine.
2. **Add domain:** Domains → Add Domain → `businessdawg.com`.
3. **DNS records** — Resend gives you 3 records (MX, SPF, DKIM). Add them in Hostinger:
   - hPanel → Domains → `businessdawg.com` → DNS / Nameservers
   - Add each record exactly as Resend specifies. TTL 14400 is fine.
   - Wait 5–60 min, then hit "Verify" in Resend.
4. **Create API key:** API Keys → Create. Scope: "Sending access" → "Full access". Copy the `re_…` key.
5. **Env vars:**
   ```
   RESEND_API_KEY=re_xxxxxxxx
   RESEND_FROM="BusinessDawg <yo@businessdawg.com>"
   ADMIN_INBOX=yo@businessdawg.com   # where the notifications go
   NOTIFY_ON_SUBSCRIBE=               # leave blank to skip newsletter pings
   ```

> Until DNS verifies, you can use Resend's onboarding sandbox (`onboarding@resend.dev` as from-address) for local testing.

---

## 3. Custom email (yo@businessdawg.com)

Why: more brandable than `tahrimzaman4@gmail.com`. Hostinger Business plan includes free business email.

1. hPanel → Emails → Manage Email Accounts.
2. Create new mailbox: `yo@businessdawg.com`. Pick a password. 5 GB included.
3. Set up Gmail forwarding or download Hostinger Webmail / set up on phone IMAP. Up to you.
4. (Optional) Forward `yo@businessdawg.com` → `tahrimzaman4@gmail.com` so everything still lands in your main inbox.

> Resend will still send "from" yo@businessdawg.com regardless. The mailbox just needs to exist so people can reply.

---

## 4. PostHog (product analytics)

Why: track lead-gen funnel. Goal #1 per CLAUDE.md.

1. Sign up at <https://us.posthog.com/signup>. Free tier: 1M events/mo, replay included.
2. New project named `businessdawg`. Region: US (lower latency for global users; switch to EU if you prefer EU data residency).
3. Copy the **Project API key** (`phc_…`) from Project Settings.
4. **Env vars:**
   ```
   NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxx
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   ```
5. (Later) Set up dashboards: "Sessions", "Funnel: visit → book a call", "Event: cta_click on Book a Call".

---

## 5. Sanity CMS (deferred to Phase 3 — set up now if you want)

Why: edit Systems and case-study copy without code changes.

1. Sign up / log in at <https://www.sanity.io/manage>.
2. Create project `businessdawg`. Dataset: `production`. Free plan.
3. Copy Project ID. Generate a read token (Settings → API → Tokens).
4. **Env vars:**
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=<id>
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=<token>
   ```
5. Once env is set, deploy and visit `/studio` to log in and create content.

> Schemas already exist in `sanity/schemas/`. Once content is added, Phase 3 wires the GROQ queries into pages.

---

## 6. Admin password

Why: protects `/admin` lead viewer.

1. Pick a long random password (1Password / `openssl rand -hex 16`).
2. Pick a different long random string for the session secret.
3. **Env vars:**
   ```
   ADMIN_PASSWORD=<password>
   ADMIN_SESSION_SECRET=<random 32+ char string>
   ```

---

## Adding all env vars to Hostinger

1. hPanel → Hosting → `businessdawg.com` → Node.js → Settings → Environment Variables.
2. Add every variable from `.env.local` (skip `DATABASE_URL` if it's the SQLite path — use the Neon URL instead).
3. After saving, hit "Restart App" so the new env is picked up.
4. Run migrations on prod once Neon URL is in place:
   ```bash
   npx prisma migrate deploy
   ```
   (Either from your local terminal pointing at the prod URL, or via Hostinger's Node terminal.)

---

## First-time verification on prod

After Hostinger redeploy with all env vars set:

```bash
# Should return ok: true (real persistence, not dev fallback)
curl -X POST https://businessdawg.com/api/newsletter \
  -H 'content-type: application/json' \
  -d '{"email":"diagnostic@example.com"}'

# Should send you an email AND create a row in Neon
curl -X POST https://businessdawg.com/api/join \
  -H 'content-type: application/json' \
  -d '{"name":"Test User","email":"test@example.com","note":"hello"}'
```

Then log in at <https://businessdawg.com/admin> with your `ADMIN_PASSWORD` and confirm both rows show up.

---

## What I cannot do for you (and why)

I work entirely from this repo. The following require your account credentials and have to be done by you in a browser:

- **Neon signup + DB creation** (needs email verification on your address)
- **Resend signup + domain verification** (needs DNS access on Hostinger)
- **PostHog signup + project creation** (needs email verification)
- **Sanity signup + project creation** (needs email verification)
- **Hostinger hPanel env vars** (your account)

Once you've done these, just share the env vars (paste them in chat) and I'll wire them into local + verify everything works end-to-end before any deploy.
