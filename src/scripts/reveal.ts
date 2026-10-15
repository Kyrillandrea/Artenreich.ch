/**
 * Wohldosierte Reveals beim Scrollen.
 * Inhalte sind ohne Skript immer sichtbar: Erst nachdem alle bereits sichtbaren Elemente
 * markiert sind, setzt das Skript `reveal-ready`. Nur dann blendet CSS übrige Elemente aus.
 * Bei reduzierter Bewegung greift die CSS-Regel nicht (Media Query), Inhalte bleiben stehen.
 */
export function initReveal(): void {
  const root = document.documentElement;
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!items.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const viewportBottom = window.innerHeight;
  const pending: HTMLElement[] = [];
  for (const el of items) {
    const rect = el.getBoundingClientRect();
    // Alles, was bereits im oder über dem Viewport liegt, sofort zeigen.
    if (rect.top < viewportBottom * 0.98) el.classList.add('is-in');
    else pending.push(el);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
  );
  pending.forEach((el) => observer.observe(el));
  root.classList.add('reveal-ready');

  // Sprungmarken und Druck: nie unsichtbare Inhalte hinterlassen
  const revealAll = () => items.forEach((el) => el.classList.add('is-in'));
  window.addEventListener('beforeprint', revealAll);
  window.addEventListener('hashchange', revealAll);
}
