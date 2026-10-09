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

export interface WaitlistDb {
  /** Inserts a signup. A phone number that already exists is a no-op and returns `duplicate: true`. */
  insertSignup(row: SignupRow): Promise<{ duplicate: boolean }>;
  /** Fixed-window counter. Returns the hit count for `key` in the current window, including this hit. */
  hit(key: string, windowMs: number): Promise<number>;
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
  };
}

// In-memory store for local development and the Playwright suite (WAITLIST_DB=memory).
function memoryDb(): WaitlistDb {
  const g = globalThis as unknown as { __tdgMem?: { phones: Map<string, SignupRow>; hits: Map<string, number> } };
  const mem = (g.__tdgMem ??= { phones: new Map(), hits: new Map() });
  return {
    async insertSignup(r) {
      if (mem.phones.has(r.phoneE164)) return { duplicate: true };
      mem.phones.set(r.phoneE164, r);
      return { duplicate: false };
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
