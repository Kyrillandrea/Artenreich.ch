/**
 * Zugängliche Grossansicht für die Galerie (natives <dialog>):
 * Escape schliesst, Pfeiltasten blättern, Wischgesten auf Touch, Fokus kehrt zum Auslöser zurück.
 */
export function initLightbox(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-lightbox-item]'));
  if (!dialog || !links.length || typeof dialog.showModal !== 'function') return;

  const img = dialog.querySelector<HTMLImageElement>('[data-lightbox-img]')!;
  const caption = dialog.querySelector<HTMLElement>('[data-lightbox-caption]')!;
  const count = dialog.querySelector<HTMLElement>('[data-lightbox-count]')!;
  const closeBtn = dialog.querySelector<HTMLButtonElement>('[data-lightbox-close]')!;
  const prevBtn = dialog.querySelector<HTMLButtonElement>('[data-lightbox-prev]')!;
  const nextBtn = dialog.querySelector<HTMLButtonElement>('[data-lightbox-next]')!;

  let index = 0;
  let opener: HTMLElement | null = null;

  const show = (i: number) => {
    index = (i + links.length) % links.length;
    const link = links[index];
    const thumb = link.querySelector('img');
    const text = link.dataset.caption ?? '';
    // Sofort das bereits geladene Vorschaubild zeigen, dann die grosse Variante
    if (thumb?.currentSrc) img.src = thumb.currentSrc;
    img.alt = text;
    img.classList.add('is-loading');
    const full = new Image();
    full.decoding = 'async';
    full.referrerPolicy = 'no-referrer';
    full.onload = () => {
      if (links[index] === link) {
        img.src = full.src;
        img.classList.remove('is-loading');
      }
    };
    full.onerror = () => img.classList.remove('is-loading');
    full.src = link.href;
    caption.textContent = text;
    count.textContent = `Bild ${index + 1} von ${links.length}`;
  };

  links.forEach((link, i) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      opener = link;
      show(i);
      dialog.showModal();
      closeBtn.focus();
    });
  });

  prevBtn.addEventListener('click', () => show(index - 1));
  nextBtn.addEventListener('click', () => show(index + 1));
  closeBtn.addEventListener('click', () => dialog.close());

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + 1);
    }
  });

  dialog.addEventListener('close', () => {
    img.removeAttribute('src');
    // Fokus auf das zuletzt angezeigte Bild zurückgeben
    (links[index] ?? opener)?.focus();
  });

  // Wischgesten
  let startX = 0;
  let startY = 0;
  let tracking = false;
  const wrap = dialog.querySelector<HTMLElement>('.lightbox__img-wrap')!;
  wrap.addEventListener('pointerdown', (e) => {
    tracking = true;
    startX = e.clientX;
    startY = e.clientY;
  });
  wrap.addEventListener('pointerup', (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) show(index + (dx < 0 ? 1 : -1));
  });
  wrap.addEventListener('pointercancel', () => (tracking = false));

  // Klick auf den freien Hintergrund des Bildbereichs schliesst
  wrap.addEventListener('click', (e) => {
    if (e.target === wrap) dialog.close();
  });
}
