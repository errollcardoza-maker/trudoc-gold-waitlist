'use client';

/* eslint-disable @next/next/no-img-element -- photos are cropped with percentage offsets (.lp-doc .crop img) */
import { useEffect, useRef } from 'react';
import { doctors } from '@/lib/content';
import { animating, countUp, onceInView } from './motion';

const A = (f: string) => `/assets/lp/${f}`;

/** "Guided by doctors. Proven by people.": rating badges that count up, then a doctor carousel. */
export function Doctors() {
  const awards = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = awards.current;
    if (!el || !animating()) return;
    const nums = [...el.querySelectorAll<HTMLElement>('[data-count]')];
    nums.forEach((n) => (n.textContent = Number(0).toFixed(Number(n.dataset.dec || 0))));
    const stops: (() => void)[] = [];
    stops.push(
      onceInView(el, () =>
        nums.forEach((n) => stops.push(countUp(n, Number(n.dataset.count), { dur: 1300, delay: 250, decimals: Number(n.dataset.dec || 0) }))),
      ),
    );
    return () => stops.forEach((f) => f());
  }, []);

  return (
    <section className="lp-sec lp-proof" aria-labelledby="doctors-title">
      <div className="lp-wrap">
        <div className="lp-head">
          <div className="lp-proof-hd">
            <h2 className="lp-h2" id="doctors-title">
              Guided by doctors.
              <br />
              Proven by people.
            </h2>
            <p>
              Real experiences from people guided by
              <br />
              DHA &amp; DoH licensed TruDoc doctors
            </p>
          </div>
          <div className="lp-awards lp-rv" ref={awards}>
            <div className="aw">
              <img className="lr" src={A('laurel-left.svg')} alt="" />
              <span className="mid">
                <b>Google</b>
                <span>
                  <span data-count="4.5" data-dec="1">4.5</span> Rating
                </span>
              </span>
              <img className="lr flip" src={A('laurel-right.svg')} alt="" />
            </div>
            <div className="aw">
              <img className="lr" src={A('laurel-left-2.svg')} alt="" />
              <span className="mid">
                <span className="faces" aria-hidden="true">
                  {[1, 2, 3, 4].map((i) => (
                    <i key={i} className={`p${i}`}>
                      <img src={A(`patient-${i}.png`)} alt="" />
                    </i>
                  ))}
                </span>
                <span>
                  <span data-count="12">12</span>k+ patients
                </span>
              </span>
              <img className="lr flip" src={A('laurel-right.svg')} alt="" />
            </div>
          </div>
        </div>

        <div className="lp-docs" role="region" aria-label="Our doctors" tabIndex={0} data-testid="doctors-scroller">
          {doctors.map((d) => (
            <div key={d.name} className={`lp-doc ${d.crop}`}>
              <div className="tx">
                <b>{d.name}</b>
                <span>{d.role}</span>
              </div>
              <div className="ph">
                <span className="crop">
                  <img src={d.img} alt={d.name} loading="lazy" decoding="async" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
