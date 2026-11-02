'use client';

/* eslint-disable @next/next/no-img-element -- 24px area icons */
import { useState } from 'react';
import { BIOMARKERS_LABEL, HEALTH_AREAS, areas } from '@/lib/content';

/** "We test 100+ biomarkers across 13 health areas": every area starts closed; several can be open at once. */
export function Biomarkers() {
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <section className="lp-sec lp-bm" id="biomarkers" aria-labelledby="biomarkers-title">
      <div className="lp-wrap">
        <div className="lp-head">
          <h2 className="lp-h2" id="biomarkers-title">
            We test {BIOMARKERS_LABEL} biomarkers
            <br />
            across {HEALTH_AREAS} health areas
          </h2>
        </div>
        <div className="lp-acc" data-testid="biomarkers">
          {areas.map((a) => {
            const isOpen = open.has(a.id);
            return (
              // The reveal lives on a wrapper whose class React never rewrites, so opening an area can't drop `.in`.
              <div key={a.id} className="lp-acc-item lp-rv">
                <div className={isOpen ? 'open' : undefined}>
                  <button
                    type="button"
                    className="lp-acc-hd"
                    id={`area-${a.id}`}
                    aria-expanded={isOpen}
                    aria-controls={`area-panel-${a.id}`}
                    onClick={() => toggle(a.id)}
                  >
                    <span className="tile">
                      <img src={`/assets/icons/${a.icon}-fill.svg`} alt="" width={24} height={24} />
                    </span>
                    <span className="nm">
                      <b>{a.name}</b>
                      <span>{a.count}</span>
                    </span>
                    <span className="chev" aria-hidden="true">
                      <img src="/assets/lp/angle-down-sm.svg" alt="" width={11} height={6} />
                    </span>
                  </button>
                  <div className="lp-collapse" id={`area-panel-${a.id}`} role="region" aria-labelledby={`area-${a.id}`} inert={!isOpen}>
                    <div>
                      <div className="lp-acc-in">
                        {a.tags.map((t) => (
                          <div key={t.name} className="lp-bmk">
                            <b>
                              {t.name}
                              {t.addOn && <em className="lp-bmk-addon">Paid add-on</em>}
                            </b>
                            <span>{t.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
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
