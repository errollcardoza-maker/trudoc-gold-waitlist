import type { WaitlistDb } from './db';
import { formatPhoneDisplay } from './validation';

// Sends signups to a Google Sheet through the Apps Script web app in integrations/google-sheet/Code.gs.
// Neon stays the source of truth: rows are marked `sheet_synced_at` only after the sheet confirms,
// so anything missed (Google down, timeout) is picked up by the next sync. The script de-duplicates
// by signup ID, so overlapping syncs never create duplicate rows.

export type SheetRow = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  plan: string;
  source: string;
  campaign: string;
  medium: string;
};

type Config = { url: string; secret: string; fetchImpl?: typeof fetch; batch?: number };

const PLAN_LABEL: Record<string, string> = { individual: 'Individual', family: 'Family' };

export function sheetsConfig(): Config | null {
  const url = process.env.SHEETS_WEBHOOK_URL;
  const secret = process.env.SHEETS_WEBHOOK_SECRET;
  return url && secret ? { url, secret } : null;
}

/** Appends every unsynced signup to the sheet (oldest first). Returns how many were confirmed. */
export async function syncToSheet(db: WaitlistDb, { url, secret, fetchImpl = fetch, batch = 50 }: Config): Promise<number> {
  let total = 0;
  for (let round = 0; round < 10; round++) {
    const pending = await db.unsyncedSignups(batch);
    if (!pending.length) break;

    const rows: SheetRow[] = pending.map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      name: s.name,
      phone: formatPhoneDisplay(s.phoneE164),
      plan: PLAN_LABEL[s.plan] ?? s.plan,
      source: s.utm?.utm_source ?? '',
      campaign: s.utm?.utm_campaign ?? '',
      medium: s.utm?.utm_medium ?? '',
    }));

    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret, rows }),
      redirect: 'follow', // Apps Script answers via a redirect to googleusercontent.com
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!res.ok || !body?.ok) throw new Error(`sheet sync failed: HTTP ${res.status} ${body?.error ?? ''}`.trim());

    await db.markSynced(pending.map((s) => s.id));
    total += pending.length;
    if (pending.length < batch) break;
  }
  return total;
}
