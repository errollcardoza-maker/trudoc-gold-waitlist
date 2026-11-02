'use client';

/* eslint-disable @next/next/no-img-element -- fixed-size composition layers */
import Image from 'next/image';
import { useEffect, useRef, type ReactNode } from 'react';
import { steps } from '@/lib/content';
import { animating, countUp, onceInView } from './motion';
import { useFitScale } from './useFitScale';
import { ParticleTile } from './ParticleTile';

const A = (f: string) => `/assets/lp/${f}`;

/* ---------- Card 1: static chips + "100+ Biomarkers" count-up ---------- */
const CHIPS = ['Heart Rate', 'Blood Pressure', 'BMI', 'SpO2', 'HRV', 'Sleep', 'Glucose', 'Cholesterol', 'Cortisol'];
const MID_X = [22.59, 114.59, 203.59, 248.59, 305.59, 355.6, 412.6, 486.6, 613.6];
const MID_HIDDEN = [4, 5, 6];

function Card1() {
  const ref = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const card = ref.current!, n = num.current!;
    if (!animating()) return;
    card.classList.add('counting');
    const stops: (() => void)[] = [];
    stops.push(
      onceInView(card, () => {
        n.style.minWidth = `${n.offsetWidth}px`; // fixed width: no jitter while counting
        stops.push(countUp(n, 100, { dur: 1500, delay: 200 }));
        const t = window.setTimeout(() => card.classList.add('counted'), 1600);
        stops.push(() => clearTimeout(t));
      }, 0.5),
    );
    return () => stops.forEach((f) => f());
  }, []);
  return (
    <div className="lp-tl-card c1" ref={ref}>
      <Image className="bg" src={A('tl-biomarkers-bg.jpg')} alt="" width={311} height={200} sizes="(min-width: 768px) 622px, calc(100vw - 64px)" />
      <div className="lp-chips" aria-hidden="true">
        {[0, 1, 2].map((r) =>
          r === 1 ? (
            <div key={r} className="lp-chip-row mid">
              {CHIPS.map((c, k) => (
                <span key={c} className="lp-chip" style={{ left: MID_X[k], opacity: MID_HIDDEN.includes(k) ? 0 : undefined }}>{c}</span>
              ))}
            </div>
          ) : (
            <div key={r} className={`lp-chip-row r${r}`}>
              {CHIPS.map((c) => <span key={c} className="lp-chip">{c}</span>)}
            </div>
          ),
        )}
      </div>
      <div className="lp-c1-title" aria-label="100+ Biomarkers">
        <span className="lp-c1-n" aria-hidden="true"><span className="num" ref={num}>100</span><span className="plus">+</span></span>
        <span aria-hidden="true">Biomarkers</span>
      </div>
    </div>
  );
}

/* ---------- Card 2: results preview (Biological age, 10-year risk, biomarker summary) ---------- */
const SUMMARY: [number, string, string][] = [
  [104, 'Biomarkers', '#171717'],
  [76, 'Optimal', '#26a762'],
  [21, 'Borderline', '#c99a2c'],
  [7, 'At risk', '#d02533'],
];
const STACK: [number, string][] = [[76, '#26a762'], [21, '#e6a819'], [7, '#e93544']];

