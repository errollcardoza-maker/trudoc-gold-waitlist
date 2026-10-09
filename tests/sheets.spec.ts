import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { expect, test } from '@playwright/test';
import type { StoredSignup, WaitlistDb } from '../lib/db';
import { syncToSheet } from '../lib/sheets';

/** Minimal in-test store with the same contract as lib/db.ts. */
function fakeDb(n: number) {
  const rows = Array.from({ length: n }, (_, i): StoredSignup & { synced: boolean } => ({
    id: `id-${i}`,
    createdAt: new Date(Date.UTC(2026, 9, 9, 10, i)).toISOString(),
    name: `Person ${i}`,
    phoneE164: '+971501234567',
    plan: i % 2 ? 'family' : 'individual',
    utm: i === 0 ? { utm_source: 'ig', utm_campaign: 'launch', utm_medium: 'social' } : null,
    synced: false,
  }));
  const db: WaitlistDb = {
    insertSignup: async () => ({ duplicate: false }),
    hit: async () => 1,
    unsyncedSignups: async (limit) => rows.filter((r) => !r.synced).slice(0, limit),
    markSynced: async (ids) => rows.forEach((r) => ids.includes(r.id) && (r.synced = true)),
  };
  return { db, rows };
}

function fakeFetch(handler: (body: { secret: string; rows: Record<string, string>[] }) => { status?: number; json: unknown }) {
  const calls: { secret: string; rows: Record<string, string>[] }[] = [];
  const impl = (async (_url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body));
    calls.push(body);
    const r = handler(body);
    return new Response(JSON.stringify(r.json), { status: r.status ?? 200 });
  }) as typeof fetch;
  return { impl, calls };
}

test.describe('syncToSheet', () => {
  test('sends unsynced signups with display formatting, then marks them synced', async () => {
    const { db, rows } = fakeDb(2);
    const { impl, calls } = fakeFetch(() => ({ json: { ok: true } }));
    expect(await syncToSheet(db, { url: 'https://x', secret: 's3', fetchImpl: impl })).toBe(2);
    expect(calls).toHaveLength(1);
    expect(calls[0].secret).toBe('s3');
    expect(calls[0].rows[0]).toEqual({
      id: 'id-0',
      createdAt: '2026-10-09T10:00:00.000Z',
      name: 'Person 0',
      phone: '+971 50 123 4567',
      plan: 'Individual',
      source: 'ig',
      campaign: 'launch',
      medium: 'social',
    });
    expect(calls[0].rows[1].plan).toBe('Family');
    expect(rows.every((r) => r.synced)).toBe(true);

    // Nothing left: no further request.
    expect(await syncToSheet(db, { url: 'https://x', secret: 's3', fetchImpl: impl })).toBe(0);
    expect(calls).toHaveLength(1);
  });

  test('a failed sync leaves rows pending so the next one retries them', async () => {
    const { db, rows } = fakeDb(3);
    const down = fakeFetch(() => ({ status: 500, json: { ok: false, error: 'boom' } }));
    await expect(syncToSheet(db, { url: 'https://x', secret: 's', fetchImpl: down.impl })).rejects.toThrow(/sheet sync failed/);
    expect(rows.some((r) => r.synced)).toBe(false);

    const up = fakeFetch(() => ({ json: { ok: true } }));
    expect(await syncToSheet(db, { url: 'https://x', secret: 's', fetchImpl: up.impl })).toBe(3);
  });

  test('rejected secret is treated as a failure', async () => {
    const { db } = fakeDb(1);
    const { impl } = fakeFetch(() => ({ json: { ok: false, error: 'unauthorized' } }));
    await expect(syncToSheet(db, { url: 'https://x', secret: 'bad', fetchImpl: impl })).rejects.toThrow(/unauthorized/);
  });

  test('backfills in batches', async () => {
    const { db } = fakeDb(120);
    const { impl, calls } = fakeFetch(() => ({ json: { ok: true } }));
    expect(await syncToSheet(db, { url: 'https://x', secret: 's', fetchImpl: impl })).toBe(120);
    expect(calls.map((c) => c.rows.length)).toEqual([50, 50, 20]);
  });
});

