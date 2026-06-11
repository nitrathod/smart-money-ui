// /api/dhan-candles — OHLC candle proxy for the ICT engine (Phase A data spike).
// Fetches intraday candles from Dhan (POST /v2/charts/intraday) for an underlying, normalizes to
// [{t,o,h,l,c,v}]. Native intervals 1/5/15/60 min (ICT ladder uses 1H/15M/5M/1M — all native).
// securityId/segment resolved from the same symbol master as the chain.
import { requireAuth } from './_lib/auth.js';
import { getSymbolMaster, STATIC_SYMBOLS } from './_lib/symbols.js';

const DHAN_BASE = 'https://api.dhan.co/v2';
const NATIVE = new Set(['1', '5', '15', '25', '60']);

// "YYYY-MM-DD HH:MM:SS" in IST (exchange time) for the intraday endpoint.
function istStamp(d) {
  const ist = new Date(d.getTime() + (5.5 * 60 - d.getTimezoneOffset()) * 60000);
  const p = n => String(n).padStart(2, '0');
  return `${ist.getFullYear()}-${p(ist.getMonth() + 1)}-${p(ist.getDate())} ${p(ist.getHours())}:${p(ist.getMinutes())}:${p(ist.getSeconds())}`;
}

// Dhan returns parallel arrays; zip into candle objects.
function toCandles(j) {
  const o = j.open || [], h = j.high || [], l = j.low || [], c = j.close || [], v = j.volume || [], t = j.timestamp || [];
  const out = [];
  for (let i = 0; i < c.length; i++) {
    out.push({ t: t[i], o: o[i], h: h[i], l: l[i], c: c[i], v: v[i] || 0 });
  }
  return out;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = await requireAuth(req, res);
  if (!user) return;

  const symbol = (req.query?.symbol || 'NIFTY').toString().toUpperCase();
  let interval = (req.query?.interval || '5').toString();
  const days = Math.min(Math.max(parseInt(req.query?.days, 10) || 5, 1), 90);
  const accessToken = req.headers['x-dhan-access-token'];
  const clientId = req.headers['x-dhan-client-id'];
  if (!accessToken || !clientId) {
    return res.status(400).json({ error: 'Missing credentials. Send x-dhan-access-token and x-dhan-client-id headers.' });
  }

  // ICT ladder uses 1/15/5/1 min and 60 (1H) — all native to Dhan, no synthesis.
  if (!NATIVE.has(interval)) {
    return res.status(400).json({ error: `Unsupported interval: ${interval}. Use 1/5/15/60.` });
  }
  const fetchInterval = interval;

  // Resolve the underlying (same map as the option chain). For candles we want the UNDERLYING's
  // own candles: NIFTY index (IDX_I → INDEX) or the stock equity (NSE_EQ → EQUITY).
  let mapping = STATIC_SYMBOLS[symbol];
  if (!mapping) {
    const master = await getSymbolMaster();
    mapping = master[symbol];
  }
  if (!mapping) return res.status(400).json({ error: `Unknown or non-F&O symbol: ${symbol}.` });
  const instrument = mapping.seg === 'IDX_I' ? 'INDEX' : 'EQUITY';

  const now = new Date();
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const body = {
    securityId: String(mapping.scrip),
    exchangeSegment: mapping.seg,
    instrument,
    interval: fetchInterval,
    oi: false,
    fromDate: istStamp(from),
    toDate: istStamp(now),
  };

  try {
    const r = await fetch(`${DHAN_BASE}/charts/intraday`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'access-token': accessToken, 'client-id': clientId },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const txt = await r.text();
      return res.status(502).json({ error: `Dhan candles HTTP ${r.status}`, detail: txt.slice(0, 300) });
    }
    const j = await r.json();
    let candles = toCandles(j);
    return res.status(200).json({
      symbol, interval, instrument, segment: mapping.seg, securityId: mapping.scrip,
      count: candles.length, candles,
    });
  } catch (e) {
    console.error('dhan-candles error:', e);
    return res.status(502).json({ error: e.message || 'Candle fetch failed' });
  }
}
