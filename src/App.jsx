import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, Activity, Layers, Zap,
  RotateCcw, ChevronRight, Radio, RefreshCw,
  Settings, KeyRound, X, ExternalLink, LogOut, Loader2, Crosshair,
} from 'lucide-react';
import Login from './Login.jsx';
import { Logo } from './Logo.jsx';

// ============================================================================
// DEMO DATA (NSE NIFTY option chain 27-May-2026 close, from your screenshot)
// ============================================================================
const DEMO_DATA = `1380	-54	1909	18.59	680.45	16.00	520	670.05	678.00	780	23300.00	520	9.15	9.30	1560	-11.90	9.25	13.30	556236	18767	64857
420	114	825	17.30	628.85	17.15	130	620.85	631.25	65	23350.00	260	11.80	11.95	1040	-13.40	11.85	13.17	239402	9992	18457
1736	175	6460	16.81	582.55	9.15	1040	576.55	582.90	2080	23400.00	910	14.90	15.00	520	-15.90	15.05	13.03	512619	28424	59000
411	122	2311	16.35	537.00	4.80	260	528.50	539.05	65	23450.00	910	18.65	18.80	520	-18.20	18.70	12.82	288293	11558	18357
8591	983	35626	15.44	488.60	0.50	65	488.00	490.85	715	23500.00	1430	23.70	23.95	520	-20.35	23.65	12.70	837513	23852	82592
542	275	5394	15.61	449.50	0.65	130	440.05	450.05	65	23550.00	1235	29.70	30.00	1105	-23.20	30.00	12.61	313752	13108	19717
7063	1658	42793	15.11	406.00	-1.30	2600	402.00	404.60	130	23600.00	130	36.65	37.40	715	-26.60	36.80	12.41	645797	29132	57720
1555	342	21872	14.67	364.05	-3.75	130	360.15	363.75	130	23650.00	650	46.20	46.50	520	-29.15	46.20	12.34	355165	12575	20610
11099	1190	127531	14.26	323.60	-9.40	65	322.00	323.40	520	23700.00	1625	57.00	57.50	715	-32.50	56.45	12.17	869754	10701	51185
3366	1263	89756	14.05	286.80	-12.60	1040	283.50	286.65	520	23750.00	715	70.15	70.60	520	-34.30	70.60	12.20	580188	7766	16237
22448	4819	556868	13.82	251.55	-15.35	1105	250.10	252.10	130	23800.00	520	85.10	85.55	455	-37.30	85.55	12.08	1321750	20540	59833
9314	5228	561221	13.57	218.20	-18.65	65	218.20	219.40	520	23850.00	260	103.10	103.80	390	-39.10	103.10	11.98	1085860	20462	26683
76980	31892	2401266	13.42	188.25	-19.85	260	188.25	188.95	390	23900.00	585	123.05	123.85	390	-39.90	123.85	11.94	2785103	43235	89092
33680	15278	1474837	13.34	161.40	-21.90	390	161.65	162.15	325	23950.00	130	145.55	146.10	325	-42.30	145.50	11.75	1385500	10555	25574
133082	43196	2199460	13.28	137.25	-22.65	715	136.65	137.25	260	24000.00	455	170.75	171.40	195	-42.90	170.75	11.64	1521460	11948	74692
29503	12513	624411	13.22	115.60	-22.20	715	115.15	115.60	260	24050.00	325	198.70	199.55	195	-43.70	199.80	11.60	228833	-205	8752
66861	24774	1074382	13.05	95.00	-23.75	130	95.55	96.05	260	24100.00	130	228.80	230.20	130	-42.50	230.85	11.51	285595	-171	17217
21599	12344	471685	13.09	79.20	-22.20	520	78.50	79.15	780	24150.00	260	261.60	264.15	1040	-43.00	263.00	11.26	62371	374	2763
82669	30716	930017	13.04	64.50	-21.15	520	64.15	64.50	2535	24200.00	260	296.45	298.70	520	-40.55	298.85	11.11	117834	323	7322
21129	12298	371208	12.98	51.90	-20.25	585	51.55	51.90	455	24250.00	130	333.50	336.70	520	-44.70	332.35	10.36	18240	606	1360
65289	26335	704960	12.92	41.20	-19.25	65	41.25	41.30	520	24300.00	1040	371.25	374.65	325	-42.70	372.65	10.09	32141	-26	4408
21161	14702	307427	12.97	33.10	-17.40	2080	32.55	32.90	975	24350.00	65	412.10	419.15	195	-38.70	413.40	9.31	3883	130	428
64877	22678	598585	12.93	25.75	-15.70	650	25.75	26.00	1820	24400.00	1040	456.25	459.50	325	-37.25	455.35	7.67	9826	183	3364
22954	11133	286204	12.93	20.50	-14.20	65	20.35	20.50	1950	24450.00	65	501.40	504.40	325	-37.80	500.30	12.61	1319	80	271
120361	47393	887729	13.02	15.85	-12.80	2600	15.85	16.05	2210	24500.00	260	546.15	549.00	650	-34.25	546.05	0	20000	632	9794
19854	10268	239384	13.14	12.60	-10.90	130	12.60	12.75	1820	24550.00	260	590.55	602.85	130	-38.45	591.10	0	449	115	324
60442	24303	417458	13.26	9.95	-9.40	520	9.85	9.95	2730	24600.00	520	638.25	643.95	520	-29.95	642.65	0	2067	476	1186`;

const INTERVAL_LABELS = ['9:20 AM', '11:00 AM', '1:00 PM', '3:00 PM'];

// ============================================================================
// LOCAL STORAGE WRAPPER (replaces window.storage from artifact env)
// ============================================================================
const storage = {
  set(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (e) { console.error(e); return false; }
  },
  get(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  list(prefix) {
    const keys = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) keys.push(k);
      }
    } catch (e) {}
    return keys;
  },
  delete(key) {
    try { localStorage.removeItem(key); return true; } catch (e) { return false; }
  },
};

// ============================================================================
// HELPERS
// ============================================================================
function parseNum(s) {
  if (s == null) return 0;
  const t = String(s).trim().replace(/,/g, '').replace(/[()₹]/g, '');
  if (t === '-' || t === '' || t === '--') return 0;
  const n = parseFloat(t);
  return isFinite(n) ? n : 0;
}

/**
 * Detect NIFTY (or other index) spot price from the pasted chain text.
 * NSE's copy-paste output typically includes "NIFTY 23,907.15" or similar near the top.
 * Returns the detected number, or null if nothing convincing was found.
 *
 * Strategy: scan the first ~5 lines for a number in a plausible NIFTY range (15000-100000)
 * that's NOT a strike price (strikes are integer multiples of 50, spot rarely is).
 */
function detectSpotFromText(text, symbol = 'NIFTY') {
  if (!text || typeof text !== 'string') return null;

  // Symbol-based range gates — keeps us from grabbing a stray big number. Indices are listed
  // explicitly; any other symbol is a stock, so fall back to a wide generic equity range
  // (NSE F&O stocks span roughly ₹30 to ₹50,000) rather than the NIFTY range.
  const ranges = {
    NIFTY:      [15000, 50000],
    BANKNIFTY:  [30000, 90000],
    FINNIFTY:   [15000, 40000],
    MIDCPNIFTY: [8000,  30000],
    RELIANCE:   [600,   4000],
  };
  const [minSpot, maxSpot] = ranges[symbol] || [30, 100000];

  // Look at the first 8 lines only — spot label is always at the top in NSE copy
  const lines = text.trim().split('\n').slice(0, 8);

  // Pattern 1: explicit label like "NIFTY 23,907.15" or "Underlying: 23907.15"
  const labelPatterns = [
    new RegExp(`${symbol}\\s+([0-9,]+\\.[0-9]+)`, 'i'),
    /underlying[:\s]+([0-9,]+\.[0-9]+)/i,
    /spot[:\s]+([0-9,]+\.[0-9]+)/i,
    /current\s+price[:\s]+([0-9,]+\.[0-9]+)/i,
    /Last\s+Price[:\s]+([0-9,]+\.[0-9]+)/i,
  ];

  for (const line of lines) {
    for (const pattern of labelPatterns) {
      const match = line.match(pattern);
      if (match) {
        const value = parseFloat(match[1].replace(/,/g, ''));
        if (value >= minSpot && value <= maxSpot) {
          return value;
        }
      }
    }
  }

  // Pattern 2: any decimal number with 2 decimal places in plausible range
  // (spot prices have decimals; strike prices are whole multiples of the strike step).
  // Matches 4-6 digit indices (23,907.15) AND 3-4 digit stock prices (1320.50, 907.15).
  for (const line of lines) {
    const matches = line.match(/([0-9]{1,3}(?:,?[0-9]{3})?\.[0-9]{2})/g);
    if (matches) {
      for (const m of matches) {
        const value = parseFloat(m.replace(/,/g, ''));
        // Spot must have a non-zero fractional part (strikes are whole numbers)
        if (value >= minSpot && value <= maxSpot && value % 50 !== 0) {
          return value;
        }
      }
    }
  }

  return null;
}

function parseChain(text) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  const rows = [];
  for (const line of lines) {
    const cells = line.split(/\t|\s{2,}/).map(c => c.trim()).filter(c => c.length > 0);
    if (cells.length < 11) continue;
    let strikeIdx = -1;
    for (let i = 8; i <= 12 && i < cells.length; i++) {
      const candidate = parseNum(cells[i]);
      if (candidate >= 1000 && candidate <= 100000 && Number.isInteger(candidate / 50)) {
        strikeIdx = i;
        break;
      }
    }
    if (strikeIdx === -1) continue;
    const strike = parseNum(cells[strikeIdx]);
    if (!strike) continue;
    rows.push({
      strike,
      ce: {
        oi: parseNum(cells[strikeIdx - 10]) || 0,
        chngOi: parseNum(cells[strikeIdx - 9]) || 0,
        volume: parseNum(cells[strikeIdx - 8]) || 0,
        iv: parseNum(cells[strikeIdx - 7]) || 0,
        ltp: parseNum(cells[strikeIdx - 6]) || 0,
        chngLtp: null,
      },
      pe: {
        ltp: parseNum(cells[strikeIdx + 6]) || 0,
        iv: parseNum(cells[strikeIdx + 7]) || 0,
        volume: parseNum(cells[strikeIdx + 8]) || 0,
        chngOi: parseNum(cells[strikeIdx + 9]) || 0,
        oi: parseNum(cells[strikeIdx + 10]) || 0,
        chngLtp: null,
      },
    });
  }
  // Pass 1 (above) anchors the strike column on divisibility-by-50 — exact for NIFTY-family
  // (50-pt strikes). If it found nothing, the paste is likely a STOCK (5/10/20-pt strikes):
  // fall back to a step-agnostic detector that picks the column forming the cleanest strike
  // ladder. NIFTY never reaches this branch, so its behaviour is unchanged.
  if (rows.length === 0) return parseChainLadder(lines);
  return rows.sort((a, b) => a.strike - b.strike);
}

// Fallback paste parser for non-50 strike steps (stocks). Detects the strike column once, by
// finding the index (in the same 8..12 window) whose values across rows form the cleanest
// arithmetic ladder — OI/price columns are noisy and lose, so there are no false positives.
function parseChainLadder(lines) {
  const tokenized = [];
  for (const line of lines) {
    const cells = line.split(/\t|\s{2,}/).map(c => c.trim()).filter(c => c.length > 0);
    if (cells.length >= 21) tokenized.push(cells); // need ce(10) + strike + pe(10)
  }
  if (tokenized.length < 3) return [];
  let strikeIdx = -1, bestScore = -1;
  for (let i = 8; i <= 12; i++) {
    const vals = tokenized.map(c => parseNum(c[i])).filter(v => v >= 100 && v <= 100000);
    const uniq = [...new Set(vals)].sort((a, b) => a - b);
    if (uniq.length < 3) continue;
    const diffs = [];
    for (let j = 1; j < uniq.length; j++) diffs.push(uniq[j] - uniq[j - 1]);
    const step = Math.min(...diffs);
    if (step <= 0) continue;
    const clean = diffs.filter(d => Math.abs(d / step - Math.round(d / step)) < 0.01).length / diffs.length;
    const score = clean * Math.min(uniq.length, 20);
    if (score > bestScore) { bestScore = score; strikeIdx = i; }
  }
  if (strikeIdx < 10) return [];
  const rows = [];
  for (const cells of tokenized) {
    if (strikeIdx + 10 >= cells.length) continue;
    const strike = parseNum(cells[strikeIdx]);
    if (!strike) continue;
    rows.push({
      strike,
      ce: {
        oi: parseNum(cells[strikeIdx - 10]) || 0,
        chngOi: parseNum(cells[strikeIdx - 9]) || 0,
        volume: parseNum(cells[strikeIdx - 8]) || 0,
        iv: parseNum(cells[strikeIdx - 7]) || 0,
        ltp: parseNum(cells[strikeIdx - 6]) || 0,
        chngLtp: null,
      },
      pe: {
        ltp: parseNum(cells[strikeIdx + 6]) || 0,
        iv: parseNum(cells[strikeIdx + 7]) || 0,
        volume: parseNum(cells[strikeIdx + 8]) || 0,
        chngOi: parseNum(cells[strikeIdx + 9]) || 0,
        oi: parseNum(cells[strikeIdx + 10]) || 0,
        chngLtp: null,
      },
    });
  }
  return rows.sort((a, b) => a.strike - b.strike);
}

// Convert raw NSE JSON to our internal row format
function convertNSEJson(nseData) {
  const rows = [];
  const data = nseData?.records?.data || nseData?.filtered?.data || [];
  for (const item of data) {
    if (!item.CE && !item.PE) continue;
    rows.push({
      strike: item.strikePrice,
      ce: {
        oi: item.CE?.openInterest || 0,
        chngOi: item.CE?.changeinOpenInterest || 0,
        volume: item.CE?.totalTradedVolume || 0,
        iv: item.CE?.impliedVolatility || 0,
        ltp: item.CE?.lastPrice || 0,
        chngLtp: item.CE?.change ?? null,
      },
      pe: {
        oi: item.PE?.openInterest || 0,
        chngOi: item.PE?.changeinOpenInterest || 0,
        volume: item.PE?.totalTradedVolume || 0,
        iv: item.PE?.impliedVolatility || 0,
        ltp: item.PE?.lastPrice || 0,
        chngLtp: item.PE?.change ?? null,
      },
    });
  }
  return {
    rows: rows.sort((a, b) => a.strike - b.strike),
    spot: nseData?.records?.underlyingValue || 0,
    // Dhan uses records.expiry (single ISO date); NSE uses records.expiryDates[0]
    expiry: nseData?.records?.expiry || nseData?.records?.expiryDates?.[0] || null,
    // True day-open of the underlying (Dhan OHLC). Null if unavailable.
    dayOpen: nseData?.records?.dayOpen || null,
  };
}

function calculateMaxPain(rows) {
  let minPain = Infinity, maxPainStrike = 0;
  const strikes = rows.map(r => r.strike);
  for (const k of strikes) {
    let totalPain = 0;
    for (const r of rows) {
      if (r.strike < k) totalPain += r.ce.oi * (k - r.strike);
      if (r.strike > k) totalPain += r.pe.oi * (r.strike - k);
    }
    if (totalPain < minPain) { minPain = totalPain; maxPainStrike = k; }
  }
  return maxPainStrike;
}

// ============================================================================
// ICT STRUCTURE PRIMITIVES (Phase B) — pure, candle-array in → levels out.
// Candles: [{t,o,h,l,c,v}] oldest→newest. Timeframe-agnostic (same code on 1H/15M/5M/1M).
// ============================================================================

// Swing pivots via a symmetric fractal: a swing HIGH at i has its high strictly above the k
// candles on each side; swing LOW mirrors with lows. k=2 → classic 5-candle fractal.
function detectSwings(candles, k = 2) {
  const sw = [];
  if (!Array.isArray(candles) || candles.length < 2 * k + 1) return sw;
  for (let i = k; i < candles.length - k; i++) {
    let isHigh = true, isLow = true;
    for (let j = 1; j <= k; j++) {
      if (!(candles[i].h > candles[i - j].h && candles[i].h > candles[i + j].h)) isHigh = false;
      if (!(candles[i].l < candles[i - j].l && candles[i].l < candles[i + j].l)) isLow = false;
    }
    if (isHigh) sw.push({ idx: i, t: candles[i].t, price: candles[i].h, type: 'high' });
    if (isLow)  sw.push({ idx: i, t: candles[i].t, price: candles[i].l, type: 'low' });
  }
  return sw;
}

// Liquidity pools from swings: swing highs = BUY-side liquidity (BSL — stops/breakout-buys rest
// ABOVE them); swing lows = SELL-side liquidity (SSL — stops rest BELOW). Most-recent-first, capped.
function liquidityPools(swings, limit = 8) {
  const bsl = swings.filter(s => s.type === 'high').slice(-limit).reverse();
  const ssl = swings.filter(s => s.type === 'low').slice(-limit).reverse();
  return { bsl, ssl };
}

// Equal highs/lows — cluster swing levels within a tolerance (default 0.15%). Clusters of ≥2 are
// the strongest liquidity pools (multiple touches = more stops resting there). Sorted by count.
function equalLevels(swings, tolPct = 0.0015) {
  const cluster = (arr) => {
    const out = [], used = new Array(arr.length).fill(false);
    for (let i = 0; i < arr.length; i++) {
      if (used[i]) continue;
      const grp = [arr[i]]; used[i] = true;
      for (let j = i + 1; j < arr.length; j++) {
        if (!used[j] && Math.abs(arr[j] - arr[i]) / arr[i] <= tolPct) { grp.push(arr[j]); used[j] = true; }
      }
      if (grp.length >= 2) out.push({ price: grp.reduce((a, b) => a + b, 0) / grp.length, count: grp.length });
    }
    return out.sort((a, b) => b.count - a.count);
  };
  return {
    eqh: cluster(swings.filter(s => s.type === 'high').map(s => s.price)),
    eql: cluster(swings.filter(s => s.type === 'low').map(s => s.price)),
  };
}

// Liquidity sweep — a candle that breaches a swing level then CLOSES BACK INSIDE (the stop-hunt),
// as opposed to a breakout (CLOSES BEYOND). Each level is consumed by its first breach.
// BSL sweep (swing high breached, close back below) = bearish; SSL sweep = bullish.
function detectSweeps(candles, swings) {
  const sweeps = [];
  for (const s of swings) {
    for (let i = s.idx + 1; i < candles.length; i++) {
      const c = candles[i];
      if (s.type === 'high') {
        if (c.h > s.price) { // breached
          if (c.c < s.price) sweeps.push({ idx: i, t: c.t, level: s.price, side: 'BSL', dir: 'bearish', swingIdx: s.idx });
          break; // consumed (sweep or breakout)
        }
      } else {
        if (c.l < s.price) {
          if (c.c > s.price) sweeps.push({ idx: i, t: c.t, level: s.price, side: 'SSL', dir: 'bullish', swingIdx: s.idx });
          break;
        }
      }
    }
  }
  return sweeps.sort((a, b) => a.idx - b.idx);
}

// Market Structure break — a candle whose close crosses BEYOND the most recent opposing swing
// pivot (above the last swing high = bullish; below the last swing low = bearish). A true ICT
// "shift" (MSS) is such a break in the reversal direction right after a sweep — that qualification
// happens in the top-down assembly; here we expose the raw structure-break events.
function detectMSS(candles, swings) {
  const mss = [];
  const highs = swings.filter(s => s.type === 'high');
  const lows = swings.filter(s => s.type === 'low');
  for (let i = 1; i < candles.length; i++) {
    const c = candles[i], prev = candles[i - 1];
    let lastHigh = null, lastLow = null;
    for (let h = highs.length - 1; h >= 0; h--) { if (highs[h].idx < i) { lastHigh = highs[h]; break; } }
    for (let l = lows.length - 1; l >= 0; l--) { if (lows[l].idx < i) { lastLow = lows[l]; break; } }
    if (lastHigh && prev.c <= lastHigh.price && c.c > lastHigh.price) mss.push({ idx: i, t: c.t, level: lastHigh.price, dir: 'bullish' });
    if (lastLow && prev.c >= lastLow.price && c.c < lastLow.price) mss.push({ idx: i, t: c.t, level: lastLow.price, dir: 'bearish' });
  }
  return mss;
}

// Order Blocks — the last opposing candle before a displacement. Bullish OB: a DOWN candle whose
// high is then closed ABOVE by the next candle (displacement up); bearish OB: an UP candle whose
// low is closed BELOW next. Zone = that candle's [low, high] — where price often retraces to enter.
function detectOrderBlocks(candles) {
  const obs = [];
  for (let i = 0; i < candles.length - 1; i++) {
    const c = candles[i], n = candles[i + 1];
    if (c.c < c.o && n.c > c.h) obs.push({ idx: i, t: c.t, type: 'bullish', low: c.l, high: c.h });
    if (c.c > c.o && n.c < c.l) obs.push({ idx: i, t: c.t, type: 'bearish', low: c.l, high: c.h });
  }
  return obs;
}

// Fair Value Gaps — a 3-candle imbalance where the wicks don't overlap (inefficient price the
// market tends to revisit). Bullish FVG: candle1.high < candle3.low → gap [c1.high, c3.low].
// Bearish FVG: candle1.low > candle3.high → gap [c3.high, c1.low]. The refined entry inside an OB.
// Fair Value Gaps — a 3-candle imbalance where the wicks don't overlap (inefficient price the
// market tends to revisit). Bullish FVG: candle1.high < candle3.low → gap [c1.high, c3.low].
// Bearish FVG: candle1.low > candle3.high → gap [c3.high, c1.low]. The refined entry inside an OB.
function detectFVGs(candles) {
  const fvgs = [];
  for (let i = 0; i < candles.length - 2; i++) {
    const a = candles[i], c = candles[i + 2];
    if (a.h < c.l) fvgs.push({ idx: i + 1, t: candles[i + 1].t, type: 'bullish', low: a.h, high: c.l });
    if (a.l > c.h) fvgs.push({ idx: i + 1, t: candles[i + 1].t, type: 'bearish', low: c.h, high: a.l });
  }
  return fvgs;
}

// Lookback scoping — ICT bias/zone should reflect recent sessions, not months of history.
// Cap candles per timeframe so detection runs on a sensible window (≈ a handful of sessions).
function scopeCandles(candles, interval) {
  const lookback = { '1': 120, '5': 96, '15': 64, '25': 56, '60': 42 };
  const n = lookback[String(interval)] || 80;
  return candles.length > n ? candles.slice(-n) : candles;
}

// Mitigation — a zone is "mitigated" once price later trades back into it (overlaps its range).
// Fresh (unmitigated) zones are the ones still in play; we draw and score only those.
function markMitigated(zones, candles) {
  return zones.map(z => {
    let mitigated = false;
    for (let i = z.idx + 2; i < candles.length; i++) {
      if (candles[i].l <= z.high && candles[i].h >= z.low) { mitigated = true; break; }
    }
    return { ...z, mitigated };
  });
}
function freshZones(zones) { return zones.filter(z => !z.mitigated); }

// Premium/discount — the dealing range (recent swing high↔low) split at 50%. Above mid = premium
// (favour shorts), below = discount (favour longs). pct = where price sits in the range (0..1).
function premiumDiscount(swings, price) {
  const highs = swings.filter(s => s.type === 'high'), lows = swings.filter(s => s.type === 'low');
  if (!highs.length || !lows.length || price == null) return null;
  const high = Math.max(...highs.slice(-3).map(s => s.price));
  const low = Math.min(...lows.slice(-3).map(s => s.price));
  if (high <= low) return null;
  const mid = (high + low) / 2;
  const zone = price > mid * 1.001 ? 'premium' : price < mid * 0.999 ? 'discount' : 'equilibrium';
  return { high, low, mid, zone, pct: (price - low) / (high - low) };
}

// Structure bias from swing sequence: higher-high & higher-low → bullish; lower-high & lower-low →
// bearish; mixed → neutral. Uses the last two of each.
function structureBias(swings) {
  const highs = swings.filter(s => s.type === 'high'), lows = swings.filter(s => s.type === 'low');
  if (highs.length < 2 || lows.length < 2) return 'neutral';
  const hh = highs[highs.length - 1].price > highs[highs.length - 2].price;
  const hl = lows[lows.length - 1].price > lows[lows.length - 2].price;
  if (hh && hl) return 'bullish';
  if (!hh && !hl) return 'bearish';
  return 'neutral';
}

// Qualified MSS — a structure break preceded by a same-direction liquidity sweep within N bars.
// (Sweep grabs liquidity, then price breaks structure the same way = a true ICT shift, not noise.)
function qualifyMSS(sweeps, mss, withinBars = 6) {
  return mss.filter(m => sweeps.some(s => s.idx < m.idx && m.idx - s.idx <= withinBars && s.dir === m.dir));
}

// Top-down assembly — chains the layers into one checklist-style read. sets = {h1,m15,m5,m1} arrays.
// 1H gives bias; 15M gives premium/discount + an OB zone; 5M gives the qualified sweep+MSS trigger;
// 1M/5M last close is the working price. status: 'ready' (all align), 'forming' (partial), 'none'.
function ictTopDown(sets) {
  const analyzeTF = (candles) => {
    const sw = detectSwings(candles, 2);
    const obs = freshZones(markMitigated(detectOrderBlocks(candles), candles));
    return { sw, sweeps: detectSweeps(candles, sw), mss: detectMSS(candles, sw), bias: structureBias(sw), obs };
  };
  const h1 = sets.h1?.length ? analyzeTF(scopeCandles(sets.h1, '60')) : null;
  const m15 = sets.m15?.length ? analyzeTF(scopeCandles(sets.m15, '15')) : null;
  const m5 = sets.m5?.length ? analyzeTF(scopeCandles(sets.m5, '5')) : null;
  const price = sets.m1?.[sets.m1.length - 1]?.c ?? sets.m5?.[sets.m5.length - 1]?.c ?? null;

  const bias = h1?.bias || 'neutral';
  const pd = m15 ? premiumDiscount(m15.sw, price) : null;
  const qmss5 = m5 ? qualifyMSS(m5.sweeps, m5.mss) : [];
  const lastQ = qmss5[qmss5.length - 1] || null;
  const triggerAligned = !!(lastQ && lastQ.dir === bias);
  const zoneOk = !!(pd && ((bias === 'bullish' && pd.zone !== 'premium') || (bias === 'bearish' && pd.zone !== 'discount')));
  const obDir = bias === 'bullish' ? 'bullish' : 'bearish';
  const ob = m15?.obs.filter(o => o.type === obDir).slice(-1)[0] || null;

  const notes = [];
  let status = 'none';
  if (bias === 'neutral') {
    notes.push('Big picture (1H): no clear trend — best to stand aside');
  } else {
    const dirWord = bias === 'bullish' ? 'up' : 'down';
    const side = bias === 'bullish' ? 'buy' : 'sell';
    notes.push(`Big picture (1H): trending ${dirWord}`);
    if (pd) {
      const half = pd.zone === 'premium' ? 'upper half' : pd.zone === 'discount' ? 'lower half' : 'middle';
      notes.push(`Price is in the ${half} of its recent range`);
    }
    notes.push(zoneOk ? `Price location is OK for a ${side}` : `Price location is poor for a ${side} — wait for a better price`);
    notes.push(triggerAligned ? `Entry signal: FIRED (5M stop-hunt then ${dirWord}-break)` : 'Entry signal: not yet (waiting for a 5M stop-hunt + break)');
    if (ob) notes.push(`${bias === 'bullish' ? 'Buy' : 'Sell'} zone to watch: ${Math.round(ob.low)}–${Math.round(ob.high)}`);
    if (triggerAligned && zoneOk && ob) status = 'ready';
    else if (zoneOk || triggerAligned) status = 'forming';
  }
  return { bias, zone: pd?.zone || null, dealingRange: pd, trigger: lastQ, triggerAligned, zoneOk, ob, status, notes, price };
}

