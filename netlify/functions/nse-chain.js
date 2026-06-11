// Netlify Function — wraps the NSE proxy for Netlify deployment.

const NSE_BASE = 'https://www.nseindia.com';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const COMMON_HEADERS = {
  'User-Agent': USER_AGENT,
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.nseindia.com/option-chain',
  'Connection': 'keep-alive',
};

let cachedCookies = null;
let cookieExpiry = 0;

async function getCookies() {
  if (cachedCookies && Date.now() < cookieExpiry) return cachedCookies;
  const res = await fetch(`${NSE_BASE}/option-chain`, { headers: { ...COMMON_HEADERS } });
  const setCookie = res.headers.get('set-cookie') || '';
  cachedCookies = setCookie.split(',').map(c => c.split(';')[0].trim()).filter(Boolean).join('; ');
  cookieExpiry = Date.now() + 5 * 60 * 1000;
  return cachedCookies;
}

export default async (req, context) => {
  const url = new URL(req.url);
  const symbol = (url.searchParams.get('symbol') || 'NIFTY').toUpperCase();
  const indices = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY'];
  const endpoint = indices.includes(symbol)
    ? `${NSE_BASE}/api/option-chain-indices?symbol=${encodeURIComponent(symbol)}`
    : `${NSE_BASE}/api/option-chain-equities?symbol=${encodeURIComponent(symbol)}`;

  try {
    let cookies = await getCookies();
    let res = await fetch(endpoint, { headers: { ...COMMON_HEADERS, Cookie: cookies } });
    if (res.status === 401 || res.status === 403) {
      cachedCookies = null;
      cookies = await getCookies();
      res = await fetch(endpoint, { headers: { ...COMMON_HEADERS, Cookie: cookies } });
    }
    if (!res.ok) throw new Error(`NSE ${res.status}`);
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
