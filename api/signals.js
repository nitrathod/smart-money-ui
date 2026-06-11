// /api/signals — the validation logger (Track A, step 1).
//   POST /api/signals?op=log    body=<record>             → store one analysis snapshot
//   GET  /api/signals?op=list&symbol=NIFTY&limit=100       → recent snapshots (most recent first)
//   GET  /api/signals?op=stats&symbol=NIFTY                → quick counts (logged so far)
//
// Storage: Vercel KV (Upstash Redis). Reads KV_REST_API_URL / KV_REST_API_TOKEN from env.
// If KV isn't configured, every op fails gracefully with a clear message rather than crashing.
// Each record is stored at  sig:<symbol>:<ts>  and indexed in a sorted set  sigidx:<symbol>
// (and sigidx:ALL) by timestamp, so the scorer can later fetch a record by key and rewrite it
// with the realized outcome.

import { kv } from '@vercel/kv';
import { requireAuth } from './_lib/auth.js';

async function readBody(req) {
  if (req.body) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

function kvConfigured() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return; // requireAuth already sent 401

  if (!kvConfigured()) {
    return res.status(503).json({
      error: 'Signal storage not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN env vars (Vercel KV / Upstash).',
      configured: false,
    });
  }

  const op = (req.query?.op || '').toString();

  try {
    // ---- LOG ----
    if (op === 'log') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST to log' });
      let body;
      try { body = await readBody(req); } catch { return res.status(400).json({ error: 'Invalid JSON body' }); }
      const symbol = (body?.symbol || 'NIFTY').toString().toUpperCase();
      if (body?.spot == null) return res.status(400).json({ error: 'record.spot required' });

      const ts = Date.now();
      const key = `sig:${symbol}:${ts}`;
      const record = { id: key, ts, loggedBy: user.email, ...body, symbol };

      await kv.set(key, record);
      await kv.zadd(`sigidx:${symbol}`, { score: ts, member: key });
      await kv.zadd('sigidx:ALL', { score: ts, member: key });

      return res.status(200).json({ ok: true, id: key, ts });
    }

    // ---- LIST ----
    if (op === 'list') {
      const symbol = (req.query?.symbol || 'ALL').toString().toUpperCase();
      let limit = parseInt(req.query?.limit, 10);
      if (!Number.isFinite(limit)) limit = 100;
      limit = Math.max(1, Math.min(500, limit));

      const idxKey = symbol === 'ALL' ? 'sigidx:ALL' : `sigidx:${symbol}`;
      // most recent first
      const keys = await kv.zrange(idxKey, 0, limit - 1, { rev: true });
      if (!keys || !keys.length) return res.status(200).json({ signals: [] });
      const recs = await kv.mget(...keys);
      return res.status(200).json({ signals: (recs || []).filter(Boolean) });
    }

    // ---- STATS ----
    if (op === 'stats') {
      const symbol = (req.query?.symbol || 'ALL').toString().toUpperCase();
      const idxKey = symbol === 'ALL' ? 'sigidx:ALL' : `sigidx:${symbol}`;
      const count = await kv.zcard(idxKey);
      return res.status(200).json({ symbol, count: count || 0 });
    }

    return res.status(400).json({ error: 'Unknown op. Use log | list | stats.' });
  } catch (e) {
    return res.status(500).json({ error: `Storage error: ${e.message}` });
  }
}