/** Runs integrations/google-sheet/Code.gs against a fake SpreadsheetApp. */
function loadAppsScript(secret = 'shh') {
  const grid: unknown[][] = [];
  const range = (row: number, col: number, nRows: number, nCols: number) => ({
    setValues(vals: unknown[][]) {
      vals.forEach((v, i) => (grid[row - 1 + i] = v.slice(0, nCols)));
      return this;
    },
    getValues: () => grid.slice(row - 1, row - 1 + nRows).map((r) => r.slice(col - 1, col - 1 + nCols)),
    setFontWeight() { return this; },
    setNumberFormat() { return this; },
  });
  const sheet = { getLastRow: () => grid.length, getRange: range, setFrozenRows() {} };
  const props: Record<string, string> = { SECRET: secret };
  const ctx = vm.createContext({
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: () => sheet, insertSheet: () => sheet, setSpreadsheetTimeZone() {} }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k: string) => props[k] ?? null, setProperty: (k: string, v: string) => (props[k] = v) }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: { createTextOutput: (s: string) => ({ setMimeType: () => JSON.parse(s) }), MimeType: { JSON: 'json' } },
    Utilities: { getUuid: () => '00000000-0000-0000-0000-000000000000' },
    Logger: { log() {} },
  });
  vm.runInContext(readFileSync(join(__dirname, '../integrations/google-sheet/Code.gs'), 'utf8'), ctx);
  const post = (body: unknown) => (ctx.doPost as (e: unknown) => { ok: boolean; appended?: number; error?: string })({ postData: { contents: JSON.stringify(body) } });
  return { ctx, grid, post };
}

test.describe('Apps Script (Code.gs)', () => {
  const row = { id: 'a1', createdAt: '2026-10-09T10:00:00.000Z', name: 'Sara', phone: '+971 50 123 4567', plan: 'Family', source: '=HYPERLINK("x")', campaign: '', medium: '' };

  test('setup writes the header row', () => {
    const { ctx, grid } = loadAppsScript();
    (ctx.setup as () => void)();
    expect(grid[0]).toEqual(['Signed up (Dubai time)', 'Name', 'Phone', 'Plan', 'Source', 'Campaign', 'Medium', 'Signup ID']);
  });

  test('appends rows, keeps phone as text, neutralises formulas, and skips known IDs', () => {
    const { ctx, grid, post } = loadAppsScript();
    (ctx.setup as () => void)();
    expect(post({ secret: 'shh', rows: [row] })).toEqual({ ok: true, appended: 1 });
    // A real date cell (Date from the script's own realm), not text.
    expect((grid[1][0] as Date).toISOString()).toBe('2026-10-09T10:00:00.000Z');
    expect(grid[1].slice(1)).toEqual(['Sara', "'+971 50 123 4567", 'Family', '\'=HYPERLINK("x")', '', '', 'a1']);

    // Retried batch with one known and one new row: only the new one is added.
    expect(post({ secret: 'shh', rows: [row, { ...row, id: 'a2', name: 'Omar' }] })).toEqual({ ok: true, appended: 1 });
    expect(grid).toHaveLength(3);
  });

  test('rejects a wrong secret', () => {
    const { post, grid } = loadAppsScript();
    expect(post({ secret: 'nope', rows: [row] })).toEqual({ ok: false, error: 'unauthorized' });
    expect(grid).toHaveLength(0);
  });
});

test.describe('sheet cells (connector sync)', () => {
  test('formats date in Dubai time and keeps phone/formula-like values as text', async () => {
    const { sheetCells } = await import('../lib/sheets');
    expect(
      sheetCells({ id: 'x', createdAt: '2026-10-09T10:05:00.000Z', name: 'Sara', phone: '+971 50 123 4567', plan: 'Family', source: '=cmd', campaign: '', medium: '@m' }),
    ).toEqual(['2026-10-09 14:05', 'Sara', "'+971 50 123 4567", 'Family', "'=cmd", '', "'@m", 'x']);
  });
});

test.describe('/api/sheet-sync', () => {
  const auth = { authorization: 'Bearer test-sheet-token' };

  test('rejects a missing or wrong token', async ({ request }) => {
    expect((await request.get('/api/sheet-sync')).status()).toBe(401);
    expect((await request.get('/api/sheet-sync', { headers: { authorization: 'Bearer nope' } })).status()).toBe(401);
  });

  test('lists unsynced signups as sheet rows, and marking removes them', async ({ request }) => {
    const phone = `05${Math.floor(Math.random() * 1e8).toString().padStart(8, '0')}`;
    const ip = { 'x-forwarded-for': `10.9.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` };
    await request.post('/api/waitlist', { data: { name: 'Lina Sync', phone, plan: 'family', t: 5000 }, headers: ip });

    const list = await (await request.get('/api/sheet-sync', { headers: auth })).json();
    const row = list.rows.find((r: { cells: string[] }) => r.cells[1] === 'Lina Sync');
    expect(row.cells[2]).toMatch(/^'\+971 5\d \d{3} \d{4}$/);
    expect(row.cells[3]).toBe('Family');
    expect(row.cells[0]).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);

    const marked = await request.post('/api/sheet-sync', { headers: auth, data: { ids: [row.id] } });
    expect(await marked.json()).toEqual({ ok: true, marked: 1 });
    const after = await (await request.get('/api/sheet-sync', { headers: auth })).json();
    expect(after.rows.some((r: { id: string }) => r.id === row.id)).toBe(false);
  });
});
