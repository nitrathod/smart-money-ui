# NIFTY Smart Money Tracker

A 4-interval option chain analysis tool that decodes institutional positioning footprints from NSE option chain data. Built for traders who want to *see* what smart money did, not what gurus claim they did.

![Tracker](https://img.shields.io/badge/stack-Vite%20%2B%20React%20%2B%20Tailwind-amber) ![License](https://img.shields.io/badge/license-MIT-emerald)

## What it does

- **Live NSE fetch** — pulls option chain directly from nseindia.com (server proxy handles cookies/headers)
- **4 interval snapshots per day** — 9:20 AM, 11:00 AM, 1:00 PM, 3:00 PM
- **Smart Money Verdict engine** — pattern-based bias detection with reasoning trace
- **Interval Comparison** — PCR curve, score evolution, direction-flip alerts (the reversal tells)
- **Persistent storage** — snapshots saved to browser localStorage, keyed by date
- **Export/Import JSON** — for journaling and review
- **Works for** NIFTY, BANKNIFTY, FINNIFTY, MIDCPNIFTY

## Quick Start — Local

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org))

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the NSE proxy server (in one terminal)
npm run server

# 3. Start the Vite dev server (in another terminal)
npm run dev
```

Then open http://localhost:5173. The dev server hot-reloads.

> **Both terminals must run together** for live-fetch to work locally. The frontend proxies `/api/*` calls to the Express server on port 3001.

You can also skip the proxy entirely and just use the paste workflow — `npm run dev` alone is enough for that.

## Deploy — Vercel (recommended, easiest)

The fastest path. The `api/` folder auto-deploys as serverless functions.

### Option A: CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. Done. You'll get a `*.vercel.app` URL.

### Option B: GitHub + Vercel Dashboard

1. Push this folder to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Vercel auto-detects Vite. Click Deploy.
4. Live in ~30 seconds.

## Deploy — Netlify

1. Push to GitHub.
2. Go to [app.netlify.com](https://app.netlify.com), New Site from Git.
3. Build command: `npm run build`, publish directory: `dist`.
4. Netlify uses the included `netlify.toml` to route `/api/nse-chain` to the function.

## Deploy — Any Static Host (without NSE proxy)

If you only want the paste-and-analyze workflow (no live fetch):

```bash
npm run build
```

Upload the `dist/` folder to any static host (GitHub Pages, Cloudflare Pages, S3, your own server).

## Project Structure

```
option-chain-tracker/
├── api/
│   └── nse-chain.js          # Vercel serverless function (NSE proxy)
├── netlify/functions/
│   └── nse-chain.js          # Netlify Function (same proxy, different runtime)
├── src/
│   ├── App.jsx               # Main app — analysis engine, UI, verdict logic
│   ├── main.jsx              # React entry
│   └── index.css             # Tailwind + custom styles
├── server.js                 # Local Express dev server (runs the proxy on :3001)
├── index.html                # HTML entry
├── package.json
├── vite.config.js            # Dev proxy /api → localhost:3001
├── tailwind.config.js
├── vercel.json               # SPA rewrites + caching
└── netlify.toml              # Netlify build + redirects
```

## How to Use

### Daily Workflow

1. Open the app, pick the correct symbol (NIFTY by default).
2. At each interval (9:20 AM / 11:00 AM / 1:00 PM / 3:00 PM):
   - Click the matching interval tab.
   - Hit **Fetch Live from NSE** (or paste data manually).
   - Click **Analyze & Save**.
3. Read the verdict card. It explains every signal it considered.
4. Once 2+ snapshots saved, open the **Interval Comparison** tab.
5. **Watch for score sign flips** — that's smart money reversing its mind. Highest-conviction signal.
6. End of day: hit the download icon to export JSON for your journal.

### Reading the Verdict

The verdict score combines six signals:
- Fresh call writing above spot (bearish)
- Fresh put writing near spot (bullish)
- Call unwinding above spot (bullish — writers covering)
- Put unwinding below spot (bearish — support breaking)
- PCR direction (>1.3 bullish, <0.7 bearish)
- Max Pain distance from spot (gravity direction)

Score ≥ +2.5 → **Strongly Bullish**
Score +1 to +2.4 → **Bullish Bias**
Score −1 to +1 → **Range-bound / Neutral**
Score −1 to −2.4 → **Bearish Bias**
Score ≤ −2.5 → **Strongly Bearish**

## Troubleshooting

**"Live fetch failed" locally** → Make sure `npm run server` is running on port 3001.

**"Live fetch failed" on Vercel** → NSE occasionally blocks based on IP/region. The proxy retries with fresh cookies, but if NSE is hostile, paste workflow always works.

**Empty rows after fetch** → NSE returns no data outside market hours sometimes. Try paste.

**localStorage full** → Use the Clear button on individual snapshots, or export+clear via browser devtools.

## Tech Stack

- **Vite** — build tool
- **React 18** — UI
- **Tailwind CSS** — styling
- **Recharts** — bar/line charts
- **Lucide React** — icons
- **Express** — local dev API proxy
- **Vercel/Netlify Functions** — production API proxy

## Disclaimer

This is an **educational analysis tool**. Not investment advice. Options carry uncapped risk on the short side. The verdict engine is rule-based and reflects historical patterns of institutional positioning — it does not predict price. Always verify against your own analysis, risk management, and broker.

## License

MIT — do whatever you want, no warranty.