function Card2() {
  return (
    <div className="lp-tl-card c2">
      <Image className="bg" src={A('tl-results-bg.jpg')} alt="" width={311} height={200} sizes="(min-width: 768px) 622px, calc(100vw - 64px)" />
      <div className="lp-c2-home" aria-hidden="true">
        <div className="lp-c2-scale">
          <div className="lp-c2-tiles">
            <div className="lp-c2-tile">
              <span className="lp-c2-glow" />
              <ParticleTile kind="body" />
              <img className="lp-c2-scrim body" src={A('tile-scrim-body.svg')} alt="" />
              <span className="lp-c2-metric">
                <span className="l">Biological Age</span>
                <span className="v">29</span>
                <span className="c"><img src={A('arrow-down-green.svg')} alt="" />2 years younger</span>
              </span>
            </div>
            <div className="lp-c2-tile">
              <span className="lp-c2-glow" />
              <ParticleTile kind="heart" />
              <img className="lp-c2-scrim heart" src={A('tile-scrim-heart.svg')} alt="" />
              <span className="lp-c2-metric">
                <span className="l" style={{ marginTop: -18 }}>10-year<br />cardiovascular risk</span>
                <span className="v">2.8%</span>
                <span className="c"><i className="dot" />Low risk</span>
              </span>
            </div>
          </div>
          <div className="lp-c2-sum">
            <div className="lp-c2-stats">
              {SUMMARY.map(([n, k, c]) => (
                <div key={k}><span className="n" style={{ color: c }}>{n}</span><span className="k">{k}</span></div>
              ))}
            </div>
            <div className="lp-c2-stack">
              {STACK.map(([n, c], i) => <i key={c} style={{ flex: n, background: c, ['--i' as string]: i }} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Card 3: doctor + risk overview ---------- */
function RiskRow({ icon, label, high }: { icon: string; label: string; high: boolean }) {
  return (
    <div className="rk">
      <span className="ic"><img src={A(icon)} alt="" /></span>
      <span className="nm">{label}</span>
      <span className={`lp-pill ${high ? 'hi' : 'lo'}`}>{high ? 'High risk' : 'Low risk'}</span>
    </div>
  );
}

function Card3() {
  return (
    <div className="lp-tl-card c3">
      <Image className="bg" src={A('tl-doctor-v2.png')} alt="" width={670} height={381} sizes="(min-width: 768px) 622px, calc(100vw - 64px)" />
      <div className="lp-c3-col" aria-hidden="true">
        <div className="lp-glass ba">
          <p className="lbl">Biological Age</p>
          <div className="v"><span>33.7</span><span className="older"><img src={A('tri-up-red.svg')} alt="" />2.4 years older</span></div>
        </div>
        <div className="lp-glass risks">
          <RiskRow icon="heart-white.svg" label="Heart & cholesterol" high />
          <RiskRow icon="glucose-white.svg" label="Blood sugar & diabetes" high />
          <RiskRow icon="kidneys-white.svg" label="Kidney health" high={false} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Card 4: specialist booked ---------- */
function Card4() {
  return (
    <div className="lp-tl-card c4">
      <Image className="bg" src={A('tl-specialist-bg.jpg')} alt="" width={311} height={200} sizes="(min-width: 768px) 622px, calc(100vw - 64px)" />
      <div className="lp-c4-col" aria-hidden="true">
        <div className="lp-glass2 risk">
          <span className="ic"><img src={A('heart-white-lg.svg')} alt="" /></span>
          <span className="nm">Heart &amp; cholesterol</span>
          <span className="lp-pill hi">High risk</span>
        </div>
        <div className="lp-glass2 doc">
          <div className="who">
            <span className="ph"><img src={A('doctor-imaan.png')} alt="" /></span>
            <span className="tx"><b>Dr. Imaan Chowdhury</b><span>Specialist, American board</span></span>
          </div>
          <div className="ok"><img src={A('badge-check-green.svg')} alt="" /><span>Consultation scheduled for 4:30 PM</span></div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Card 5: Vitamin D trend ---------- */
function Card5() {
  return (
    <div className="lp-tl-card c5">
      <Image className="bg" src={A('tl-progress-bg.jpg')} alt="" width={343} height={343} sizes="(min-width: 768px) 686px, calc((100vw - 64px) * 1.1)" />
      <div className="lp-chart" aria-hidden="true">
        <div className="hd">
          <p className="t">Vitamin D</p>
          <p className="v"><span className="mono">32.6</span><span className="u">ng/mL</span></p>
          <p className="s">Optimal <i /> Oct 26</p>
        </div>
        <div className="plot">
          <svg viewBox="0 0 118.634 99.634" width="118.634" height="99.634">
            <rect x="0" y="9.27" width="118.634" height="39.39" fill="rgba(114,255,180,.3)" />
            <g stroke="#58eb9d" strokeOpacity=".2" strokeWidth=".463" strokeDasharray=".92 .92">
              <line x1="0" y1="9.27" x2="118.634" y2="9.27" />
              <line x1="0" y1="49.12" x2="118.634" y2="49.12" />
            </g>
            <g stroke="#a3a3a3" strokeOpacity=".2" strokeWidth=".463" strokeDasharray=".92 .92">
              <line x1="29.66" y1="0" x2="29.66" y2="99.634" />
              <line x1="88.98" y1="0" x2="88.98" y2="99.634" />
            </g>
            <polyline className="ln" points="29.66,83 88.98,41" fill="none" stroke="#a3a3a3" strokeWidth=".463" pathLength={1} />
            <circle className="d0" cx="29.66" cy="83" r="2" fill="#fb3748" />
            <g className="d1">
              <circle cx="88.98" cy="41" r="3.5" fill="none" stroke="#423424" />
              <circle cx="88.98" cy="41" r="3" fill="#3cc97e" />
              <circle className="pulse" cx="88.98" cy="41" r="4" fill="none" stroke="#3cc97e" strokeWidth=".463" />
            </g>
          </svg>
          <div className="rng">
            <i style={{ height: 8.341, background: '#fb3748' }} />
            <i style={{ height: 40.317, background: '#3cc97e' }} />
            <i style={{ flex: 1, background: '#e6a819' }} />
            <i style={{ height: 19.463, background: '#fb3748' }} />
          </div>
          <div className="ylab">
            <span style={{ top: 0 }} className="dim">100+</span>
            <span style={{ top: 8.8 }}>100</span>
            <span style={{ top: 48.19 }}>30</span>
            <span style={{ top: 76.92 }} className="dim">20</span>
          </div>
        </div>
        <div className="xlab">
          <span style={{ left: 29.66 }}>Apr 26</span>
          <span className="last" style={{ left: 88.98 }}>Oct 26</span>
        </div>
      </div>
    </div>
  );
}

const CARDS: (() => ReactNode)[] = [Card1, Card2, Card3, Card4, Card5];

export function HowItWorks() {
  const stepsRef = useRef<HTMLDivElement>(null);
  useFitScale(stepsRef, 311, 32, { desktop: true, max: 2 }); // cards fill the column at every width
  return (
    <section className="lp-sec lp-tl" aria-labelledby="how-it-works">
      <div className="lp-wrap">
        <div className="lp-head">
          <h2 className="lp-h2" id="how-it-works">
            <span className="g">How it works</span>
            <br />
            Complete health picture
          </h2>
        </div>
        <div className="lp-steps" ref={stepsRef}>
          {steps.map((s, i) => {
            const Card = CARDS[i];
            return (
              <div key={s.title} className={`lp-step${i ? ' lp-rv' : ' in'}`} data-inview>
                <div className="lp-step-badge" aria-hidden="true">{i + 1}</div>
                {i < steps.length - 1 && <div className="lp-step-line" aria-hidden="true" />}
                <div className="lp-tl-frame">
                  <Card />
                </div>
                <div className="lp-step-text">
                  <h3 className="t">{s.title}</h3>
                  <p className="d">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
