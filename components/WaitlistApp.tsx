'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { UTM_KEYS, formatPhoneDisplay, type Plan } from '@/lib/validation';
import { Landing } from './landing/Landing';
import { Success } from './Success';
import { WaitlistForm, type ExpandRect, type FormAnim } from './WaitlistForm';
import { WaitlistModal, type Rect } from './WaitlistModal';

type Screen = 'landing' | 'form' | 'success';
type Saved = { screen?: Screen; name?: string; phone?: string; plan?: Plan | null; openedAt?: number };
type ModalState = { from: Rect | null; closing: boolean } | null;

const STORAGE_KEY = 'tdg-waitlist';
const DESKTOP_MQ = '(min-width: 768px)';
const CLOSE_MS = 560; // mobile collapse
const MODAL_CLOSE_MS = 460; // desktop reverse FLIP

const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const isDesktopNow = () => !!window.matchMedia?.(DESKTOP_MQ).matches;

/** Current URL with `?join=` set to `value` (or removed), other params kept. */
function joinUrl(value: '1' | 'success' | null) {
  const q = new URLSearchParams(location.search);
  if (value) q.set('join', value);
  else q.delete('join');
  const qs = q.toString();
  return location.pathname + (qs ? `?${qs}` : '');
}
const joinParam = () => new URLSearchParams(location.search).get('join');

function readSaved(): Saved | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function captureUtm() {
  try {
    const q = new URLSearchParams(location.search);
    const utm: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = q.get(k);
      if (v) utm[k] = v.slice(0, 200);
    }
    if (Object.keys(utm).length) sessionStorage.setItem('tdg-utm', JSON.stringify(utm));
  } catch {}
}

