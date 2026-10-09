import { createHash, timingSafeEqual } from 'node:crypto';
import { getDb } from '@/lib/db';
import { sheetCells, toSheetRow } from '@/lib/sheets';

// Private endpoint for the scheduled Claude task that copies signups into the Google Sheet
// (scripts/sheet-sync.mjs). Requires `Authorization: Bearer <SHEET_SYNC_TOKEN>`; returns 404 when
// the token isn't configured, so the route doesn't exist as far as anyone else can tell.
//
//   GET  → { count, more, rows: [{ id, cells: [8 sheet cells] }] }   signups not yet in the sheet
//   POST { ids: [...] } → { marked }                                  after they've been written

const LIMIT = 200;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const headers = { 'cache-control': 'no-store' };

function authorized(req: Request): boolean | null {
  const token = process.env.SHEET_SYNC_TOKEN;
  if (!token) return null;
  const given = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const h = (v: string) => createHash('sha256').update(v).digest();
  return timingSafeEqual(h(given), h(token));
}

function deny(auth: boolean | null) {
  return auth === null
    ? new Response('Not found', { status: 404, headers })
    : Response.json({ ok: false, error: 'unauthorized' }, { status: 401, headers });
}

export async function GET(req: Request) {
  const auth = authorized(req);
  if (!auth) return deny(auth);
  const pending = await getDb().unsyncedSignups(LIMIT);
  const rows = pending.map((s) => ({ id: s.id, cells: sheetCells(toSheetRow(s)) }));
  return Response.json({ count: rows.length, more: rows.length === LIMIT, rows }, { headers });
}

export async function POST(req: Request) {
  const auth = authorized(req);
  if (!auth) return deny(auth);
  const body = (await req.json().catch(() => null)) as { ids?: unknown } | null;
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x): x is string => typeof x === 'string' && UUID.test(x)) : [];
  if (!ids.length) return Response.json({ ok: false, error: 'no_ids' }, { status: 400, headers });
  await getDb().markSynced(ids);
  return Response.json({ ok: true, marked: ids.length }, { headers });
}
