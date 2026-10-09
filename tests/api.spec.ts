import { expect, test } from '@playwright/test';
import { randomIp, randomPhone } from './helpers';
import { formatPhoneDisplay, phoneDigits, toE164 } from '../lib/validation';

test.describe('phone normalisation (unit)', () => {
  for (const v of ['0501234567', '+971 50 123 4567', '971501234567', '501234567']) {
    test(`"${v}" → +971501234567`, () => {
      expect(toE164(v)).toBe('+971501234567');
      expect(formatPhoneDisplay(v)).toBe('+971 50 123 4567');
    });
  }
  for (const v of ['0401234567', '5012345', '', '+971 4 123 4567']) {
    test(`"${v}" is rejected`, () => expect(toE164(v)).toBeNull());
  }
  test('strips 971 then a leading 0', () => expect(phoneDigits('+971 050 123 4567')).toBe('501234567'));
});

test.describe('POST /api/waitlist', () => {
  const body = (over: Record<string, unknown> = {}) => ({ name: 'Jane Doe', phone: randomPhone(), plan: 'individual', t: 5000, ...over });

  test('accepts a valid signup and reports duplicates', async ({ request }) => {
    const headers = { 'x-forwarded-for': randomIp() };
    const data = body({ utm: { utm_source: 'ig' } });
    const a = await request.post('/api/waitlist', { data, headers });
    expect(a.status()).toBe(200);
    expect(await a.json()).toEqual({ ok: true });

    const b = await request.post('/api/waitlist', { data: { ...data, phone: toE164(data.phone as string) }, headers });
    expect(await b.json()).toEqual({ ok: true, duplicate: true });
  });

  test('rejects invalid input with 400', async ({ request }) => {
    const headers = { 'x-forwarded-for': randomIp() };
    for (const bad of [{ name: 'J' }, { phone: '0401234567' }, { plan: 'gold' }, { name: 'x'.repeat(121) }]) {
      const r = await request.post('/api/waitlist', { data: body(bad), headers });
      expect(r.status()).toBe(400);
      expect((await r.json()).ok).toBe(false);
    }
  });

  test('honeypot and too-fast submissions look successful but store nothing', async ({ request }) => {
    const headers = { 'x-forwarded-for': randomIp() };
    const phone = randomPhone();
    expect(await (await request.post('/api/waitlist', { data: body({ phone, company: 'Acme' }), headers })).json()).toEqual({ ok: true });
    expect(await (await request.post('/api/waitlist', { data: body({ phone, t: 300 }), headers })).json()).toEqual({ ok: true });
    // Neither was stored, so a real submission is not a duplicate.
    expect(await (await request.post('/api/waitlist', { data: body({ phone }), headers })).json()).toEqual({ ok: true });
  });

  test('rate-limits to 5 requests per 10 minutes per IP', async ({ request }) => {
    const headers = { 'x-forwarded-for': randomIp() };
    const statuses = [];
    for (let i = 0; i < 6; i++) statuses.push((await request.post('/api/waitlist', { data: body(), headers })).status());
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
  });
});
