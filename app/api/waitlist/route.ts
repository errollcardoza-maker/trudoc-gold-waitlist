import { createHash } from 'node:crypto';
import { getDb } from '@/lib/db';
import { waitlistSchema } from '@/lib/validation';

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const MIN_FILL_MS = 1500;
const MAX_BODY_BYTES = 8 * 1024;

type Result = { ok: true; duplicate?: true } | { ok: false; error: string };

const json = (body: Result, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

function clientIp(req: Request): string {
  // On Vercel, x-forwarded-for / x-real-ip are set by the platform to the client IP.
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

export async function POST(req: Request) {
  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'invalid_request' }, 413);
  }

  const salt = process.env.IP_HASH_SALT;
  if (!salt && process.env.NODE_ENV === 'production' && process.env.WAITLIST_DB !== 'memory') {
    console.error('[waitlist] IP_HASH_SALT is not set');
    return json({ ok: false, error: 'server_error' }, 500);
  }
  const ipHash = createHash('sha256').update(clientIp(req) + (salt ?? 'dev-salt')).digest('hex');

  try {
    const db = getDb();

    // Count every request, valid or not, so the limit can't be dodged with junk bodies.
    if ((await db.hit(`waitlist:${ipHash}`, RATE_WINDOW_MS)) > RATE_MAX) {
      return json({ ok: false, error: 'rate_limited' }, 429);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: 'invalid_request' }, 400);
    }
    const parsed = waitlistSchema.safeParse(body);
    if (!parsed.success) return json({ ok: false, error: 'invalid_input' }, 400);
    const d = parsed.data;

    // Likely bot: honeypot filled, or submitted implausibly fast. Look successful, store nothing.
    if (d.company || d.t === undefined || d.t < MIN_FILL_MS) return json({ ok: true });

    const utm = d.utm && Object.keys(d.utm).length ? (d.utm as Record<string, string>) : null;
    const { duplicate } = await db.insertSignup({
      name: d.name,
      phoneE164: d.phone,
      plan: d.plan,
      source: utm?.utm_source ?? null,
      utm,
      userAgent: req.headers.get('user-agent')?.slice(0, 512) ?? null,
      ipHash,
    });
    return json(duplicate ? { ok: true, duplicate: true } : { ok: true });
  } catch (err) {
    console.error('[waitlist]', err);
    return json({ ok: false, error: 'server_error' }, 500);
  }
}