// Gamma confluence — overlays the ICT top-down setup with the options gamma read (pin/flip/regime).
// ICT setups are sweep-and-reverse (mean-reversion-flavoured), so they align with a LONG-gamma
// (vol-suppressing) regime and conflict with SHORT-gamma (trending). The pin is a magnet: bias is
// reinforced when the pin sits in the bias direction, opposed when the pin caps the move.
function gammaConfluence(ict, gamma, spot) {
  if (!ict || ict.bias === 'neutral' || !gamma || gamma.peakGammaStrike == null || spot == null) {
    return { level: 'n/a', score: 0, notes: ['No ICT bias or gamma data to combine'] };
  }
  const notes = [];
  let score = 0;
  const bias = ict.bias;
  const dirWord = bias === 'bullish' ? 'up' : 'down';
  const pinAbove = gamma.peakGammaStrike > spot;
  const pinAligned = (bias === 'bullish' && pinAbove) || (bias === 'bearish' && !pinAbove);
  if (pinAligned) { score += 1; notes.push(`Options magnet (${gamma.peakGammaStrike}) is in your favour — it pulls price the same way (${dirWord})`); }
  else { score -= 1; notes.push(`Options magnet (${gamma.peakGammaStrike}) pulls against you — it may cap the ${dirWord}-move`); }
  if (gamma.gammaRegime === 'long') { score += 1; notes.push('Market is calm/pinning — good for fade-and-reverse trades'); }
  else if (gamma.gammaRegime === 'short') { score -= 1; notes.push('Market is jumpy/trending — a stop-hunt may keep running instead of reversing'); }
  if (gamma.gammaFlip != null && gamma.gammaFlipDistancePct != null && Math.abs(gamma.gammaFlipDistancePct) < 0.3) {
    notes.push(`Price is right on the tipping point (${Math.round(gamma.gammaFlip)}) — this read can flip easily`);
  }
  const level = score >= 2 ? 'strong' : score === 1 ? 'supportive' : score === 0 ? 'mixed' : 'conflicting';
  return { level, score, notes };
}

function analyzeChain(rows, spot, openSpot = null, dayOpenIsTrue = false, expiryStr = null) {
  if (!rows || rows.length === 0) return null;
  // Focus on strikes within ±15% of spot for cleaner analysis
  const band = rows.filter(r => Math.abs(r.strike - spot) / spot < 0.15);
  const useRows = band.length >= 10 ? band : rows;

  const totalCallOI = useRows.reduce((s, r) => s + r.ce.oi, 0);
  const totalPutOI = useRows.reduce((s, r) => s + r.pe.oi, 0);
  const totalCallChng = useRows.reduce((s, r) => s + r.ce.chngOi, 0);
  const totalPutChng = useRows.reduce((s, r) => s + r.pe.chngOi, 0);
  const pcr = totalCallOI > 0 ? totalPutOI / totalCallOI : 0;
  const pcrChng = (totalCallOI + totalCallChng > 0)
    ? (totalPutOI + totalPutChng) / (totalCallOI + totalCallChng) - pcr : 0;

  const sortedByCallOI = [...useRows].sort((a, b) => b.ce.oi - a.ce.oi);
  const sortedByPutOI = [...useRows].sort((a, b) => b.pe.oi - a.pe.oi);
  const callWalls = sortedByCallOI.slice(0, 5);
  const putWalls = sortedByPutOI.slice(0, 5);

  const sortedByCallChng = [...useRows].sort((a, b) => b.ce.chngOi - a.ce.chngOi);
  const sortedByPutChng = [...useRows].sort((a, b) => b.pe.chngOi - a.pe.chngOi);
  const callBuildUp = sortedByCallChng.slice(0, 5);
  const putBuildUp = sortedByPutChng.slice(0, 5);
  const callUnwind = [...useRows].sort((a, b) => a.ce.chngOi - b.ce.chngOi).slice(0, 5).filter(r => r.ce.chngOi < 0);
  const putUnwind = [...useRows].sort((a, b) => a.pe.chngOi - b.pe.chngOi).slice(0, 5).filter(r => r.pe.chngOi < 0);

  // Max Pain MUST be computed over the FULL chain, not the ±15% band.
  const maxPain = calculateMaxPain(rows);
  const atmStrike = useRows.reduce((closest, r) =>
    Math.abs(r.strike - spot) < Math.abs(closest.strike - spot) ? r : closest, useRows[0]).strike;

  // Intraday price drift vs the first spot of the session (if known).
  const priceDriftPct = (openSpot && openSpot > 0) ? ((spot - openSpot) / openSpot) * 100 : null;

  // Days to expiry — used to gate max-pain's directional weight (its pull is only
  // meaningful close to expiry).
  const dteForVerdict = (() => {
    const d = daysToExpiryFromDate(expiryStr); // real expiry (monthly for stocks) when available
    return d != null ? d : daysToWeeklyExpiry();
  })();

  const verdict = generateVerdict({
    spot, atmStrike, callWalls, putWalls, callBuildUp, putBuildUp,
    callUnwind, putUnwind, pcr, maxPain, totalCallChng, totalPutChng,
    totalCallOI, totalPutOI, daysToExpiry: dteForVerdict,
    openSpot, priceDriftPct, dayOpenIsTrue,
  });

  // === GAMMA TIER 1: pin map (assumption-light) ===
  // Total option gamma resting at each strike = γ_CE·OI_CE + γ_PE·OI_PE. This is independent of
  // who is long vs short the contracts, so it needs NO dealer-sign assumption (that's Tier 2).
  // The strike with the most gamma is the strongest pin magnet — where hedging concentrates and
  // price tends to gravitate near expiry. How far spot sits from it tells pin-vs-free.
  const gammaT = Math.max(dteForVerdict, 0) / 365;
  const gammaProfile = useRows.map(r => {
    const ivCe = (r.ce?.iv > 0 && r.ce.iv < 200) ? r.ce.iv / 100 : 0; // skip garbage/illiquid IV
    const ivPe = (r.pe?.iv > 0 && r.pe.iv < 200) ? r.pe.iv / 100 : 0;
    const gCe = ivCe > 0 ? blackScholes(spot, r.strike, gammaT, ivCe, 'CE').gamma : 0;
    const gPe = ivPe > 0 ? blackScholes(spot, r.strike, gammaT, ivPe, 'PE').gamma : 0;
    return { strike: r.strike, gammaOI: gCe * (r.ce?.oi || 0) + gPe * (r.pe?.oi || 0) };
  }).filter(g => g.gammaOI > 0);

  let peakGammaStrike = null, peakGammaVal = 0, totalGamma = 0;
  for (const g of gammaProfile) {
    totalGamma += g.gammaOI;
    if (g.gammaOI > peakGammaVal) { peakGammaVal = g.gammaOI; peakGammaStrike = g.strike; }
  }
  // Concentration = share of all gamma sitting at the single peak strike. Higher → sharper pin.
  const gammaConcentration = totalGamma > 0 ? peakGammaVal / totalGamma : 0;
  const gammaPinDistancePct = peakGammaStrike != null ? ((peakGammaStrike - spot) / spot) * 100 : null;

  // === GAMMA TIER 2: signed dealer GEX + flip level ===
  // Net dealer gamma under a sign convention. STANDARD: dealers are long CALL gamma (+) and short
  // PUT gamma (−). Positive net gamma → dealers hedge AGAINST moves (sell rips / buy dips) →
  // vol-suppressing, pinning. Negative → hedge WITH moves → vol-amplifying, trending. The spot
  // where net gamma crosses zero is the "gamma flip" — a regime boundary.
  // ⚠ The sign convention is the load-bearing assumption, and NSE is a WRITING-heavy market, so if
  // a name's price consistently behaves opposite to the stated regime, flip GEX_INVERTED to true.
  const GEX_INVERTED = false;
  const gexCallSign = GEX_INVERTED ? -1 : 1;
  const gexPutSign = GEX_INVERTED ? 1 : -1;
  // Net gamma at a hypothetical spot S. Lot/contract-multiplier omitted: it's a positive constant,
  // so it can't move the zero-crossing (flip) or the sign (regime) — only the absolute ₹ magnitude,
  // which we treat as relative anyway given NSE OI-unit ambiguity.
  const netGexAt = (S) => {
    if (S <= 0 || gammaT <= 0) return 0;
    let g = 0;
    for (const r of useRows) {
      const ivCe = (r.ce?.iv > 0 && r.ce.iv < 200) ? r.ce.iv / 100 : 0;
      const ivPe = (r.pe?.iv > 0 && r.pe.iv < 200) ? r.pe.iv / 100 : 0;
      const gc = ivCe > 0 ? blackScholes(S, r.strike, gammaT, ivCe, 'CE').gamma : 0;
      const gp = ivPe > 0 ? blackScholes(S, r.strike, gammaT, ivPe, 'PE').gamma : 0;
      g += gexCallSign * gc * (r.ce?.oi || 0) * S * S
         + gexPutSign  * gp * (r.pe?.oi || 0) * S * S;
    }
    return g * 0.01;
  };
  const gammaExposureRel = netGexAt(spot);
  const gammaRegime = gammaExposureRel > 0 ? 'long' : gammaExposureRel < 0 ? 'short' : 'neutral';
  // Flip: scan sorted strikes for a sign change in net gamma, linear-interpolate the zero crossing.
  let gammaFlip = null;
  const sortedK = useRows.map(r => r.strike).sort((a, b) => a - b);
  if (sortedK.length >= 2) {
    let prevK = sortedK[0], prevG = netGexAt(prevK);
    for (let i = 1; i < sortedK.length; i++) {
      const k = sortedK[i], gg = netGexAt(k);
      if (prevG === 0) { gammaFlip = prevK; break; }
      if ((prevG < 0 && gg > 0) || (prevG > 0 && gg < 0)) {
        gammaFlip = prevK + (k - prevK) * (0 - prevG) / (gg - prevG);
        break;
      }
      prevK = k; prevG = gg;
    }
  }
  const gammaFlipDistancePct = gammaFlip != null ? ((spot - gammaFlip) / spot) * 100 : null;

  return {
    totalCallOI, totalPutOI, totalCallChng, totalPutChng, pcr, pcrChng,
    callWalls, putWalls, callBuildUp, putBuildUp, callUnwind, putUnwind,
    maxPain, atmStrike, verdict, rowCount: useRows.length,
    openSpot, priceDriftPct,
    // Gamma Tier 1 (pin map)
    gammaProfile, peakGammaStrike, gammaConcentration, gammaPinDistancePct,
    // Gamma Tier 2 (signed GEX + flip)
    gammaRegime, gammaFlip, gammaFlipDistancePct, gexInverted: GEX_INVERTED,
  };
}

function generateVerdict({ spot, atmStrike, callWalls, putWalls, callBuildUp, putBuildUp, callUnwind, putUnwind, pcr, maxPain, totalCallChng, totalPutChng, totalCallOI = 0, totalPutOI = 0, daysToExpiry = 5, openSpot = null, priceDriftPct = null, dayOpenIsTrue = false }) {
  const reasons = [];
  let score = 0;

  // Pair OI change with the option's PREMIUM change to tell real writing/covering apart
  // from buying/long-unwinding. OI alone can't: every contract has a buyer and a seller, so
  // a rise in OI looks identical whether it was sold-to-open (writing) or bought-to-open
  // (a directional long). Combining with premium direction resolves the four cases:
  //   OI↑ premium↓ = short buildup (writing)   OI↑ premium↑ = long buildup (buying)
  //   OI↓ premium↑ = short covering             OI↓ premium↓ = long unwinding
  // When premium change is unavailable (e.g. pasted data) we return 'unknown' and fall back
  // to the old OI-only heuristic (rising OI ≈ writing) so behaviour is unchanged there.
  const classifyFlow = (chngOi, chngLtp) => {
    if (chngLtp == null || chngLtp === 0) return 'unknown';
    if (chngOi > 0) return chngLtp < 0 ? 'short_buildup' : 'long_buildup';
    if (chngOi < 0) return chngLtp > 0 ? 'short_covering' : 'long_unwinding';
    return 'unknown';
  };
  const flowDataAvailable = [...(callBuildUp || []), ...(putBuildUp || [])]
    .some(r => r.ce?.chngLtp != null || r.pe?.chngLtp != null);


  // Normalize OI-change thresholds to a fraction of total chain OI instead of using
  // fixed absolute lot counts. Fixed thresholds (e.g. ">50,000") are regime-blind: the
  // same 50K is huge early in the day / on a small index and trivial near expiry / on a
  // large index. Intraday ΔOI is also cumulative-since-open (grows monotonically through
  // the session), so absolute thresholds trip ever more easily in the afternoon. A ratio
  // to total OI is stable across both effects. Calibrated so the old ~50K/20K levels map
  // to roughly the same triggers at a typical ~3–4M total-OI chain.
  const totalChainOI = Math.max(totalCallOI + totalPutOI, 1);
  const STRONG_WRITE_FRAC = 0.015;  // ~1.5% of total chain OI = "heavy" fresh writing
  const MODERATE_WRITE_FRAC = 0.006; // ~0.6% = "moderate"
  const strongWriteThresh = totalChainOI * STRONG_WRITE_FRAC;
  const moderateWriteThresh = totalChainOI * MODERATE_WRITE_FRAC;

  const callsAboveSpot = callBuildUp.filter(r => r.strike >= spot && r.ce.chngOi > 0);
  // Genuine writing = OI up + premium NOT rising (short buildup or unknown). Exclude confirmed
  // long buildup (OI up + premium up = call buying), which is a directional long, not resistance.
  const callWritingStrikes = callsAboveSpot.filter(r => classifyFlow(r.ce.chngOi, r.ce.chngLtp) !== 'long_buildup');
  const callBuyingStrikes  = callsAboveSpot.filter(r => classifyFlow(r.ce.chngOi, r.ce.chngLtp) === 'long_buildup');
  const aggressiveCallWriting = callWritingStrikes.reduce((s, r) => s + r.ce.chngOi, 0);
  const callWriteConfirm = flowDataAvailable && callWritingStrikes.length ? ' · premium falling confirms writing' : '';
  if (aggressiveCallWriting > strongWriteThresh) {
    score -= 2;
    reasons.push({ type: 'bearish', text: `Heavy fresh call writing above spot (+${fmt(aggressiveCallWriting)}, ${(aggressiveCallWriting / totalChainOI * 100).toFixed(1)}% of chain) at strikes ${callWritingStrikes.slice(0, 2).map(r => r.strike).join(', ')} — institutions building resistance${callWriteConfirm}` });
  } else if (aggressiveCallWriting > moderateWriteThresh) {
    score -= 1;
    reasons.push({ type: 'bearish', text: `Moderate call writing above spot — resistance forming` });
  }
  // Fresh call BUYING above spot (OI up + premium up) — a directional long, not resistance. Surface it
  // so the rising call-OI isn't misread as bearish writing. Informational (no score change).
  const callBuying = callBuyingStrikes.reduce((s, r) => s + r.ce.chngOi, 0);
  if (callBuying > moderateWriteThresh) {
    reasons.push({ type: 'neutral', text: `Fresh call buying above spot (+${fmt(callBuying)}) at ${callBuyingStrikes.slice(0, 2).map(r => r.strike).join(', ')} — premium rising, a directional long (not resistance)` });
  }

  const putsNearSpot = putBuildUp.filter(r => r.strike <= spot && r.strike >= spot - 200 && r.pe.chngOi > 0);
  const putWritingStrikes = putsNearSpot.filter(r => classifyFlow(r.pe.chngOi, r.pe.chngLtp) !== 'long_buildup');
  const putBuyingStrikes  = putsNearSpot.filter(r => classifyFlow(r.pe.chngOi, r.pe.chngLtp) === 'long_buildup');
  const aggressivePutWriting = putWritingStrikes.reduce((s, r) => s + r.pe.chngOi, 0);
  const putWriteConfirm = flowDataAvailable && putWritingStrikes.length ? ' · premium falling confirms writing' : '';
  if (aggressivePutWriting > strongWriteThresh) {
    score += 2;
    reasons.push({ type: 'bullish', text: `Heavy put writing near spot (+${fmt(aggressivePutWriting)}, ${(aggressivePutWriting / totalChainOI * 100).toFixed(1)}% of chain) at strikes ${putWritingStrikes.slice(0, 2).map(r => r.strike).join(', ')} — floor being built${putWriteConfirm}` });
  } else if (aggressivePutWriting > moderateWriteThresh) {
    score += 1;
    reasons.push({ type: 'bullish', text: `Moderate put writing near spot — support forming` });
  }
  // Fresh put BUYING near spot (OI up + premium up) — a directional short, not a floor. Informational.
  const putBuying = putBuyingStrikes.reduce((s, r) => s + r.pe.chngOi, 0);
  if (putBuying > moderateWriteThresh) {
    reasons.push({ type: 'neutral', text: `Fresh put buying near spot (+${fmt(putBuying)}) at ${putBuyingStrikes.slice(0, 2).map(r => r.strike).join(', ')} — premium rising, a directional short (not a floor)` });
  }

  const callUnwindAbove = callUnwind.filter(r => r.strike > spot);
  if (callUnwindAbove.length >= 2) {
    const covers = callUnwindAbove.filter(r => classifyFlow(r.ce.chngOi, r.ce.chngLtp) === 'short_covering').length;
    const longExits = callUnwindAbove.filter(r => classifyFlow(r.ce.chngOi, r.ce.chngLtp) === 'long_unwinding').length;
    const strikesTxt = callUnwindAbove.slice(0, 2).map(r => r.strike).join(', ');
    if (flowDataAvailable && longExits > covers) {
      // OI falling + premium falling = call buyers exiting, NOT writers covering — no bullish lift.
      reasons.push({ type: 'neutral', text: `Call OI falling above spot at ${strikesTxt} with premium dropping — call longs exiting, not writers covering` });
    } else {
      score += 1;
      reasons.push({ type: 'bullish', text: `Call unwinding above spot at ${strikesTxt} — writers covering shorts${flowDataAvailable && covers ? ' · premium rising confirms covering' : ''}` });
    }
  }

  const putUnwindBelow = putUnwind.filter(r => r.strike <= spot);
  if (putUnwindBelow.length >= 2) {
    const covers = putUnwindBelow.filter(r => classifyFlow(r.pe.chngOi, r.pe.chngLtp) === 'short_covering').length;
    const longExits = putUnwindBelow.filter(r => classifyFlow(r.pe.chngOi, r.pe.chngLtp) === 'long_unwinding').length;
    const strikesTxt = putUnwindBelow.slice(0, 2).map(r => r.strike).join(', ');
    if (flowDataAvailable && longExits > covers) {
      reasons.push({ type: 'neutral', text: `Put OI falling near/below spot at ${strikesTxt} with premium dropping — put longs exiting, not writers covering` });
    } else {
      score -= 1;
      reasons.push({ type: 'bearish', text: `Put unwinding near/below spot at ${strikesTxt} — writers losing conviction on support${flowDataAvailable && covers ? ' · premium rising confirms covering' : ''}` });
    }
  }

  if (pcr > 1.3) {
    score += 1;
    reasons.push({ type: 'bullish', text: `PCR ${pcr.toFixed(2)} — heavy put writing dominance (contrarian bullish)` });
  } else if (pcr < 0.7) {
    score -= 1;
    reasons.push({ type: 'bearish', text: `PCR ${pcr.toFixed(2)} — heavy call writing dominance` });
  } else {
    reasons.push({ type: 'neutral', text: `PCR ${pcr.toFixed(2)} — balanced positioning between calls and puts` });
  }

  const painDistance = ((maxPain - spot) / spot) * 100;
  // Max pain's directional "gravity" is only empirically meaningful close to expiry
  // (its pinning effect concentrates in the final session or two). Away from expiry it's
  // largely noise, so we report it but do NOT let it move the score. Near expiry
  // (≤1 day) we apply the small ±0.5 nudge as before.
  const maxPainCountsDirectionally = daysToExpiry <= 1;
  if (Math.abs(painDistance) > 1.5) {
    if (painDistance < 0) {
      if (maxPainCountsDirectionally) score -= 0.5;
      reasons.push({ type: 'bearish', text: `Max Pain ${maxPain} is ${painDistance.toFixed(1)}% below spot${maxPainCountsDirectionally ? " — writer's gravity pulls market down (near expiry)" : ' — informational only (pull weak away from expiry)'}` });
    } else {
      if (maxPainCountsDirectionally) score += 0.5;
      reasons.push({ type: 'bullish', text: `Max Pain ${maxPain} is ${painDistance.toFixed(1)}% above spot${maxPainCountsDirectionally ? " — writer's gravity pulls market up (near expiry)" : ' — informational only (pull weak away from expiry)'}` });
    }
  } else {
    reasons.push({ type: 'neutral', text: `Max Pain ${maxPain} near spot — magnet zone, expect pinning` });
  }

  const atmPutBuild = putBuildUp.find(r => r.strike === atmStrike);
  if (atmPutBuild && atmPutBuild.pe.chngOi > 30000 && callsAboveSpot.length >= 3) {
    reasons.push({ type: 'warning', text: `⚠ TRAP RISK: heavy put writing AT spot (${atmStrike}) while calls stack above — put writers exposed if breakdown` });
  }

  // ── Price trend vs positioning ──────────────────────────────────────────────
  // The OI score above is pure positioning. Now layer in intraday PRICE drift
  // (vs the first spot of the session). We keep OI dominant: only a STRONG move
  // (beyond ±0.5%) nudges the score, and only modestly (max ±1), so the verdict
  // doesn't become a pure momentum chaser — but a big trend isn't ignored either.
  const oiScore = score; // snapshot before price nudge, for divergence check
  let priceNudge = 0;
  let divergence = null;
  if (priceDriftPct != null) {
    const absDrift = Math.abs(priceDriftPct);
    const dir = priceDriftPct > 0 ? 'up' : 'down';
    const trendWord = dir === 'up' ? 'bullish' : 'bearish';
    const openLabel = dayOpenIsTrue ? "day open" : "session start";
    if (absDrift >= 0.15) {
      // Report the trend as its own line regardless of strength
      reasons.push({
        type: dir === 'up' ? 'bullish' : 'bearish',
        text: `Price ${dir} ${absDrift.toFixed(2)}% intraday (spot ${Math.round(spot)} vs ${openLabel} ${Math.round(openSpot)}) — ${trendWord} momentum`,
      });
    } else {
      reasons.push({ type: 'neutral', text: `Price roughly flat intraday (${priceDriftPct >= 0 ? '+' : ''}${priceDriftPct.toFixed(2)}% vs ${openLabel}) — no momentum signal` });
    }
    // Conservative nudge: strong moves only
    if (absDrift >= 0.75) priceNudge = dir === 'up' ? 1 : -1;
    else if (absDrift >= 0.5) priceNudge = dir === 'up' ? 0.5 : -0.5;
    score += priceNudge;

    // Divergence: price moved meaningfully but OI positioning leans the other way
    // (or is flat). This is the "market fell but signal says neutral" case.
    if (absDrift >= 0.4) {
      if (dir === 'down' && oiScore >= 0) {
        divergence = {
          text: `Price fell ${absDrift.toFixed(2)}% today, but OI positioning is ${oiScore > 0 ? 'still leaning bullish' : 'neutral'} — momentum and smart-money disagree. Either the drop is exhausting (writers defending support) or positioning hasn't caught up. Trade with caution.`,
        };
      } else if (dir === 'up' && oiScore <= 0) {
        divergence = {
          text: `Price rose ${absDrift.toFixed(2)}% today, but OI positioning is ${oiScore < 0 ? 'still leaning bearish' : 'neutral'} — momentum and smart-money disagree. Either the rally is unsupported or positioning hasn't caught up. Trade with caution.`,
        };
      }
    }
    // Note: divergence is surfaced via the prominent banner (verdict.divergence),
    // so we deliberately do NOT also push it into the reasons list (avoids showing
    // the same warning twice).
  }

  let label, color;
  if (score >= 2.5) { label = 'STRONGLY BULLISH'; color = 'emerald'; }
  else if (score >= 1) { label = 'BULLISH BIAS'; color = 'emerald'; }
  else if (score <= -2.5) { label = 'STRONGLY BEARISH'; color = 'red'; }
  else if (score <= -1) { label = 'BEARISH BIAS'; color = 'red'; }
  else { label = 'RANGE-BOUND / NEUTRAL'; color = 'amber'; }
  return { label, color, score, reasons, oiScore, priceNudge, priceDriftPct, divergence };
}

