'use client';

import { useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { planOptions, SUBMIT_ERROR } from '@/lib/content';
import { nameError, phoneError, planError, type Plan } from '@/lib/validation';
import { Icon } from './Icon';

export type ExpandRect = { t: string; r: string; b: string; l: string };
export type FormAnim = { closing: boolean; ex: ExpandRect | null; box: { l: number; w: number } | null };

type Props = {
  name: string;
  phone: string;
  plan: Plan | null;
  onName: (v: string) => void;
  onPhone: (v: string) => void;
  onPlan: (v: Plan) => void;
  openedAt: number;
  /** `screen`: full-screen mobile form (< 768px). `modal`: inside the desktop dialog. */
  variant?: 'screen' | 'modal';
  anim?: FormAnim;
  onBack?: () => void;
  onSuccess: () => void;
};

const RADIO = '226,166,49'; // gold (production default; Figma's blue was 51,92,255)
const SUBMIT_TIMEOUT_MS = 10_000;

function readUtm(): Record<string, string> | undefined {
  try {
    const raw = sessionStorage.getItem('tdg-utm');
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

export function WaitlistForm(p: Props) {
  const [touched, setTouched] = useState({ name: false, phone: false });
  const [focus, setFocus] = useState<'name' | 'phone' | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  const nErr = nameError(p.name);
  const pErr = phoneError(p.phone);
  const plErr = planError(p.plan);
  const visible = (f: 'name' | 'phone') => attempted || (touched[f] && focus !== f);

  const border = (f: 'name' | 'phone', err: string | null) => {
    if (err && visible(f)) return 'rgb(240,68,56)';
    if (focus === f) return 'rgb(46,144,250)';
    if (loading) return 'rgb(235,235,235)';
    return (f === 'name' ? p.name : p.phone) ? 'rgb(157,164,174)' : 'rgb(235,235,235)';
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setAttempted(true);
    setSubmitError(null);
    setTouched({ name: true, phone: true });
    if (nErr || pErr || plErr) {
      const id = nErr ? 'td-name' : pErr ? 'td-phone' : null;
      if (id) setTimeout(() => document.getElementById(id)?.focus(), 0);
      return;
    }

    setLoading(true);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), SUBMIT_TIMEOUT_MS);
    let ok = false;
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: p.name,
          phone: p.phone,
          plan: p.plan,
          utm: readUtm(),
          company: honeypot.current?.value || undefined,
          t: Date.now() - p.openedAt,
        }),
        signal: ctrl.signal,
      });
      ok = res.ok && (await res.json()).ok === true;
    } catch {
      ok = false;
    } finally {
      clearTimeout(timer);
    }
    setLoading(false);
    if (ok) p.onSuccess();
    else setSubmitError(SUBMIT_ERROR);
  }

  const modal = p.variant === 'modal';
  const { closing, ex, box } = p.anim ?? { closing: false, ex: null, box: null };
  const style = modal
    ? ({ animation: 'tdContentIn 0.45s cubic-bezier(0.32,0.72,0,1) 0.15s both' } as CSSProperties)
    : ({
    '--ex-t': ex?.t ?? '100%',
    '--ex-r': ex?.r ?? '0px',
    '--ex-b': ex?.b ?? '0px',
    '--ex-l': ex?.l ?? '0px',
    animation: closing
      ? 'tdCollapse 0.55s cubic-bezier(0.32,0.72,0,1) both'
      : 'tdExpand 0.7s cubic-bezier(0.32,0.72,0,1) both, tdBlurIn 0.7s cubic-bezier(0.32,0.72,0,1) both',
    position: closing ? 'fixed' : 'relative',
    top: 0,
    left: closing && box ? box.l : 'auto',
    width: closing && box ? box.w : 'auto',
    height: closing ? '100dvh' : 'auto',
    zIndex: closing ? 60 : 'auto',
    overflow: closing ? 'hidden' : 'visible',
    pointerEvents: closing ? 'none' : 'auto',
    willChange: 'clip-path, filter, transform',
    transformOrigin: '50% 100%',
  } as CSSProperties);

  const errText = 'text-xs leading-5 font-medium tracking-[0.2px] text-danger';
  const inputCls =
    'min-w-0 flex-1 border-0 bg-transparent p-0 text-base leading-6 font-medium tracking-[0.2px] text-[rgb(32,37,43)] outline-none';
  const fieldCls = 'flex h-12 items-center gap-3 rounded-lg bg-white p-3 transition-[box-shadow] duration-150 ease-in-out';

  return (
    <form
      data-screen-label="02 Join the waitlist"
      aria-hidden={closing || undefined}
      onSubmit={submit}
      noValidate
      className={modal ? 'm-0 flex flex-col' : 'min-h-screen-d m-0 flex flex-col items-stretch bg-white'}
      style={style}
    >
      {!modal && (
        <div className="flex h-10 items-center justify-between px-4 py-2">
          {/* 24px visual, 44px touch target */}
          <button
            type="button"
            onClick={p.onBack}
            aria-label="Back"
            className="relative -m-2.5 size-11 cursor-pointer border-0 bg-transparent p-0"
          >
            <Icon src="/assets/icons/arrow-left-t.svg" w={14} h={11.991} className="absolute top-4 left-4" />
          </button>
          <div className="size-6 opacity-0" />
        </div>
      )}

      <div className={`flex flex-1 flex-col gap-6 ${modal ? 'px-6 pt-2 pb-4' : 'p-4'}`}>
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-2xl leading-[1.4] font-semibold tracking-[-0.02em] text-black">Join the waitlist</h1>
          <span className="text-sm leading-[1.4] font-normal text-mid">
            We&apos;ll let you know as soon as TruDoc Gold launches, so you can join at the early-bird rate
          </span>
        </div>

        <div className="flex flex-col gap-5">
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="td-name" className="text-sm leading-6 font-medium text-black">Name</label>
            <div className={fieldCls} style={{ boxShadow: `inset 0 0 0 1px ${border('name', nErr)}` }}>
              <input
                id="td-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={p.name}
                onChange={(e) => {
                  p.onName(e.target.value);
                  setSubmitError(null);
                }}
                onFocus={() => setFocus('name')}
                onBlur={() => {
                  setFocus(null);
                  setTouched((t) => ({ ...t, name: t.name || !!p.name }));
                }}
                disabled={loading}
                aria-invalid={!!(nErr && visible('name'))}
                aria-describedby={nErr && visible('name') ? 'td-name-err' : undefined}
                className={inputCls}
              />
            </div>
            {nErr && visible('name') && (
              <span id="td-name-err" role="alert" className={errText}>{nErr}</span>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <label htmlFor="td-phone" className="text-sm leading-6 font-medium text-black">Phone number</label>
            <div className={fieldCls} style={{ boxShadow: `inset 0 0 0 1px ${border('phone', pErr)}` }}>
              <div className="relative flex h-5 w-[62px] shrink-0 items-center gap-3">
                <div className="flex items-center gap-1">
                  <div aria-hidden="true" className="relative size-4 shrink-0 overflow-hidden rounded-full bg-[rgb(240,240,240)]">
                    <div className="absolute top-0 left-[4.522px] h-[5.217px] w-[10.981px] bg-[rgb(109,165,68)]" />
                    <div className="absolute top-[10.783px] left-[4.522px] h-[5.217px] w-[11.478px] bg-black" />
                    <div className="absolute top-0 left-0 h-4 w-[5.217px] bg-[rgb(162,0,29)]" />
                  </div>
                  <span className="text-sm leading-5 font-normal whitespace-nowrap text-body">+971</span>
                </div>
                <div className="absolute top-0.5 left-[62px] h-4 w-px bg-[rgb(207,205,214)]" />
              </div>
              <input
                id="td-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="50 123 4567"
                maxLength={16}
                value={p.phone}
                onChange={(e) => {
                  p.onPhone(e.target.value.replace(/[^\d\s+]/g, ''));
                  setSubmitError(null);
                }}
                onFocus={() => setFocus('phone')}
                onBlur={() => {
                  setFocus(null);
                  setTouched((t) => ({ ...t, phone: t.phone || !!p.phone }));
                }}
                disabled={loading}
                aria-invalid={!!(pErr && visible('phone'))}
                aria-describedby={pErr && visible('phone') ? 'td-phone-err' : undefined}
                className={inputCls}
              />
            </div>
            {pErr && visible('phone') && (
              <span id="td-phone-err" role="alert" className={errText}>{pErr}</span>
            )}
          </div>

          {/* Plan */}
          <div role="radiogroup" aria-label="Which plan are you interested in?" className="flex flex-col gap-1">
            <span className="text-sm leading-6 font-medium text-black">Which plan are you interested in?</span>
            <div className="flex flex-col gap-2">
              {planOptions.map((o) => {
                const sel = p.plan === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={sel}
                    onClick={() => p.onPlan(o.id)}
                    disabled={loading}
                    className="flex h-[89px] cursor-pointer items-center gap-4 overflow-hidden rounded-xl border-0 p-3 text-left transition-[box-shadow,background] duration-200 ease-in-out"
                    style={{
                      background: sel ? `rgba(${RADIO},0.04)` : 'rgb(255,255,255)',
                      boxShadow: sel
                        ? `inset 0 0 0 1.5px rgb(${RADIO}), 0 0 0 3px rgba(${RADIO},0.12)`
                        : 'inset 0 0 0 1px rgb(235,235,235), 0 1px 2px 0 rgba(10,13,20,0.03)',
                    }}
                  >
                    <div className="flex flex-1 flex-col justify-center gap-2">
                      <span className="text-sm leading-5 font-medium whitespace-nowrap text-mid">{o.label}</span>
                      <div className="flex flex-col gap-1">
                        <span className="text-base leading-[1.2] font-medium whitespace-nowrap text-black">{o.price}</span>
                        <span className="text-xs leading-[1.2] font-normal tracking-[-0.02em] whitespace-nowrap text-mid">{o.billed}</span>
                      </div>
                    </div>
                    <div aria-hidden="true" className="relative size-5 shrink-0">
                      {sel ? (
                        <>
                          <div className="absolute top-0.5 left-0.5 size-4 rounded-full" style={{ background: `rgb(${RADIO})` }} />
                          <div className="absolute top-1.5 left-1.5 size-2 rounded-full bg-white" />
                        </>
                      ) : (
                        <>
                          <div className="absolute top-0.5 left-0.5 size-4 rounded-full bg-line" />
                          <div className="absolute top-[3.5px] left-[3.5px] size-[13px] rounded-full bg-white shadow-[0_2px_4px_-2px_rgba(27,28,29,0.12)]" />
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {attempted && plErr && <span role="alert" className={errText}>{plErr}</span>}
          </div>

          {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
          <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
            <label htmlFor="td-company">Company</label>
            <input ref={honeypot} id="td-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>
        </div>
      </div>

      <div
        className={`sticky bottom-0 flex flex-col items-stretch gap-4 bg-white ${modal ? 'px-6 pt-4 pb-6' : 'p-4 pb-[calc(16px+env(safe-area-inset-bottom))]'}`}
      >
        <div className="flex flex-col items-stretch gap-2 rounded-xl bg-[linear-gradient(90deg,rgb(21,21,22)_0%,rgb(41,34,23)_100%)] p-2 shadow-[0_16px_32px_-12px_rgba(14,18,27,0.1)]">
          {submitError ? (
            <span role="alert" className="text-center text-xs leading-[1.5] font-medium text-[rgb(249,112,102)]">{submitError}</span>
          ) : (
            <span className="text-center text-xs leading-[1.5] font-normal whitespace-pre-wrap text-white/70">
              {"Free to join, with no payment now. We'll only\n use these details to notify you "}
            </span>
          )}
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            data-testid="submit"
            className="flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[rgb(226,166,49)] px-5 py-3.5 shadow-[0_0_0_1px_rgb(226,166,49)] hover:bg-[rgb(236,178,64)] active:scale-[0.98]"
          >
            {loading && (
              <span
                aria-hidden="true"
                className="inline-block size-4 rounded-full border-2 border-[rgba(21,19,15,0.25)] border-t-[rgb(21,19,15)]"
                style={{ animation: 'tdspin 0.7s linear infinite' }}
              />
            )}
            <span className="text-base leading-6 font-bold whitespace-nowrap text-[rgb(21,19,15)]">
              {loading ? 'Joining…' : submitError ? 'Try again' : 'Join the waitlist'}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
