'use client';

import { useEffect, useState } from 'react';
import type { JoinHandler } from './Landing';

/** Bottom CTA panel. Hidden while the hero's own buttons are on screen; slides up once they've scrolled
 *  above the viewport and tucks away again when the user scrolls back up to them. */
export function StickyCta({ onJoin, heroCta }: { onJoin: JoinHandler; heroCta: React.RefObject<HTMLDivElement | null> }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = heroCta.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([en]) => setShow(!en.isIntersecting && en.boundingClientRect.top < (en.rootBounds?.top ?? 0) + 40),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [heroCta]);

  return (
    <div className={`lp-sticky${show ? ' show' : ''}`} data-testid="sticky-cta" aria-hidden={!show} inert={!show}>
      <div className="lp-cta-panel">
        <div className="lp-cta-top">
          <span className="b">From AED 1/day</span>
          <span className="m">Limited-time launch price</span>
        </div>
        <button type="button" className="lp-btn lp-btn-cta" data-testid="join-cta" onClick={(e) => onJoin(e)}>
          <span className="lp-stripes" aria-hidden="true">
            <i className="lp-stripe a" />
            <i className="lp-stripe b" />
            <i className="lp-sheen" />
          </span>
          <span>Join waitlist for free</span>
        </button>
      </div>
    </div>
  );
}
