# Deploying the NIFTY Smart Money Tracker

This is ONE app: `src/` is the UI (Vite + React), `api/` is the backend (Vercel
serverless functions). They deploy together to **Vercel**. You can deploy two ways:

- **CLI (what you do now):** `npx vercel --prod` from this folder.
- **GitHub (recommended):** push to GitHub, connect it to Vercel, and every
  `git push` auto-deploys. No more zip-extract + `npm install` + manual deploy.

---

## A. One-time GitHub setup

### 1. Create an empty repo on GitHub
- Go to github.com -> New repository.
- Name it e.g. `option-chain-tracker`. Set it to **Private**.
- Do NOT add a README, .gitignore, or licence (keep it empty so the first push is clean).
- Copy the repo URL, e.g. `https://github.com/<you>/option-chain-tracker.git`

### 2. Push this folder up
Open a terminal **in this folder** and run:

```bash
git init
git add .
git commit -m "NIFTY Smart Money Tracker v75 + signal logger"
git branch -M main
git remote add origin https://github.com/<you>/option-chain-tracker.git
git push -u origin main
```

(Prefer a GUI? Install **GitHub Desktop**, "Add Local Repository" -> this folder,
commit, then "Publish repository" as Private. Same result, no commands.)

> The `.gitignore` already excludes `node_modules/`, `dist/`, `.vercel/`, and all
> `.env*` files, so **no secrets and no bulky build output get committed.**

---

## B. Connect GitHub to your EXISTING Vercel project

You already have the `option-chain-tracker` project on Vercel (from CLI deploys).
Link it to the repo so you keep the same domain AND the env vars you already set:

1. Vercel dashboard -> your `option-chain-tracker` project -> **Settings -> Git**.
2. **Connect Git Repository** -> pick the GitHub repo you just pushed.
3. Confirm build settings (Vercel auto-detects Vite):
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Done. Now every push to `main` auto-deploys to production.

(If you'd rather start fresh: Vercel -> Add New -> Project -> Import the repo. But
then you must re-enter all env vars below and you may get a new URL.)

---

## C. Environment variables (set in Vercel, NEVER in the repo)

Vercel -> Project -> Settings -> Environment Variables. These power auth, email,
and the new signal logger:

| Variable | Purpose |
|---|---|
| `JWT_SECRET` | Session signing (32+ random chars) |
| `ADMIN_EMAIL` | Your admin email (comma-separated for more than one) |
| `ALLOWED_EMAILS` | Comma-separated allowlist of who can log in |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Sending login OTP emails |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | **Signal logger storage** (see D) |

> The Dhan token is NOT an env var — you paste it in the app each day. Nothing
> Dhan-related goes in GitHub or Vercel env.

If you connected the existing project (B-1) these are already set; only add the
KV ones below.

---

## D. Enable the signal logger storage (Vercel KV)

The validation logger needs a KV store:

1. Vercel -> your project -> **Storage** tab -> **Create Database** -> **KV**.
2. Accept the defaults and create it; **connect it to this project**.
3. Vercel auto-adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` to the project env.
4. Redeploy (push any commit, or Vercel -> Deployments -> Redeploy).

Verify: log in as admin, click **Analyze** a few times, and look for
**"signal log: ✓ saved …"** under the Analyze button. If it says
*"signal storage not configured"*, the KV env vars aren't attached yet.

---

## Daily use after GitHub is set up

- Make changes -> `git add . && git commit -m "..." && git push` -> Vercel
  builds and deploys automatically. Watch progress in Vercel -> Deployments.
- No more extracting zips or running `npm install` by hand.
- The footer still shows the BUILD marker so you can confirm what's live.
