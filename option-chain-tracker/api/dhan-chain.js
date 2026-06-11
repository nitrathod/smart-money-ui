// Dhan API proxy — /api/dhan-chain?symbol=NIFTY
// Headers required from client:
//   x-dhan-access-token: <JWT from web.dhan.co>
//   x-dhan-client-id:    <your Dhan client ID, e.g. 1000000001>
//
// Returns the option chain in the same shape as the NSE proxy so the
// frontend doesn't have to know which provider it came from.

import { requireAuth } from './_lib/auth.js';
import { getSymbolMaster, STATIC_SYMBOLS } from './_lib/symbols.js';

const DHAN_BASE = 'https://api.dhan.co/v2';

// Verified static entries (indices + RELIANCE) live in ./_lib/symbols.js as STATIC_SYMBOLS.
// Any other F&O underlying is resolved dynamically from the Dhan instrument master.

// Cache nearest-expiry lookups for an hour — saves one Dhan call per warm fetch
const expiryCache = new Map(); // key: `${scrip}-${seg}` -> { expiry, fetchedAt }
const EXPIRY_TTL_MS = 60 * 60 * 1000;

async function getNearestExpiry(scrip, seg, dhanHeaders) {
  const cacheKey = `${scrip}-${seg}`;
  const cached = expiryCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < EXPIRY_TTL_MS) return cached.expiry;

  const res = await fetch(`${DHAN_BASE}/optionchain/expirylist`, {
    method: 'POST',
    headers: dhanHeaders,
    body: JSON.stringify({ UnderlyingScrip: scrip, UnderlyingSeg: seg }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Dhan expirylist ${res.status}: ${txt.slice(0, 160)}`);
  }
  const json = await res.json();
  const expiries = json?.data || [];
  if (expiries.length === 0) throw new Error('No expiry dates returned from Dhan');
  const nearest = expiries[0];
  expiryCache.set(cacheKey, { expiry: nearest, fetchedAt: Date.now() });
  return nearest;
}

async function getOptionChain(scrip, seg, expiry, dhanHeaders) {
  const res = await fetch(`${DHAN_BASE}/optionchain`, {
    method: 'POST',
    headers: dhanHeaders,
    body: JSON.stringify({ UnderlyingScrip: scrip, UnderlyingSeg: seg, Expiry: expiry }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Dhan optionchain ${res.status}: ${txt.slice(0, 160)}`);
  }
  return res.json();
}