// ============================================================================
// POSITIONING READ GENERATOR — translates verdict into observable directional bias
// ============================================================================
// ============================================================================
// MARKET STRUCTURE ANALYZER
// Synthesizes option-chain signals + optional macro inputs (GIFT NIFTY, India VIX)
// into a coherent "regime" view. Returns null fields gracefully when inputs missing.
// ============================================================================
function assessMarketStructure({ analysis, spot, giftNifty, giftPrevClose, vix, vixPrevClose }) {
  // ----- 1. Trend regime (from verdict score) -----
  const score = analysis.verdict.score;
  let trendRegime, trendColor;
  if (score >= 2.5)        { trendRegime = 'STRONG BULLISH';   trendColor = 'emerald'; }
  else if (score >= 1)     { trendRegime = 'BULLISH';          trendColor = 'emerald'; }
  else if (score <= -2.5)  { trendRegime = 'STRONG BEARISH';   trendColor = 'red'; }
  else if (score <= -1)    { trendRegime = 'BEARISH';          trendColor = 'red'; }
  else                     { trendRegime = 'RANGE-BOUND';      trendColor = 'amber'; }

  // ----- 2. Volatility regime (from India VIX) -----
  let volatilityRegime = null, volatilityColor = null, vixChange = null, vixChangePct = null, vixDirection = null;
  if (vix && vix > 0) {
    if (vix < 11)        { volatilityRegime = 'COMPLACENT';   volatilityColor = 'red'; }     // too low = warning
    else if (vix < 14)   { volatilityRegime = 'LOW';          volatilityColor = 'emerald'; }
    else if (vix < 18)   { volatilityRegime = 'NORMAL';       volatilityColor = 'slate'; }
    else if (vix < 22)   { volatilityRegime = 'ELEVATED';     volatilityColor = 'amber'; }
    else                 { volatilityRegime = 'FEAR';         volatilityColor = 'red'; }

    if (vixPrevClose && vixPrevClose > 0) {
      vixChange = vix - vixPrevClose;
      vixChangePct = (vixChange / vixPrevClose) * 100;
      if (vixChangePct > 5)        vixDirection = 'spiking ↑';
      else if (vixChangePct > 1)   vixDirection = 'rising';
      else if (vixChangePct < -5)  vixDirection = 'collapsing ↓';
      else if (vixChangePct < -1)  vixDirection = 'easing';
      else                         vixDirection = 'flat';
    }
  }

  // ----- 3. Gap bias (from GIFT NIFTY) -----
  let gapBias = null, gapBiasColor = null, gapPoints = null, gapPct = null;
  if (giftNifty && giftNifty > 0 && spot && spot > 0) {
    gapPoints = giftNifty - spot;
    gapPct = (gapPoints / spot) * 100;

    if (Math.abs(gapPoints) < 25)       { gapBias = 'FLAT OPEN';     gapBiasColor = 'slate'; }
    else if (gapPoints >= 200)          { gapBias = 'STRONG GAP-UP'; gapBiasColor = 'emerald'; }
    else if (gapPoints >= 50)           { gapBias = 'GAP-UP';        gapBiasColor = 'emerald'; }
    else if (gapPoints <= -200)         { gapBias = 'STRONG GAP-DN'; gapBiasColor = 'red'; }
    else if (gapPoints <= -50)          { gapBias = 'GAP-DOWN';      gapBiasColor = 'red'; }
    else                                { gapBias = 'MILD GAP';      gapBiasColor = 'amber'; }
  }

  // ----- 4. Positioning concentration (already derived in analysis) -----
  const totalCallOI = analysis.callWalls.reduce((s, w) => s + w.oi, 0);
  const totalPutOI = analysis.putWalls.reduce((s, w) => s + w.oi, 0);
  const topCallOI = analysis.callWalls.slice(0, 3).reduce((s, w) => s + w.oi, 0);
  const topPutOI = analysis.putWalls.slice(0, 3).reduce((s, w) => s + w.oi, 0);
  const callConcentration = totalCallOI > 0 ? (topCallOI / totalCallOI) * 100 : 0;
  const putConcentration = totalPutOI > 0 ? (topPutOI / totalPutOI) * 100 : 0;
  const avgConcentration = (callConcentration + putConcentration) / 2;

  let concentrationLabel;
  if (avgConcentration > 65)      concentrationLabel = 'CONCENTRATED';
  else if (avgConcentration > 45) concentrationLabel = 'CLUSTERED';
  else                            concentrationLabel = 'DISTRIBUTED';

  // ----- 5. Smart money conviction (cumulative fresh ΔOI at top strikes) -----
  const freshCallWriting = analysis.callWalls.slice(0, 3).reduce((s, w) => s + Math.max(0, w.chngOi || 0), 0);
  const freshPutWriting = analysis.putWalls.slice(0, 3).reduce((s, w) => s + Math.max(0, w.chngOi || 0), 0);
  const totalFreshFlow = freshCallWriting + freshPutWriting;

  let convictionLabel, convictionColor;
  if (totalFreshFlow > 200000)      { convictionLabel = 'HIGH';     convictionColor = 'emerald'; }
  else if (totalFreshFlow > 80000)  { convictionLabel = 'MODERATE'; convictionColor = 'slate'; }
  else                              { convictionLabel = 'LOW';      convictionColor = 'amber'; }

  // ----- 6. Composite structure summary (one-line narrative) -----
  const parts = [];
  parts.push(trendRegime.toLowerCase().replace('_', ' '));
  if (volatilityRegime) parts.push(`${volatilityRegime.toLowerCase()} vol`);
  if (gapBias && gapBias !== 'FLAT OPEN') parts.push(gapBias.toLowerCase().replace('-', ' '));
  parts.push(`${concentrationLabel.toLowerCase()} positioning`);
  const narrative = parts.join(' · ');

  return {
    trendRegime, trendColor,
    volatilityRegime, volatilityColor, vix, vixChange, vixChangePct, vixDirection,
    gapBias, gapBiasColor, giftNifty, gapPoints, gapPct,
    concentrationLabel, callConcentration, putConcentration,
    convictionLabel, convictionColor, freshCallWriting, freshPutWriting,
    narrative,
  };
}


// ============================================================================
// POSITIONING READ GENERATOR — translates verdict into observable directional bias
// ============================================================================
// ============================================================================
// BLACK-SCHOLES OPTION MATH
// Used by admin trade math to replace the delta≈0.5 approximation.
// Standard textbook formulas; risk-free rate held at 6.5% (RBI repo proxy).
// ============================================================================

// Standard normal CDF using Abramowitz–Stegun approximation
// Accurate to ~7 decimals — plenty for retail option pricing
function normCDF(x) {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * ax);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1.0 + sign * y);
}

// Standard normal PDF
function normPDF(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Black-Scholes option Greeks.
 * @param {number} S    Spot
 * @param {number} K    Strike
 * @param {number} T    Time to expiry in years (e.g. 7 days = 7/365)
 * @param {number} sigma  IV as decimal (e.g. 0.12 for 12%)
 * @param {string} type 'CE' (call) or 'PE' (put)
 * @param {number} r    Risk-free rate (default 6.5% — RBI repo proxy)
 * @returns {{delta, gamma, theta, vega, price}}
 *   delta — per 1 unit of underlying
 *   theta — per day (already / 365)
 *   vega  — per 1 vol point (already / 100)
 *   price — theoretical option price per share
 */
function blackScholes(S, K, T, sigma, type, r = 0.065) {
  // Guardrails for edge cases (expiry day, zero IV, etc.)
  if (T <= 0 || sigma <= 0 || S <= 0 || K <= 0) {
    const intrinsic = type === 'CE' ? Math.max(S - K, 0) : Math.max(K - S, 0);
    return { delta: type === 'CE' ? (S > K ? 1 : 0) : (S < K ? -1 : 0), gamma: 0, theta: 0, vega: 0, price: intrinsic };
  }

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;

  let delta, theta, price;
  if (type === 'CE') {
    delta = normCDF(d1);
    price = S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);
    theta = -(S * normPDF(d1) * sigma) / (2 * sqrtT) - r * K * Math.exp(-r * T) * normCDF(d2);
  } else {
    delta = normCDF(d1) - 1;
    price = K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1);
    theta = -(S * normPDF(d1) * sigma) / (2 * sqrtT) + r * K * Math.exp(-r * T) * normCDF(-d2);
  }

  const gamma = normPDF(d1) / (S * sigma * sqrtT);
  const vega  = S * normPDF(d1) * sqrtT / 100;
  const thetaPerDay = theta / 365;

  return { delta, gamma, theta: thetaPerDay, vega, price };
}

/**
 * NSE trading holidays for 2026 (full-day exchange closures), as ISO date strings.
 * Source: official NSE 2026 trading-holiday list (provided by the user).
 * IMPORTANT: YEAR-SPECIFIC — update each year. Used only by the FALLBACK expiry
 * estimator (paste path, when the chain carries no real expiry date). The live data
 * path reads the true expiry from the feed and ignores this list entirely.
 *
 * For expiry-prepone purposes, the Tuesday entries are the ones that move the weekly
 * expiry: 03-Mar, 31-Mar, 14-Apr, 20-Oct, 10-Nov, 24-Nov. The rest only affect the
 * exact day-count and the rare case where a preponed Monday is itself a holiday.
 */
const NSE_HOLIDAYS_2026 = new Set([
  '2026-01-15', // Municipal Corporation Election in Maharashtra (Thu)
  '2026-01-26', // Republic Day (Mon)
  '2026-02-19', // Chhatrapati Shivaji Maharaj Jayanti (Thu)
  '2026-03-03', // Holi - second day (Tue) ← prepones expiry
  '2026-03-19', // Gudhi Padwa (Thu)
  '2026-03-26', // Ram Navami (Thu)
  '2026-03-31', // Mahavir Jayanti (Tue) ← prepones expiry
  '2026-04-01', // Annual Bank Closing (Wed)
  '2026-04-03', // Good Friday (Fri)
  '2026-04-14', // Dr. Babasaheb Ambedkar Jayanti (Tue) ← prepones expiry
  '2026-05-01', // Maharashtra Din / Buddha Pournima (Fri)
  '2026-05-28', // Bakri ID (Thu)
  '2026-06-26', // Muharram (Fri)
  '2026-08-26', // Id-E-Milad (Wed)
  '2026-09-14', // Ganesh Chaturthi (Mon)
  '2026-10-02', // Mahatma Gandhi Jayanti (Fri)
  '2026-10-20', // Dussehra (Tue) ← prepones expiry
  '2026-11-10', // Diwali - Bali Pratipada (Tue) ← prepones expiry
  '2026-11-24', // Guru Nanak Jayanti (Tue) ← prepones expiry
  '2026-12-25', // Christmas (Fri)
]);

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isTradingHoliday(d) {
  const day = d.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return true;            // weekend
  return NSE_HOLIDAYS_2026.has(toISODate(d));         // listed holiday
}

/**
 * Days to the next weekly NIFTY expiry from a given date.
 * FALLBACK ONLY — used when the chain doesn't carry an explicit expiry date.
 *
 * NIFTY weekly expiry is TUESDAY. If that Tuesday is a holiday, NSE prepones the
 * expiry to the previous trading day (Monday, or earlier if Monday is also closed).
 * This walks forward to the upcoming Tuesday, prepones over any holiday, and returns
 * the fractional day count to that expiry's 3:30 PM close.
 *
 * Prefer daysToExpiryFromDate() with the real expiry from the chain whenever available.
 */
function daysToWeeklyExpiry(fromDate = new Date()) {
  const TUESDAY = 2;
  // Find the upcoming Tuesday (today if today is Tuesday)
  const base = new Date(fromDate);
  base.setHours(0, 0, 0, 0);
  let daysAhead = (TUESDAY - base.getDay() + 7) % 7;
  let expiry = new Date(base);
  expiry.setDate(base.getDate() + daysAhead);

  // If that Tuesday is a holiday, prepone to the previous trading day
  let guard = 0;
  while (isTradingHoliday(expiry) && guard < 7) {
    expiry.setDate(expiry.getDate() - 1);
    guard++;
  }

  // If the resulting expiry is already in the past (e.g. today is Tuesday after close,
  // or prepone pushed it before now), roll to next week's Tuesday and re-prepone.
  expiry.setHours(15, 30, 0, 0);
  if (expiry.getTime() <= fromDate.getTime()) {
    const nextBase = new Date(base);
    nextBase.setDate(base.getDate() + daysAhead + 7);
    expiry = new Date(nextBase);
    let g2 = 0;
    while (isTradingHoliday(expiry) && g2 < 7) {
      expiry.setDate(expiry.getDate() - 1);
      g2++;
    }
    expiry.setHours(15, 30, 0, 0);
  }

  const days = (expiry.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000);
  return Math.max(days, 0.4);
}

/**
 * Calendar days from now to a given expiry date string (e.g. "2026-06-02").
 * This is the CORRECT time-to-expiry source — reads the actual expiry from the chain.
 * Returns a fractional day count; floors at ~half a day so BS never divides by zero.
 */
function daysToExpiryFromDate(expiryStr, fromDate = new Date()) {
  if (!expiryStr) return null;
  const expiry = new Date(expiryStr + 'T15:30:00+05:30'); // NSE close on expiry day, IST
  if (isNaN(expiry.getTime())) return null;
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = (expiry.getTime() - fromDate.getTime()) / msPerDay;
  return Math.max(days, 0.4);
}

/**
 * Hours remaining from now until the daily trade cut-off (default 3:05 PM IST).
 * Used to (a) project the option premium for a SAME-DAY exit by cut-off, and
 * (b) block new entries once the cut-off has passed.
 *
 * Returns { hoursToClose, pastCutoff }.
 * hoursToClose is floored to a small positive value so projections stay sane.
 */
