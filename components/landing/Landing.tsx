'use client';

import { useEffect, useRef, type MouseEvent } from 'react';
import type { Plan } from '@/lib/validation';
import { Biomarkers } from './Biomarkers';
import { Conditions } from './Conditions';
import { Doctors } from './Doctors';
import { Faq } from './Faq';
import { Footer } from './Footer';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { Pricing } from './Pricing';
import { Puzzle } from './Puzzle';
import { StickyCta } from './StickyCta';

/** Opens the waitlist form from a button, optionally with a plan preselected (hero price cards). */
export type JoinHandler = (e: MouseEvent<HTMLButtonElement>, plan?: Plan) => void;

/** Scroll reveals: each element gets `.in` once, the first time 18% of it is in view. The hidden starting
 *  states only exist under html.td-intro, which the layout script sets before paint (first visit, motion on). */
function useReveals() {
  useEffect(() => {
    const els = document.querySelectorAll('.lp-rv, .lp-tl-card, .lp-pz, [data-inview]');
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      },
      { threshold: 0.18 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export function Landing({ onJoin }: { onJoin: JoinHandler }) {
  const heroCta = useRef<HTMLDivElement>(null);
  useReveals();
  return (
    <main data-screen-label="01 Landing" className="lp">
      <Hero onJoin={onJoin} ctaRef={heroCta} />
      <HowItWorks />
      <Puzzle />
      <Biomarkers />
      <Conditions />
      <Doctors />
      <Pricing />
      <Faq />
      <Footer />
      <StickyCta onJoin={onJoin} heroCta={heroCta} />
    </main>
  );
}