export function WaitlistApp() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [desktop, setDesktop] = useState(false);
  const [anim, setAnim] = useState<FormAnim>({ closing: false, ex: null, box: null });
  const [modal, setModal] = useState<ModalState>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [openedAt, setOpenedAt] = useState(0);
  const [done, setDone] = useState<{ firstName: string; phoneDisplay: string } | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);

  const appRef = useRef<HTMLDivElement>(null);
  const live = useRef({ screen, desktop, modal });
  const landingScroll = useRef(0);
  const pendingScroll = useRef<number | null>(null);
  const ownsEntry = useRef(false); // we pushed the ?join history entry
  const closeTimer = useRef<number | undefined>(undefined);
  const openScrollTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    live.current = { screen, desktop, modal };
  });

  /* ---------- open ---------- */

  const openMobile = useCallback((ex: ExpandRect | null, startedAt?: number) => {
    document.documentElement.classList.remove('td-intro');
    clearTimeout(closeTimer.current);
    setAnim({ closing: false, ex, box: null });
    setOpenedAt(startedAt ?? Date.now());
    setScreen('form');
    openScrollTimer.current = window.setTimeout(() => window.scrollTo(0, 0), 0);
  }, []);

  const openModal = useCallback((from: Rect | null, startedAt?: number) => {
    document.documentElement.classList.remove('td-intro');
    clearTimeout(closeTimer.current);
    setOpenedAt(startedAt ?? Date.now());
    setScreen('form');
    setModal({ from, closing: false });
  }, []);

  /* ---------- close ---------- */

  const closeMobile = useCallback(() => {
    clearTimeout(openScrollTimer.current); // a very fast Back must not scroll the landing to the top
    const reduce = reducedMotion();
    const a = appRef.current?.getBoundingClientRect();
    setAnim((s) => ({ ...s, closing: !reduce, box: a ? { l: a.left, w: a.width } : null }));
    pendingScroll.current = landingScroll.current;
    setModal(null);
    setScreen('landing');
    clearTimeout(closeTimer.current);
    if (!reduce) closeTimer.current = window.setTimeout(() => setAnim((s) => ({ ...s, closing: false })), CLOSE_MS);
  }, []);

  const closeModal = useCallback(() => {
    const m = live.current.modal;
    if (!m || m.closing) return;
    setModal({ ...m, closing: true });
    clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(
      () => {
        setModal(null);
        setScreen('landing');
      },
      reducedMotion() ? 0 : MODAL_CLOSE_MS,
    );
  }, []);

  /* ---------- mount: viewport, restore, UTM, URL ---------- */

  useEffect(() => {
    history.scrollRestoration = 'manual';
    captureUtm();
    const mq = window.matchMedia(DESKTOP_MQ);
    const isDesk = mq.matches;
    const saved = readSaved();
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync with browser-only state */
    setDesktop(isDesk);
    if (saved) {
      setName(saved.name || '');
      setPhone(saved.phone || '');
      setPlan(saved.plan || null);
    }
    const join = joinParam();
    if (join === '1' || saved?.screen === 'form') {
      // Make sure Back has a landing entry to return to.
      history.replaceState(null, '', joinUrl(null));
      history.pushState({ tdg: 'form' }, '', joinUrl('1'));
      ownsEntry.current = true;
      if (isDesk) openModal(null, saved?.openedAt);
      else openMobile(null, saved?.openedAt);
    } else if (join) {
      // e.g. ?join=success without a submission in this session → back to the landing.
      history.replaceState(null, '', joinUrl(null));
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    const onChange = (e: MediaQueryListEvent) => setDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [openMobile, openModal]);

  // Crossing the breakpoint while the form is open swaps presentation without re-running the open animation.
  useEffect(() => {
    if (!hydrated) return;
    if (desktop && screen !== 'landing' && !live.current.modal) setModal({ from: null, closing: false });
    if (!desktop && live.current.modal && !live.current.modal.closing) setModal(null);
  }, [desktop, screen, hydrated]);

  /* ---------- browser Back / Forward ---------- */

  useEffect(() => {
    const onPop = () => {
      const { screen: cur, desktop: isDesk } = live.current;
      const join = joinParam();
      if (join === '1') {
        if (cur !== 'form') {
          ownsEntry.current = true;
          landingScroll.current = window.scrollY;
          if (isDesk) openModal(null);
          else openMobile(null);
        }
        return;
      }
      if (join) history.replaceState(null, '', joinUrl(null));
      ownsEntry.current = false;
      if (isDesk && live.current.modal) closeModal();
      else if (cur === 'form') closeMobile();
      else if (cur === 'success') {
        pendingScroll.current = 0;
        setScreen('landing');
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [openMobile, openModal, closeMobile, closeModal]);

  // Restore the landing scroll position after returning from the mobile form.
  useEffect(() => {
    if (screen === 'landing' && pendingScroll.current !== null) {
      window.scrollTo(0, pendingScroll.current);
      pendingScroll.current = null;
    }
  }, [screen]);

  // Persist progress so a refresh restores it.
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (screen === 'success') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, name, phone, plan, openedAt }));
    } catch {}
  }, [hydrated, screen, name, phone, plan, openedAt]);

  /* ---------- handlers ---------- */

  const onJoin = (e: MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    if (isDesktopNow()) {
      if (live.current.modal) return; // ignore double clicks while opening/open
      const r = btn.getBoundingClientRect();
      setTrigger(btn);
      history.pushState({ tdg: 'form' }, '', joinUrl('1'));
      ownsEntry.current = true;
      openModal(reducedMotion() ? null : { left: r.left, top: r.top, width: r.width, height: r.height });
      return;
    }
    let ex: ExpandRect | null = null;
    try {
      const r = btn.getBoundingClientRect();
      const app = appRef.current!.getBoundingClientRect();
      ex = {
        t: `${Math.max(0, r.top)}px`,
        l: `${r.left - app.left}px`,
        r: `calc(100% - ${r.right - app.left}px)`,
        b: `calc(100% - ${Math.min(window.innerHeight, r.bottom)}px)`,
      };
    } catch {}
    landingScroll.current = window.scrollY;
    history.pushState({ tdg: 'form' }, '', joinUrl('1'));
    ownsEntry.current = true;
    openMobile(ex);
  };

  /** Back arrow (mobile), ×, backdrop, Esc (desktop). Goes through history when we own the entry. */
  const requestClose = () => {
    if (ownsEntry.current && (history.state?.tdg === 'form' || history.state?.tdg === 'done')) {
      history.back(); // popstate closes
      return;
    }
    history.replaceState(null, '', joinUrl(null));
    if (live.current.modal) closeModal();
    else closeMobile();
  };

  const onSuccess = () => {
    setDone({ firstName: name.trim().split(/\s+/)[0], phoneDisplay: formatPhoneDisplay(phone) });
    setName('');
    setPhone('');
    setPlan(null);
    history.replaceState({ tdg: 'done' }, '', joinUrl('success'));
    setScreen('success');
    if (!live.current.desktop) {
      ownsEntry.current = false;
      window.scrollTo(0, 0);
    }
  };

  /* ---------- render ---------- */

  const formProps = {
    name,
    phone,
    plan,
    onName: setName,
    onPhone: setPhone,
    onPlan: setPlan,
    openedAt,
    onSuccess,
  };
  const showLanding = desktop || screen === 'landing' || anim.closing;
  const showMobileForm = !desktop && (screen === 'form' || anim.closing);
  const showModal = desktop && !!modal && (screen !== 'landing' || modal.closing);

  return (
    <div className="flex min-h-screen justify-center bg-[rgb(68,68,68)] md:block md:bg-white">
      <div ref={appRef} data-screen-label="App" className="relative min-h-screen w-full max-w-[480px] overflow-x-clip bg-white md:max-w-none">
        {showLanding && <Landing onJoin={onJoin} />}
        {showMobileForm && <WaitlistForm {...formProps} variant="screen" anim={anim} onBack={requestClose} />}
        {!desktop && screen === 'success' && done && <Success {...done} />}
        {showModal && (
          <WaitlistModal
            from={modal.from}
            closing={modal.closing}
            onRequestClose={requestClose}
            returnFocusTo={trigger ?? document.querySelector<HTMLElement>('[data-testid="join-cta-desktop"]')}
          >
            {screen === 'success' && done ? <Success {...done} variant="modal" /> : <WaitlistForm {...formProps} variant="modal" />}
          </WaitlistModal>
        )}
      </div>
    </div>
  );
}