function hoursToDailyCutoff(fromDate = new Date(), cutoffHour = 15, cutoffMin = 5) {
  // Work in IST. fromDate is a real Date; convert to IST wall-clock.
  const istNow = new Date(fromDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const cutoff = new Date(istNow);
  cutoff.setHours(cutoffHour, cutoffMin, 0, 0);
  const diffMs = cutoff.getTime() - istNow.getTime();
  const hoursToClose = diffMs / (1000 * 60 * 60);
  return {
    hoursToClose: Math.max(hoursToClose, 0),
    pastCutoff: hoursToClose <= 0,
    istHour: istNow.getHours(),
    istMin: istNow.getMinutes(),
  };
}

/**
 * Expected 1-day move of the underlying (1 standard deviation), in points.
 * Derived from IV: move = spot × IV × √(1 trading day / 365).
 * This is the statistical basis for a REALISTIC same-day target — a move the
 * underlying can actually achieve in one session, instead of a far-off wall.
 */
function expectedDailyMove(spot, ivDecimal) {
  if (!spot || !ivDecimal || ivDecimal <= 0) return 0;
  return spot * ivDecimal * Math.sqrt(1 / 365);
}

/**
 * Project realistic option premium after underlying moves N points,
 * accounting for delta change AND IV crush + theta over `hoursElapsed`.
 *
 * Returns the projected premium per share, with friction.
 */
function projectPremiumWithFriction(S0, K, T0, sigma0, type, underlyingDelta, hoursElapsed = 2, ivCrushPct = 0.10) {
  // Time decays
  const Tnew = Math.max(0.01 / 365, T0 - (hoursElapsed / 24 / 365));

  // IV typically crushes 5-15% on a directional move — model as 10% drop
  const sigmaNew = sigma0 * (1 - ivCrushPct);

  // New spot after underlying move
  const Snew = S0 + underlyingDelta;

  const { price } = blackScholes(Snew, K, Tnew, sigmaNew, type);
  return price;
}


// ============================================================================
// POSITIONING READ GENERATOR — translates verdict into observable directional bias
// Now includes admin-only Black-Scholes Greeks + friction-adjusted P&L projection
// ============================================================================
// Lot sizes per underlying. Static values are the offline fallback; DYNAMIC_LOTS is filled at
// runtime from /api/symbols so the full F&O universe (and any NSE lot revisions) resolve
// correctly without a redeploy.
const LOT_SIZES = { NIFTY: 65, BANKNIFTY: 35, FINNIFTY: 65, MIDCPNIFTY: 140, RELIANCE: 500 };
const DYNAMIC_LOTS = {};
function getLotSize(symbol) {
  const s = (symbol || 'NIFTY').toUpperCase();
  return DYNAMIC_LOTS[s] || LOT_SIZES[s] || 65;
}

function generateTradeIdea(analysis, rows, spot, expiryStr = null, focusStrike = null, lotSize = 65, symbol = 'NIFTY') {
  // Auto-detect the strike step (gap between adjacent strikes) so the trade math works for any
  // underlying. NIFTY is 50; stocks use 2.5 / 5 / 10 / 20 / etc. Uses the most common gap; falls back to 50.
  const strikeStep = (() => {
    if (!rows || rows.length < 2) return 50;
    const ks = [...rows].map(r => r.strike).sort((a, b) => a - b);
    const gaps = {};
    for (let i = 1; i < ks.length; i++) {
      const g = Math.round((ks[i] - ks[i - 1]) * 100) / 100;
      if (g > 0) gaps[g] = (gaps[g] || 0) + 1;
    }
    let best = 50, bestN = 0;
    for (const k of Object.keys(gaps)) { if (gaps[k] > bestN) { bestN = gaps[k]; best = parseFloat(k); } }
    return best || 50;
  })();
  const { verdict, callWalls, putWalls, atmStrike, maxPain, pcr, sessionHigh = null, sessionLow = null } = analysis;
  const score = verdict.score;

  // Determine bias and confidence from verdict score
  let action, confidence, color;
  if (score >= 2.5)      { action = 'BUY_CE';   confidence = 'HIGH';   color = 'emerald'; }
  else if (score >= 1)   { action = 'BUY_CE';   confidence = 'MEDIUM'; color = 'emerald'; }
  else if (score <= -2.5){ action = 'BUY_PE';   confidence = 'HIGH';   color = 'red'; }
  else if (score <= -1)  { action = 'BUY_PE';   confidence = 'MEDIUM'; color = 'red'; }
  else                   { action = 'NO_TRADE'; confidence = 'LOW';    color = 'amber'; }

  if (action === 'NO_TRADE') {
    return {
      action,
      confidence,
      color,
      reason: 'Smart money positioning is balanced. No clear directional edge — either both sides writing equally, or signals contradict. Wait for clearer footprint.',
      strike: atmStrike,
      premium: 0,
      target: 0,
      stopLoss: 0,
      riskReward: '-',
      conditions: [
        'Best observed: no high-conviction read at this interval',
        'Re-evaluate at the next interval for a clearer footprint',
      ],
    };
  }

  // ATM strike in focus for the bias
  const targetStrike = atmStrike;
  const targetRow = rows.find(r => r.strike === targetStrike);
  const premium = action === 'BUY_CE' ? (targetRow?.ce?.ltp || 0) : (targetRow?.pe?.ltp || 0);
  const iv = action === 'BUY_CE' ? (targetRow?.ce?.iv || 0) : (targetRow?.pe?.iv || 0);

  // Continuation / invalidation levels based on walls
  // A "wall" only qualifies as a meaningful target/SL if it's at least MIN_WALL_DISTANCE
  // away from spot. Otherwise we'd pick a wall that's essentially ATM (e.g. picking
  // a strike 10 pts from spot as SL — which gives meaningless premium projections).
  // All distances are expressed as multiples of the underlying's strike step, so they scale:
  // NIFTY (step 50) → 50 / 200 / 100 / 25 (unchanged); a ₹1320 stock (step 10) → 10 / 40 / 20 / 5.
  const MIN_WALL_DISTANCE = strikeStep;            // ≥ 1 strike from spot
  const DEFAULT_TARGET_DISTANCE = strikeStep * 4;  // fallback target when no qualifying wall
  const DEFAULT_SL_DISTANCE = strikeStep * 2;      // fallback stop when no qualifying wall
  const MIN_LEVEL_DISTANCE = strikeStep * 0.5;     // minimum sanity gap from spot
  let target, stopLoss;
  if (action === 'BUY_CE') {
    const wallsAbove = callWalls
      .filter(w => w.strike > spot + MIN_WALL_DISTANCE)
      .sort((a, b) => a.strike - b.strike);
    target = wallsAbove[0]?.strike || (Math.round((spot + DEFAULT_TARGET_DISTANCE) / strikeStep) * strikeStep);
    const wallsBelow = putWalls
      .filter(w => w.strike < spot - MIN_WALL_DISTANCE)
      .sort((a, b) => b.strike - a.strike);
    stopLoss = wallsBelow[0]?.strike || (Math.round((spot - DEFAULT_SL_DISTANCE) / strikeStep) * strikeStep);
  } else {
    const wallsBelow = putWalls
      .filter(w => w.strike < spot - MIN_WALL_DISTANCE)
      .sort((a, b) => b.strike - a.strike);
    target = wallsBelow[0]?.strike || (Math.round((spot - DEFAULT_TARGET_DISTANCE) / strikeStep) * strikeStep);
    const wallsAbove = callWalls
      .filter(w => w.strike > spot + MIN_WALL_DISTANCE)
      .sort((a, b) => a.strike - b.strike);
    stopLoss = wallsAbove[0]?.strike || (Math.round((spot + DEFAULT_SL_DISTANCE) / strikeStep) * strikeStep);
  }

  // === SANITY INVARIANTS (defense in depth) ===
  // Even if wall selection went wrong somehow, target & SL MUST sit on the correct
  // sides of spot for the bias direction. Otherwise the option-premium math goes the wrong way
  // (e.g. SL premium > entry premium for a BUY_PE).

  if (action === 'BUY_CE') {
    // Target must be ABOVE spot, SL must be BELOW spot
    if (!Number.isFinite(target) || target <= spot + MIN_LEVEL_DISTANCE) {
      target = Math.round((spot + DEFAULT_TARGET_DISTANCE) / strikeStep) * strikeStep;
    }
    if (!Number.isFinite(stopLoss) || stopLoss >= spot - MIN_LEVEL_DISTANCE) {
      stopLoss = Math.round((spot - DEFAULT_SL_DISTANCE) / strikeStep) * strikeStep;
    }
  } else {
    // BUY_PE: Target must be BELOW spot, SL must be ABOVE spot
    if (!Number.isFinite(target) || target >= spot - MIN_LEVEL_DISTANCE) {
      target = Math.round((spot - DEFAULT_TARGET_DISTANCE) / strikeStep) * strikeStep;
    }
    if (!Number.isFinite(stopLoss) || stopLoss <= spot + MIN_LEVEL_DISTANCE) {
      stopLoss = Math.round((spot + DEFAULT_SL_DISTANCE) / strikeStep) * strikeStep;
    }
  }

  // Continuation/invalidation distance on the underlying (WALL-BASED — public display)
  const reward = Math.abs(target - spot);
  const risk = Math.abs(spot - stopLoss);
  const riskReward = risk > 0 ? (reward / risk).toFixed(2) + ':1' : '-';

  // ============================================================================
  // REALISTIC SAME-DAY TARGET (admin trade math)
  // ----------------------------------------------------------------------------
  // The wall-based target can be 300+ points away — fine as a structural marker,
  // but NOT achievable in a single session. NIFTY's expected 1-day move is only
  // ~spot × IV × √(1/365). We cap the trade-math target to 0.8× that expected
  // move (high hit-rate calibration) so projected premiums match what the option
  // can realistically reach by the 3:05 PM cut-off — not a multi-day wall.
  //
  // The wall remains a HARD CEILING: never target beyond structural resistance.
  // A small floor (0.3× expected move) prevents an absurdly tight target.
  // ============================================================================
  const TARGET_MULTIPLIER = 0.8;          // 0.8× expected move over the time remaining
  const TARGET_FLOOR_MULT = 0.3;          // never target less than 0.3× that move
  const SL_FLOOR_MULT = 0.3;              // SL must be at least 0.3× that move away (noise filter)

  // ── EXPECTED MOVE (model-free, direction-agnostic) ──────────────────────────
  // The expected move is a property of the UNDERLYING — it must NOT depend on whether
  // we're buying a call or a put. Previously this picked CE-IV for bullish and PE-IV
  // for bearish setups, so the same spot/moment produced different "expected moves" by
  // direction (incoherent), and it imported the feed's ATM IV — which is often an
  // unreliable print (CE and PE ATM IV can differ several vol points, violating
  // put-call parity). The market already prices the expected move directly via the ATM
  // STRADDLE (CE + PE premium), with no model or IV assumption. We use that as primary,
  // and fall back to a sanity-guarded IV only if the straddle is unavailable.
  //
  // Straddle → expected move: a 1-SD move to expiry ≈ 0.85 × ATM straddle premium.
  // Converting a to-expiry move to a 1-day-equivalent: divide by √(days to expiry),
  // since variance scales with time. This also sidesteps the 365-vs-252 day-count
  // question entirely — the straddle is already in the market's own time units.
  const atmRowForMove = rows.find(r => r.strike === atmStrike);
  const STRADDLE_TO_1SD = 0.85;
  const daysLeftForMove = (() => {
    const d = daysToExpiryFromDate(expiryStr);
    return d != null ? d : daysToWeeklyExpiry();
  })();
  const daysToExpiryClamped = Math.max(daysLeftForMove, 0.5); // expiry-day floor

  const atmCeLtp = atmRowForMove?.ce?.ltp || 0;
  const atmPeLtp = atmRowForMove?.pe?.ltp || 0;
  const atmStraddle = atmCeLtp + atmPeLtp;

  // IV-fallback path, sanity-guarded. The two ATM legs SHOULD agree under parity; if
  // one is a garbage print we use the lower of the two valid ones (less likely to be a
  // blown-up print), and reject anything outside a plausible NIFTY band (3%–150%).
  function sanitizeIv(ivPct) {
    if (!ivPct || !isFinite(ivPct) || ivPct < 3 || ivPct > 150) return null;
    return ivPct;
  }
  const ceIvOk = sanitizeIv(atmRowForMove?.ce?.iv);
  const peIvOk = sanitizeIv(atmRowForMove?.pe?.iv);
  // Prefer the average of the two valid legs (parity-consistent); else whichever is
  // valid; else a conservative NIFTY default of 12%.
  let ivForFallback;
  if (ceIvOk != null && peIvOk != null) ivForFallback = (ceIvOk + peIvOk) / 2;
  else ivForFallback = ceIvOk ?? peIvOk ?? 12;

  let fullDayMove;
  let moveBasis;
  if (atmStraddle > 0.5) {
    // Primary: model-free straddle. Expected move to expiry, then per-day equivalent.
    const emToExpiry = STRADDLE_TO_1SD * atmStraddle;
    fullDayMove = emToExpiry / Math.sqrt(daysToExpiryClamped);
    moveBasis = 'straddle';
  } else {
    // Fallback: sanity-guarded IV (direction-agnostic — single underlying vol).
    fullDayMove = expectedDailyMove(spot, ivForFallback / 100);
    moveBasis = 'iv-fallback';
  }

  // CRITICAL: the target must reflect the move achievable in the time LEFT until the
  // same-day exit, not a full day. Vol scales with √time, so the achievable move is
  // fullDayMove × √(fracLeft). Without this, a target set late in the day asks for a
  // move several times larger than the clock supports and will almost never be hit.
  //
  // CONSISTENCY: we project the option's value to a 3:05 PM exit (HOLDING_HOURS below
  // counts to the same 3:05 cutoff). So the session window used here MUST also end at
  // 3:05 — measuring "time to 3:05" against a window that ends at 3:30 would understate
  // the fraction. Trading window = 9:15 → 15:05 = 350 minutes. Both ends match the cutoff.
  const CUTOFF_HOUR = 15, CUTOFF_MIN = 5;        // 3:05 PM IST same-day exit
  const SESSION_OPEN_MIN = 9 * 60 + 15;          // 9:15 AM IST
  const SESSION_MINUTES = (CUTOFF_HOUR * 60 + CUTOFF_MIN) - SESSION_OPEN_MIN; // 350
  const cutoffForMove = hoursToDailyCutoff(new Date(), CUTOFF_HOUR, CUTOFF_MIN);
  const minutesLeft = Math.max(cutoffForMove.hoursToClose * 60, 0);
  // Clamp: a tiny sliver of time shouldn't produce a ~0 target (floor 4%); and a
  // pre-open / early fetch caps at 1.0 (can't have more than a full window left).
  const fracSessionLeft = Math.min(1, Math.max(minutesLeft / SESSION_MINUTES, 0.04));
  const expMove = fullDayMove * Math.sqrt(fracSessionLeft);

  // Realistic target distance: capped between floor and the wall distance
  let realisticTargetDistance = TARGET_MULTIPLIER * expMove;
  const wallTargetDistance = reward; // distance to the wall
  // Don't exceed the wall (structural ceiling) and don't go below the floor
  realisticTargetDistance = Math.min(realisticTargetDistance, wallTargetDistance);
  realisticTargetDistance = Math.max(realisticTargetDistance, TARGET_FLOOR_MULT * expMove);
  // Guard: if expMove is unavailable (no IV in the chain), DON'T fall back to the
  // structural wall — that reintroduces the unreachable-target bug (a wall can be
  // 300+ pts away, impossible in one session). Instead use a sane default: a typical
  // session move of ~0.4% of spot, still scaled by the fraction of session left,
  // and never exceeding the wall.
  if (!expMove || expMove <= 0) {
    const defaultMove = spot * 0.004 * Math.sqrt(fracSessionLeft);
    realisticTargetDistance = Math.min(defaultMove, wallTargetDistance);
  }

  const directionForTarget = action === 'BUY_CE' ? 1 : -1;
  const realisticTarget = spot + (directionForTarget * realisticTargetDistance);

  // ── ETA TO TARGET ───────────────────────────────────────────────────────────
  // How long for the underlying to travel realisticTargetDistance? Volatility
  // scales with √time, so inverting: t = SESSION_MINUTES × (D / fullDayMove)².
  // This is the expected time for a directional move of that size. The actual
  // arrival time is a right-skewed distribution (clean moves arrive sooner, choppy
  // ones much later), so we give an asymmetric band, not a false-precise single time.
  let etaMinutes = null, etaFast = null, etaSlow = null, etaFeasible = null, etaCloserTargetPts = null;
  if (fullDayMove > 0 && realisticTargetDistance > 0) {
    etaMinutes = SESSION_MINUTES * Math.pow(realisticTargetDistance / fullDayMove, 2);
    etaFast = 0.4 * etaMinutes;   // clean directional move
    etaSlow = 2.5 * etaMinutes;   // choppy / meandering (right-skewed tail)
    // Feasible if the expected ETA fits inside the time remaining to the cutoff.
    etaFeasible = etaMinutes <= minutesLeft;
    if (!etaFeasible && minutesLeft > 0) {
      // Suggest a closer target reachable in ~70% of the time left (leaves a buffer).
      etaCloserTargetPts = Math.round(fullDayMove * Math.sqrt((0.7 * minutesLeft) / SESSION_MINUTES));
    }
  }
  // etaFeasible stays null when ETA is incomputable (no IV) — the UI treats null as
  // "unknown" and shows neither the green nor the amber state, rather than a false OK.

  // SL distance: bounded BOTH ways. Floor (≥0.3× expMove) so we're not stopped on
  // noise; CEILING (≤1.0× expMove, and never more than the wall) so the stop isn't
  // hundreds of points away — a far wall projects the option to ~₹0, which both
  // misrepresents the real risk and makes "loss per lot" the entire premium. A
  // same-day stop should sit within roughly one expected session move of spot.
  let realisticSLDistance = risk; // wall-based distance (starting point)
  const slFloor = SL_FLOOR_MULT * expMove;
  const slCeiling = expMove > 0 ? expMove : spot * 0.004 * Math.sqrt(fracSessionLeft);
  if (expMove > 0) {
    realisticSLDistance = Math.min(realisticSLDistance, slCeiling); // cap to ~1× expected move
    realisticSLDistance = Math.max(realisticSLDistance, slFloor);   // floor for noise
  } else {
    realisticSLDistance = Math.min(realisticSLDistance, slCeiling);
  }
  const directionForSL = action === 'BUY_CE' ? -1 : 1;
  const realisticSL = spot + (directionForSL * realisticSLDistance);


  // Context observations
  const conditions = [];

  if (confidence === 'HIGH') {
    conditions.push(`Score ${score.toFixed(1)} — multiple signals aligned, footprint is strong`);
  } else {
    conditions.push(`Score ${score.toFixed(1)} — moderate signal alignment, footprint is partial`);
  }

  if (iv > 18) {
    conditions.push(`IV ${iv.toFixed(1)}% is elevated — option premium is rich at this strike`);
  } else if (iv < 10) {
    conditions.push(`IV ${iv.toFixed(1)}% is low — option premium is cheap but vulnerable to IV crush around events`);
  }

  const painAlignsWithTrade =
    (action === 'BUY_CE' && maxPain > spot) ||
    (action === 'BUY_PE' && maxPain < spot);
  if (painAlignsWithTrade) {
    conditions.push(`Max Pain (${maxPain}) sits on the same side — writer's gravity confirms the bias`);
  } else {
    conditions.push(`Max Pain (${maxPain}) sits on the opposite side — writers may pull price against this bias`);
  }

  if (parseFloat(riskReward) < 1.5) {
    conditions.push(`Continuation/invalidation ratio is thin (${riskReward}) — limited room before bias would be invalidated`);
  } else if (parseFloat(riskReward) >= 2.5) {
    conditions.push(`Continuation/invalidation ratio is favourable (${riskReward}) — wide runway if bias plays out`);
  }

  const hour = new Date().getHours();
  if (hour >= 14) {
    conditions.push(`Late session — theta decay accelerates into close; option buyers face quick erosion`);
  }

  // ============ ADMIN-ONLY: Option-level trade math ============
  // Now computes trade math for MULTIPLE strike depths so admin can compare
  // ATM (high gamma, lottery ticket) vs deeper ITM (lower decay, more directional).
  const NIFTY_LOT_SIZE = lotSize;
  const optionType = action === 'BUY_CE' ? 'CE' : 'PE';
  const ivDecimal = iv / 100;

  // TIME TO EXPIRY — prefer the real expiry date from the chain; fall back to weekly calc.
  const daysFromExpiry = daysToExpiryFromDate(expiryStr);
  const daysLeft = daysFromExpiry != null ? daysFromExpiry : daysToWeeklyExpiry();
  const T = Math.max(daysLeft / 365, 0.4 / 365);

  // SAME-DAY EXIT by 3:05 PM cut-off. The holding window is the time from NOW until
  // the cut-off — NOT a fixed 2-hour guess. This makes the projection a same-day move.
  const cutoff = cutoffForMove; // same 3:05 cutoff used for target scaling above
  const pastCutoff = cutoff.pastCutoff;
  // Holding hours = time until 3:05 PM (floored to 0.5h so projection is sane if near close)
  const HOLDING_HOURS = Math.max(cutoff.hoursToClose, 0.5);
  // Smaller IV crush for a partial same-day move (we're targeting 0.8× expected move, not a gap)
  const IV_CRUSH_PCT = 0.05;

  const directionMult = action === 'BUY_CE' ? 1 : -1;
  // Use REALISTIC same-day distances (capped at 0.8× expected move), not wall distances
  const realisticReward = Math.abs(realisticTarget - spot);
  const realisticRisk = Math.abs(spot - realisticSL);
  const underlyingDeltaToTarget = realisticReward * directionMult;
  const underlyingDeltaToSL = realisticRisk * (-directionMult);

  /**
   * Compute full trade math for a given strike.
   * Returns the same fields the UI needs, scoped to one strike.
   */
  function computeStrikeMath(strikeForCalc, depthLabel, isDefault) {
    // Find LTP for this strike from the chain (fall back to BS-theoretical if not traded)
    const row = rows.find(r => r.strike === strikeForCalc);
    const liveLtp = optionType === 'CE' ? (row?.ce?.ltp || 0) : (row?.pe?.ltp || 0);
    const theoretical = blackScholes(spot, strikeForCalc, T, ivDecimal, optionType);
    const entryPx = liveLtp > 0 ? liveLtp : Math.max(theoretical.price, 0.05);

    // Greeks at entry
    const g = blackScholes(spot, strikeForCalc, T, ivDecimal, optionType);
    const deltaAbs = Math.abs(g.delta);
    const thetaAbs = Math.abs(g.theta);

    // Clean projection — pure delta math at the realistic same-day target/SL, no friction
    const gT = blackScholes(spot + underlyingDeltaToTarget, strikeForCalc, T, ivDecimal, optionType);
    const gSL = blackScholes(spot + underlyingDeltaToSL, strikeForCalc, T, ivDecimal, optionType);
    let tgtClean = Math.max(gT.price, 0.05);
    let slClean = Math.max(gSL.price, 0.05);

    // Friction-adjusted — theta over the SAME-DAY holding window (now → 3:05 PM)
    let tgtFriction = Math.max(
      projectPremiumWithFriction(spot, strikeForCalc, T, ivDecimal, optionType, underlyingDeltaToTarget, HOLDING_HOURS, IV_CRUSH_PCT),
      0.05
    );
    let slFriction = Math.max(
      projectPremiumWithFriction(spot, strikeForCalc, T, ivDecimal, optionType, underlyingDeltaToSL, HOLDING_HOURS, 0),
      0.05
    );

    // Invariant enforcement — the DISPLAYED values are the friction-adjusted ones,
    // so the invariant (slPremium < entryPremium < targetPremium) must be enforced on
    // THOSE, not on the clean values. Previously this checked tgtClean while the UI
    // showed tgtFriction, so a friction target dragged below entry by theta/IV-crush
    // slipped through and displayed "target < entry" — impossible for a long option.
    //
    // If the friction-adjusted target can't clear entry, the projected underlying move
    // is too small to overcome same-day decay at this strike. We floor the target just
    // above entry so the level is coherent, and flag the trade as decay-challenged so
    // the UI can warn rather than imply a clean profit.
    let decayChallenged = false;
    if (tgtFriction <= entryPx) {
      decayChallenged = true;
      tgtFriction = entryPx * 1.05; // minimal coherent target above entry
    }
    if (tgtClean <= entryPx) {
      tgtClean = entryPx * 1.5;
    }
    if (slFriction >= entryPx) {
      slFriction = entryPx * 0.7;
    }
    if (slClean >= entryPx) {
      slClean = entryPx * 0.5;
    }

    // P&L
    const profitLotClean = (tgtClean - entryPx) * NIFTY_LOT_SIZE;
    const lossLotClean = (entryPx - slClean) * NIFTY_LOT_SIZE;
    const profitLot = (tgtFriction - entryPx) * NIFTY_LOT_SIZE;
    const lossLot = (entryPx - slFriction) * NIFTY_LOT_SIZE;
    const capital = entryPx * NIFTY_LOT_SIZE;
    const roi = capital > 0 ? (profitLot / capital) * 100 : 0;
    const roiClean = capital > 0 ? (profitLotClean / capital) * 100 : 0;
    const drag = profitLotClean - profitLot;
    const dragPct = profitLotClean > 0 ? (drag / profitLotClean) * 100 : 0;
    const hourlyTheta = (thetaAbs / 24) * NIFTY_LOT_SIZE;

    return {
      strike: strikeForCalc,
      depthLabel,
      isDefault: !!isDefault,
      entryPremium: entryPx,
      ltpFromChain: liveLtp,
      targetPremiumPerShare: tgtFriction,
      slPremiumPerShare: slFriction,
      targetPremiumClean: tgtClean,
      slPremiumClean: slClean,
      profitPerLot: profitLot,
      lossPerLot: lossLot,
      profitPerLotClean: profitLotClean,
      lossPerLotClean: lossLotClean,
      capitalRequiredPerLot: capital,
      lotSize: NIFTY_LOT_SIZE,
      returnOnCapitalPct: roi,
      returnOnCapitalPctClean: roiClean,
      entryDelta: deltaAbs,
      entryTheta: thetaAbs,
      entryVega: g.vega,
      entryGamma: g.gamma,
      frictionDrag: drag,
      frictionDragPct: dragPct,
      hourlyThetaCostPerLot: hourlyTheta,
      decayChallenged,
    };
  }

  // Strike-depth definitions:
  // Three CONSECUTIVE strikes for an even, readable ladder (no gaps): ATM, 1-ITM, 2-ITM.
  // For BUY_PE (bearish) — ITM means strike ABOVE spot, so +strikeStep per depth.
  // For BUY_CE (bullish) — ITM means strike BELOW spot, so −strikeStep per depth.
  // ATM is the closest strike to spot (= targetStrike). 1-ITM and 2-ITM step one strike
  // at a time INTO the money, using the underlying's actual strike step (50 for NIFTY,
  // 10/20/etc. for stocks).
  const directionToITM = action === 'BUY_CE' ? -1 : +1; // calls go ITM as strike falls; puts go ITM as strike rises
  const atmStrikeForOptions = targetStrike;
  const strike1ITM = atmStrikeForOptions + (directionToITM * 1 * strikeStep);
  const strike2ITM = atmStrikeForOptions + (directionToITM * 2 * strikeStep);

  // Build the three trade options. 1-ITM (the middle) is the balanced default.
  const tradeOptions = [
    computeStrikeMath(atmStrikeForOptions, 'ATM',   false),
    computeStrikeMath(strike1ITM,          '1 ITM', true), // DEFAULT
    computeStrikeMath(strike2ITM,          '2 ITM', false),
  ];

  // For backwards compatibility with existing journal/UI code, expose the DEFAULT (2-ITM) as top-level fields
  const defaultOpt = tradeOptions.find(o => o.isDefault) || tradeOptions[0];

  // STRIKE FOCUS — if the user picked/clicked a specific strike, compute its full trade
  // math through the SAME per-strike engine (so target/SL/premium/Greeks are consistent
  // with the three default depths). Direction follows the verdict (CE when bullish, PE
  // when bearish). Only valid if the strike exists in the chain.
  let focusedOption = null;
  if (focusStrike != null) {
    const fs = Math.round(Number(focusStrike));
    if (rows.some(r => r.strike === fs)) {
      const depthVsAtm = Math.round((fs - atmStrike) / strikeStep);
      const label = depthVsAtm === 0 ? 'ATM' : `${Math.abs(depthVsAtm)} strike${Math.abs(depthVsAtm) > 1 ? 's' : ''} ${depthVsAtm > 0 ? 'OTM' : 'ITM'}`;
      focusedOption = computeStrikeMath(fs, label, false);
    }
  }

  // ── TRAILING STOP (advisory · fixed-distance, volatility-scaled) ─────────────
  // Rule: hold the initial SL until the trade is up ~1R (favorable move ≥ initial
  // risk = "move to breakeven"), then trail the favorable SESSION EXTREME (high-water
  // mark from auto-fetch) by a fixed, volatility-scaled distance (0.25× expected move).
  // It only ever tightens, never loosens. This is NOT structural/swing-based — true
  // swing trailing needs intraday candle data (a planned upgrade); this is an honest
  // volatility-distance trail behind the best price the move has reached.
  const initialRiskPts = Math.abs(spot - realisticSL);

  // Bad-tick guard: ignore a session extreme that is implausibly far from spot — a
  // single glitchy print shouldn't poison the high-water mark for the rest of the day.
  // Cap the usable extreme at 8× the expected daily move from spot (a real intraday
  // move never approaches that; a 10000 print on a 23000 index clearly would).
  const maxPlausibleExcursion = (fullDayMove > 0 ? fullDayMove : spot * 0.02) * 8;
  const rawExtreme = action === 'BUY_CE'
    ? (sessionHigh != null ? sessionHigh : spot)
    : (sessionLow != null ? sessionLow : spot);
  let favExtreme = rawExtreme;
  let badTick = false;
  if (Math.abs(rawExtreme - spot) > maxPlausibleExcursion) {
    favExtreme = spot; // discard the implausible extreme
    badTick = true;
  }

  // Profit run of the (validated) extreme beyond spot, in the favorable direction.
  const favRunBeyondSpot = action === 'BUY_CE' ? (favExtreme - spot) : (spot - favExtreme);
  const trailActive = initialRiskPts > 0 && favRunBeyondSpot >= initialRiskPts;

  // Volatility-scaled trailing distance: 0.25× expected move, clamped so it's never
  // wider than the initial 1R stop (a trail must always be ≤ entry SL distance).
  const trailBuffer = Math.min(
    Math.max(expMove * 0.25, spot * 0.001),
    Math.max(initialRiskPts, spot * 0.001)
  );

  let trailingStop;
  if (trailActive) {
    const trailSpot = action === 'BUY_CE' ? favExtreme - trailBuffer : favExtreme + trailBuffer;
    // Premium AT the trail level. A trail is a price level the option can touch at any
    // time, NOT an end-of-session exit — so we value it at the CURRENT time-to-expiry
    // (Black-Scholes), not via the full holding-period theta+IV-crush projection used
    // for target/SL (which would wrongly understate a level that may hit immediately).
    // A small spread haircut keeps it realistic vs the mid-price.
    const Ttrail = Math.max(daysLeft / 365, 0.4 / 365);
    const trailMid = blackScholes(trailSpot, defaultOpt.strike, Ttrail, ivDecimal, optionType).price;
    const trailPrem = Math.max(trailMid * 0.985, 0.05); // ~1.5% spread haircut
    trailingStop = {
      activated: true,
      trailSpot: Math.round(trailSpot),
      trailPremiumApprox: Math.round(trailPrem * 100) / 100,
      favorableExtreme: Math.round(favExtreme),
      trailBuffer: Math.round(trailBuffer),
      locksProfit: trailPrem > defaultOpt.entryPremium,
      badTick,
    };
  } else {
    trailingStop = {
      activated: false,
      favorableExtreme: Math.round(favExtreme),
      trailBuffer: Math.round(trailBuffer),
      badTick,
      activationNote: action === 'BUY_CE'
        ? `Activates once ${symbol} runs ~${Math.round(initialRiskPts)} pts above ${Math.round(spot)} (up 1R). Until then hold fixed SL ${Math.round(realisticSL)}.`
        : `Activates once ${symbol} runs ~${Math.round(initialRiskPts)} pts below ${Math.round(spot)} (up 1R). Until then hold fixed SL ${Math.round(realisticSL)}.`,
    };
  }

  // ============================================================================
  // NEXT-DAY OPEN MODEL — honest probabilistic range + positioning lean. NOT a
  // point prediction. Overnight gaps are driven by global cues the option chain
  // can't see (GIFT Nifty, US close, crude, news). We show the statistically
  // expected range (IV-based) and a soft lean from positioning — never a number
  // dressed up as a forecast.
  // ============================================================================
  // 1-sigma overnight move from ATM IV (same expected-move math used elsewhere)
  const overnightSigma = expectedDailyMove(spot, ivDecimal);
  const nextDayModel = {
    center: Math.round(spot),
    sigma: Math.round(overnightSigma),
    band68: [Math.round(spot - overnightSigma), Math.round(spot + overnightSigma)],
    band95: [Math.round(spot - 2 * overnightSigma), Math.round(spot + 2 * overnightSigma)],
    // Positioning lean — a soft tilt, not a prediction
    maxPainPull: Math.round(maxPain - spot),       // + = gravity above spot, − = below
    pcr,
    leanText: (() => {
      const signals = [];
      const mp = maxPain - spot;
      if (Math.abs(mp) >= 25) signals.push(mp > 0 ? 'max pain above spot (mild upward gravity)' : 'max pain below spot (mild downward gravity)');
      if (pcr < 0.9) signals.push('PCR < 0.9 — heavier call writing (bearish lean)');
      else if (pcr > 1.1) signals.push('PCR > 1.1 — heavier put writing (bullish lean)');
      if (signals.length === 0) return 'Positioning is balanced — no clear overnight lean';
      return signals.join(' · ');
    })(),
  };

  // ============================================================================
  // SPOT ENTRY TRIGGER + CONFIRMATION RULE
  // Don't enter just because a bias exists — wait for spot to confirm by breaking
  // a near level. For PE bias: break BELOW nearest support. For CE bias: break
  // ABOVE nearest resistance. A buffer (~0.08% of spot) filters intrabar whipsaw.
  // ============================================================================
  const stepSize = strikeStep;
  const buffer = spot * 0.0008; // ~19 pts at 23900
  let entryTrigger, entryCondition, entryConfirmation, noEntryNote;
  if (action === 'BUY_PE') {
    const supportStrike = Math.floor(spot / stepSize) * stepSize;
    entryTrigger = Math.round(supportStrike - buffer);
    entryCondition = `Enter PUT only if spot breaks below ${entryTrigger}`;
    entryConfirmation = `Wait for a 5-min candle to close below ${entryTrigger} (avoid intrabar whipsaw)`;
    noEntryNote = `If spot holds above ${supportStrike}, bias not confirmed — wait`;
  } else if (action === 'BUY_CE') {
    const resistStrike = Math.ceil(spot / stepSize) * stepSize;
    entryTrigger = Math.round(resistStrike + buffer);
    entryCondition = `Enter CALL only if spot breaks above ${entryTrigger}`;
    entryConfirmation = `Wait for a 5-min candle to close above ${entryTrigger} (avoid intrabar whipsaw)`;
    noEntryNote = `If spot holds below ${resistStrike}, bias not confirmed — wait`;
  }
  const entryTriggerModel = { entryTrigger, entryCondition, entryConfirmation, noEntryNote };

  // Expected value (probability-weighted) — same formula the detailed card uses, lifted
  // here so the top-level decision card can show it without duplicating logic. Uses the
  // wall-based reward/risk and a 1-SD daily move (252 trading days) from the ATM IV.
  const evExpectedMove = iv > 0 ? spot * (iv / 100) * Math.sqrt(1 / 252) : 0;
  const evTouchProb = (distance, em) => {
    if (em <= 0) return 0;
    const z = Math.abs(distance) / em;
    if (z < 0.3) return 88; if (z < 0.6) return 75; if (z < 0.9) return 60;
    if (z < 1.2) return 46; if (z < 1.5) return 33; if (z < 1.9) return 22;
    if (z < 2.4) return 13; return 7;
  };
  const evTargetProb = evTouchProb(reward, evExpectedMove);
  const evSlProb = evTouchProb(risk, evExpectedMove);
  const expectedValuePts = Math.round((evTargetProb / 100) * reward - (evSlProb / 100) * risk);

  return {
    action,
    confidence,
    color,
    target,
    stopLoss,
    riskReward,
    reward,
    risk,
    expectedValuePts,
    evTargetProb,
    evSlProb,
    conditions,
    iv,
    // === Next-day open model + entry trigger ===
    nextDayModel,
    entryTriggerModel,
    // === Default (2-ITM) values mapped to legacy field names for compatibility ===
    strike: defaultOpt.strike,
    premium: defaultOpt.entryPremium,
    entryPremium: defaultOpt.entryPremium,
    targetPremiumPerShare: defaultOpt.targetPremiumPerShare,
    slPremiumPerShare: defaultOpt.slPremiumPerShare,
    profitPerLot: defaultOpt.profitPerLot,
    lossPerLot: defaultOpt.lossPerLot,
    capitalRequiredPerLot: defaultOpt.capitalRequiredPerLot,
    returnOnCapitalPct: defaultOpt.returnOnCapitalPct,
    lotSize: NIFTY_LOT_SIZE,
    targetPremiumClean: defaultOpt.targetPremiumClean,
    slPremiumClean: defaultOpt.slPremiumClean,
    profitPerLotClean: defaultOpt.profitPerLotClean,
    lossPerLotClean: defaultOpt.lossPerLotClean,
    returnOnCapitalPctClean: defaultOpt.returnOnCapitalPctClean,
    entryDelta: defaultOpt.entryDelta,
    entryTheta: defaultOpt.entryTheta,
    entryVega: defaultOpt.entryVega,
    entryGamma: defaultOpt.entryGamma,
    frictionDrag: defaultOpt.frictionDrag,
    frictionDragPct: defaultOpt.frictionDragPct,
    hourlyThetaCostPerLot: defaultOpt.hourlyThetaCostPerLot,
    daysLeft,
    ivCrushAssumedPct: IV_CRUSH_PCT * 100,
    holdingHours: HOLDING_HOURS,
    // === NEW: Full array of strike options for side-by-side comparison ===
    tradeOptions,
    focusedOption,
    directionType: action === 'BUY_CE' ? 'CE' : action === 'BUY_PE' ? 'PE' : null,
    // === NEW: realistic same-day targeting metadata ===
    realisticTarget: Math.round(realisticTarget),
    realisticSL: Math.round(realisticSL),
    expectedDailyMovePts: Math.round(expMove),
    fullDayMovePts: Math.round(fullDayMove),
    expMoveBasis: moveBasis,
    minutesLeftToCutoff: Math.round(minutesLeft),
    // ETA to target
    etaMinutes: etaMinutes != null ? Math.round(etaMinutes) : null,
    etaFast: etaFast != null ? Math.round(etaFast) : null,
    etaSlow: etaSlow != null ? Math.round(etaSlow) : null,
    etaFeasible,
    etaCloserTargetPts,
    trailingStop,
    realisticTargetDistance: Math.round(realisticTargetDistance),
    targetMultiplier: TARGET_MULTIPLIER,
    wallTarget: target,       // the structural wall (for reference)
    wallStopLoss: stopLoss,
    pastCutoff,
    hoursToClose: cutoff.hoursToClose,
    expiryDate: expiryStr || null,
  };
}

// Builds a compact, loggable record of one analysis — every factor + the recommendation levels.
// This is the row the validation track records each time the user Analyzes; the outcome scorer
// (next phase) later fills in what actually happened. Pure function so the harness can check it.
function buildSignalRecord({ analysis, idea, symbol, spot, openSpot, expiry, ict }) {
  const v = analysis?.verdict || {};
  const action = idea?.action || null;
  const et = idea?.entryTriggerModel || {};
  return {
    symbol: symbol || null,
    spot: spot ?? null,
    dayOpen: openSpot ?? null,
    expiry: expiry ?? null,
    dte: idea?.daysLeft ?? null,
    // verdict
    score: v.score ?? null,
    verdict: v.label ?? null,
    divergence: !!v.divergence,
    // positioning
    pcr: analysis?.pcr ?? null,
    maxPain: analysis?.maxPain ?? null,
    atmStrike: analysis?.atmStrike ?? null,
    // gamma
    gammaPin: analysis?.peakGammaStrike ?? null,
    gammaFlip: analysis?.gammaFlip ?? null,
    gammaRegime: analysis?.gammaRegime ?? null,
    gexInverted: !!analysis?.gexInverted,
    // recommendation
    action,
    confidence: idea?.confidence ?? null,
    recoStrike: idea?.strike ?? null,
    recoType: action ? (action.includes('CE') ? 'CE' : action.includes('PE') ? 'PE' : null) : null,
    recoEntry: idea?.entryPremium ?? null,
    spotTarget: idea?.target ?? null,
    spotSL: idea?.stopLoss ?? null,
    entryTrigger: et.entryTrigger ?? null,
    // expected value
    ev: idea?.expectedValuePts ?? null,
    evTargetProb: idea?.evTargetProb ?? null,
    evSlProb: idea?.evSlProb ?? null,
    iv: idea?.iv ?? null,
    riskReward: idea?.riskReward ?? null,
    // ICT (if a top-down was run)
    ictBias: ict?.bias ?? null,
    ictStatus: ict?.status ?? null,
    ictConfluence: ict?.confluence?.level ?? null,
    // outcome fields — filled later by the scorer
    outcome: null, // 'target' | 'sl' | 'timeout' | null
    outcomeAt: null,
    mfePts: null,
    maePts: null,
  };
}

function compareSnapshots(curr, prev) {
  if (!curr || !prev) return null;
  const flips = [];
  for (const cr of curr.callBuildUp) {
    const prevCall = prev.callBuildUp.find(p => p.strike === cr.strike);
    if (prevCall && Math.sign(prevCall.ce.chngOi) !== Math.sign(cr.ce.chngOi) && Math.abs(cr.ce.chngOi) > 10000) {
      flips.push(`Call ${cr.strike}: flipped from ${prevCall.ce.chngOi > 0 ? 'writing' : 'covering'} to ${cr.ce.chngOi > 0 ? 'writing' : 'covering'}`);
    }
  }
  for (const pr of curr.putBuildUp) {
    const prevPut = prev.putBuildUp.find(p => p.strike === pr.strike);
    if (prevPut && Math.sign(prevPut.pe.chngOi) !== Math.sign(pr.pe.chngOi) && Math.abs(pr.pe.chngOi) > 10000) {
      flips.push(`Put ${pr.strike}: flipped from ${prevPut.pe.chngOi > 0 ? 'writing' : 'covering'} to ${pr.pe.chngOi > 0 ? 'writing' : 'covering'}`);
    }
  }
  return {
    flips,
    pcrShift: curr.pcr - prev.pcr,
    maxPainShift: curr.maxPain - prev.maxPain,
    scoreShift: curr.verdict.score - prev.verdict.score,
  };
}

function fmt(n) {
  if (n === 0 || n == null) return '0';
  const abs = Math.abs(n);
  if (abs >= 10000000) return (n / 10000000).toFixed(2) + 'Cr';
  if (abs >= 100000) return (n / 100000).toFixed(2) + 'L';
  if (abs >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toFixed(0);
}

function fmtPlain(n) {
  if (n == null) return '-';
  return n.toLocaleString('en-IN');
}

// Auto-detect which interval the current time best matches
function detectCurrentInterval() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const targets = [
    { label: '9:20 AM', mins: 9 * 60 + 20 },
    { label: '11:00 AM', mins: 11 * 60 },
    { label: '1:00 PM', mins: 13 * 60 },
    { label: '3:00 PM', mins: 15 * 60 },
  ];
  let best = targets[0], bestDist = Math.abs(minutes - targets[0].mins);
  for (const t of targets) {
    const d = Math.abs(minutes - t.mins);
    if (d < bestDist) { bestDist = d; best = t; }
  }
  return best.label;
}

// ============================================================================
// MAIN APP
// ============================================================================
export default function App() {
  const [authState, setAuthState] = useState({ status: 'loading', user: null });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated) {
          setAuthState({ status: 'authed', user: { email: data.email, isAdmin: data.isAdmin } });
        } else {
          setAuthState({ status: 'guest', user: null });
        }
      } catch (e) {
        setAuthState({ status: 'guest', user: null });
      }
    })();
  }, []);

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (e) {}
    setAuthState({ status: 'guest', user: null });
  };

  if (authState.status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (authState.status === 'guest') {
    return <Login onAuthenticated={(data) => setAuthState({ status: 'authed', user: { email: data.email, isAdmin: data.isAdmin } })} />;
  }

  return <MainApp user={authState.user} onLogout={handleLogout} />;
}

