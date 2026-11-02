import { useEffect, type RefObject } from 'react';

/** Sets `--k` on `ref` so a fixed-size composition (designed at `designW` px) scales to fill the column, minus
 *  `inset` px of its own indent, up to `max`. By default mobile only (< 768px; desktop sets `--k` in landing.css);
 *  pass `desktop` to keep fitting on wide screens too. */
export function useFitScale(ref: RefObject<HTMLElement | null>, designW: number, inset = 0, { desktop = false, max = Infinity } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = matchMedia('(min-width: 768px)');
    const fit = () => {
      if (mq.matches && !desktop) el.style.removeProperty('--k');
      else el.style.setProperty('--k', String(Math.min(max, Math.max(1, (el.clientWidth - inset) / designW))));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    mq.addEventListener('change', fit);
    return () => {
      ro.disconnect();
      mq.removeEventListener('change', fit);
    };
  }, [ref, designW, inset, desktop, max]);
}
