import { clamp, onScrollFrame, reducedMotion, smoothstep } from './motion';

/**
 * Jahreszeiten in drei Modi:
 * - «wheel»: Desktop mit Bewegung – Technik 03, scrollgebundene Rotation des Jahresrads.
 * - «tabs»:  Desktop mit reduzierter Bewegung – ARIA-Tabs (Pfeiltasten, Pos1/Ende).
 * - «stack»: Mobil/ohne Skript – vier Kapitel untereinander.
 */
const DESKTOP = '(min-width: 900px)';
const WHEEL = '(min-width: 1000px) and (min-height: 620px)';

type Mode = 'wheel' | 'tabs' | 'stack';

export function initSeasons(): void {
  document.querySelectorAll<HTMLElement>('[data-seasons]').forEach(setup);
}

function setup(root: HTMLElement): void {
  const tablist = root.querySelector<HTMLElement>('[data-seasons-tablist]');
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-season]'));
  const wheel = root.querySelector<HTMLElement>('[data-wheel]');
  const dial = root.querySelector<HTMLElement>('[data-dial]');
  const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-node]'));
  const words = Array.from(root.querySelectorAll<HTMLElement>('.wheel__word'));
  const pin = root.querySelector<HTMLElement>('[data-seasons-pin]');
  if (!tablist || tabs.length !== panels.length) return;

  const desktop = window.matchMedia(DESKTOP);
  const wheelQuery = window.matchMedia(WHEEL);
  let mode: Mode = 'stack';
  let current = 0;
  let stopWheel: (() => void) | null = null;

  const setSelected = (index: number, focus = false) => {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    if (focus) tabs[index].focus();
  };

  const showPanel = (index: number) => {
    panels.forEach((panel, i) => {
      panel.classList.toggle('is-active', i === index);
      panel.toggleAttribute('inert', i !== index);
    });
    words.forEach((word, i) => word.classList.toggle('is-active', i === index));
  };

  // ---------- Tabs (reduzierte Bewegung) ----------
  const selectTab = (index: number, focus = false) => {
    if (index === current) {
      if (focus) tabs[index].focus();
      return;
    }
    const prev = panels[current];
    const next = panels[index];
    const tabRect = tabs[index].getBoundingClientRect();
    const listRect = tablist.getBoundingClientRect();
    const originX = ((tabRect.left + tabRect.width / 2 - listRect.left) / listRect.width) * 100;
    next.style.setProperty('--origin-x', `${clamp(originX, 8, 92).toFixed(1)}%`);
    panels.forEach((p) => p.classList.remove('is-leaving', 'is-entering'));
    prev.classList.remove('is-active');
    prev.classList.add('is-leaving');
    prev.setAttribute('inert', '');
    next.removeAttribute('inert');
    next.classList.add('is-active', 'is-entering');
    setSelected(index, focus);
    current = index;
    const finish = () => {
      prev.classList.remove('is-leaving');
      next.classList.remove('is-entering');
    };
    if (reducedMotion()) finish();
    else window.setTimeout(finish, 1150);
  };

  // ---------- Jahresrad ----------
  // Die Bühne klebt unter dem Header: Drehung läuft, solange sie festgehalten wird.
  const stickyTop = () => (pin ? parseFloat(getComputedStyle(pin).top) || 0 : 0);
  const scrollRange = () => Math.max(1, root.offsetHeight - (pin?.offsetHeight ?? window.innerHeight));
  const scrollToSeason = (index: number) => {
    const top = root.getBoundingClientRect().top + window.scrollY - stickyTop();
    window.scrollTo({ top: top + (index / (panels.length - 1)) * scrollRange() + 2, behavior: 'smooth' });
  };

  const renderWheel = (rect: DOMRect) => {
    if (!dial || !wheel) return;
    const p = clamp((stickyTop() - rect.top) / scrollRange());
    const steps = panels.length - 1;
    const u = p * steps;
    const i = Math.min(Math.floor(u), steps - 1);
    const f = smoothstep(clamp((u - i - 0.22) / 0.56));
    const rot = 90 * (i + f);

    const box = wheel.getBoundingClientRect();
    const d = Math.min(box.height * 0.86, box.width * 0.82);
    const radius = d * 0.43;
    const node = d * 0.46;
    dial.style.setProperty('--d', `${d.toFixed(0)}px`);
    dial.style.setProperty('--rot', `${(-rot).toFixed(2)}deg`);
    nodes.forEach((el, k) => {
      const angle = ((180 + 90 * k - rot) * Math.PI) / 180;
      const facing = Math.max(0, Math.cos(angle - Math.PI)); // 1 = vorn (links)
      const scale = 0.46 + 0.54 * facing ** 2;
      el.style.setProperty('--node', `${node.toFixed(0)}px`);
      el.style.setProperty('--x', `${(Math.cos(angle) * radius).toFixed(1)}px`);
      el.style.setProperty('--y', `${(Math.sin(angle) * radius).toFixed(1)}px`);
      el.style.setProperty('--ns', scale.toFixed(3));
      el.style.setProperty('--o', (0.5 + 0.5 * facing).toFixed(3));
      el.style.setProperty('--z', String(Math.round(facing * 10) + 1));
    });

    const active = Math.round(rot / 90);
    if (active !== current) {
      current = active;
      showPanel(active);
      setSelected(active);
    }
  };

  // ---------- Moduswechsel ----------
  const apply = () => {
    const next: Mode = desktop.matches ? (wheelQuery.matches && !reducedMotion() ? 'wheel' : 'tabs') : 'stack';
    if (next === mode) return;
    stopWheel?.();
    stopWheel = null;
    root.classList.remove('is-tabs', 'is-wheel');
    panels.forEach((panel) => panel.classList.remove('is-leaving', 'is-entering'));
    if (wheel) wheel.hidden = true;
    mode = next;

    if (mode === 'stack') {
      tablist.hidden = true;
      panels.forEach((panel) => {
        panel.removeAttribute('role');
        panel.removeAttribute('tabindex');
        panel.removeAttribute('inert');
        panel.setAttribute('aria-labelledby', panel.querySelector('h3')?.id ?? '');
        panel.classList.remove('is-active');
      });
      return;
    }

    tablist.hidden = false;
    panels.forEach((panel, i) => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabs[i].id);
      panel.tabIndex = 0;
    });
    showPanel(current);
    setSelected(current);

    if (mode === 'tabs') {
      root.classList.add('is-tabs');
    } else {
      root.classList.add('is-wheel');
      if (wheel) wheel.hidden = false;
      stopWheel = onScrollFrame(root, (rect) => renderWheel(rect));
    }
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => (mode === 'wheel' ? scrollToSeason(i) : selectTab(i)));
    tab.addEventListener('keydown', (event) => {
      const last = tabs.length - 1;
      let target: number | null = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = i === last ? 0 : i + 1;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = i === 0 ? last : i - 1;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = last;
      if (target === null) return;
      event.preventDefault();
      if (mode === 'wheel') {
        setSelected(target, true);
        scrollToSeason(target);
      } else selectTab(target, true);
    });
  });

  desktop.addEventListener('change', apply);
  wheelQuery.addEventListener('change', apply);
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', apply);
  apply();

  // Bilder vorladen, sobald die Jahreszeiten näher kommen – Wechsel ohne Lücke
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || mode === 'stack') return;
      root.querySelectorAll('img').forEach((img) => (img.loading = 'eager'));
      io.disconnect();
    },
    { rootMargin: '400px 0px' },
  );
  io.observe(root);
}