// Is the NSE market currently open? (Mon-Fri, 9:15-3:30 IST, excluding holidays)
// Gates auto-fetch so we don't poll a closed market.
function isMarketOpenNow(now = new Date()) {
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const day = ist.getDay();
  if (day === 0 || day === 6) return false;
  const iso = `${ist.getFullYear()}-${String(ist.getMonth() + 1).padStart(2, '0')}-${String(ist.getDate()).padStart(2, '0')}`;
  if (typeof NSE_HOLIDAYS_2026 !== 'undefined' && NSE_HOLIDAYS_2026.has(iso)) return false;
  const mins = ist.getHours() * 60 + ist.getMinutes();
  return mins >= (9 * 60 + 15) && mins <= (15 * 60 + 30);
}

// Searchable symbol picker — type to filter the full F&O universe (indices + ~180 stocks),
// shows each underlying's lot size, indices listed first. Falls back to the static list offline.
// ICT chart — custom SVG candlestick view with structure overlays (Recharts has no candlesticks).
// Reuses the pure detectors. Draws last ~80 candles + nearest BSL/SSL, recent OB/FVG zones,
// sweep markers, last MSS, and the premium/discount midline.
function ICTChart({ candles, interval }) {
  if (!candles || candles.length < 5) return <div className="text-[11px] text-slate-400 font-mono">Not enough candles to chart.</div>;
  const view = scopeCandles(candles, interval);
  const swings = detectSwings(view, 2);
  const pools = liquidityPools(swings);
  const sweeps = detectSweeps(view, swings).slice(-4);
  const mssAll = detectMSS(view, swings);
  const lastMss = mssAll[mssAll.length - 1] || null;
  const obs = freshZones(markMitigated(detectOrderBlocks(view), view)).slice(-3);
  const fvgs = freshZones(markMitigated(detectFVGs(view), view)).slice(-4);
  const price = view[view.length - 1].c;
  const pd = premiumDiscount(swings, price);

  const W = 920, H = 440, padR = 60, padB = 20, padT = 8;
  const plotW = W - padR, plotH = H - padB - padT;
  const n = view.length, cw = plotW / n, bodyW = Math.max(1.5, cw * 0.6);
  const lo = Math.min(...view.map(c => c.l)), hi = Math.max(...view.map(c => c.h));
  const pad = (hi - lo) * 0.06 || 1, yMin = lo - pad, yMax = hi + pad;
  const x = i => i * cw + cw / 2;
  const y = p => padT + (yMax - p) / (yMax - yMin) * plotH;
  const UP = '#16a34a', DN = '#dc2626';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }} fontFamily="monospace">
      {/* premium/discount midline */}
      {pd && <>
        <line x1="0" y1={y(pd.mid)} x2={plotW} y2={y(pd.mid)} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 4" />
        <text x={plotW + 3} y={y(pd.mid) + 3} fontSize="9" fill="#94a3b8">EQ {Math.round(pd.mid)}</text>
        <text x="4" y={y(pd.high) + 10} fontSize="8" fill="#cbd5e1">premium</text>
        <text x="4" y={y(pd.low) - 4} fontSize="8" fill="#cbd5e1">discount</text>
      </>}

      {/* OB zones (span from the OB candle to the right edge) */}
      {obs.map((o, k) => (
        <g key={`ob${k}`}>
          <rect x={x(o.idx)} y={y(o.high)} width={plotW - x(o.idx)} height={Math.max(1, y(o.low) - y(o.high))}
            fill={o.type === 'bullish' ? 'rgba(22,163,74,0.10)' : 'rgba(220,38,38,0.10)'}
            stroke={o.type === 'bullish' ? 'rgba(22,163,74,0.5)' : 'rgba(220,38,38,0.5)'} strokeWidth="0.75" />
          <text x={plotW + 3} y={y((o.high + o.low) / 2) + 3} fontSize="8" fill={o.type === 'bullish' ? UP : DN}>OB</text>
        </g>
      ))}

      {/* FVG zones */}
      {fvgs.map((f, k) => (
        <rect key={`fvg${k}`} x={x(f.idx)} y={y(f.high)} width={plotW - x(f.idx)} height={Math.max(1, y(f.low) - y(f.high))}
          fill="rgba(96,165,250,0.12)" stroke="rgba(96,165,250,0.45)" strokeWidth="0.5" strokeDasharray="3 2" />
      ))}

      {/* nearest BSL / SSL */}
      {pools.bsl[0] && <>
        <line x1="0" y1={y(pools.bsl[0].price)} x2={plotW} y2={y(pools.bsl[0].price)} stroke="#ef4444" strokeWidth="1" strokeDasharray="5 3" />
        <text x={plotW + 3} y={y(pools.bsl[0].price) + 3} fontSize="9" fill="#ef4444">BSL {Math.round(pools.bsl[0].price)}</text>
      </>}
      {pools.ssl[0] && <>
        <line x1="0" y1={y(pools.ssl[0].price)} x2={plotW} y2={y(pools.ssl[0].price)} stroke="#22c55e" strokeWidth="1" strokeDasharray="5 3" />
        <text x={plotW + 3} y={y(pools.ssl[0].price) + 3} fontSize="9" fill="#22c55e">SSL {Math.round(pools.ssl[0].price)}</text>
      </>}

      {/* last MSS */}
      {lastMss && <>
        <line x1={x(lastMss.idx) - cw * 2} y1={y(lastMss.level)} x2={x(lastMss.idx) + cw * 2} y2={y(lastMss.level)} stroke="#7c3aed" strokeWidth="1.25" />
        <text x={x(lastMss.idx) + cw * 2 + 2} y={y(lastMss.level) - 2} fontSize="8" fill="#7c3aed">MSS {lastMss.dir === 'bullish' ? '↑' : '↓'}</text>
      </>}

      {/* candles */}
      {view.map((c, i) => {
        const up = c.c >= c.o, col = up ? UP : DN;
        const yO = y(c.o), yC = y(c.c);
        return (
          <g key={i}>
            <line x1={x(i)} y1={y(c.h)} x2={x(i)} y2={y(c.l)} stroke={col} strokeWidth="1" />
            <rect x={x(i) - bodyW / 2} y={Math.min(yO, yC)} width={bodyW} height={Math.max(1, Math.abs(yC - yO))} fill={col} />
          </g>
        );
      })}

      {/* sweep markers */}
      {sweeps.map((s, k) => (
        <g key={`sw${k}`}>
          {s.side === 'BSL'
            ? <text x={x(s.idx)} y={y(s.level) - 5} fontSize="11" fill="#d97706" textAnchor="middle">▼</text>
            : <text x={x(s.idx)} y={y(s.level) + 12} fontSize="11" fill="#d97706" textAnchor="middle">▲</text>}
        </g>
      ))}
    </svg>
  );
}