// Fetch the day's OHLC for the underlying index so we can anchor intraday drift
// to the TRUE market open (9:15), not whenever the user first loaded the app.
// Uses /marketfeed/ohlc with the segment-keyed request format Dhan expects.
// Best-effort: returns null on any failure so a missing open never breaks the chain.
async function getDayOpen(scrip, seg, dhanHeaders) {
  try {
    const res = await fetch(`${DHAN_BASE}/marketfeed/ohlc`, {
      method: 'POST',
      headers: dhanHeaders,
      body: JSON.stringify({ [seg]: [scrip] }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const inst = json?.data?.[seg]?.[String(scrip)];
    const open = inst?.ohlc?.open;
    return (typeof open === 'number' && open > 0) ? open : null;
  } catch {
    return null;
  }
}

// Convert Dhan response into the NSE-style shape the frontend already understands
function convertDhanToNseShape(dhan) {
  const oc = dhan?.data?.oc || {};
  const spot = dhan?.data?.last_price || 0;
  const data = [];

  for (const [strikeStr, strikeData] of Object.entries(oc)) {
    const strike = parseFloat(strikeStr);
    if (!strike) continue;
    const ce = strikeData.ce || {};
    const pe = strikeData.pe || {};
    data.push({
      strikePrice: strike,
      CE: {
        openInterest: ce.oi || 0,
        changeinOpenInterest: (ce.oi || 0) - (ce.previous_oi || 0),
        totalTradedVolume: ce.volume || 0,
        impliedVolatility: ce.implied_volatility || 0,
        lastPrice: ce.last_price || 0,
        change: (ce.previous_close_price == null || ce.previous_close_price <= 0) ? null : (ce.last_price || 0) - ce.previous_close_price,
      },
      PE: {
        openInterest: pe.oi || 0,
        changeinOpenInterest: (pe.oi || 0) - (pe.previous_oi || 0),
        totalTradedVolume: pe.volume || 0,
        impliedVolatility: pe.implied_volatility || 0,
        lastPrice: pe.last_price || 0,
        change: (pe.previous_close_price == null || pe.previous_close_price <= 0) ? null : (pe.last_price || 0) - pe.previous_close_price,
      },
    });
  }

  data.sort((a, b) => a.strikePrice - b.strikePrice);

  return {
    records: {
      underlyingValue: spot,
      data,
    },
    source: 'dhan',
  };
}

// ── Server-side response cache ───────────────────────────────────────────────
// Auto-fetch (every 60s, multiple users) would otherwise hammer Dhan's rate limit.
// We cache the converted chain per symbol for CACHE_TTL_MS. Any request within the
// window gets the cached copy and we skip the upstream Dhan call entirely — so N
// users polling every minute cost ~1 Dhan call/min total instead of N.
// NOTE: this is per-serverless-instance memory. Vercel may run several instances,
// so the effective upstream rate is ~1 call per instance per TTL — still a massive
// reduction. For a hard global cap, a shared store (KV/Redis) would be the next step.
const chainCache = new Map(); // symbol -> { payload, fetchedAt }
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await requireAuth(req, res);
  if (!user) return;

  // Symbol list for the picker (no Dhan credentials needed). Folded into this function to stay
  // under Vercel's Hobby-plan 12-function limit. Called as /api/dhan-chain?list=symbols .
  if (req.query?.list === 'symbols') {
    const map = await getSymbolMaster();
    const symbols = Object.values(map)
      .map(m => ({ symbol: m.label, lotSize: m.lotSize, type: m.type }))
      .sort((a, b) => (a.type === b.type ? a.symbol.localeCompare(b.symbol) : (a.type === 'index' ? -1 : 1)));
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).json({ symbols, count: symbols.length });
  }

  const symbol = (req.query?.symbol || 'NIFTY').toString().toUpperCase();
  const accessToken = req.headers['x-dhan-access-token'];
  const clientId = req.headers['x-dhan-client-id'];

  if (!accessToken || !clientId) {
    return res.status(400).json({
      error: 'Missing credentials. Send x-dhan-access-token and x-dhan-client-id headers.',
    });
  }

  // Resolve the underlying: verified static first (indices + RELIANCE), then the dynamic
  // Dhan instrument master for any other F&O stock.
  let mapping = STATIC_SYMBOLS[symbol];
  if (!mapping) {
    const master = await getSymbolMaster();
    mapping = master[symbol];
  }
  if (!mapping) {
    return res.status(400).json({ error: `Unknown or non-F&O symbol: ${symbol}.` });
  }

  // Serve from cache if fresh — this is what protects the Dhan quota under auto-fetch.
  const cached = chainCache.get(symbol);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    const ageMs = Date.now() - cached.fetchedAt;
    res.setHeader('x-cache', 'HIT');
    res.setHeader('x-cache-age-ms', String(ageMs));
    return res.status(200).json({ ...cached.payload, cacheAgeMs: ageMs, cached: true });
  }

  const dhanHeaders = {
    'Content-Type': 'application/json',
    'access-token': accessToken,
    'client-id': clientId,
  };

  try {
    const expiry = await getNearestExpiry(mapping.scrip, mapping.seg, dhanHeaders);
    await new Promise(r => setTimeout(r, 500));
    const chain = await getOptionChain(mapping.scrip, mapping.seg, expiry, dhanHeaders);
    const converted = convertDhanToNseShape(chain);
    converted.records.expiry = expiry;
    converted.records.lotSize = mapping.lotSize; // per-underlying lot for the client
    // Best-effort: anchor intraday drift to the true day open.
    const dayOpen = await getDayOpen(mapping.scrip, mapping.seg, dhanHeaders);
    if (dayOpen != null) converted.records.dayOpen = dayOpen;
    chainCache.set(symbol, { payload: converted, fetchedAt: Date.now() });
    res.setHeader('x-cache', 'MISS');
    return res.status(200).json({ ...converted, cached: false });
  } catch (e) {
    console.error('Dhan proxy error:', e);
    // If we have a stale cached copy, serve it rather than failing the user outright.
    if (cached) {
      res.setHeader('x-cache', 'STALE');
      return res.status(200).json({ ...cached.payload, cacheAgeMs: Date.now() - cached.fetchedAt, cached: true, stale: true });
    }
    return res.status(502).json({ error: e.message, symbol });
  }
}

export default handler;

