// Symbol master — resolves an F&O underlying (index or stock) to the Dhan option-chain
// parameters {scrip, seg} plus its lot size, sourced from Dhan's PUBLIC instrument master.
//
// For the option-chain API, UnderlyingScrip = the underlying's security id and UnderlyingSeg =
// the underlying's segment (IDX_I for an index, NSE_EQ for a stock). The detailed master's
// OPTSTK / OPTIDX rows carry UNDERLYING_SYMBOL, UNDERLYING_SECURITY_ID and LOT_SIZE — exactly
// what we need. We cache the parsed map (lot sizes change only on periodic NSE review).

const MASTER_URL = 'https://images.dhan.co/api-data/api-scrip-master-detailed.csv';
const TTL_MS = 12 * 60 * 60 * 1000; // 12h

// Verified static seed — guarantees the indices + RELIANCE work even if the master fetch fails,
// and overrides the master for these so a bad row can't break the core symbols.
export const STATIC_SYMBOLS = {
  NIFTY:      { scrip: 13,   seg: 'IDX_I',  lotSize: 65,  label: 'NIFTY',      type: 'index' },
  BANKNIFTY:  { scrip: 25,   seg: 'IDX_I',  lotSize: 35,  label: 'BANKNIFTY',  type: 'index' },
  FINNIFTY:   { scrip: 27,   seg: 'IDX_I',  lotSize: 65,  label: 'FINNIFTY',   type: 'index' },
  MIDCPNIFTY: { scrip: 442,  seg: 'IDX_I',  lotSize: 140, label: 'MIDCPNIFTY', type: 'index' },
  RELIANCE:   { scrip: 2885, seg: 'NSE_EQ', lotSize: 500, label: 'RELIANCE',   type: 'stock' },
};

let cache = { map: null, at: 0 };

// Minimal CSV line parser that respects double-quoted fields (which may contain commas).
function parseCSVLine(line) {
  const out = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cur += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export async function getSymbolMaster() {
  if (cache.map && Date.now() - cache.at < TTL_MS) return cache.map;
  try {
    const res = await fetch(MASTER_URL);
    if (!res.ok) throw new Error('master HTTP ' + res.status);
    const text = await res.text();
    const lines = text.split('\n');
    const header = parseCSVLine(lines[0]).map(h => h.trim());
    const col = {};
    header.forEach((h, i) => { col[h] = i; });
    const ci = {
      exch: col['EXCH_ID'],
      inst: col['INSTRUMENT'],
      uSym: col['UNDERLYING_SYMBOL'],
      uId:  col['UNDERLYING_SECURITY_ID'],
      lot:  col['LOT_SIZE'],
    };
    // If the expected columns aren't present, bail to static.
    if ([ci.exch, ci.inst, ci.uSym, ci.uId, ci.lot].some(v => v == null)) {
      throw new Error('master columns missing');
    }
    const map = {};
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i]) continue;
      const c = parseCSVLine(lines[i]);
      if (c.length <= ci.lot) continue;
      if ((c[ci.exch] || '').trim() !== 'NSE') continue;
      const inst = (c[ci.inst] || '').trim();
      if (inst !== 'OPTSTK' && inst !== 'OPTIDX') continue;
      const sym = (c[ci.uSym] || '').trim().toUpperCase();
      if (!sym || map[sym]) continue; // one contract row per underlying is enough
      const scrip = parseInt(c[ci.uId], 10);
      const lotSize = parseInt(c[ci.lot], 10);
      if (!scrip || !lotSize) continue;
      map[sym] = {
        scrip,
        seg: inst === 'OPTIDX' ? 'IDX_I' : 'NSE_EQ',
        lotSize,
        label: sym,
        type: inst === 'OPTIDX' ? 'index' : 'stock',
      };
    }
    // Sanity: a real master has 150+ F&O underlyings. If we got far fewer, treat as failure.
    if (Object.keys(map).length < 50) throw new Error('master parse too small: ' + Object.keys(map).length);
    const merged = { ...map, ...STATIC_SYMBOLS }; // static wins for the verified core
    cache = { map: merged, at: Date.now() };
    return merged;
  } catch (e) {
    console.error('getSymbolMaster failed:', e.message);
    return cache.map || { ...STATIC_SYMBOLS };
  }
}
