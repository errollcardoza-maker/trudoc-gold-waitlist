'use client';

/* eslint-disable @next/next/no-img-element -- 16px icon */
import { useState } from 'react';
import { FAQ_DEFAULT_OPEN, faqs } from '@/lib/content';

/** Renders **bold** spans in an answer. */
function withBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
}

/** FAQs: one item open by default; each question toggles on its own. */
export function Faq() {
  const [open, setOpen] = useState<Set<number>>(() => new Set([FAQ_DEFAULT_OPEN]));
  const toggle = (i: number) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  return (
    <section className="lp-sec lp-faq" aria-labelledby="faq-title">
      <div className="lp-wrap">
        <h2 className="lp-h2 sb" id="faq-title">FAQs</h2>
        <div className="lp-faq-list" data-testid="faq">
          {faqs.map(([q, a], i) => {
            const isOpen = open.has(i);
            return (
              <div key={q} className={`lp-faq-item${isOpen ? ' open' : ''}`}>
                <button type="button" className="lp-faq-q" id={`faq-${i}`} aria-expanded={isOpen} aria-controls={`faq-panel-${i}`} onClick={() => toggle(i)}>
                  <span>{q}</span>
                  <img src="/assets/lp/plus-dark.svg" alt="" width={16} height={16} />
                </button>
                <div className="lp-collapse" id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-${i}`} inert={!isOpen}>
                  <div>
                    <p className="lp-faq-a">{withBold(a)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
