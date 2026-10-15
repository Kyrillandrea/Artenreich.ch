/**
 * Dezenter mobiler Anfrage-Button.
 * Erscheint erst nach dem Einstieg, verschwindet, sobald ein Anfrageformular oder der Footer
 * sichtbar ist, bei geöffnetem Menü und während ein Eingabefeld fokussiert ist (Bildschirmtastatur).
 */
export function initStickyCta(): void {
  const cta = document.querySelector<HTMLAnchorElement>('[data-sticky-cta]');
  if (!cta || !('IntersectionObserver' in window)) return;

  cta.hidden = false;
  cta.classList.add('is-away');

  const blockers = new Set<Element>();
  let pastIntro = false;
  let typing = false;

  const update = () => {
    const away = !pastIntro || blockers.size > 0 || typing || document.documentElement.classList.contains('menu-open');
    cta.classList.toggle('is-away', away);
    if (away) cta.setAttribute('tabindex', '-1');
    else cta.removeAttribute('tabindex');
  };

  const blockObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) blockers.add(entry.target);
      else blockers.delete(entry.target);
    }
    update();
  });
  document.querySelectorAll('[data-inquiry], [data-footer]').forEach((el) => blockObserver.observe(el));

  const intro = document.querySelector('[data-intro]');
  if (intro) {
    new IntersectionObserver(([entry]) => {
      pastIntro = !entry.isIntersecting;
      update();
    }).observe(intro);
  } else {
    const onScroll = () => {
      pastIntro = window.scrollY > window.innerHeight * 0.6;
      update();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  document.addEventListener('focusin', (e) => {
    const t = e.target as HTMLElement;
    typing = t.matches('input, textarea, select');
    update();
  });
  document.addEventListener('focusout', () => {
    typing = false;
    update();
  });
  new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}
