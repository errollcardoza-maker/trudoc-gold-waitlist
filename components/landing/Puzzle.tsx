'use client';

/* eslint-disable @next/next/no-img-element -- 14px check icons */
import { useLayoutEffect, useRef, useState } from 'react';
import { puzzle } from '@/lib/content';
import { useFitScale } from './useFitScale';

// Gold piece's right edge X, radius R, seam GAP; the knob is centred on the piece's height.
const W = 343, X = 236, R = 16, GAP = 4;

function goldPath(H: number) {
  const c = H / 2;
  return (
    `M${R} 0H${X - R}Q${X} 0 ${X} ${R}V${c - 8}` +
    `C${X + 5} ${c - 8} ${X + 4} ${c - 15} ${X + 13} ${c - 15}C${X + 21} ${c - 15} ${X + 25} ${c - 9} ${X + 25} ${c}` +
    `C${X + 25} ${c + 9} ${X + 21} ${c + 15} ${X + 13} ${c + 15}C${X + 4} ${c + 15} ${X + 5} ${c + 8} ${X} ${c + 8}` +
    `V${H - R}Q${X} ${H} ${X - R} ${H}H${R}Q0 ${H} 0 ${H - R}V${R}Q0 0 ${R} 0Z`
  );
}

/** "Already insured? Gold is the missing piece": the Gold piece slides in and locks into the insurance piece. */
export function Puzzle() {
  const inner = useRef<HTMLDivElement>(null);
  const [H, setH] = useState(214);
  const wrap = useRef<HTMLDivElement>(null);
  useFitScale(wrap, 343); // fills the column on phones wider than 375px

  // The pieces are drawn for the Gold content's real height (fonts can change it).
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const fit = () => setH(Math.ceil(el.offsetHeight));
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const gp = goldPath(H);
  return (
    <section className="lp-sec lp-cmp" aria-labelledby="missing-piece">
      <div className="lp-wrap" ref={wrap}>
        <h2 className="lp-h2" id="missing-piece">
          <span className="g">{puzzle.titleA}</span>
          <br />
          {puzzle.titleB}
        </h2>
        <div className="lp-pz-frame" style={{ ['--h' as string]: `${H}px` }}>
          <div className="lp-pz" style={{ height: H }} data-testid="puzzle">
            <div className="pz-ins">
              <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
                <defs>
                  <mask id="pzSocket" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                    <rect width={W} height={H} fill="#fff" />
                    <path d={gp} fill="#000" stroke="#000" strokeWidth={GAP * 2} strokeLinejoin="round" />
                  </mask>
                </defs>
                <rect x={X - 40} y="0" width={W - X + 40} height={H} rx={R} fill="#f3f3f3" mask="url(#pzSocket)" />
              </svg>
              <div className="pz-ins-tx">
                <b>{puzzle.insurance}</b>
                <span>{puzzle.insuranceSub}</span>
              </div>
            </div>
            <div className="pz-gold">
              <svg width={X + 26} height={H} viewBox={`0 0 ${X + 26} ${H}`} aria-hidden="true">
                <defs>
                  <linearGradient id="pzGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#fcf3d9" />
                    <stop offset="1" stopColor="#f4dc99" />
                  </linearGradient>
                </defs>
                <path d={gp} fill="url(#pzGold)" />
                <path d={gp} fill="none" stroke="rgba(201,154,44,.28)" strokeWidth="1" />
              </svg>
              <div className="pz-gold-in" ref={inner}>
                <div className="pz-gold-hd">
                  <b>{puzzle.gold}</b>
                  <span>{puzzle.goldSub}</span>
                </div>
                <ul className="pz-perks">
                  {puzzle.perks.map((p, i) => (
                    <li key={p}>
                      <i style={{ ['--i' as string]: i }}>
                        <img src="/assets/lp/check-gold.svg" alt="" width={14} height={10} />
                      </i>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
