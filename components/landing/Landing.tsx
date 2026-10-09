'use client';

import { useEffect, type MouseEvent } from 'react';
import { Biomarkers } from './Biomarkers';
import { Conditions } from './Conditions';
import { Doctors } from './Doctors';
import { Faq } from './Faq';
import { Footer } from './Footer';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { Pricing } from './Pricing';
import { FloatingCta, StickyCta } from './StickyCta';
import { TopBar } from './TopBar';

/** Plays the intro once per page load. `html.td-intro` is set before paint by the layout script
 *  and removed when the user leaves the landing, so returning from the form shows everything. */
function useIntroReveal() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('td-intro')) return;
    const els = [...document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-shown])')];
    const show = (el: HTMLElement) => el.setAttribute('data-shown', '');
    const timers: number[] = [];

    for (const el of els.filter((e) => e.dataset.reveal === 'hero')) {
      const d = Number(el.dataset.revealDelay || 0);
      el.style.transitionDelay = `${d}ms`;
      requestAnimationFrame(() => requestAnimationFrame(() => show(el)));
      timers.push(window.setTimeout(() => (el.style.transitionDelay = ''), d + 1000));
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            show(en.target as HTMLElement);
            io.unobserve(en.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );
    els.filter((e) => e.dataset.reveal === 'section' || e.dataset.reveal === 'glow').forEach((e) => io.observe(e));

    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);
}

export function Landing({ onJoin }: { onJoin: (e: MouseEvent<HTMLButtonElement>) => void }) {
  useIntroReveal();
  return (
    <main data-screen-label="01 Landing" className="flex flex-col items-stretch bg-white">
      <TopBar />
      <Hero />
      <HowItWorks />
      <Biomarkers />
      <Conditions />
      <Doctors />
      <Pricing />
      <Faq />
      <Footer />
      <StickyCta onJoin={onJoin} />
      <FloatingCta onJoin={onJoin} />
    </main>
  );
}
