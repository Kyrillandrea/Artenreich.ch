/**
 * Jahreszeiten-Auswahl als ARIA-Tabs (automatische Aktivierung, Pfeiltasten, Pos1/Ende).
 * Nur ab 900 px; darunter bleiben die vier Kapitel untereinander stehen.
 */
const QUERY = '(min-width: 900px)';

export function initSeasons(): void {
  document.querySelectorAll<HTMLElement>('[data-seasons]').forEach(setup);
}

function setup(root: HTMLElement): void {
  const tablist = root.querySelector<HTMLElement>('[data-seasons-tablist]');
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-season]'));
  if (!tablist || tabs.length !== panels.length) return;

  const media = window.matchMedia(QUERY);
  let current = 0;

  const enable = () => {
    root.classList.add('is-tabs');
    tablist.hidden = false;
    panels.forEach((panel, i) => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabs[i].id);
      panel.tabIndex = 0;
      panel.hidden = false;
      panel.toggleAttribute('inert', i !== current);
      panel.classList.toggle('is-active', i === current);
    });
  };

  const disable = () => {
    root.classList.remove('is-tabs');
    tablist.hidden = true;
    panels.forEach((panel) => {
      panel.removeAttribute('role');
      panel.removeAttribute('tabindex');
      panel.removeAttribute('inert');
      panel.setAttribute('aria-labelledby', panel.querySelector('h3')?.id ?? '');
      panel.classList.remove('is-active', 'is-leaving', 'is-entering');
    });
  };

  const select = (index: number, focus = false) => {
    if (index === current) {
      if (focus) tabs[index].focus();
      return;
    }
    const prev = panels[current];
    const next = panels[index];
    const tabRect = tabs[index].getBoundingClientRect();
    const listRect = tablist.getBoundingClientRect();
    const originX = ((tabRect.left + tabRect.width / 2 - listRect.left) / listRect.width) * 100;
    next.style.setProperty('--origin-x', `${Math.max(8, Math.min(92, originX)).toFixed(1)}%`);

    panels.forEach((p) => p.classList.remove('is-leaving', 'is-entering'));
    prev.classList.remove('is-active');
    prev.classList.add('is-leaving');
    prev.setAttribute('inert', '');
    next.removeAttribute('inert');
    next.classList.add('is-active', 'is-entering');

    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    if (focus) tabs[index].focus();
    current = index;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finish = () => {
      prev.classList.remove('is-leaving');
      next.classList.remove('is-entering');
    };
    if (reduced) finish();
    else window.setTimeout(finish, 1150);
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (event) => {
      const last = tabs.length - 1;
      let target: number | null = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = i === last ? 0 : i + 1;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = i === 0 ? last : i - 1;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = last;
      if (target !== null) {
        event.preventDefault();
        select(target, true);
      }
    });
  });

  const evaluate = () => (media.matches ? enable() : disable());
  media.addEventListener('change', evaluate);
  evaluate();

  // Bilder der übrigen Jahreszeiten im Leerlauf vorladen, damit der Wechsel ohne Lücke gelingt
  const preload = () =>
    panels.forEach((panel) => panel.querySelectorAll('img').forEach((img) => (img.loading = 'eager')));
  if (media.matches) {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          preload();
          io.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(root);
  }
}
