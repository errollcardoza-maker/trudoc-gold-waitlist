/** True while the landing's entrance motion is on (html.td-intro: first visit, motion allowed). Without it
 *  every element shows in its final state, so count-ups and swirls are skipped. */
export function animating() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('td-intro');
}

/** Calls `fn` once, the first time `el` is at least `threshold` in view. Returns a cleanup. */
export function onceInView(el: Element, fn: () => void, threshold = 0.18) {
  const io = new IntersectionObserver(
    ([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      fn();
    },
    { threshold },
  );
  io.observe(el);
  return () => io.disconnect();
}

/** Counts `el`'s text from 0 to `to` with ease-out-quart. Returns a cleanup. */
export function countUp(el: HTMLElement, to: number, { dur = 1300, delay = 0, decimals = 0 } = {}) {
  let raf = 0;
  const fmt = (v: number) => v.toFixed(decimals);
  el.textContent = fmt(0);
  const t = window.setTimeout(() => {
    const start = performance.now();
    const step = (now: number) => {
      const x = Math.min(1, (now - start) / dur);
      el.textContent = fmt(to * (1 - Math.pow(1 - x, 4)));
      if (x < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }, delay);
  return () => {
    clearTimeout(t);
    cancelAnimationFrame(raf);
    el.textContent = fmt(to);
  };
}
