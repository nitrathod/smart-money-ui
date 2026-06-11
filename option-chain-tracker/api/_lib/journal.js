// ============================================================================
// Journal storage helpers (Vercel KV / Upstash Redis)
// Schema:
//   journal:<userEmail>:<entryId>  → JSON blob with trade idea + outcome
//   journal:<userEmail>:_index     → array of entryIds (for listing without SCAN)
//
// Per-user isolation: each user only sees their own entries. Admin emails get
// their own journal — the journal is private even between admins.
// ============================================================================
import { kv } from '@vercel/kv';

const MAX_ENTRIES_PER_USER = 500; // hard cap to prevent runaway storage

/**
 * Valid outcome statuses (per the realistic 6-option set we agreed on).
 */
export const OUTCOME_STATUSES = [
  'pending',         // default — trade idea generated, not yet resolved
  'target_hit',      // full target reached
  'partial_target',  // partial profit booked before target
  'sl_hit',          // stop loss triggered
  'closed_flat',     // exited around entry — no real win or loss
  'exited_early',    // exited before SL or target (discretion)
  'skipped',         // never took the trade
];

/**
 * Build the entry key.
 */
function entryKey(email, entryId) {
  return `journal:${email}:${entryId}`;
}

function indexKey(email) {
  return `journal:${email}:_index`;
}

/**
 * Save a new journal entry. Returns the saved entry with assigned id.
 * If `entry.id` is provided, it's an update; otherwise a new id is minted.
 */
export async function saveEntry(email, entry) {
  if (!email) throw new Error('email required');

  const isUpdate = !!entry.id;
  const id = entry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const now = new Date().toISOString();
  const record = {
    ...entry,
    id,
    email,
    createdAt: entry.createdAt || now,
    updatedAt: now,
    outcome: entry.outcome || 'pending',
  };

  await kv.set(entryKey(email, id), record);

  // Maintain index for listing
  if (!isUpdate) {
    const existing = (await kv.get(indexKey(email))) || [];
    if (existing.length >= MAX_ENTRIES_PER_USER) {
      // Drop oldest entry to make room
      const oldest = existing.shift();
      if (oldest) await kv.del(entryKey(email, oldest));
    }
    existing.push(id);
    await kv.set(indexKey(email), existing);
  }

  return record;
}

/**
 * List all entries for a user, most recent first.
 * Returns up to `limit` entries.
 */
export async function listEntries(email, { limit = 200 } = {}) {
  if (!email) throw new Error('email required');

  const index = (await kv.get(indexKey(email))) || [];
  if (index.length === 0) return [];

  // Newest first; cap at limit
  const ids = index.slice(-limit).reverse();
  const keys = ids.map(id => entryKey(email, id));

  // Fetch in one batch
  const records = await kv.mget(...keys);
  return records.filter(Boolean);
}

/**
 * Get one entry by id.
 */
export async function getEntry(email, id) {
  if (!email || !id) return null;
  return kv.get(entryKey(email, id));
}

/**
 * Delete an entry.
 */
export async function deleteEntry(email, id) {
  if (!email || !id) return false;
  await kv.del(entryKey(email, id));
  const index = (await kv.get(indexKey(email))) || [];
  const filtered = index.filter(x => x !== id);
  await kv.set(indexKey(email), filtered);
  return true;
}

/**
 * Update only the outcome fields of an existing entry.
 * Used by the "mark outcome" inline UI without re-uploading the full trade idea.
 */
export async function updateOutcome(email, id, { outcome, exitPremium, notes, exitedAt }) {
  if (!email || !id) throw new Error('email and id required');
  const existing = await kv.get(entryKey(email, id));
  if (!existing) throw new Error('entry not found');

  if (outcome && !OUTCOME_STATUSES.includes(outcome)) {
    throw new Error(`invalid outcome: ${outcome}`);
  }

  const updated = {
    ...existing,
    outcome: outcome || existing.outcome,
    exitPremium: exitPremium !== undefined ? exitPremium : existing.exitPremium,
    notes: notes !== undefined ? notes : existing.notes,
    exitedAt: exitedAt || (outcome && outcome !== 'pending' ? new Date().toISOString() : existing.exitedAt),
    updatedAt: new Date().toISOString(),
  };
  await kv.set(entryKey(email, id), updated);
  return updated;
}
