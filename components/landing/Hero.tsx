'use client';

/* eslint-disable @next/next/no-img-element -- small decorative SVGs */
import Image from 'next/image';
import { useEffect, useRef, type MouseEvent } from 'react';
import { HEALTH_RISKS_LABEL, heroBullets, heroPrices } from '@/lib/content';
import type { Plan } from '@/lib/validation';
import type { JoinHandler } from './Landing';

const PLANS: Plan[] = ['individual', 'family'];

/** Scrolls so the biomarker section sits 56px below the top of the viewport. */
function viewTests() {
  const el = document.getElementById('biomarkers');
  if (!el) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 56, behavior: reduce ? 'auto' : 'smooth' });
}

export function Hero({ onJoin, ctaRef }: { onJoin: JoinHandler; ctaRef: React.RefObject<HTMLDivElement | null> }) {
  const imgRef = useRef<HTMLDivElement>(null);

  // Parallax while the hero is on screen: the photo drifts down and grows slightly.
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = imgRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > window.innerHeight * 1.2) return;
        el.style.transform = `translate3d(0,${(y * 0.42).toFixed(1)}px,0) scale(${(1 + y * 0.00025).toFixed(4)})`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const pickPlan = (plan: Plan) => (e: MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    btn.classList.add('picked');
    setTimeout(() => btn.classList.remove('picked'), 600);
    onJoin(e, plan);
  };

  return (
    <section className="lp-hero" aria-label="TruDoc Gold">
      <div className="lp-hero-img" ref={imgRef}>
        <Image src="/assets/lp/hero-woman.jpg" alt="" fill sizes="(min-width: 1001px) 62vw, 100vw" loading="eager" fetchPriority="high" quality={80} />
        <div className="lp-hero-fade" />
      </div>

      <div className="lp-logo">
        <img className="heart" src="/assets/lp/logo-heart.svg" alt="" width={24} height={18} />
        <span className="row">
          <img className="word" src="/assets/lp/logo-trudoc-word.svg" alt="TruDoc" width={68} height={15} />
          <span className="lp-gold-pill">
            <span>Gold</span>
          </span>
        </span>
      </div>

      <div className="lp-hero-body">
        <div className="lp-hero-main">
          <div className="lp-hero-spacer" />
          <h1 className="lp-hero-title lp-rise" style={{ ['--d' as string]: '.9s', ['--dl' as string]: '.35s' }}>
            Make proactive healthcare simple.
          </h1>
          <ul className="lp-hero-list">
            {heroBullets(HEALTH_RISKS_LABEL).map((b, i) => (
              <li key={b.text} className="lp-rise" style={{ ['--dl' as string]: `${0.5 + i * 0.1}s` }}>
                <span className="ck">
                  <img src="/assets/lp/check-yellow.svg" alt="" width={16} height={12} />
                </span>
                <span>
                  {b.text}
                  {b.rest && (
                    <>
                      <br className="lp-br-m" /> {b.rest}
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <div className="lp-price-cards lp-rise" style={{ ['--dl' as string]: '.8s' }}>
            {heroPrices.map((p, i) => (
              <button
                key={p.label}
                type="button"
                className="lp-price-card"
                data-testid={`price-${PLANS[i]}`}
                aria-label={`${p.label}: ${p.price}, was ${p.was}. Join the waitlist for this plan`}
                onClick={pickPlan(PLANS[i])}
              >
                <span className="l">{p.label}</span>
                <span className="p">{p.price}</span>
                <s aria-label={`was ${p.was}`}>{p.was}</s>
              </button>
            ))}
          </div>
        </div>

        <div className="lp-hero-cta lp-rise" style={{ ['--dl' as string]: '.95s' }} ref={ctaRef}>
          <div className="lp-hero-btns">
            <button type="button" className="lp-btn lp-btn-gold lp-btn-ring" data-testid="hero-join" onClick={(e) => onJoin(e)}>
              <span>Join waitlist for free</span>
            </button>
            <button type="button" className="lp-btn lp-btn-glass lp-btn-ring" onClick={viewTests}>
              <span>View included tests</span>
            </button>
          </div>
          <div className="lp-launch">
            <span>Limited-time launch price!</span>
            <img className="m1" src="/assets/lp/hero-monstera-r.svg" alt="" />
            <img className="m2" src="/assets/lp/hero-monstera-l.svg" alt="" />
          </div>
        </div>
      </div>
    </section>
  );
}
