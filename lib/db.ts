import { neon } from '@neondatabase/serverless';
import { SCHEMA_STATEMENTS } from './schema';
import type { Plan } from './validation';

// Server-only. Every write goes through /api/waitlist; the client never sees credentials.

export type SignupRow = {
  name: string;
  phoneE164: string;
  plan: Plan;
  source: string | null;
  utm: Record<string, string> | null;
  userAgent: string | null;
  ipHash: string | null;
};

/** A stored signup, as sent to the Google Sheet. */
export type StoredSignup = {
  id: string;
  createdAt: string; // ISO 8601
  name: string;
  phoneE164: string;
  plan: Plan;
  utm: Record<string, string> | null;
};

export interface WaitlistDb {
  /** Inserts a signup. A phone number that already exists is a no-op and returns `duplicate: true`. */
  insertSignup(row: SignupRow): Promise<{ duplicate: boolean }>;
  /** Fixed-window counter. Returns the hit count for `key` in the current window, including this hit. */
  hit(key: string, windowMs: number): Promise<number>;
  /** Oldest signups not yet appended to the Google Sheet. */
  unsyncedSignups(limit: number): Promise<StoredSignup[]>;
  markSynced(ids: string[]): Promise<void>;
}

function neonDb(url: string): WaitlistDb {
  const sql = neon(url);
  // Create tables on the first query after a cold start (idempotent), so a fresh database needs no manual step.
  let ready: Promise<void> | null = null;
  const ensureSchema = () =>
    (ready ??= (async () => {
      for (const stmt of SCHEMA_STATEMENTS) await sql.query(stmt);
    })().catch((err) => {
      ready = null; // retry on the next request
      throw err;
    }));
  return {
    async insertSignup(r) {
      await ensureSchema();
      const rows = await sql`
        insert into waitlist_signups (name, phone_e164, plan, source, utm, user_agent, ip_hash)
        values (${r.name}, ${r.phoneE164}, ${r.plan}, ${r.source}, ${r.utm ? JSON.stringify(r.utm) : null}::jsonb, ${r.userAgent}, ${r.ipHash})
        on conflict (phone_e164) do nothing
        returning id`;
      return { duplicate: rows.length === 0 };
    },
    async hit(key, windowMs) {
      await ensureSchema();
      const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);
      const rows = await sql`
        insert into waitlist_rate_limits (key, window_start, hits)
        values (${key}, ${windowStart.toISOString()}, 1)
        on conflict (key, window_start) do update set hits = waitlist_rate_limits.hits + 1
        returning hits`;
      // Occasionally prune old windows so the table stays small.
      if (Math.random() < 0.01) await sql`delete from waitlist_rate_limits where window_start < now() - interval '1 day'`;
      return Number(rows[0].hits);
    },
    async unsyncedSignups(limit) {
      await ensureSchema();
      const rows = await sql`
        select id, created_at, name, phone_e164, plan, utm
        from waitlist_signups
        where sheet_synced_at is null
        order by created_at
        limit ${limit}`;
      return rows.map((r) => ({
        id: String(r.id),
        createdAt: new Date(r.created_at).toISOString(),
        name: r.name,
        phoneE164: r.phone_e164,
        plan: r.plan,
        utm: r.utm ?? null,
      }));
    },
    async markSynced(ids) {
      if (!ids.length) return;
      await sql`update waitlist_signups set sheet_synced_at = now() where id = any(${ids}::uuid[])`;
    },
  };
}

// In-memory store for local development and the Playwright suite (WAITLIST_DB=memory).
function memoryDb(): WaitlistDb {
  type MemRow = StoredSignup & { synced: boolean };
  const g = globalThis as unknown as { __tdgMem?: { phones: Map<string, MemRow>; hits: Map<string, number> } };
  const mem = (g.__tdgMem ??= { phones: new Map(), hits: new Map() });
  return {
    async insertSignup(r) {
      if (mem.phones.has(r.phoneE164)) return { duplicate: true };
      mem.phones.set(r.phoneE164, {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        name: r.name,
        phoneE164: r.phoneE164,
        plan: r.plan,
        utm: r.utm,
        synced: false,
      });
      return { duplicate: false };
    },
    async unsyncedSignups(limit) {
      return [...mem.phones.values()]
        .filter((r) => !r.synced)
        .slice(0, limit)
        .map((r) => ({ id: r.id, createdAt: r.createdAt, name: r.name, phoneE164: r.phoneE164, plan: r.plan, utm: r.utm }));
    },
    async markSynced(ids) {
      for (const r of mem.phones.values()) if (ids.includes(r.id)) r.synced = true;
    },
    async hit(key, windowMs) {
      const k = `${key}:${Math.floor(Date.now() / windowMs)}`;
      const n = (mem.hits.get(k) ?? 0) + 1;
      mem.hits.set(k, n);
      return n;
    },
  };
}

let cached: WaitlistDb | null = null;

export function getDb(): WaitlistDb {
  if (cached) return cached;
  if (process.env.WAITLIST_DB === 'memory') return (cached = memoryDb());
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set (or set WAITLIST_DB=memory for local development)');
  return (cached = neonDb(url));
}
