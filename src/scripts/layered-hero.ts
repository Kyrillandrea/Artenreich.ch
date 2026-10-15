import { clamp, onScrollFrame, reducedMotion } from './motion';

/**
 * Layered Parallax: jede Ebene mit `data-depth` verschiebt sich beim Scrollen um
 * Scrollweg × Tiefe (positiv = langsamer/hinten, negativ = schneller/vorn).
 * `data-mouse` (px) gibt die maximale Verschiebung zur Maus auf Desktop an.
 */
export function initLayeredHero(): void {
  const hero = document.querySelector<HTMLElement>('[data-layered]');
  if (!hero || reducedMotion()) return;

  const layers = Array.from(hero.querySelectorAll<HTMLElement>('[data-depth]'));
  const fade = hero.querySelector<HTMLElement>('[data-fade]');
  const small = window.matchMedia('(max-width: 899px)');

  onScrollFrame(hero, (rect) => {
    const y = clamp(-rect.top, 0, rect.height);
    const factor = small.matches ? 0.6 : 1;
    for (const layer of layers) {
      const depth = Number(layer.dataset.depth) || 0;
      layer.style.setProperty('--sy', `${(y * depth * factor).toFixed(1)}px`);
    }
    if (fade) fade.style.setProperty('--fade', (1 - clamp(y / (rect.height * 0.8)) * 0.85).toFixed(3));
  });

  // Maus-Tiefe nur mit feinem Zeiger auf grossen Bildschirmen
  const pointer = window.matchMedia('(pointer: fine) and (min-width: 900px)');
  if (!pointer.matches) return;
  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let raf = 0;
  const step = () => {
    x += (targetX - x) * 0.08;
    y += (targetY - y) * 0.08;
    for (const layer of layers) {
      const amount = Number(layer.dataset.mouse) || 0;
      if (!amount) continue;
      layer.style.setProperty('--mx', `${(x * amount).toFixed(2)}px`);
      layer.style.setProperty('--my', `${(y * amount * 0.6).toFixed(2)}px`);
    }
    raf = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.001 ? requestAnimationFrame(step) : 0;
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(step);
  };
  hero.addEventListener('pointermove', (event) => {
    targetX = clamp(event.clientX / window.innerWidth, 0, 1) * 2 - 1;
    targetY = clamp(event.clientY / window.innerHeight, 0, 1) * 2 - 1;
    kick();
  });
  hero.addEventListener('pointerleave', () => {
    targetX = 0;
    targetY = 0;
    kick();
  });
}
