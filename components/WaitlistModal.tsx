'use client';

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type Rect = { left: number; top: number; width: number; height: number };
type Flip = { tx: number; ty: number; sx: number; sy: number } | null;

type Props = {
  /** The CTA button's rect at open time; null = fallback (deep link / restore). */
  from: Rect | null;
  closing: boolean;
  onRequestClose: () => void;
  /** Focused again after the modal unmounts. */
  returnFocusTo: HTMLElement | null;
  children: ReactNode;
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
const ease = 'cubic-bezier(0.32,0.72,0,1)';

export function WaitlistModal({ from, closing, onRequestClose, returnFocusTo, children }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'measure' | 'open'>('measure');
  const [flip, setFlip] = useState<Flip>(null);
  const closeRef = useRef(onRequestClose);
  useEffect(() => {
    closeRef.current = onRequestClose;
  });

  // FLIP: the card first renders hidden, gets measured, then animates from the button's rect.
  useLayoutEffect(() => {
    const c = cardRef.current?.getBoundingClientRect();
    const b = from;
    if (b && c?.width) {
      setFlip({
        tx: b.left + b.width / 2 - (c.left + c.width / 2),
        ty: b.top + b.height / 2 - (c.top + c.height / 2),
        sx: b.width / c.width,
        sy: b.height / c.height,
      });
    }
    setPhase('open');
  }, [from]);

  // Scroll lock, Esc, focus trap, initial focus, and focus return.
  useEffect(() => {
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !cardRef.current) return;
      const els = [...cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement;
      if (!cardRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);

    const focusTimer = window.setTimeout(() => {
      const target = document.getElementById('td-name') ?? cardRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      target?.focus({ preventScroll: true });
    }, 650);

    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(focusTimer);
      html.style.overflow = prevOverflow;
      returnFocusTo?.focus({ preventScroll: true });
    };
  }, [returnFocusTo]);

  const vars = {
    '--tx': `${flip?.tx ?? 0}px`,
    '--ty': `${flip?.ty ?? 40}px`,
    '--sx': flip?.sx ?? 0.96,
    '--sy': flip?.sy ?? 0.96,
  } as CSSProperties;

  const cardAnim = closing
    ? `tdFlipOut 0.45s ${ease} both`
    : phase === 'open'
      ? `tdFlipIn 0.6s ${ease} both`
      : 'none';

  return createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center p-6" data-testid="waitlist-modal">
      <div
        aria-hidden="true"
        onClick={onRequestClose}
        className="absolute inset-0 bg-[rgba(10,8,4,0.5)] backdrop-blur-[6px]"
        style={{ animation: closing ? 'tdFadeOut 0.45s ease both' : 'tdFadeIn 0.4s ease both' }}
        data-testid="modal-backdrop"
      />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label="Join the waitlist"
        className="relative max-h-[calc(100vh-48px)] w-full max-w-[520px] origin-center overflow-y-auto rounded-3xl bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.45)]"
        style={{ ...vars, visibility: phase === 'measure' ? 'hidden' : 'visible', animation: cardAnim }}
      >
        <div className="sticky top-0 z-[2] flex justify-end bg-white px-4 pt-4">
          <button
            type="button"
            onClick={onRequestClose}
            aria-label="Close"
            className="flex size-10 cursor-pointer items-center justify-center rounded-full border-0 bg-[rgb(245,245,245)] text-[22px] leading-none text-[rgb(65,57,92)] hover:bg-[rgb(235,235,235)]"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