function SymbolPicker({ value, onChange, symbols }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    let list = symbols || [];
    if (q) list = list.filter(s => s.symbol.includes(q));
    list = [...list].sort((a, b) => (a.type === b.type ? a.symbol.localeCompare(b.symbol) : (a.type === 'index' ? -1 : 1)));
    return list.slice(0, 60);
  }, [symbols, query]);

  const cur = (symbols || []).find(s => s.symbol === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="bg-white border border-slate-300 rounded-md px-2 py-1 text-amber-600 font-semibold focus:outline-none focus:border-amber-600 flex items-center gap-1 min-w-[7rem] justify-between"
      >
        <span>{value}{cur?.type === 'stock' ? <span className="text-slate-400 font-normal"> · stk</span> : null}</span>
        <span className="text-slate-400 text-[10px]">▾</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 left-0 w-60 bg-white border border-slate-300 rounded-md shadow-lg overflow-hidden">
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search symbol…"
            className="w-full px-3 py-2 text-xs text-slate-700 border-b border-slate-200 focus:outline-none"
          />
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 && <div className="px-3 py-3 text-xs text-slate-400">No matches</div>}
            {filtered.map(s => (
              <button
                key={s.symbol}
                type="button"
                onClick={() => { onChange(s.symbol); setOpen(false); setQuery(''); }}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-amber-50 ${s.symbol === value ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-slate-700'}`}
              >
                <span>{s.symbol}{s.type === 'index' ? <span className="ml-1 text-[9px] uppercase tracking-wider text-slate-400">index</span> : null}</span>
                <span className="text-[10px] text-slate-400">lot {s.lotSize}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MainApp({ user, onLogout }) {
  const [activeInterval, setActiveInterval] = useState(detectCurrentInterval());
  const [liveMode, setLiveMode] = useState(() => storage.get('live-mode') !== 'false'); // default ON
  const [snapshots, setSnapshots] = useState({});
  const [spotInput, setSpotInput] = useState('');
  const [spotAutoDetected, setSpotAutoDetected] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  // ICT data-spike: ad-hoc candle fetch to verify the Dhan charts pipeline.
  const [candleTest, setCandleTest] = useState(null); // {loading, error, count, last, interval}
  const testCandles = async (interval) => {
    setCandleTest({ loading: true, interval });
    try {
      const r = await fetch(`/api/dhan-candles?symbol=${encodeURIComponent(symbol)}&interval=${interval}&days=5`, {
        headers: { 'x-dhan-client-id': dhanClientId, 'x-dhan-access-token': dhanAccessToken },
      });
      const j = await r.json();
      if (!r.ok) { setCandleTest({ error: j.error || `HTTP ${r.status}`, interval }); return; }
      const last = j.candles?.[j.candles.length - 1] || null;
      const scoped = scopeCandles(j.candles || [], interval);
      const swings = detectSwings(scoped, 2);
      const pools = liquidityPools(swings);
      const sweeps = detectSweeps(scoped, swings);
      const mss = detectMSS(scoped, swings);
      const eq = equalLevels(swings);
      const obs = detectOrderBlocks(scoped);
      const fvgs = detectFVGs(scoped);
      const obFresh = freshZones(markMitigated(obs, scoped)).length;
      const fvgFresh = freshZones(markMitigated(fvgs, scoped)).length;
      const lastSweep = sweeps[sweeps.length - 1] || null;
      const lastMss = mss[mss.length - 1] || null;
      setCandleTest({ count: j.count, scoped: scoped.length, last, interval, instrument: j.instrument, swings: swings.length, bsl: pools.bsl[0]?.price, ssl: pools.ssl[0]?.price, sweeps: sweeps.length, lastSweep, mss: mss.length, lastMss, eqh: eq.eqh.length, eql: eq.eql.length, obs: obs.length, obFresh, fvgs: fvgs.length, fvgFresh });
    } catch (e) {
      setCandleTest({ error: e.message, interval });
    }
  };
  const [autoFetchOn, setAutoFetchOn] = useState(true);
  // ICT top-down: fetch all four timeframes and run the assembly.
  const [ictResult, setIctResult] = useState(null); // {loading, error, status, bias, notes,...}
  const runTopDown = async () => {
    setIctResult({ loading: true });
    try {
      const tfs = { h1: '60', m15: '15', m5: '5', m1: '1' };
      const sets = {};
      for (const [key, iv] of Object.entries(tfs)) {
        const r = await fetch(`/api/dhan-candles?symbol=${encodeURIComponent(symbol)}&interval=${iv}&days=5`, {
          headers: { 'x-dhan-client-id': dhanClientId, 'x-dhan-access-token': dhanAccessToken },
        });
        const j = await r.json();
        if (!r.ok) { setIctResult({ error: j.error || `HTTP ${r.status} on ${iv}m` }); return; }
        sets[key] = j.candles || [];
      }
      const td = ictTopDown(sets);
      const a = current?.analysis;
      const conf = a ? gammaConfluence(td, a, current?.spot) : null;
      setIctResult({ ...td, confluence: conf });
    } catch (e) {
      setIctResult({ error: e.message });
    }
  };
  // ICT chart: load candles for a timeframe and render the SVG chart.
  const [chartState, setChartState] = useState(null); // {loading, error, candles, interval}
  const [signalLog, setSignalLog] = useState(null); // {state:'saving'|'ok'|'err', ...} validation logger status
  const loadChart = async (interval) => {
    setChartState({ loading: true, interval });
    try {
      const r = await fetch(`/api/dhan-candles?symbol=${encodeURIComponent(symbol)}&interval=${interval}&days=5`, {
        headers: { 'x-dhan-client-id': dhanClientId, 'x-dhan-access-token': dhanAccessToken },
      });
      const j = await r.json();
      if (!r.ok) { setChartState({ error: j.error || `HTTP ${r.status}`, interval }); return; }
      setChartState({ candles: j.candles || [], interval });
    } catch (e) {
      setChartState({ error: e.message, interval });
    }
  };
  const [lastFetchAt, setLastFetchAt] = useState(null);
  const [fetchTick, setFetchTick] = useState(0);
  // First spot seen this session — the reference for intraday price drift.
  const [sessionOpenSpot, setSessionOpenSpot] = useState(null);
  // Session spot extremes — the high-water-mark basis for the trailing stop.
  const [sessionHigh, setSessionHigh] = useState(null);
  const [sessionLow, setSessionLow] = useState(null);
  // Market Context inputs (admin-only)
  const [giftNiftyInput, setGiftNiftyInput] = useState('');
  const [giftPrevCloseInput, setGiftPrevCloseInput] = useState('');
  const [vixInput, setVixInput] = useState('');
  const [vixPrevCloseInput, setVixPrevCloseInput] = useState('');
  const [dateKey, setDateKey] = useState(new Date().toISOString().split('T')[0]);
  const [parseError, setParseError] = useState('');
  const [view, setView] = useState('analyze');
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [symbol, setSymbol] = useState('NIFTY');
  const [symbolList, setSymbolList] = useState(() => Object.keys(LOT_SIZES).map(s => ({ symbol: s, lotSize: LOT_SIZES[s], type: s.endsWith('NIFTY') ? 'index' : 'stock' })));
  // Load the full F&O universe (indices + ~180 stocks) with lot sizes from the instrument master.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/dhan-chain?list=symbols');
        const data = await res.json();
        if (Array.isArray(data?.symbols) && data.symbols.length) {
          data.symbols.forEach(s => { DYNAMIC_LOTS[s.symbol] = s.lotSize; });
          setSymbolList(data.symbols);
        }
      } catch (e) { /* keep static fallback list */ }
    })();
  }, []);
  const [provider, setProvider] = useState(() => storage.get('chain-provider') || 'dhan');
  const [dhanClientId, setDhanClientId] = useState(() => storage.get('dhan-client-id') || '');
  const [dhanAccessToken, setDhanAccessToken] = useState(() => storage.get('dhan-access-token') || '');
  const [showSettings, setShowSettings] = useState(false);

  // Persist provider + creds whenever they change
  useEffect(() => { storage.set('chain-provider', provider); }, [provider]);
  useEffect(() => { storage.set('dhan-client-id', dhanClientId); }, [dhanClientId]);
  useEffect(() => { storage.set('dhan-access-token', dhanAccessToken); }, [dhanAccessToken]);
  useEffect(() => { storage.set('live-mode', String(liveMode)); }, [liveMode]);

  // AUTO-FETCH: pull the chain every 60s while enabled and market is open.
  // Fires once immediately on enable, then every minute. Pauses when market closed.
  useEffect(() => {
    if (!autoFetchOn) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (isMarketOpenNow()) fetchChainOnly(true); // silent = no spinner
    };
    tick(); // immediate first pull
    const id = setInterval(tick, 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetchOn, provider, symbol, dhanClientId, dhanAccessToken]);

  // 1-second ticker so the "fetched N sec ago" label stays live without re-fetching.
  useEffect(() => {
    const id = setInterval(() => setFetchTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // The slot a fetch/analyze writes to. In Live mode every pull lands in one 'LIVE'
  // slot (always overwritten with the latest) so frequent polling just refreshes the
  // view. With Live mode off, the classic 4-interval bucketing applies.
  const writeInterval = liveMode ? 'LIVE' : activeInterval;

  // Load snapshots from localStorage on mount or date change
  useEffect(() => {
    const keys = storage.list(`chain:${dateKey}:`);
    const loaded = {};
    for (const k of keys) {
      try {
        const v = storage.get(k);
        if (v) {
          const data = JSON.parse(v);
          loaded[data.interval] = data;
        }
      } catch (e) {}
    }
    setSnapshots(loaded);
    // Restore the session-open spot for this date (reference for intraday drift)
    const openRaw = storage.get(`session-open:${dateKey}`);
    setSessionOpenSpot(openRaw ? parseFloat(openRaw) : null);
    const hiRaw = storage.get(`session-high:${dateKey}`);
    const loRaw = storage.get(`session-low:${dateKey}`);
    setSessionHigh(hiRaw ? parseFloat(hiRaw) : null);
    setSessionLow(loRaw ? parseFloat(loRaw) : null);
  }, [dateKey]);

  // Fetch ONLY — pulls the raw chain and holds it as pendingData. Does NOT analyze
  // or save. Used by both the auto-fetch timer and any manual refresh.
  // `silent` suppresses the spinner for background auto-fetches.
  const fetchChainOnly = async (silent = false) => {
    if (!silent) setFetching(true);
    setFetchError('');
    try {
      let res;
      if (provider === 'dhan') {
        if (!dhanClientId || !dhanAccessToken) {
          if (!silent) setShowSettings(true);
          throw new Error('Dhan credentials missing — add your Client ID and Access Token in Settings (gear icon, top right).');
        }
        res = await fetch(`/api/dhan-chain?symbol=${encodeURIComponent(symbol)}`, {
          headers: {
            'x-dhan-client-id': dhanClientId,
            'x-dhan-access-token': dhanAccessToken,
          },
        });
      } else {
        res = await fetch(`/api/nse-chain?symbol=${encodeURIComponent(symbol)}`);
      }
      if (res.status === 401) {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson.error || '';
        // A repeatedly-failing auto-fetch should stop the timer, not spam errors.
        setAutoFetchOn(false);
        if (/dhan|token|unauthor/i.test(msg)) {
          throw new Error('Dhan access token expired or invalid. Auto-fetch paused. Generate a fresh token at web.dhan.co → Profile → DhanHQ Trading APIs, paste it in Settings, then re-enable auto-fetch.');
        }
        throw new Error('Your session expired. Auto-fetch paused. Sign out and back in, then re-enable auto-fetch.');
      }
      if (res.status === 429) {
        throw new Error('Rate limited (too many requests). Auto-fetch will retry next cycle.');
      }
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned ${res.status}. Provider may be temporarily unavailable.`);
      }
      const data = await res.json();
      const { rows, spot, expiry, dayOpen } = convertNSEJson(data);
      if (rows.length === 0) {
        throw new Error('Response had no option-chain rows. Market may be closed (live data only flows 9:15 AM–3:30 PM IST).');
      }
      const now = Date.now();
      // Update session spot extremes (high-water-mark basis for trailing stop)
      const newHigh = sessionHigh == null ? spot : Math.max(sessionHigh, spot);
      const newLow = sessionLow == null ? spot : Math.min(sessionLow, spot);
      if (newHigh !== sessionHigh) { setSessionHigh(newHigh); storage.set(`session-high:${dateKey}`, String(newHigh)); }
      if (newLow !== sessionLow) { setSessionLow(newLow); storage.set(`session-low:${dateKey}`, String(newLow)); }
      // Reference for intraday drift, in priority order:
      //   1. TRUE day open from Dhan OHLC (correct regardless of when user logged in)
      //   2. Fall back to first spot seen this session (if OHLC unavailable)
      let openSpot;
      if (dayOpen && dayOpen > 0) {
        openSpot = dayOpen;
        if (sessionOpenSpot !== dayOpen) {
          setSessionOpenSpot(dayOpen);
          storage.set(`session-open:${dateKey}`, String(dayOpen));
        }
      } else {
        openSpot = sessionOpenSpot;
        if (openSpot == null) {
          openSpot = spot;
          setSessionOpenSpot(spot);
          storage.set(`session-open:${dateKey}`, String(spot));
        }
      }
      setPendingData({
        rows, spot, expiry,
        fetchedAt: now,
        cached: !!data.cached,
        cacheAgeMs: data.cacheAgeMs || 0,
        sessionOpenSpot: openSpot,
        sessionHigh: newHigh,
        sessionLow: newLow,
        dayOpenIsTrue: !!(dayOpen && dayOpen > 0),
      });
      setLastFetchAt(now);
      setSpotInput(spot.toString());
      setSpotAutoDetected(true);
    } catch (e) {
      setFetchError(e.message || 'Fetch failed. Check your connection and try again.');
    } finally {
      if (!silent) setFetching(false);
    }
  };

  // Analyze — takes the currently-fetched pendingData, runs the verdict, and saves
  // the snapshot. This is the one deliberate action the user takes.
  const handleAnalyze = () => {
    if (!pendingData) {
      setFetchError('No data to analyze yet. Wait for the first auto-fetch (or click Fetch now).');
      return;
    }
    const { rows, spot, expiry, sessionOpenSpot: openSpot, dayOpenIsTrue, sessionHigh: sHigh, sessionLow: sLow } = pendingData;
    const analysis = analyzeChain(rows, spot, openSpot, dayOpenIsTrue, expiry);
    // Attach session extremes so generateTradeIdea can compute the trailing stop
    analysis.sessionHigh = sHigh;
    analysis.sessionLow = sLow;
    const snapshot = {
      interval: writeInterval,
      timestamp: new Date().toISOString(),
      spot, rows, analysis, symbol, expiry,
      sessionOpenSpot: openSpot,
      sessionHigh: sHigh,
      sessionLow: sLow,
      source: 'live',
      provider,
    };
    const newSnapshots = { ...snapshots, [writeInterval]: snapshot };
    setSnapshots(newSnapshots);
    storage.set(`chain:${dateKey}:${writeInterval.replace(/[:\s]/g, '_')}`, JSON.stringify(snapshot));

    // --- Validation logger (Track A) : record this analysis for later scoring ---
    try {
      const idea = generateTradeIdea(analysis, rows, spot, expiry, null, getLotSize(symbol), symbol);
      const record = buildSignalRecord({ analysis, idea, symbol, spot, openSpot, expiry, ict: ictResult });
      setSignalLog({ state: 'saving' });
      fetch('/api/signals?op=log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })
        .then(r => r.json().then(j => ({ ok: r.ok, j })))
        .then(({ ok, j }) => setSignalLog(ok ? { state: 'ok', ts: j.ts } : { state: 'err', msg: j.error }))
        .catch(e => setSignalLog({ state: 'err', msg: e.message }));
    } catch (e) {
      setSignalLog({ state: 'err', msg: e.message });
    }
  };

  const clearOne = (intv) => {
    const k = `chain:${dateKey}:${intv.replace(/[:\s]/g, '_')}`;
    storage.delete(k);
    const newSnapshots = { ...snapshots };
    delete newSnapshots[intv];
    setSnapshots(newSnapshots);
    setSpotInput('');
    setSpotAutoDetected(false);
    setParseError('');
  };

  const current = snapshots[writeInterval];
  const previousInterval = useMemo(() => {
    if (liveMode) return null; // no interval comparison in live mode
    const idx = INTERVAL_LABELS.indexOf(activeInterval);
    if (idx <= 0) return null;
    for (let i = idx - 1; i >= 0; i--) {
      if (snapshots[INTERVAL_LABELS[i]]) return INTERVAL_LABELS[i];
    }
    return null;
  }, [activeInterval, snapshots, liveMode]);
  const comparison = previousInterval ? compareSnapshots(current?.analysis, snapshots[previousInterval]?.analysis) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 terminal-bg">
      {/* HEADER */}
      <div className="border-b border-slate-200 bg-white/85 backdrop-blur sticky top-0 z-10 card-shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <Logo size={24} />
            <h1 className="text-base font-semibold tracking-[0.15em] uppercase text-slate-900 whitespace-nowrap">
              Smart Money
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 flex-wrap">
            <SymbolPicker value={symbol} onChange={setSymbol} symbols={symbolList} />
            <input
              type="date"
              value={dateKey}
              onChange={e => setDateKey(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:border-amber-600 flex-shrink-0"
            />
            {user.isAdmin && (
              <button
                onClick={() => setShowSettings(true)}
                title="API Settings"
                className={`hover:text-amber-600 p-1 ${provider === 'dhan' && (!dhanClientId || !dhanAccessToken) ? 'text-red-600' : ''}`}
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <div className="hidden md:flex items-center gap-2.5 pl-3 ml-1 border-l border-slate-200">
              <div className="relative w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700 flex-shrink-0" title={user.email + (user.isAdmin ? ' (admin)' : '')}>
                {user.email?.[0]?.toUpperCase() || '?'}
                {user.isAdmin && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <button
                onClick={onLogout}
                title="Sign out"
                className="flex items-center gap-1.5 whitespace-nowrap bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-700 text-xs font-medium px-3 py-1.5 rounded-md transition flex-shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <SettingsModal
          provider={provider}
          setProvider={setProvider}
          dhanClientId={dhanClientId}
          setDhanClientId={setDhanClientId}
          dhanAccessToken={dhanAccessToken}
          setDhanAccessToken={setDhanAccessToken}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Tab bar removed — app is Analyze-first; other pages live in the header "More" menu */}

      <div className="max-w-7xl mx-auto px-6 py-6">
        {view === 'analyze' && (
          <>
            {/* LIVE MODE TOGGLE */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLiveMode(m => !m)}
                  className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono font-semibold transition ${
                    liveMode
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  {liveMode ? 'LIVE MODE ON' : 'Live mode off'}
                  {liveMode && <span className="inline-block w-1.5 h-1.5 rounded-full bg-white pulse-dot"></span>}
                </button>
                <span className="text-[11px] font-mono text-slate-400">
                  {liveMode
                    ? 'Every fetch shows the latest pull'
                    : '4-interval mode — capture 9:20 / 11:00 / 1:00 / 3:00'}
                </span>
              </div>
              {liveMode && current?.timestamp && (
                <span className="text-[11px] font-mono text-emerald-600">
                  Last updated: {new Date(current.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </span>
              )}
            </div>

            {/* ICT DATA SPIKE — verify the Dhan candle pipeline (admin/testing). */}
            {user?.isAdmin && provider === 'dhan' && (
              <div className="mb-4 border border-dashed border-slate-300 rounded-lg px-3 py-2 bg-white flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">ICT candle spike</span>
                {['1', '5', '15', '60'].map(iv => (
                  <button
                    key={iv}
                    onClick={() => testCandles(iv)}
                    className="text-[11px] font-mono px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    {iv === '60' ? '1H' : `${iv}m`}
                  </button>
                ))}
                {candleTest && (
                  <span className="text-[11px] font-mono text-slate-600 ml-1">
                    {candleTest.loading ? `fetching ${candleTest.interval}m…`
                      : candleTest.error ? <span className="text-red-600">err: {candleTest.error}</span>
                      : <>{candleTest.count} candles · {candleTest.swings} swings{candleTest.bsl != null ? ` · BSL ${Math.round(candleTest.bsl)}/SSL ${Math.round(candleTest.ssl)}` : ''} · {candleTest.sweeps} sweeps{candleTest.lastSweep ? ` (last ${candleTest.lastSweep.side} ${candleTest.lastSweep.dir})` : ''} · {candleTest.mss} MSS{candleTest.lastMss ? ` (last ${candleTest.lastMss.dir})` : ''} · EQH {candleTest.eqh}/EQL {candleTest.eql} · {candleTest.obs} OB ({candleTest.obFresh} fresh) · {candleTest.fvgs} FVG ({candleTest.fvgFresh} fresh){candleTest.scoped != null && candleTest.count > candleTest.scoped ? ` · scoped ${candleTest.scoped}/${candleTest.count}` : ''}</>}
                  </span>
                )}
                <button
                  onClick={runTopDown}
                  className="text-[11px] font-mono px-2 py-1 rounded border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 ml-auto"
                >
                  Top-down ▸
                </button>
              </div>
            )}

            {/* ICT TOP-DOWN ASSEMBLY result */}
            {user?.isAdmin && provider === 'dhan' && ictResult && (
              <div className={`mb-4 border rounded-lg px-3 py-2 ${ictResult.status === 'ready' ? 'border-emerald-300 bg-emerald-50' : ictResult.status === 'forming' ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
                {ictResult.loading ? <span className="text-[11px] font-mono text-slate-500">running 1H/15M/5M/1M…</span>
                  : ictResult.error ? <span className="text-[11px] font-mono text-red-600">err: {ictResult.error}</span>
                  : (
                    <div className="text-[11px] font-mono text-slate-700">
                      <span className="uppercase tracking-wider text-slate-500">Setup direction:</span>{' '}
                      <span className={`font-bold ${ictResult.bias === 'bullish' ? 'text-emerald-700' : ictResult.bias === 'bearish' ? 'text-red-700' : 'text-slate-500'}`}>{ictResult.bias === 'bullish' ? 'up (look to buy)' : ictResult.bias === 'bearish' ? 'down (look to sell)' : 'no clear trend'}</span>
                      {' · '}<span className="font-bold">{ictResult.status === 'ready' ? 'READY TO ACT' : ictResult.status === 'forming' ? 'NOT READY YET' : 'NOTHING HERE'}</span>
                      <span className="block mt-1 text-slate-600 font-sans">{ictResult.notes?.join(' · ')}</span>
                      {ictResult.confluence && ictResult.confluence.level !== 'n/a' && (
                        <span className={`block mt-1 font-sans ${ictResult.confluence.level === 'strong' ? 'text-emerald-700' : ictResult.confluence.level === 'conflicting' ? 'text-red-700' : 'text-slate-600'}`}>
                          <span className="uppercase tracking-wider text-[10px]">Options agreement: </span>
                          <span className="font-bold">{ictResult.confluence.level === 'strong' ? 'strong (both agree)' : ictResult.confluence.level === 'supportive' ? 'mild (lean agrees)' : ictResult.confluence.level === 'mixed' ? 'mixed' : 'conflicting (they disagree)'}</span> — {ictResult.confluence.notes.join(' · ')}
                        </span>
                      )}
                      <span className="block mt-0.5 text-[10px] text-slate-400">This is a guide, not a trade signal — check the chart below before acting.{!current?.analysis ? ' Run Analyze first to see options agreement.' : ''}</span>
                    </div>
                  )}
              </div>
            )}

            {/* ICT CHART */}
            {user?.isAdmin && provider === 'dhan' && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">ICT chart</span>
                  {['5', '15', '60'].map(iv => (
                    <button key={iv} onClick={() => loadChart(iv)}
                      className={`text-[11px] font-mono px-2 py-1 rounded border ${chartState?.interval === iv && chartState?.candles ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                      {iv === '60' ? '1H' : `${iv}m`}
                    </button>
                  ))}
                  {chartState?.loading && <span className="text-[11px] font-mono text-slate-500">loading…</span>}
                  {chartState?.error && <span className="text-[11px] font-mono text-red-600">err: {chartState.error}</span>}
                  {chartState?.candles && (
                    <span className="text-[10px] font-mono text-slate-400 ml-1">
                      <span className="text-red-500">━</span> BSL · <span className="text-emerald-500">━</span> SSL · <span className="text-emerald-600">▢</span>/<span className="text-red-600">▢</span> OB · <span className="text-blue-400">▢</span> FVG · <span className="text-amber-600">▲▼</span> sweep · <span style={{ color: '#7c3aed' }}>━</span> MSS
                    </span>
                  )}
                </div>
                {chartState?.candles && (
                  <div className="border border-slate-200 rounded-lg bg-white p-2">
                    <ICTChart candles={chartState.candles} interval={chartState.interval} />
                  </div>
                )}
              </div>
            )}

            {/* INTERVAL TABS — only in 4-interval mode */}
            {!liveMode && (
              <div className="flex flex-wrap gap-2 mb-4">
                {INTERVAL_LABELS.map(intv => {
                  const has = !!snapshots[intv];
                  return (
                    <button
                      key={intv}
                      onClick={() => setActiveInterval(intv)}
                      className={`relative px-4 py-2 rounded-lg text-sm font-mono font-semibold transition ${
                        activeInterval === intv
                          ? 'bg-slate-900 text-white shadow-sm'
                          : has
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                            : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {intv}
                      {has && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* INPUT PANEL — live fetch only */}
            <div className="bg-white border border-slate-200 rounded-xl card-shadow p-5 mb-6">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-amber-500" />
                  {liveMode ? 'Live data' : `Snapshot — ${activeInterval}`}
                </h2>
                {current?.spot && (
                  <div className="text-xs font-mono text-slate-500">
                    Spot: <span className="text-amber-700 font-semibold">{current.spot}</span>
                    {current.timestamp && (
                      <span className="ml-2 text-slate-400">
                        @ {new Date(current.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {(() => {
                const marketOpen = isMarketOpenNow();
                const ageSec = lastFetchAt ? Math.floor((Date.now() - lastFetchAt) / 1000) : null;
                const ageLabel = ageSec == null ? 'no data yet'
                  : ageSec < 60 ? `${ageSec}s ago`
                  : `${Math.floor(ageSec / 60)}m ${ageSec % 60}s ago`;
                const pendingAnalyzed = current && pendingData && current.spot === pendingData.spot;
                return (
                  <>
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={() => setAutoFetchOn(o => !o)}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition ${
                            autoFetchOn
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <Radio className="w-3.5 h-3.5" />
                          {autoFetchOn ? 'Auto-fetch ON' : 'Auto-fetch OFF'}
                          {autoFetchOn && <span className="inline-block w-1.5 h-1.5 rounded-full bg-white pulse-dot"></span>}
                        </button>
                        <span className="text-[11px] font-mono text-slate-500">
                          {!marketOpen
                            ? '⏸ Market closed — auto-fetch paused (9:15 AM–3:30 PM IST)'
                            : autoFetchOn
                              ? `Pulling every 60s · data ${ageLabel}`
                              : 'Auto-fetch off — use Fetch now'}
                        </span>
                      </div>
                      {pendingData?.spot && (
                        <div className="text-xs font-mono text-slate-500">
                          Live spot: <span className="text-amber-700 font-semibold">{pendingData.spot}</span>
                          {pendingData.cached && <span className="ml-1.5 text-[10px] text-slate-400">(cached {Math.round((pendingData.cacheAgeMs || 0) / 1000)}s)</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                        Data refreshes automatically every minute. Click <span className="font-semibold text-slate-700">Analyze</span> to run the verdict and trade signal on the latest pull.
                        {pendingAnalyzed && <span className="text-emerald-600"> · Showing analysis of current data.</span>}
                        {!pendingAnalyzed && pendingData && <span className="text-amber-600"> · New data available — click Analyze to refresh the signal.</span>}
                      </p>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => fetchChainOnly(false)}
                          disabled={fetching}
                          className="text-xs px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-md text-slate-600 flex items-center gap-1.5 transition disabled:opacity-50"
                        >
                          {fetching ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                          Fetch now
                        </button>
                        {current && (
                          <button onClick={() => clearOne(writeInterval)} className="text-xs px-3 py-2 bg-white hover:bg-red-50 border border-slate-300 hover:border-red-300 rounded-md text-slate-500 hover:text-red-700 flex items-center gap-1 transition">
                            <RotateCcw className="w-3 h-3" /> Clear
                          </button>
                        )}
                        <button
                          onClick={handleAnalyze}
                          disabled={!pendingData}
                          className="text-sm font-semibold px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-md flex items-center gap-2 transition card-shadow"
                        >
                          <Zap className="w-4 h-4" /> Analyze
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}

              {fetchError && (
                <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {fetchError}
                </div>
              )}
              {user?.isAdmin && signalLog && (
                <div className="mt-2 text-[11px] font-mono text-slate-400">
                  {signalLog.state === 'saving' ? 'signal log: saving…'
                    : signalLog.state === 'ok' ? `signal log: ✓ saved ${new Date(signalLog.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                    : <span className="text-amber-600">signal log: {signalLog.msg}</span>}
                </div>
              )}
            </div>

            {current ? (
              <AnalysisView snapshot={current} comparison={comparison} previousInterval={previousInterval} user={user} />
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl card-shadow p-10 text-center text-slate-500">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                {liveMode ? (
                  <>
                    <p className="text-sm font-semibold text-slate-600 mb-1">No data yet</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      Live mode is on. Click "Fetch live chain" above and the view updates with the latest pull. Pull again any time — each fetch refreshes this view with current data.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-600 mb-1">No snapshot for {activeInterval} yet</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      4-interval mode captures one snapshot per interval (9:20 AM / 11:00 AM / 1:00 PM / 3:00 PM) so you can
                      track how positioning shifts through the day. Capture each one at its time — or switch on Live mode to just see the latest pull.
                    </p>
                    {(() => {
                      const captured = INTERVAL_LABELS.filter(i => !!snapshots[i]);
                      if (captured.length > 0) {
                        return (
                          <p className="text-[11px] font-mono text-emerald-600 mt-3">
                            ✓ Captured so far today: {captured.join(' · ')}
                          </p>
                        );
                      }
                      return null;
                    })()}
                  </>
                )}
              </div>
            )}
          </>
        )}

      </div>

      <div className="border-t border-slate-200 mt-12 py-6 text-center text-[11px] text-slate-500 font-mono leading-relaxed max-w-3xl mx-auto px-6">
        Educational analysis of publicly available option chain data. Not investment advice, not a SEBI-registered advisory service. All trading decisions and outcomes are your own responsibility. Options trading carries uncapped risk on the short side and total premium loss on the buy side.
        <div className="mt-3 text-[10px] text-amber-600 font-bold tracking-widest">BUILD v75 · TRACK A · SIGNAL LOGGER</div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-VIEWS
// ============================================================================
function AnalysisView({ snapshot, comparison, previousInterval, user }) {
  const [footprintOpen, setFootprintOpen] = useState(false);
  const [oiProfileOpen, setOiProfileOpen] = useState(false);
  const [oiChangeOpen, setOiChangeOpen] = useState(false);
  const [focusStrike, setFocusStrike] = useState(null);
  const [selectedDepthIdx, setSelectedDepthIdx] = useState(null); // null = use analytical default (2-ITM); set when user picks ATM/3-ITM
  const [gexInvert, setGexInvert] = useState(() => storage.get('gex-inverted') === 'true');
  const toggleGex = () => setGexInvert(v => { const nv = !v; storage.set('gex-inverted', nv ? 'true' : 'false'); return nv; });
  const { analysis, spot, rows, source, timestamp } = snapshot;
  const lotSize = getLotSize(snapshot?.symbol); // per-underlying lot (NIFTY 75, RELIANCE 500, …)
  const { verdict, pcr, pcrChng, maxPain, callWalls, putWalls, callBuildUp, putBuildUp, callUnwind, putUnwind, totalCallChng, totalPutChng, atmStrike, peakGammaStrike, gammaConcentration, gammaPinDistancePct, gammaRegime, gammaFlip, gammaFlipDistancePct, gexInverted } = analysis;

  const colorMap = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
    red: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
  };
  const c = colorMap[verdict.color];

  const atmIdx = rows.findIndex(r => r.strike === atmStrike);
  const chartStart = Math.max(0, atmIdx - 10);
  const chartEnd = Math.min(rows.length, atmIdx + 11);
  const chartData = rows.slice(chartStart, chartEnd).map(r => ({
    strike: r.strike,
    'Call OI': r.ce.oi,
    'Put OI': r.pe.oi,
    'Call CHNG': r.ce.chngOi,
    'Put CHNG': r.pe.chngOi,
  }));

  return (
    <div className="space-y-6">
      {/* CONTEXT BAR — decision-first: the at-a-glance context sits above the verdict */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Spot" value={fmtPlain(Math.round(spot))} sub={snapshot?.symbol || 'NIFTY'} tone="slate" />
        <MetricCard label="PCR" value={pcr.toFixed(2)} sub={pcrChng !== 0 ? `Δ ${pcrChng > 0 ? '+' : ''}${pcrChng.toFixed(2)}` : ''} tone={pcr > 1.2 ? 'emerald' : pcr < 0.8 ? 'red' : 'slate'} />
        <MetricCard label="Max Pain" value={maxPain.toString()} sub={`${((maxPain - spot) / spot * 100).toFixed(2)}% vs spot`} tone={Math.abs(maxPain - spot) / spot > 0.015 ? 'amber' : 'slate'} />
        <MetricCard label="Expected Range" value={`${putWalls[0]?.strike}–${callWalls[0]?.strike}`} sub="Floor – Ceiling" tone="amber" />
        <MetricCard label="Net ΔOI C/P" value={`${fmt(totalCallChng)}/${fmt(totalPutChng)}`} sub={totalPutChng > totalCallChng ? 'Put-heavy ↑' : 'Call-heavy ↑'} tone={totalPutChng > totalCallChng ? 'emerald' : 'red'} />
      </div>

      {/* GAMMA TIER 1 — pin map. Where option gamma concentrates → the strike price gravitates
          toward into expiry. Assumption-light (no dealer-sign guess). */}
      {peakGammaStrike != null && (() => {
        const dist = gammaPinDistancePct;
        const near = Math.abs(dist) < 0.4;
        const strength = gammaConcentration > 0.15 ? 'sharp' : gammaConcentration > 0.08 ? 'moderate' : 'diffuse';
        const dir = dist > 0 ? 'above' : 'below';
        return (
          <div className="border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 flex items-start gap-3 flex-wrap">
            <div className="flex items-baseline gap-2 flex-shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Gamma Pin</span>
              <span className="text-lg font-mono font-bold text-slate-800">{fmtPlain(peakGammaStrike)}</span>
              <span className="text-[11px] font-mono text-slate-500">{dist > 0 ? '+' : ''}{dist.toFixed(2)}% {dir}</span>
            </div>
            <div className="text-[11px] text-slate-600 leading-snug flex-1 min-w-[260px]">
              {near
                ? <>Spot is sitting on the heaviest-gamma strike — strong <span className="font-semibold">pinning</span> pressure; expect moves to get pulled back toward {fmtPlain(peakGammaStrike)} into expiry.</>
                : <>Heaviest option gamma sits at {fmtPlain(peakGammaStrike)} ({dir} spot). Price tends to gravitate there as expiry nears.</>}
              {' '}<span className="text-slate-400">Concentration {strength} · strongest near expiry &amp; for indices · context, not a trigger.</span>
            </div>
            {gammaRegime && gammaRegime !== 'neutral' && (() => {
              const effRegime = gexInvert ? (gammaRegime === 'long' ? 'short' : 'long') : gammaRegime;
              const isLong = effRegime === 'long';
              const fdist = gammaFlipDistancePct;
              return (
                <div className="w-full border-t border-slate-200 pt-2.5 mt-1 flex items-start gap-3 flex-wrap">
                  <div className="flex items-baseline gap-2 flex-shrink-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Gamma Regime</span>
                    <span className={`text-sm font-mono font-bold ${isLong ? 'text-emerald-700' : 'text-red-700'}`}>
                      {isLong ? 'LONG' : 'SHORT'}
                    </span>
                    {gammaFlip != null && (
                      <span className="text-[11px] font-mono text-slate-500">
                        flip {fmtPlain(Math.round(gammaFlip))}{fdist != null ? ` · spot ${fdist > 0 ? '+' : ''}${fdist.toFixed(2)}%` : ''}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={toggleGex}
                      title="Flip the dealer-sign assumption (NSE is writing-heavy). Use if price behaves opposite to the stated regime."
                      className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${gexInvert ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-300 text-slate-400 hover:text-slate-600'}`}
                    >
                      {gexInvert ? 'inverted ✓' : 'invert'}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-600 leading-snug flex-1 min-w-[260px]">
                    {isLong
                      ? <>Dealers <span className="font-semibold">suppress</span> volatility — they sell rips and buy dips. Favours mean-reversion: fade stretched moves back toward the pin; expect chop over trend.</>
                      : <>Dealers <span className="font-semibold">amplify</span> volatility — they buy strength and sell weakness. Favours momentum: respect trends, widen stops, breakouts run further.</>}
                    {' '}<span className="text-slate-400">{gexInvert ? 'Sign inverted (writing-heavy assumption).' : 'Assumes standard dealer signs.'} Tap "{gexInvert ? 'inverted' : 'invert'}" if price acts opposite. Slow structural read, not a trigger.</span>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* UNIFIED DECISION CARD — verdict + recommended trade + EV/cut-off in one hero */}
      {(() => {
        const idea = generateTradeIdea(analysis, rows, spot, snapshot?.expiry, null, lotSize, snapshot?.symbol);
        const isTrade = idea.action !== 'NO_TRADE';
        const dirWord = idea.action === 'BUY_CE' ? 'CE' : idea.action === 'BUY_PE' ? 'PE' : '';
        const evBad = idea.expectedValuePts != null && idea.expectedValuePts < 0;
        const showWarn = isTrade && (idea.pastCutoff || evBad);
        // Which strike depth is shown — follows the user's selection in the cards below (lifted state)
        const depthLabels = ['ATM', '2-ITM', '3-ITM'];
        const defIdx = idea.tradeOptions ? Math.max(0, idea.tradeOptions.findIndex(o => o.isDefault)) : 1;
        const selIdx = selectedDepthIdx != null ? selectedDepthIdx : defIdx;
        const selOpt = (idea.tradeOptions && idea.tradeOptions[selIdx]) || null;
        const showStrike = selOpt ? selOpt.strike : idea.strike;
        const showEntry = selOpt ? selOpt.entryPremium : idea.entryPremium;
        const showTgt = selOpt ? selOpt.targetPremiumPerShare : idea.targetPremiumPerShare;
        const showSl = selOpt ? selOpt.slPremiumPerShare : idea.slPremiumPerShare;
        return (
          <div className={`rounded-xl border-2 ${c.border} ${c.bg} p-5`}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="text-[10px] font-mono text-slate-800 mb-1 uppercase tracking-wider flex items-center gap-2">
                  Smart money verdict — {snapshot.interval}
                  {source === 'live' && <span className="px-1.5 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-600 rounded text-[9px]">LIVE</span>}
                </div>
                <div className={`text-3xl font-bold ${c.text}`}>{verdict.label}</div>
                <div className="text-xs text-slate-800 mt-1 font-mono">
                  Score: {verdict.score.toFixed(1)} · Spot: {fmtPlain(Math.round(spot))} · {new Date(timestamp).toLocaleTimeString('en-IN')}
                </div>
              </div>
              <div className="text-right">
                {verdict.color === 'emerald' && <TrendingUp className={`w-10 h-10 ${c.text}`} />}
                {verdict.color === 'red' && <TrendingDown className={`w-10 h-10 ${c.text}`} />}
                {verdict.color === 'amber' && <Minus className={`w-10 h-10 ${c.text}`} />}
              </div>
            </div>

            {/* Recommended trade summary — pulled up into the decision */}
            {isTrade && (
              <div className="mt-4 bg-white/70 border border-slate-200 rounded-lg px-4 py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-[10px] font-mono text-slate-800 uppercase tracking-wider w-full sm:w-auto">Recommended · {depthLabels[selIdx] || '2-ITM'}</span>
                <span className="text-base font-bold text-slate-800 font-mono">Buy {showStrike} {dirWord}</span>
                <span className="text-sm text-slate-800 font-mono">@ ₹{showEntry?.toFixed(2)}</span>
                <span className="text-xs font-mono text-emerald-700">tgt ₹{showTgt?.toFixed(0)}</span>
                <span className="text-xs font-mono text-red-700">sl ₹{showSl?.toFixed(0)}</span>
                {idea.expectedValuePts != null && (
                  <span className={`text-xs font-mono ml-auto ${evBad ? 'text-red-600 font-bold' : 'text-emerald-700'}`}>EV {idea.expectedValuePts > 0 ? '+' : ''}{idea.expectedValuePts} pts</span>
                )}
              </div>
            )}

            {/* Elevated blocker strip — the things that should stop you, made prominent */}
            {showWarn && (
              <div className="mt-3 bg-red-50 border border-red-300 rounded-lg px-4 py-2.5 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-red-700 leading-relaxed">
                  {idea.pastCutoff && <span className="font-semibold">Past 3:05 PM cut-off — no fresh same-day entry. </span>}
                  {evBad && <span>Expected value is negative ({idea.expectedValuePts} pts) — a thin / unfavourable setup. Treat as informational.</span>}
                </div>
              </div>
            )}

            {verdict.divergence && (
              <div className="mt-3 bg-amber-50 border-2 border-amber-400 rounded-lg p-3 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">Price vs positioning divergence</div>
                  <div className="text-sm text-amber-900 leading-relaxed">{verdict.divergence.text}</div>
                </div>
              </div>
            )}

            {/* Reasons — supporting (aligned with verdict) first */}
            <div className="mt-4 space-y-2">
              {[...verdict.reasons].sort((a, b) => {
                const rank = (t) => {
                  if (verdict.color === 'emerald') return t === 'bullish' ? 0 : t === 'bearish' ? 2 : 1;
                  if (verdict.color === 'red') return t === 'bearish' ? 0 : t === 'bullish' ? 2 : 1;
                  return t === 'warning' ? 0 : 1;
                };
                return rank(a.type) - rank(b.type);
              }).map((r, i) => (
                <div key={i} className={`flex items-start gap-2 text-sm ${
                  r.type === 'bullish' ? 'text-emerald-700' :
                  r.type === 'bearish' ? 'text-red-700' :
                  r.type === 'warning' ? 'text-amber-700 font-semibold' :
                  'text-slate-800'
                }`}>
                  <span className="font-mono text-xs mt-0.5">{r.type === 'bullish' ? '▲' : r.type === 'bearish' ? '▼' : r.type === 'warning' ? '⚠' : '•'}</span>
                  <span>{r.text}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* POSITIONING READ — observed directional bias from smart money footprint */}
      <TradeIdeaCard idea={generateTradeIdea(analysis, rows, spot, snapshot?.expiry, null, lotSize, snapshot?.symbol)} spot={spot} isAdmin={user?.isAdmin} snapshot={snapshot} verdict={verdict} selectedDepth={selectedDepthIdx} onSelectDepth={setSelectedDepthIdx} />

      {/* Phase 3: the OI-profile and change-in-OI charts are consolidated into the single
          combined FootprintChart below (which shows total OI + ΔOI together with controls). */}

      {/* STRIKE FOCUS — pick any strike (dropdown or click a chart bar) to see its trade math */}
      {(() => {
        const focusIdea = focusStrike != null ? generateTradeIdea(analysis, rows, spot, snapshot?.expiry, focusStrike, lotSize, snapshot?.symbol) : null;
        const fo = focusIdea?.focusedOption;
        const dirType = focusIdea?.directionType;
        const sortedStrikes = [...new Set(rows.map(r => r.strike))].sort((a, b) => a - b);
        return (
          <div className="bg-white border border-slate-200 rounded-xl card-shadow overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-amber-500" />
                Strike focus
              </h3>
              <div className="flex items-center gap-2">
                <select
                  value={focusStrike ?? ''}
                  onChange={(e) => setFocusStrike(e.target.value ? Number(e.target.value) : null)}
                  className="text-xs font-mono border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="">Pick a strike…</option>
                  {sortedStrikes.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                {focusStrike != null && (
                  <button onClick={() => setFocusStrike(null)} className="text-[11px] font-mono text-slate-800 hover:text-slate-800 px-2 py-1.5">clear</button>
                )}
              </div>
            </div>
            <div className="px-5 py-4">
              {!focusStrike && (
                <p className="text-xs text-slate-800 font-mono">Select a strike above, or click any bar in the chart below, to see its target, stop-loss and trade math (in the verdict's {dirType || 'CE/PE'} direction).</p>
              )}
              {focusStrike != null && !fo && (
                <p className="text-xs text-red-500 font-mono">Strike {focusStrike} not found in the current chain. Pick another.</p>
              )}
              {fo && (
                <div>
                  <div className="flex items-baseline gap-3 flex-wrap mb-3">
                    <span className="text-lg font-bold text-slate-800 font-mono">{fo.strike} {dirType}</span>
                    <span className="text-[10px] font-mono text-slate-800 uppercase">{fo.depthLabel}</span>
                    <span className="text-sm text-slate-800 font-mono">entry ₹{fo.entryPremium.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div><div className="text-slate-800 mb-0.5">Target</div><div className="text-emerald-700 font-bold">₹{fo.targetPremiumPerShare.toFixed(2)}</div></div>
                    <div><div className="text-slate-800 mb-0.5">Stop-loss</div><div className="text-red-600 font-bold">₹{fo.slPremiumPerShare.toFixed(2)}</div></div>
                    <div><div className="text-slate-800 mb-0.5">Profit/lot</div><div className={fo.profitPerLot >= 0 ? 'text-emerald-700' : 'text-red-600'}>{fo.profitPerLot >= 0 ? '+' : '−'}₹{Math.abs(fo.profitPerLot).toFixed(0)}</div></div>
                    <div><div className="text-slate-800 mb-0.5">Loss/lot</div><div className="text-red-600">−₹{Math.abs(fo.lossPerLot).toFixed(0)}</div></div>
                    <div><div className="text-slate-800 mb-0.5">Delta</div><div className="text-slate-800">{(dirType === 'PE' ? '−' : '')}{fo.entryDelta.toFixed(3)}</div></div>
                    <div><div className="text-slate-800 mb-0.5">Theta/day</div><div className="text-red-600">−₹{fo.entryTheta.toFixed(2)}</div></div>
                    <div><div className="text-slate-800 mb-0.5">Capital</div><div className="text-slate-800">₹{fo.capitalRequiredPerLot.toFixed(0)}</div></div>
                    <div><div className="text-slate-800 mb-0.5">ROI</div><div className={fo.returnOnCapitalPct >= 0 ? 'text-emerald-700' : 'text-red-600'}>{fo.returnOnCapitalPct.toFixed(0)}%</div></div>
                  </div>
                  {fo.decayChallenged && (
                    <div className="mt-3 text-[11px] font-mono text-amber-600 border-t border-amber-100 pt-2">
                      ⚠ Decay-challenged: the projected move is too small to clear theta + IV-crush at this strike by 3:05 PM. Target is a minimal floor above entry — weak setup.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* COMBINED FOOTPRINT — the single consolidated OI chart; bars are clickable to focus a strike */}
      <div className="bg-white border border-slate-200 rounded-xl card-shadow overflow-hidden">
        <button
          onClick={() => setFootprintOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition"
        >
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <ChevronRight className={`w-4 h-4 text-amber-500 transition-transform ${footprintOpen ? 'rotate-90' : ''}`} />
            TODAY'S FOOTPRINT — OI + change, combined
          </h3>
          <span className="text-[10px] font-mono text-slate-800 uppercase">{footprintOpen ? 'Hide' : 'Show'}</span>
        </button>
        {footprintOpen && (
          <div className="px-5 pb-5 border-t border-slate-100 pt-4">
            <FootprintChart rows={rows} spot={spot} atmStrike={atmStrike} onSelectStrike={setFocusStrike} />>
          </div>
        )}
      </div>

      {comparison && previousInterval && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-amber-600 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            SHIFT vs {previousInterval}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
            <div>
              <div className="text-[10px] font-mono text-slate-800 uppercase">Score Shift</div>
              <div className={`text-lg font-mono font-bold ${comparison.scoreShift > 0 ? 'text-emerald-600' : comparison.scoreShift < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                {comparison.scoreShift > 0 ? '+' : ''}{comparison.scoreShift.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-800 uppercase">PCR Shift</div>
              <div className={`text-lg font-mono font-bold ${comparison.pcrShift > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {comparison.pcrShift > 0 ? '+' : ''}{comparison.pcrShift.toFixed(3)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-800 uppercase">Max Pain Shift</div>
              <div className={`text-lg font-mono font-bold ${comparison.maxPainShift > 0 ? 'text-emerald-600' : comparison.maxPainShift < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                {comparison.maxPainShift > 0 ? '+' : ''}{comparison.maxPainShift}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-800 uppercase">Direction Flips</div>
              <div className="text-lg font-mono font-bold text-amber-600">{comparison.flips.length}</div>
            </div>
          </div>
          {comparison.flips.length > 0 && (
            <div className="text-xs space-y-1 text-amber-700">
              {comparison.flips.map((f, i) => <div key={i}>⚠ {f}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub, tone }) {
  const tones = {
    emerald: 'text-emerald-700 border-emerald-200 bg-emerald-50/40',
    red: 'text-red-700 border-red-200 bg-red-50/40',
    amber: 'text-amber-700 border-amber-200 bg-amber-50/40',
    slate: 'text-slate-800 border-blue-200 bg-blue-50/50',
  };
  const textClass = (tones[tone] || tones.slate).split(' ')[0];
  return (
    <div className={`border rounded-lg p-3 card-shadow ${tones[tone] || tones.slate}`}>
      <div className="text-[10px] font-mono text-slate-800 mb-1 uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-bold font-mono ${textClass}`}>{value}</div>
      {sub && <div className="text-[10px] text-slate-800 mt-0.5 font-mono">{sub}</div>}
    </div>
  );
}

function FootprintChart({ rows, spot, atmStrike, onSelectStrike }) {
  // Strike-range controls: both ±N-around-ATM buttons AND min/max inputs
  const allStrikes = rows.map(r => r.strike);
  const minAvail = allStrikes[0];
  const maxAvail = allStrikes[allStrikes.length - 1];
  const atmIdx = rows.findIndex(r => r.strike === atmStrike);

  const [rangeMode, setRangeMode] = useState('atm'); // 'atm' | 'custom'
  const [nAroundAtm, setNAroundAtm] = useState(10);
  const [minStrike, setMinStrike] = useState(minAvail);
  const [maxStrike, setMaxStrike] = useState(maxAvail);
  const [showTotalOI, setShowTotalOI] = useState(true);

  // Determine the visible window
  let windowRows;
  if (rangeMode === 'atm' && atmIdx >= 0) {
    if (nAroundAtm === 'all') {
      windowRows = rows;
    } else {
      const lo = Math.max(0, atmIdx - nAroundAtm);
      const hi = Math.min(rows.length, atmIdx + nAroundAtm + 1);
      windowRows = rows.slice(lo, hi);
    }
  } else {
    windowRows = rows.filter(r => r.strike >= minStrike && r.strike <= maxStrike);
  }

  // Build chart data. Solid = |ΔOI| (today's change); cap = total OI minus |ΔOI| (the rest).
  // Decrease (unwinding) is rendered with a hollow look (light fill + colored outline).
  const data = windowRows.map(r => {
    const callChg = r.ce.chngOi;
    const putChg = r.pe.chngOi;
    return {
      strike: r.strike,
      callSolid: Math.abs(callChg),
      callCap: showTotalOI ? Math.max(r.ce.oi - Math.abs(callChg), 0) : 0,
      callIncrease: callChg >= 0,
      putSolid: Math.abs(putChg),
      putCap: showTotalOI ? Math.max(r.pe.oi - Math.abs(putChg), 0) : 0,
      putIncrease: putChg >= 0,
    };
  });

  const fmtOI = (v) => {
    if (v >= 10000000) return (v / 10000000).toFixed(2) + 'Cr';
    if (v >= 100000) return (v / 100000).toFixed(1) + 'L';
    if (v >= 1000) return (v / 1000).toFixed(0) + 'K';
    return String(v);
  };

  // Totals for footer
  const totCallChg = windowRows.reduce((s, r) => s + r.ce.chngOi, 0);
  const totPutChg = windowRows.reduce((s, r) => s + r.pe.chngOi, 0);
  const deltaPcr = totCallChg !== 0 ? (totPutChg / totCallChg) : 0;

  // Custom bar shapes: solid fill for increase, hollow (light fill + dashed stroke) for decrease.
  // Leg ('call'|'put') is bound explicitly since Recharts 2.x doesn't reliably pass dataKey to shape.
  const makeSolidBar = (leg, fillIncrease, fillDecrease, strokeColor) => (props) => {
    const { x, y, width, height, payload } = props;
    if (!height || height <= 0 || !width || width <= 0) return null;
    const increase = leg === 'call' ? payload.callIncrease : payload.putIncrease;
    if (increase) {
      return <rect x={x} y={y} width={width} height={height} fill={fillIncrease} />;
    }
    return <rect x={x} y={y} width={width} height={height} fill={fillDecrease} stroke={strokeColor} strokeWidth={1.5} strokeDasharray="3 2" />;
  };

  // Spot reference: find nearest strike index for the dashed line
  const nearestSpotStrike = windowRows.reduce((best, r) =>
    Math.abs(r.strike - spot) < Math.abs(best - spot) ? r.strike : best, windowRows[0]?.strike);

  const nAtmOptions = [5, 10, 15, 20, 'all'];

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-slate-800 uppercase">Strikes:</span>
          <div className="flex gap-1">
            {nAtmOptions.map(n => (
              <button
                key={n}
                onClick={() => { setRangeMode('atm'); setNAroundAtm(n); }}
                className={`text-[11px] font-mono px-2 py-1 rounded border ${
                  rangeMode === 'atm' && nAroundAtm === n
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
              >
                {n === 'all' ? 'All' : `±${n}`}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-1.5 text-[11px] font-mono text-slate-800 cursor-pointer">
          <input type="checkbox" checked={showTotalOI} onChange={e => setShowTotalOI(e.target.checked)} className="accent-amber-500" />
          Show total OI
        </label>
      </div>

      {/* Custom min/max range */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono text-slate-800 uppercase">Custom range:</span>
        <select
          value={minStrike}
          onChange={e => { setRangeMode('custom'); setMinStrike(Number(e.target.value)); }}
          className="text-[11px] font-mono px-2 py-1 rounded border border-slate-200 bg-white text-slate-800"
        >
          {allStrikes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-slate-800 text-xs">to</span>
        <select
          value={maxStrike}
          onChange={e => { setRangeMode('custom'); setMaxStrike(Number(e.target.value)); }}
          className="text-[11px] font-mono px-2 py-1 rounded border border-slate-200 bg-white text-slate-800"
        >
          {allStrikes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {rangeMode === 'custom' && (
          <button
            onClick={() => { setRangeMode('atm'); setNAroundAtm(10); }}
            className="text-[10px] font-mono px-2 py-1 text-amber-600 hover:text-amber-700"
          >
            Reset to ATM±10
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] font-mono text-slate-800">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: '#10b981' }}></span>Put ΔOI (writing)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: '#a7f3d0' }}></span>Put total OI</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: '#ef4444' }}></span>Call ΔOI (writing)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: '#fecaca' }}></span>Call total OI</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm border border-dashed border-slate-400" style={{ background: 'transparent' }}></span>dashed = unwinding</span>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 30 }} barGap={2} barCategoryGap="20%"
          onClick={(st) => { if (onSelectStrike && st && st.activeLabel != null) onSelectStrike(Number(st.activeLabel)); }}
          style={onSelectStrike ? { cursor: 'pointer' } : undefined}>
          <XAxis dataKey="strike" stroke="#94a3b8" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} angle={-45} textAnchor="end" height={50} interval={0} />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickFormatter={fmtOI} />
          <Tooltip
            contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', fontFamily: 'JetBrains Mono' }}
            labelStyle={{ color: '#0f172a', fontWeight: 600 }}
            formatter={(v, name) => [fmtOI(v), name]}
          />
          {nearestSpotStrike != null && (
            <ReferenceLine x={nearestSpotStrike} stroke="#475569" strokeDasharray="5 4" label={{ value: 'spot', position: 'top', fontSize: 10, fill: '#475569', fontFamily: 'JetBrains Mono' }} />
          )}
          {/* Put stack: solid ΔOI (bottom) + light total cap (top) */}
          <Bar dataKey="putSolid" stackId="put" name="Put ΔOI" shape={makeSolidBar('put', '#10b981', '#ecfdf5', '#10b981')} />
          <Bar dataKey="putCap" stackId="put" name="Put total OI" fill="#a7f3d0" opacity={0.7} />
          {/* Call stack */}
          <Bar dataKey="callSolid" stackId="call" name="Call ΔOI" shape={makeSolidBar('call', '#ef4444', '#fef2f2', '#ef4444')} />
          <Bar dataKey="callCap" stackId="call" name="Call total OI" fill="#fecaca" opacity={0.7} />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary footer */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 pt-3 border-t border-slate-200 text-[11px] font-mono">
        <span className="text-slate-800">Call ΔOI: <span className={totCallChg >= 0 ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>{totCallChg >= 0 ? '+' : ''}{fmtOI(totCallChg)}</span></span>
        <span className="text-slate-800">Put ΔOI: <span className={totPutChg >= 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>{totPutChg >= 0 ? '+' : ''}{fmtOI(totPutChg)}</span></span>
        <span className="text-slate-800">PCR (ΔOI): <span className="text-slate-800 font-bold">{deltaPcr.toFixed(2)}</span></span>
        <span className="text-slate-800">Spot: <span className="text-slate-800 font-bold">{spot.toFixed(2)}</span></span>
        <span className="text-slate-800">Showing: <span className="text-slate-800 font-bold">{windowRows.length} strikes</span></span>
      </div>

      {/* How to read this chart */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-1">
        <div className="text-[11px] font-semibold text-slate-800 mb-2">How to read this chart</div>
        <ul className="space-y-1.5 text-[11px] text-slate-800 leading-relaxed">
          <li><span className="inline-block w-2.5 h-2.5 rounded-sm align-middle mr-1.5" style={{ background: '#10b981' }}></span>
            <span className="font-semibold text-emerald-700">Green = puts.</span> The solid dark base is today's put OI added (writers selling puts = building a floor / support). Tall green = strong support at that strike.</li>
          <li><span className="inline-block w-2.5 h-2.5 rounded-sm align-middle mr-1.5" style={{ background: '#ef4444' }}></span>
            <span className="font-semibold text-red-700">Red = calls.</span> The solid dark base is today's call OI added (writers selling calls = building a ceiling / resistance). Tall red = strong resistance at that strike.</li>
          <li><span className="inline-block w-2.5 h-2.5 rounded-sm align-middle mr-1.5" style={{ background: '#a7f3d0' }}></span>
            <span className="font-semibold text-slate-800">Light cap on top = total standing OI</span> (yesterday's + today's). The solid part vs the light cap shows how much of the wall was built <span className="italic">today</span> vs already there.</li>
          <li><span className="inline-block w-3 h-2.5 align-middle mr-1.5 border border-dashed border-slate-400" style={{ background: 'transparent' }}></span>
            <span className="font-semibold text-slate-800">Dashed/hollow bar = unwinding</span> (OI fell today). Writers covering — the wall is weakening, not building.</li>
          <li><span className="text-slate-800 mr-1.5">┊</span>
            <span className="font-semibold text-slate-800">Dashed vertical line = spot.</span> Big green walls below spot = support; big red walls above = resistance.</li>
          <li className="pt-1 text-slate-800"><span className="font-semibold">Quick read:</span> heavier green below spot + heavier red above = range-bound. Green stacking up near spot = support rising (bullish). Red stacking down near spot = resistance capping (bearish).</li>
        </ul>
      </div>
    </div>
  );
}

function WallsTable({ title, data, side, tone, spot }) {
  const toneClass = tone === 'red' ? 'text-red-600' : 'text-emerald-600';
  return (
    <div className="bg-white border border-slate-200 rounded-xl card-shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200">
        <h3 className={`text-xs font-bold font-mono ${toneClass}`}>{title}</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] font-mono text-slate-800 bg-slate-50/60 uppercase">
            <th className="text-left px-4 py-2">Rank</th>
            <th className="text-right px-4 py-2">Strike</th>
            <th className="text-right px-4 py-2">OI</th>
            <th className="text-right px-4 py-2">ΔOI</th>
            <th className="text-right px-4 py-2">Vol/OI</th>
          </tr>
        </thead>
        <tbody className="font-mono text-sm">
          {data.map((r, i) => {
            const isAtm = Math.abs(r.strike - spot) < 50;
            const volOiRatio = r[side].oi > 0 ? (r[side].volume / r[side].oi).toFixed(1) : '-';
            return (
              <tr key={r.strike} className={`border-t border-slate-200 ${isAtm ? 'bg-amber-50' : ''}`}>
                <td className="px-4 py-2 text-slate-800">#{i + 1}</td>
                <td className="px-4 py-2 text-right font-bold text-slate-800">
                  {r.strike}{isAtm && <span className="text-amber-600 text-[10px] ml-1">ATM</span>}
                </td>
                <td className={`px-4 py-2 text-right font-bold ${toneClass}`}>{fmtPlain(r[side].oi)}</td>
                <td className={`px-4 py-2 text-right ${r[side].chngOi > 0 ? toneClass : 'text-slate-800'}`}>
                  {r[side].chngOi > 0 ? '+' : ''}{fmtPlain(r[side].chngOi)}
                </td>
                <td className="px-4 py-2 text-right text-slate-800">{volOiRatio}x</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ActivityTable({ title, data, side, tone, spot }) {
  const toneClass = tone === 'red' ? 'text-red-600' : 'text-emerald-600';
  return (
    <div className="bg-white border border-slate-200 rounded-xl card-shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200">
        <h3 className={`text-xs font-bold font-mono ${toneClass}`}>{title}</h3>
      </div>
      {data.length === 0 ? (
        <div className="px-4 py-6 text-center text-xs text-slate-800 font-mono">No significant activity</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-mono text-slate-800 bg-slate-50/60 uppercase">
              <th className="text-right px-4 py-2">Strike</th>
              <th className="text-right px-4 py-2">ΔOI</th>
              <th className="text-right px-4 py-2">% of OI</th>
              <th className="text-right px-4 py-2">vs Spot</th>
            </tr>
          </thead>
          <tbody className="font-mono text-sm">
            {data.slice(0, 5).map(r => {
              const pct = r[side].oi > 0 ? ((r[side].chngOi / r[side].oi) * 100).toFixed(0) : 0;
              const distance = r.strike - spot;
              return (
                <tr key={r.strike} className="border-t border-slate-200">
                  <td className="px-4 py-2 text-right font-bold text-slate-800">{r.strike}</td>
                  <td className={`px-4 py-2 text-right font-bold ${toneClass}`}>
                    {r[side].chngOi > 0 ? '+' : ''}{fmtPlain(r[side].chngOi)}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-800">{pct}%</td>
                  <td className="px-4 py-2 text-right text-[11px] text-slate-800">
                    {distance > 0 ? '+' : ''}{distance.toFixed(0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}


// ============================================================================
// POSITIONING READ CARD — surfaces directional bias from the verdict
// ============================================================================
function TradeIdeaCard({ idea, spot, isAdmin, snapshot, verdict, selectedDepth = null, onSelectDepth = null }) {

  const {
    action, confidence, color, strike, premium, iv, target, stopLoss,
    riskReward, reward, risk, conditions, reason,
    entryPremium, targetPremiumPerShare, slPremiumPerShare,
    profitPerLot, lossPerLot, capitalRequiredPerLot, returnOnCapitalPct, lotSize,
    // Greeks + friction breakdown
    entryDelta, entryTheta, entryVega, entryGamma,
    targetPremiumClean, slPremiumClean,
    profitPerLotClean, lossPerLotClean, returnOnCapitalPctClean,
    frictionDrag, frictionDragPct, hourlyThetaCostPerLot,
    daysLeft, ivCrushAssumedPct, holdingHours,
    // Multi-strike comparison array (ATM / 2-ITM / 3-ITM)
    tradeOptions,
    // Realistic same-day targeting
    realisticTarget, realisticSL, expectedDailyMovePts, realisticTargetDistance,
    fullDayMovePts, minutesLeftToCutoff,
    etaMinutes, etaFast, etaSlow, etaFeasible, etaCloserTargetPts,
    trailingStop,
    targetMultiplier, wallTarget, wallStopLoss, pastCutoff, hoursToClose, expiryDate,
    // Next-day open model + entry trigger
    nextDayModel, entryTriggerModel,
  } = idea;

  // Underlying symbol for user-facing copy (so a stock view doesn't say "NIFTY").
  const sym = snapshot?.symbol || 'NIFTY';

  const colorMap = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-700', solid: 'bg-emerald-600', solidText: 'text-white' },
    red:     { bg: 'bg-red-50',     border: 'border-red-400',     text: 'text-red-700',     solid: 'bg-red-600',     solidText: 'text-white' },
    amber:   { bg: 'bg-amber-50',   border: 'border-amber-400',   text: 'text-amber-700',   solid: 'bg-amber-600',   solidText: 'text-white' },
  };
  const c = colorMap[color];

  // Selectable strike depth. Local state drives the tile highlight (this is the mechanism that
  // worked reliably); on change we also notify the parent so the top decision strip stays in sync.
  const defaultIdx = tradeOptions ? Math.max(0, tradeOptions.findIndex(o => o.isDefault)) : 1;
  const initialIdx = selectedDepth != null ? selectedDepth : defaultIdx;
  const [selectedIdx, setSelectedIdx] = useState(initialIdx);
  const selectStrike = (idx) => {
    setSelectedIdx(idx);
    if (onSelectDepth) onSelectDepth(idx);
  };
  const selectedOpt = (tradeOptions && tradeOptions[selectedIdx]) || null;
  const depthSubtitles = ['ATM · Lottery ticket', '2 ITM · Balanced', '3 ITM · Position trade'];

  // User-visible language: observation, not instruction
  const actionLabel = action === 'BUY_CE' ? 'CALL-SIDE BIAS' : action === 'BUY_PE' ? 'PUT-SIDE BIAS' : 'NO CLEAR BIAS';
  const symbolForTitle = action === 'BUY_CE' ? `${strike} CE in focus` : action === 'BUY_PE' ? `${strike} PE in focus` : '';

  // NO_TRADE compact view
  if (action === 'NO_TRADE') {
    return (
      <div className={`rounded-xl border-2 ${c.border} ${c.bg} p-5`}>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10px] font-mono text-slate-800 mb-1 uppercase tracking-wider">Positioning Read</div>
            <div className={`text-2xl font-bold ${c.text}`}>NO CLEAR BIAS</div>
            <div className="text-xs text-slate-800 mt-2 max-w-2xl leading-relaxed">{reason}</div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg ${c.solid} ${c.solidText} text-xs font-bold font-mono`}>
            CONFIDENCE: {confidence}
          </div>
        </div>
        <div className="mt-4 space-y-1.5 text-xs">
          {conditions.map((cond, i) => (
            <div key={i} className="text-slate-800">→ {cond}</div>
          ))}
        </div>
      </div>
    );
  }

  // Directional bias view (call-side or put-side)
  // Recompute clean R:R as reward/risk multiple
  const rrMultiple = risk > 0 ? (reward / risk) : 0;
  const rrLabel = rrMultiple >= 2.5 ? 'favourable' : rrMultiple >= 1.5 ? 'acceptable' : 'thin';
  const rrTextClass = rrMultiple >= 2.5 ? 'text-emerald-700' : rrMultiple >= 1.5 ? 'text-amber-700' : 'text-red-700';

  // Position of spot on the visual ladder (left = invalidation, right = continuation)
  const totalRange = reward + risk;
  const spotPositionPct = totalRange > 0 ? (risk / totalRange) * 100 : 50;

  // ============ TOUCH PROBABILITY MODEL ============
  // Expected 1-day move from ATM IV (standard options math)
  // EM = Spot × (IV/100) × √(1/252)
  const expectedMove = iv > 0 ? spot * (iv / 100) * Math.sqrt(1 / 252) : 0;

  // Approximate touch probability based on z-score (distance / expected move)
  // Touch probability ≈ 2 × P(closes beyond) for a barrier — well-known options approximation
  const touchProb = (distance, em) => {
    if (em <= 0) return 50;
    const z = Math.abs(distance) / em;
    if (z < 0.3) return 88;
    if (z < 0.6) return 75;
    if (z < 0.9) return 60;
    if (z < 1.2) return 46;
    if (z < 1.5) return 33;
    if (z < 1.9) return 22;
    if (z < 2.4) return 13;
    return 7;
  };

  const targetTouchProb = touchProb(reward, expectedMove);
  const slTouchProb = touchProb(risk, expectedMove);

  // Expected value (positive = favourable trade math)
  // EV = P(target) × reward − P(SL) × risk
  const expectedValue = (targetTouchProb / 100) * reward - (slTouchProb / 100) * risk;
  const evClass = expectedValue > 0 ? 'text-emerald-700' : 'text-red-700';

  // Direct trade labels for admin
  const adminTradeLabel = action === 'BUY_CE' ? `BUY ${strike} CE` : `BUY ${strike} PE`;
  const adminDirection = action === 'BUY_CE' ? 'Bullish' : 'Bearish';

  // Staleness indicator: how old is this snapshot vs now?
  const snapshotAgeMinutes = snapshot?.timestamp
    ? Math.floor((Date.now() - new Date(snapshot.timestamp).getTime()) / 60000)
    : null;
  const snapshotTime = snapshot?.timestamp
    ? new Date(snapshot.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : null;
  // Three levels of staleness coloring
  const stalenessSeverity = snapshotAgeMinutes == null ? 'unknown'
    : snapshotAgeMinutes < 10 ? 'fresh'
    : snapshotAgeMinutes < 45 ? 'aging'
    : 'stale';

  return (
    <div className={`rounded-xl border-2 ${c.border} ${c.bg} p-5`}>
      {/* ADMIN-ONLY TRADE RECOMMENDATION — direct, explicit, friction-adjusted */}
      {isAdmin && (
        <div className={`${c.bg} text-slate-800 border ${c.border} rounded-lg p-4 mb-4 card-shadow`}>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="text-[10px] font-mono text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full pulse-dot"></span>
              Admin trade recommendation · {adminDirection}
            </div>
            <div className="text-[10px] font-mono text-amber-600 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">
              PRIVATE · Not visible to other users
            </div>
          </div>

          <div className="flex items-baseline gap-3 mb-3 flex-wrap">
            <div className="text-2xl font-bold text-amber-600 font-mono tracking-tight">
              {action === 'BUY_CE' ? 'BUY CALL' : 'BUY PUT'}
            </div>
            <div className="text-sm text-slate-800 font-mono">
              {tradeOptions?.length || 3} strike depths shown · IV {iv.toFixed(1)}% · DTE {daysLeft.toFixed(1)}d · Spot {spot.toFixed(2)}
            </div>
          </div>

          {/* STALENESS BANNER — critical for trade decisions */}
          {snapshotTime && (
            <div className={`rounded-md p-2.5 mb-3 border ${
              stalenessSeverity === 'fresh'
                ? 'bg-emerald-50 border-emerald-200'
                : stalenessSeverity === 'aging'
                ? 'bg-amber-50 border-amber-300'
                : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] font-mono">
                <div className={`${
                  stalenessSeverity === 'fresh' ? 'text-emerald-700'
                  : stalenessSeverity === 'aging' ? 'text-amber-700'
                  : 'text-red-700'
                }`}>
                  {stalenessSeverity === 'fresh' && '✓ '}
                  {stalenessSeverity === 'aging' && '⏱ '}
                  {stalenessSeverity === 'stale' && '⚠ '}
                  <strong>Snapshot from {snapshotTime}</strong>
                  {snapshotAgeMinutes !== null && (
                    <span className="ml-1.5 opacity-75">
                      ({snapshotAgeMinutes === 0 ? 'just now' : snapshotAgeMinutes < 60 ? `${snapshotAgeMinutes} min ago` : `${(snapshotAgeMinutes/60).toFixed(1)}h ago`})
                    </span>
                  )}
                </div>
                <div className={`text-[10px] ${
                  stalenessSeverity === 'fresh' ? 'text-emerald-600'
                  : stalenessSeverity === 'aging' ? 'text-amber-600'
                  : 'text-red-600'
                }`}>
                  {stalenessSeverity === 'fresh' && 'Premiums likely current'}
                  {stalenessSeverity === 'aging' && 'Premiums may have moved — verify on broker before trading'}
                  {stalenessSeverity === 'stale' && 'PREMIUMS ARE STALE — re-fetch live before any real trade'}
                </div>
              </div>
            </div>
          )}

          {/* PAST-CUTOFF BANNER — block new entries after 3:05 PM */}
          {pastCutoff && (
            <div className="bg-red-50 border border-red-300 rounded-md p-2.5 mb-3 text-center">
              <div className="text-[11px] font-mono text-red-700 font-bold">
                ⛔ PAST 3:05 PM CUT-OFF — no new same-day entry
              </div>
              <div className="text-[10px] text-red-600 mt-0.5">
                Same-day projections below assume an exit by 3:05 PM. Past cut-off, theta and gap risk make fresh entries unfavourable.
              </div>
            </div>
          )}

          {/* SHARED HEADER — realistic same-day levels, applies to all strikes */}
          <div className="bg-transparent border border-slate-200 rounded-md p-4 mb-3">
            <div className="text-[10px] font-mono text-slate-800 uppercase tracking-wider mb-3 text-center">
              Same-day levels · target = {targetMultiplier}× expected move in {minutesLeftToCutoff != null ? `${minutesLeftToCutoff} min left` : 'time left'} ({expectedDailyMovePts}pts)
              {fullDayMovePts != null && expectedDailyMovePts != null && fullDayMovePts !== expectedDailyMovePts && (
                <span className="text-slate-800 normal-case"> · scaled from {fullDayMovePts}pts full-day</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 text-center font-mono">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-800 mb-1">Spot now</div>
                <div className="text-2xl font-bold text-slate-900 leading-none">{spot.toFixed(2)}</div>
                <div className="text-[11px] text-slate-800 mt-1">reference</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-800 mb-1">Target</div>
                <div className="text-2xl font-bold text-emerald-700 leading-none">{realisticTarget}</div>
                <div className="text-[11px] text-slate-800 mt-1">{action === 'BUY_CE' ? '↗' : '↘'} {Math.abs(realisticTarget - spot).toFixed(0)} pts</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-800 mb-1">Stop loss</div>
                <div className="text-2xl font-bold text-red-700 leading-none">{realisticSL}</div>
                <div className="text-[11px] text-slate-800 mt-1">{action === 'BUY_CE' ? '↘' : '↗'} {Math.abs(realisticSL - spot).toFixed(0)} pts</div>
              </div>
            </div>

            {/* ETA TO TARGET — same for all strikes (shared underlying move) */}
            {etaMinutes != null && (
              <div className={`mt-2 rounded-md px-3 py-2 text-center ${etaFeasible ? 'bg-transparent border border-slate-200' : 'bg-amber-50 border border-amber-300'}`}>
                <div className="text-[10px] font-mono uppercase tracking-wider mb-0.5 text-slate-800">
                  ⏱ ETA to target {etaFeasible ? '' : '· ⚠ may not complete in time'}
                </div>
                <div className="font-mono text-sm">
                  <span className={etaFeasible ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                    ~{etaMinutes} min
                  </span>
                  <span className="text-slate-800"> (range {etaFast}–{etaSlow} min)</span>
                </div>
                <div className="text-[10px] text-slate-800 mt-0.5">
                  {etaFeasible
                    ? `Fits the ${minutesLeftToCutoff} min left to 3:05 PM cutoff`
                    : `Only ${minutesLeftToCutoff} min left to cutoff — expected time exceeds it`}
                </div>
                {!etaFeasible && etaCloserTargetPts != null && (
                  <div className="text-[10px] text-amber-600 mt-1 pt-1 border-t border-amber-200">
                    Suggested closer target: ~{etaCloserTargetPts} pts away
                    (spot {action === 'BUY_CE' ? '+' : '−'} {etaCloserTargetPts} = {action === 'BUY_CE' ? Math.round(spot + etaCloserTargetPts) : Math.round(spot - etaCloserTargetPts)})
                    — reachable before cutoff
                  </div>
                )}
                <div className="text-[9px] text-slate-800 mt-1 leading-relaxed">
                  Same for all 3 strikes — they hit their premium target together when {sym} reaches {realisticTarget}. Estimate only; markets don't move in straight lines.
                </div>
              </div>
            )}

            {/* TRAILING STOP — advisory, fixed-distance volatility-scaled */}
            {trailingStop && (
              <div className={`mt-2 rounded-md px-3 py-2 ${trailingStop.activated ? 'bg-emerald-50 border border-emerald-300' : 'bg-transparent border border-slate-200'}`}>
                <div className="text-[10px] font-mono uppercase tracking-wider mb-1 text-slate-800 flex items-center gap-1.5">
                  <span>⤵</span> Trailing stop · fixed-distance {trailingStop.activated ? '· ACTIVE' : '· armed (not yet active)'}
                </div>
                {trailingStop.activated ? (
                  <>
                    <div className="font-mono text-sm flex items-center gap-3 flex-wrap">
                      <span>{sym} trail: <span className="text-emerald-700 font-bold">{trailingStop.trailSpot}</span></span>
                      <span className="text-slate-800">|</span>
                      <span>Premium trail: <span className="text-emerald-700 font-bold">≈₹{trailingStop.trailPremiumApprox}</span></span>
                      {trailingStop.locksProfit && <span className="text-[10px] text-emerald-600">✓ locks profit</span>}
                    </div>
                    <div className="text-[10px] text-slate-800 mt-1">
                      Trails {trailingStop.trailBuffer} pts behind session {action === 'BUY_CE' ? 'high' : 'low'} {trailingStop.favorableExtreme} (0.25× expected move, volatility-scaled)
                    </div>
                  </>
                ) : (
                  <div className="text-[11px] text-slate-800">{trailingStop.activationNote}</div>
                )}
                {trailingStop.badTick && (
                  <div className="text-[10px] text-amber-600 mt-1">⚠ Ignored an implausible spot print (likely a bad tick) when setting the high-water mark.</div>
                )}
              </div>
            )}
            <div className="mt-1 text-[10px] text-slate-800">
              Structural wall: <span className="text-slate-800">{wallTarget}</span> ({Math.abs(wallTarget - spot).toFixed(0)}pts away) — too far for one session, used as ceiling only
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-slate-200 text-[10px] font-mono text-amber-600">
              {expiryDate ? `Expiry ${expiryDate} · ${daysLeft.toFixed(1)}d` : `Expiry ~${daysLeft.toFixed(1)}d`}
              {' · '}Exit by 3:05 PM ({holdingHours.toFixed(1)}h window) · Theta −₹{hourlyThetaCostPerLot.toFixed(0)}/hr per lot
            </div>
          </div>

          {/* SPOT ENTRY TRIGGER — when to actually pull the trigger */}
          {entryTriggerModel && entryTriggerModel.entryTrigger != null && (
            <div className="bg-transparent border border-amber-300 rounded-md p-3 mb-3">
              <div className="text-[10px] font-mono text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>⎯</span> Spot entry trigger · wait for confirmation
              </div>
              <div className="flex items-baseline gap-2 flex-wrap mb-1.5">
                <span className="text-2xl font-bold text-amber-600 font-mono">{entryTriggerModel.entryTrigger}</span>
                <span className="text-xs text-slate-800 font-mono">{entryTriggerModel.entryCondition}</span>
              </div>
              <div className="text-[11px] text-slate-800 mb-1">
                ✓ {entryTriggerModel.entryConfirmation}
              </div>
              <div className="text-[11px] text-slate-800">
                ✗ {entryTriggerModel.noEntryNote}
              </div>
            </div>
          )}

          {/* THREE-COLUMN SIDE-BY-SIDE: ATM / 2-ITM (default) / 3-ITM */}
          {tradeOptions && tradeOptions.length === 3 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {tradeOptions.map((opt, idx) => {
                const strikeLabel = `${action === 'BUY_CE' ? 'CE' : 'PE'}`;
                const isSelected = idx === selectedIdx;
                const containerClass = isSelected
                  ? 'bg-amber-50 border-2 border-amber-400 rounded-md p-3 relative cursor-pointer shadow-[0_0_0_3px_rgba(245,158,11,0.12)]'
                  : 'bg-white border border-slate-200 rounded-md p-3 relative cursor-pointer hover:border-slate-300 transition';
                const subtitleMap = depthSubtitles;
                return (
                  <div key={opt.strike} className={containerClass} onClick={() => selectStrike(idx)} role="button" tabIndex={0}>
                    {isSelected && (
                      <div className="absolute -top-2 left-2 bg-amber-400 text-slate-900 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded tracking-wider">
                        {idx === defaultIdx ? 'DEFAULT' : 'SELECTED'}
                      </div>
                    )}
                    <div className="text-[9px] font-mono text-slate-800 uppercase tracking-wider mb-1 mt-0.5">
                      {subtitleMap[idx]}
                    </div>
                    <div className="text-base font-bold text-amber-600 font-mono mb-0.5">
                      {opt.strike} {strikeLabel}
                    </div>
                    <div className="text-xs font-mono text-slate-800 mb-2">@ ₹{opt.entryPremium.toFixed(2)}</div>

                    <table className="w-full text-[10px] font-mono">
                      <tbody>
                        <tr>
                          <td className="text-slate-800 py-0.5">Delta</td>
                          <td className="text-right text-slate-800">{(action === 'BUY_PE' ? '−' : '')}{opt.entryDelta.toFixed(3)}</td>
                        </tr>
                        <tr>
                          <td className="text-slate-800 py-0.5">Target</td>
                          <td className="text-right text-emerald-700">₹{opt.targetPremiumPerShare.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="text-slate-800 py-0.5">SL</td>
                          <td className="text-right text-red-700">₹{opt.slPremiumPerShare.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="text-slate-800 py-0.5">Theta/day</td>
                          <td className="text-right text-red-700">−₹{opt.entryTheta.toFixed(2)}</td>
                        </tr>
                        <tr><td colSpan="2" className="border-t border-slate-200 py-0.5"></td></tr>
                        <tr>
                          <td className="text-slate-800 py-0.5">Profit/lot</td>
                          <td className={`text-right font-bold ${opt.profitPerLot >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{opt.profitPerLot >= 0 ? '+' : '−'}₹{Math.abs(opt.profitPerLot).toFixed(0)}</td>
                        </tr>
                        <tr>
                          <td className="text-slate-800 py-0.5">Loss/lot</td>
                          <td className="text-right text-red-600">−₹{Math.abs(opt.lossPerLot).toFixed(0)}</td>
                        </tr>
                        <tr>
                          <td className="text-slate-800 py-0.5">Capital</td>
                          <td className="text-right text-slate-800">₹{opt.capitalRequiredPerLot.toFixed(0)}</td>
                        </tr>
                        <tr>
                          <td className="text-slate-800 py-0.5">ROI</td>
                          <td className={`text-right ${opt.returnOnCapitalPct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{opt.returnOnCapitalPct.toFixed(0)}%</td>
                        </tr>
                      </tbody>
                    </table>
                    {opt.decayChallenged && (
                      <div className="mt-2 text-[9px] text-amber-600 leading-relaxed border-t border-amber-200 pt-1.5">
                        ⚠ Decay-challenged: the projected underlying move is too small to clear theta + IV-crush at this strike by 3:05 PM. Target shown is a minimal floor above entry — this is a weak setup; a bigger move or a deeper-ITM strike (less theta) is needed to profit.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Tradeoff explainer */}
          <div className="bg-transparent border border-slate-200 rounded-md p-2.5 mb-3 text-[10px] text-slate-800 leading-relaxed">
            <span className="text-amber-600">Tradeoff:</span> Going deeper ITM raises delta (more 1:1 with {sym}) and lowers theta-per-day (less decay punishment), but requires more capital. ATM is high-gamma — small moves matter most. 2-ITM (default) balances both.
          </div>

          {/* Next-day open section removed per design */}


          {/* Math footnote removed per design */}
        </div>
      )}

      {/* HEADLINE */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <div className="text-[10px] font-mono text-slate-800 mb-1 uppercase tracking-wider">{isAdmin ? 'Positioning context' : 'Positioning Read'}</div>
          <div className={`text-3xl font-bold ${c.text} flex items-baseline gap-2 flex-wrap`}>
            {actionLabel}
            <span className="text-base font-mono text-slate-800">· {symbolForTitle}</span>
          </div>
          <div className="text-xs text-slate-800 mt-1.5 font-mono">
            Reference premium ~₹{premium.toFixed(2)} · IV {iv.toFixed(1)}%
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-lg ${c.solid} ${c.solidText} text-xs font-bold font-mono whitespace-nowrap flex-shrink-0`}>
          {confidence} CONFIDENCE
        </div>
      </div>

      {/* BIG R:R PANEL — now with touch probabilities */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-3 card-shadow">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-[10px] font-mono text-slate-800 uppercase tracking-wider mb-1">Risk : Reward</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 font-mono">1 : {rrMultiple.toFixed(2)}</span>
            </div>
            <div className={`text-[11px] font-mono mt-0.5 ${rrTextClass} font-semibold`}>
              {rrLabel} setup
            </div>
          </div>
          <div className="sm:border-l sm:border-slate-200 sm:pl-4">
            <div className="text-[10px] font-mono text-slate-800 uppercase tracking-wider mb-1">Reward potential</div>
            <div className="text-2xl font-bold text-emerald-700 font-mono">{reward.toFixed(0)} <span className="text-sm text-slate-800">pts</span></div>
            <div className="text-[11px] font-mono text-slate-800 mt-0.5">
              <span className="text-emerald-700 font-bold">~{targetTouchProb}%</span> chance to touch {target}
            </div>
          </div>
          <div className="sm:border-l sm:border-slate-200 sm:pl-4">
            <div className="text-[10px] font-mono text-slate-800 uppercase tracking-wider mb-1">Risk exposure</div>
            <div className="text-2xl font-bold text-red-700 font-mono">{risk.toFixed(0)} <span className="text-sm text-slate-800">pts</span></div>
            <div className="text-[11px] font-mono text-slate-800 mt-0.5">
              <span className="text-red-700 font-bold">~{slTouchProb}%</span> chance to breach {stopLoss}
            </div>
          </div>
        </div>

        {/* Expected value summary line */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <span className="text-slate-800">
            Expected value (probability-weighted):
          </span>
          <span className={`${evClass} font-bold`}>
            {expectedValue > 0 ? '+' : ''}{expectedValue.toFixed(0)} pts on {sym}
            <span className="text-slate-800 ml-1.5">
              ({targetTouchProb}% × {reward.toFixed(0)} − {slTouchProb}% × {risk.toFixed(0)})
            </span>
          </span>
        </div>
      </div>

      {/* VISUAL LADDER with probability bands */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-3 card-shadow">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="text-[10px] font-mono text-slate-800 uppercase tracking-wider">Where {sym} may head today</div>
          <div className="text-[10px] font-mono text-slate-800">
            1-SD move: ±{expectedMove.toFixed(0)} pts (from IV)
          </div>
        </div>

        {/* Three-point label row */}
        <div className="grid grid-cols-3 mb-2">
          <div className="text-left">
            <div className="text-[9px] font-mono text-slate-800 uppercase tracking-wide">Bias invalidates</div>
            <div className="text-lg font-bold font-mono text-red-700">{stopLoss}</div>
            <div className="text-[9px] font-mono text-red-700 font-semibold">~{slTouchProb}% chance to touch</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] font-mono text-slate-800 uppercase tracking-wide">Spot now</div>
            <div className="text-lg font-bold font-mono text-amber-700">{spot}</div>
            <div className="text-[9px] font-mono text-slate-800">reference price</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-mono text-slate-800 uppercase tracking-wide">Bias plays out</div>
            <div className="text-lg font-bold font-mono text-emerald-700">{target}</div>
            <div className="text-[9px] font-mono text-emerald-700 font-semibold">~{targetTouchProb}% chance to touch</div>
          </div>
        </div>

        {/* Visual gradient bar with spot indicator */}
        <div className="relative mt-4">
          <div className="h-3 rounded-full bg-gradient-to-r from-red-200 via-slate-100 to-emerald-200"></div>
          <div
            className="absolute top-1/2 w-0.5 h-6 bg-amber-600 rounded-full"
            style={{ left: `${spotPositionPct}%`, transform: 'translate(-50%, -50%)' }}
          ></div>
          <div
            className="absolute top-full w-3 h-3 rounded-full bg-amber-600 border-2 border-white shadow"
            style={{ left: `${spotPositionPct}%`, transform: 'translate(-50%, -50%)' }}
          ></div>
        </div>

        {/* Bottom labels */}
        <div className="flex justify-between mt-5 text-[10px] font-mono text-slate-800">
          <span>← bias would fail</span>
          <span>bias would confirm →</span>
        </div>
      </div>

      {/* CONTEXT */}
      <div className="space-y-1.5 mb-4">
        <div className="text-[10px] font-mono text-slate-800 uppercase tracking-wider mb-1">Context</div>
        {conditions.map((cond, i) => (
          <div key={i} className="text-xs flex items-start gap-2 text-slate-800">
            <span className="font-mono mt-0.5 text-slate-800">→</span>
            <span>{cond}</span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-slate-200 text-[10px] font-mono text-slate-800 leading-relaxed">
        <strong className="text-slate-800">How probabilities are estimated:</strong> Touch probabilities derived from ATM implied volatility using the standard options approximation P(touch) ≈ 2 × P(close beyond). These are <em>rough estimates of what the market is pricing in</em>, not predictions. IV changes throughout the day; real outcomes depend on news, flows, and macro factors not captured here. Educational positioning analysis derived from publicly available option chain data. Not a recommendation, not investment advice. Option positions carry uncapped risk on the sell side and total premium loss on the buy side.
      </div>
    </div>
  );
}

// ============================================================================
// SETTINGS MODAL — Provider switcher + Dhan credentials manager
// ============================================================================
function SettingsModal({
  provider, setProvider,
  dhanClientId, setDhanClientId,
  dhanAccessToken, setDhanAccessToken,
  onClose,
}) {
  const [localId, setLocalId] = useState(dhanClientId);
  const [localToken, setLocalToken] = useState(dhanAccessToken);
  const [localProvider, setLocalProvider] = useState(provider);
  const [showToken, setShowToken] = useState(false);

  const save = () => {
    setProvider(localProvider);
    setDhanClientId(localId.trim());
    setDhanAccessToken(localToken.trim());
    onClose();
  };

  const clearDhan = () => {
    setLocalId('');
    setLocalToken('');
    setDhanClientId('');
    setDhanAccessToken('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-300 rounded-xl max-w-lg w-full p-6 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-serif">Data Provider Settings</h2>
              <p className="text-xs text-slate-400 font-mono">Configure your live-fetch source</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider selector */}
        <div className="mb-5">
          <label className="block text-[10px] font-mono text-slate-400 mb-2 uppercase tracking-wider">Provider</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setLocalProvider('dhan')}
              className={`px-3 py-2 rounded-md text-sm font-semibold border transition ${
                localProvider === 'dhan'
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                  : 'bg-slate-100 border-slate-300 text-slate-400 hover:border-slate-600'
              }`}
            >
              Dhan (recommended)
            </button>
            <button
              onClick={() => setLocalProvider('nse')}
              className={`px-3 py-2 rounded-md text-sm font-semibold border transition ${
                localProvider === 'nse'
                  ? 'bg-amber-100 border-amber-500 text-amber-700'
                  : 'bg-slate-100 border-slate-300 text-slate-400 hover:border-slate-600'
              }`}
            >
              NSE Direct (scraped)
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            {localProvider === 'dhan'
              ? 'Reliable broker API. Requires Dhan account + token (regenerate daily).'
              : 'Public NSE scrape. Often blocked from cloud IPs.'}
          </p>
        </div>

        {/* Dhan credentials section */}
        {localProvider === 'dhan' && (
          <>
            <div className="border-t border-slate-200 pt-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800">Dhan Credentials</h3>
                <a
                  href="https://web.dhan.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  Open Dhan Web <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Client ID</label>
              <input
                type="text"
                value={localId}
                onChange={e => setLocalId(e.target.value)}
                placeholder="e.g. 1000000001"
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm font-mono text-slate-800 focus:outline-none focus:border-amber-600 mb-3"
              />

              <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase flex items-center justify-between">
                <span>Access Token (JWT)</span>
                <button
                  onClick={() => setShowToken(s => !s)}
                  className="text-amber-600 hover:text-amber-700 text-[10px] normal-case font-sans"
                >
                  {showToken ? 'Hide' : 'Show'}
                </button>
              </label>
              <textarea
                value={localToken}
                onChange={e => setLocalToken(e.target.value)}
                placeholder="Paste your JWT from web.dhan.co → Profile → DhanHQ Trading APIs"
                rows={3}
                className={`w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-amber-600 resize-none ${
                  showToken ? '' : 'blur-sm hover:blur-none focus:blur-none transition'
                }`}
              />
              <p className="text-[11px] text-slate-400 mt-2 font-mono">
                Token expires every 24h (SEBI rule). Regenerate daily from web.dhan.co.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 text-xs text-amber-700">
              <strong>How to get credentials:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-0.5 text-slate-700">
                <li>Log in to web.dhan.co</li>
                <li>Profile → DhanHQ Trading APIs</li>
                <li>First time: click "Request Access", wait, refresh</li>
                <li>Click "Generate Access Token"</li>
                <li>Copy Client ID and Token, paste above</li>
              </ol>
            </div>
          </>
        )}

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
          {localProvider === 'dhan' && (dhanClientId || dhanAccessToken) ? (
            <button onClick={clearDhan} className="text-xs px-3 py-2 text-red-600 hover:text-red-700">
              Clear stored credentials
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} className="text-sm px-4 py-2 text-slate-400 hover:text-slate-800">
              Cancel
            </button>
            <button
              onClick={save}
              className="text-sm px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-md"
            >
              Save
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 mt-4 font-mono leading-relaxed">
          Credentials stored in browser localStorage on your device only. Never sent anywhere except via your own Vercel proxy → Dhan.
          Sharing this URL with someone else does NOT share your credentials.
        </p>
      </div>
    </div>
  );
}
