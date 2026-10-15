/**
 * Gemeinsame Scroll-Engine für alle scrollgebundenen Effekte:
 * ein einziger requestAnimationFrame pro Frame, aktualisiert nur sichtbare Elemente.
 * Native Scrollbewegung – kein Scroll-Hijacking.
 */
type Tick = (rect: DOMRect, vh: number, vw: number) => void;

interface Item {
  el: Element;
  tick: Tick;
  visible: boolean;
}

const items: Item[] = [];
let frame = 0;
let observer: IntersectionObserver | null = null;

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const smoothstep = (t: number) => t * t * (3 - 2 * t);

export function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function run() {
  frame = 0;
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  for (const item of items) if (item.visible) item.tick(item.el.getBoundingClientRect(), vh, vw);
}

export function requestTick(): void {
  if (!frame) frame = requestAnimationFrame(run);
}

/** Ruft `tick` bei jedem Scroll-/Resize-Frame auf, solange `el` (mit Vorlauf) sichtbar ist. */
export function onScrollFrame(el: Element, tick: Tick): () => void {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const item = items.find((i) => i.el === entry.target);
          if (item) item.visible = entry.isIntersecting;
        }
        requestTick();
      },
      { rootMargin: '30% 0px 30% 0px' },
    );
    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick, { passive: true });
  }
  const item: Item = { el, tick, visible: false };
  items.push(item);
  observer.observe(el);
  requestTick();
  return () => {
    observer?.unobserve(el);
    const index = items.indexOf(item);
    if (index >= 0) items.splice(index, 1);
  };
}
