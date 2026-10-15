/**
 * Sparsames Desktop-Parallax (max. ±40 px) für Naturdetails.
 * Nur ab 1024 px, nicht bei reduzierter Bewegung; aktualisiert nur sichtbare Elemente.
 * Verwendung: <div data-parallax="0.12"> – Faktor bezogen auf den Abstand zur Viewport-Mitte.
 */
const MAX_SHIFT = 40;

export function initParallax(): void {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (!items.length || !('IntersectionObserver' in window)) return;

  const desktop = window.matchMedia('(min-width: 1024px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set<HTMLElement>();
  let frame = 0;
  let active = false;

  const render = () => {
    frame = 0;
    const mid = window.innerHeight / 2;
    for (const el of visible) {
      const factor = Number(el.dataset.parallax) || 0.1;
      const rect = el.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - mid) * -factor;
      const shift = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, offset));
      el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
    }
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement;
      if (entry.isIntersecting) visible.add(el);
      else visible.delete(el);
    }
    schedule();
  });

  const enable = () => {
    if (active) return;
    active = true;
    items.forEach((el) => {
      el.style.willChange = 'transform';
      observer.observe(el);
    });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
  };
  const disable = () => {
    if (!active) return;
    active = false;
    observer.disconnect();
    visible.clear();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    items.forEach((el) => {
      el.style.transform = '';
      el.style.willChange = '';
    });
  };
  const evaluate = () => (desktop.matches && !reduced.matches ? enable() : disable());

  desktop.addEventListener('change', evaluate);
  reduced.addEventListener('change', evaluate);
  evaluate();
}
