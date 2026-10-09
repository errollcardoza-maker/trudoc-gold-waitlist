import { z } from 'zod';

// Rules ported exactly from the prototype. Shared by the form (client) and /api/waitlist (server).

export const PLANS = ['individual', 'family'] as const;
export type Plan = (typeof PLANS)[number];

const NAME_RE = /^[\p{L}][\p{L}\s'.-]*$/u;

/** Strip non-digits, then a leading 971, then a leading 0. */
export function phoneDigits(v: string | null | undefined): string {
  let d = (v || '').replace(/\D/g, '');
  if (d.startsWith('971')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return d;
}

export function isValidUaeMobile(v: string): boolean {
  const d = phoneDigits(v);
  return d.length === 9 && d[0] === '5';
}

/** `+9715XXXXXXXX`, or null if invalid. */
export function toE164(v: string): string | null {
  return isValidUaeMobile(v) ? `+971${phoneDigits(v)}` : null;
}

/** `+971 5X XXX XXXX` for display. */
export function formatPhoneDisplay(v: string): string {
  const d = phoneDigits(v);
  return d.length === 9 ? `+971 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}` : `+971 ${v}`;
}

export function nameError(name: string): string | null {
  const n = name.trim();
  if (!n) return 'Please enter your name';
  if (n.length < 2 || !NAME_RE.test(n)) return 'Please enter a valid name';
  return null;
}

export function phoneError(phone: string): string | null {
  const raw = phone.trim();
  if (!raw) return 'Please enter your phone number';
  if (!isValidUaeMobile(raw)) return 'Please enter a valid UAE mobile number, e.g. 050 123 4567';
  return null;
}

export function planError(plan: string | null): string | null {
  return plan ? null : 'Please choose a plan';
}

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

export const waitlistSchema = z.object({
  name: z
    .string()
    .transform((s) => s.trim())
    .refine((s) => nameError(s) === null, { message: 'invalid_name' })
    .refine((s) => s.length <= 120, { message: 'invalid_name' }),
  phone: z
    .string()
    .max(32)
    .refine((s) => phoneError(s) === null, { message: 'invalid_phone' })
    .transform((s) => toE164(s) as string),
  plan: z.enum(PLANS),
  utm: z.partialRecord(z.enum(UTM_KEYS), z.string().max(200)).optional(),
  /** Honeypot: must be empty. */
  company: z.string().max(200).optional(),
  /** Milliseconds between the form opening and submit. */
  t: z.number().nonnegative().optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
