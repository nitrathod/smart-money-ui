// Vercel Serverless Function — proxies NSE option chain API.
// Handles the cookie handshake NSE requires before serving JSON.
// Path: /api/nse-chain?symbol=NIFTY
//
// Also exported as a plain handler so the local Express dev server can reuse it.

import { requireAuth } from './_lib/auth.js';

const NSE_BASE = 'https://www.nseindia.com';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const COMMON_HEADERS = {
  'User-Agent': USER_AGENT,
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': 'https://www.nseindia.com/option-chain',
  'Connection': 'keep-alive',
};

// Simple in-memory cookie cache so we don't hit NSE homepage on every request
let cachedCookies = null;
let cookieExpiry = 0;

async function getCookies() {
  if (cachedCookies && Date.now() < cookieExpiry) return cachedCookies;
  const res = await fetch(`${NSE_BASE}/option-chain`, {
    headers: { ...COMMON_HEADERS },
    redirect: 'follow',
  });
  const setCookie = res.headers.get('set-cookie') || '';
  // Stitch the cookies into a single Cookie header value
  cachedCookies = setCookie.split(',').map(c => c.split(';')[0].trim()).filter(Boolean).join('; ');
  cookieExpiry = Date.now() + 5 * 60 * 1000; // refresh every 5 min
  return cachedCookies;
}

async function fetchOptionChain(symbol) {
  const indices = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY'];
  const isIndex = indices.includes(symbol.toUpperCase());
  const endpoint = isIndex
    ? `${NSE_BASE}/api/option-chain-indices?symbol=${encodeURIComponent(symbol)}`
    : `${NSE_BASE}/api/option-chain-equities?symbol=${encodeURIComponent(symbol)}`;

  let cookies = await getCookies();
  let res = await fetch(endpoint, {
    headers: { ...COMMON_HEADERS, Cookie: cookies },
  });

  // If unauthorized, retry once with fresh cookies
  if (res.status === 401 || res.status === 403) {
    cachedCookies = null;
    cookies = await getCookies();
    res = await fetch(endpoint, {
      headers: { ...COMMON_HEADERS, Cookie: cookies },
    });
  }

  if (!res.ok) throw new Error(`NSE responded ${res.status}`);
  return res.json();
}

// Universal handler — used by both Vercel and the local Express server
export async function handler(req, res) {
  // CORS for safety, though same-origin proxy normally doesn't need it
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  const symbol = (req.query?.symbol || 'NIFTY').toString().toUpperCase();
  try {
    const data = await fetchOptionChain(symbol);
    res.status(200).json(data);
  } catch (e) {
    console.error('NSE fetch error:', e);
    res.status(502).json({ error: e.message || 'Upstream fetch failed' });
  }
}

export default handler;
