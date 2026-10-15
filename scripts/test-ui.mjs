#!/usr/bin/env node
/**
 * Interaktions- und Barrierefreiheitsprüfung gegen einen laufenden Server.
 *   npm run build && npm run preview   # anderes Terminal
 *   npm run test:ui
 */
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE ?? 'http://127.0.0.1:4321';
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` – ${detail}` : ''}`);
};
const active = (p) => p.evaluate(() => {
  const el = document.activeElement;
  return el ? `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${[...el.classList].join('.')}` : '';
});

const browser = await chromium.launch();
try {
  // --- Mobiles Menü ------------------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await p.click('[data-menu-open]');
    check('Menü öffnet als modaler Dialog', await p.evaluate(() => document.querySelector('[data-menu-dialog]').open));
    check('aria-expanded = true', (await p.getAttribute('[data-menu-open]', 'aria-expanded')) === 'true');
    await p.keyboard.press('Escape');
    check('Escape schliesst das Menü', !(await p.evaluate(() => document.querySelector('[data-menu-dialog]').open)));
    check('Fokus kehrt zum Menü-Button zurück', (await active(p)).includes('menu-toggle'));
    // Fokus bleibt im Dialog
    await p.click('[data-menu-open]');
    for (let i = 0; i < 14; i++) await p.keyboard.press('Tab');
    const inside = await p.evaluate(() => document.querySelector('[data-menu-dialog]').contains(document.activeElement) || document.activeElement === document.body);
    check('Tastaturfokus bleibt im geöffneten Menü', inside);
    await p.click('[data-menu-dialog] a[href$="/naturgarten/"]');
    await p.waitForURL('**/naturgarten/');
    check('Menülink navigiert', p.url().endsWith('/naturgarten/'));

    // Sticky-CTA: nach dem Einstieg sichtbar, beim Formular ausgeblendet
    await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    const hiddenAtTop = await p.evaluate(() => document.querySelector('[data-sticky-cta]').classList.contains('is-away'));
    await p.evaluate(() => window.scrollTo({ top: document.querySelector('#leistungen').offsetTop, behavior: 'instant' }));
    await p.waitForTimeout(400);
    const shownMid = await p.evaluate(() => !document.querySelector('[data-sticky-cta]').classList.contains('is-away'));
    await p.evaluate(() => document.querySelector('#anfrage').scrollIntoView({ behavior: 'instant' }));
    await p.waitForTimeout(400);
    const hiddenAtForm = await p.evaluate(() => document.querySelector('[data-sticky-cta]').classList.contains('is-away'));
    check('Mobiler CTA: im Hero verborgen, danach sichtbar, beim Formular verborgen', hiddenAtTop && shownMid && hiddenAtForm);
    const safeArea = await p.evaluate(() => getComputedStyle(document.querySelector('[data-sticky-cta]')).bottom);
    check('Mobiler CTA mit Abstand zum Rand (Safe Area)', parseFloat(safeArea) >= 16, safeArea);
    await ctx.close();
  }

  // --- Jahreszeiten: Tabs (Tablet-Breite bzw. reduzierte Bewegung) ----------------
  {
    const ctx = await browser.newContext({ viewport: { width: 960, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/#jahreszeiten`, { waitUntil: 'domcontentloaded' });
    check('Jahreszeiten: Tabs aktiv ab 900 px', await p.isVisible('[data-seasons-tablist]'));
    await p.focus('#jahreszeiten-tab-fruehling');
    await p.keyboard.press('ArrowRight');
    check('Pfeiltaste wählt Sommer', (await p.getAttribute('#jahreszeiten-tab-sommer', 'aria-selected')) === 'true');
    check('Fokus folgt der Auswahl', (await active(p)).includes('jahreszeiten-tab-sommer'));
    await p.keyboard.press('End');
    check('Ende-Taste wählt Winter', (await p.getAttribute('#jahreszeiten-tab-winter', 'aria-selected')) === 'true');
    await p.waitForTimeout(1300);
    const visibleTitles = await p.evaluate(() =>
      [...document.querySelectorAll('[data-season] h3')].filter((h) => getComputedStyle(h).visibility === 'visible').map((h) => h.textContent.trim()),
    );
    check('Nur der aktive Text sichtbar', visibleTitles.length === 1 && visibleTitles[0] === 'Winter', visibleTitles.join(','));
    await p.click('#jahreszeiten-tab-herbst');
    // Während des Wechsels darf kein dunkler Zwischenzustand entstehen: altes Bild bleibt sichtbar
    const during = await p.evaluate(() => {
      const leaving = document.querySelector('[data-season].is-leaving');
      return leaving ? getComputedStyle(leaving).visibility : 'none';
    });
    check('Bildwechsel ohne Lücke (vorheriges Bild bleibt sichtbar)', during === 'visible');
    await ctx.close();

    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const m = await mctx.newPage();
    await m.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    const stacked = await m.evaluate(() => [...document.querySelectorAll('[data-season]')].every((s) => getComputedStyle(s).visibility === 'visible' && !s.hidden));
    check('Mobil: vier Jahreszeiten als Kapitel untereinander', stacked && !(await m.isVisible('[data-seasons-tablist]')));
    await mctx.close();
  }

  // --- Technik 03: Jahresrad (scrollgebundene Rotation) ---------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    check('Jahresrad aktiv auf Desktop', await p.evaluate(() => document.querySelector('[data-seasons]').classList.contains('is-wheel')));
    const geo = await p.evaluate(() => {
      const s = document.querySelector('[data-seasons]');
      const pin = document.querySelector('[data-seasons-pin]');
      return {
        top: s.getBoundingClientRect().top + window.scrollY - parseFloat(getComputedStyle(pin).top),
        range: s.offsetHeight - pin.offsetHeight,
      };
    });
    const at = async (f) => {
      await p.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), geo.top + geo.range * f);
      await p.waitForTimeout(450);
      return p.evaluate(() => ({
        rot: getComputedStyle(document.querySelector('[data-dial]')).getPropertyValue('--rot').trim(),
        active: document.querySelector('[data-season].is-active h3')?.textContent.trim(),
        pinTop: Math.round(document.querySelector('[data-seasons-pin]').getBoundingClientRect().top),
      }));
    };
    const a0 = await at(0.02);
    const a1 = await at(0.5);
    const a2 = await at(1);
    check('Rad dreht mit dem Scrollen', a0.rot !== a1.rot && a1.rot !== a2.rot, `${a0.rot} → ${a1.rot} → ${a2.rot}`);
    check('Aktive Jahreszeit folgt der Drehung', a0.active === 'Frühling' && a2.active === 'Winter', `${a0.active} … ${a2.active}`);
    check('Bühne bleibt beim Scrollen stehen (sticky)', a1.pinTop === a2.pinTop, `${a1.pinTop}/${a2.pinTop}`);
    await p.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), geo.top);
    await p.click('#jahreszeiten-tab-herbst');
    await p.waitForTimeout(1800);
    check('Tab «Herbst» dreht das Rad zum Herbst', (await p.evaluate(() => document.querySelector('[data-season].is-active h3')?.textContent.trim())) === 'Herbst');
    await ctx.close();
  }

  // --- Technik 01, 02, 04, 05 -----------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    const layer = (sel) => p.evaluate((s) => getComputedStyle(document.querySelector(s)).getPropertyValue('--sy').trim(), sel);
    await p.evaluate(() => window.scrollTo({ top: 400, behavior: 'instant' }));
    await p.waitForTimeout(300);
    const back = await layer('.hero__back');
    const front = await layer('.hero__front--a');
    check('01 Layered Parallax: Ebenen bewegen sich unterschiedlich', parseFloat(back) > 0 && parseFloat(front) < 0, `hinten ${back}, vorn ${front}`);

    const bloom = async (offset) => {
      await p.evaluate((o) => {
        const el = document.querySelector('[data-bloom]');
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - o, behavior: 'instant' });
      }, offset);
      await p.waitForTimeout(300);
      return p.evaluate(() => Number(getComputedStyle(document.querySelector('[data-bloom]')).getPropertyValue('--p')));
    };
    const early = await bloom(780);
    const done = await bloom(150);
    check('02 Text Reveal: Buchstaben erblühen beim Scrollen', early < 0.5 && done === 1, `${early} → ${done}`);
    const readable = await p.evaluate(() => document.querySelector('#habitat-title').textContent.includes('Ein Garten. Unzählige Lebensräume.'));
    check('02 Text Reveal: Überschrift für Screenreader vollständig', readable);

    await p.evaluate(() => document.querySelector('[data-eye]').scrollIntoView({ block: 'center', behavior: 'instant' }));
    await p.waitForTimeout(300);
    const box = await p.locator('[data-eye]').boundingBox();
    await p.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    for (let i = 0; i < 8; i++) {
      await p.mouse.move(box.x + box.width * (0.45 + i * 0.02), box.y + box.height * 0.5);
      await p.waitForTimeout(160);
    }
    const ripples = await p.locator('[data-eye] .ripple').count();
    await p.mouse.move(box.x - 400, box.y + 20);
    await p.waitForTimeout(800);
    const tx = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.eye__pupil')).getPropertyValue('--tx')));
    check('04 Cursor Tracking: Auge folgt dem Cursor', tx < -5, `${tx.toFixed(1)}px`);
    check('04 Cursor Tracking: Wellen unter dem Cursor', ripples > 0, `${ripples}`);

    const stackTop = await p.evaluate(() => document.querySelector('[data-stack]').getBoundingClientRect().top + window.scrollY);
    await p.evaluate((t) => window.scrollTo({ top: t + 1200, behavior: 'instant' }), stackTop);
    await p.waitForTimeout(400);
    const stack = await p.evaluate(() => {
      const items = [...document.querySelectorAll('[data-stack] > li')];
      return items.map((li) => ({
        top: Math.round(li.getBoundingClientRect().top),
        s: Number(getComputedStyle(li.firstElementChild).getPropertyValue('--s') || 1),
      }));
    });
    check('05 Stacking Cards: Karten stapeln sich versetzt', stack[0].top < stack[1].top && stack[1].top - stack[0].top < 40, stack.map((c) => c.top).join('/'));
    check('05 Stacking Cards: untere Karten treten zurück', stack[0].s < 1 && stack[0].s >= 0.86, stack.map((c) => c.s).join('/'));
    await ctx.close();
  }

  // --- Galerie / Grossansicht -------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/impressionen/`, { waitUntil: 'domcontentloaded' });
    check('Galerie: alle 18 Aufnahmen', (await p.locator('[data-lightbox-item]').count()) === 18);
    await p.focus('[data-lightbox-item][data-index="2"]');
    await p.keyboard.press('Enter');
    check('Enter öffnet die Grossansicht', await p.evaluate(() => document.querySelector('[data-lightbox]').open));
    check('Zähler korrekt', (await p.textContent('[data-lightbox-count]')) === 'Bild 3 von 18');
    await p.keyboard.press('ArrowRight');
    check('Pfeil rechts blättert', (await p.textContent('[data-lightbox-count]')) === 'Bild 4 von 18');
    check('Bildunterschrift = Motivbeschreibung', (await p.textContent('[data-lightbox-caption]')).includes('Blüten und Gräser'));
    await p.keyboard.press('Escape');
    check('Escape schliesst', !(await p.evaluate(() => document.querySelector('[data-lightbox]').open)));
    check('Fokus zurück auf das zuletzt gezeigte Bild', (await p.evaluate(() => document.activeElement?.dataset.index)) === '3');
    await ctx.close();
  }

  // --- FAQ ---------------------------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/naturpools-schwimmteiche/`, { waitUntil: 'domcontentloaded' });
    const items = p.locator('.faq__item');
    check('FAQ: fünf Fragen', (await items.count()) === 5);
    await p.focus('.faq__item:nth-child(3) summary');
    await p.keyboard.press('Enter');
    check('FAQ per Tastatur öffnen', await p.evaluate(() => document.querySelectorAll('.faq__item')[2].open));
    await ctx.close();
  }

  // --- Reduzierte Bewegung -----------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    const state = await p.evaluate(() => {
      const hidden = [...document.querySelectorAll('[data-reveal]')].filter((el) => getComputedStyle(el).opacity !== '1').length;
      const anim = getComputedStyle(document.querySelector('.hero__line')).animationName;
      const parallax = [...document.querySelectorAll('[data-parallax]')].some((el) => el.style.transform);
      return { hidden, anim, parallax, smooth: getComputedStyle(document.documentElement).scrollBehavior };
    });
    check('Reduzierte Bewegung: alle Inhalte sofort sichtbar', state.hidden === 0, `${state.hidden} verborgen`);
    check('Reduzierte Bewegung: keine Hero-Animation', state.anim === 'none');
    check('Reduzierte Bewegung: kein Parallax', !state.parallax);
    check('Reduzierte Bewegung: kein Smooth-Scroll', state.smooth === 'auto');
    const rm = await p.evaluate(() => ({
      bloom: getComputedStyle(document.querySelector('[data-bloom]')).getPropertyValue('--p').trim(),
      wheel: document.querySelector('[data-seasons]').classList.contains('is-wheel'),
      sy: document.querySelector('.hero__back').style.getPropertyValue('--sy'),
    }));
    check('Reduzierte Bewegung: Text sofort vollständig, kein Rad, kein Parallax', rm.bloom === '1' && !rm.wheel && !rm.sy, JSON.stringify(rm));
    await ctx.close();
  }

  // --- Ohne JavaScript ---------------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    const state = await p.evaluate(() => ({
      hidden: [...document.querySelectorAll('[data-reveal]')].filter((el) => getComputedStyle(el).opacity !== '1').length,
      seasons: [...document.querySelectorAll('[data-season]')].filter((s) => getComputedStyle(s).visibility === 'visible').length,
    }));
    check('Ohne JS: keine verborgenen Inhalte', state.hidden === 0);
    check('Ohne JS: alle vier Jahreszeiten lesbar', state.seasons === 4);
    await ctx.close();

    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    const m = await mctx.newPage();
    await m.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    check('Ohne JS: Menü-Link führt zur Fussnavigation', await m.isVisible('a.menu-toggle--nojs[href="#footer-nav"]'));
    await mctx.close();
  }

  // --- Tastatur & Fokus --------------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await p.keyboard.press('Tab');
    const skip = await p.evaluate(() => {
      const el = document.activeElement;
      const r = el.getBoundingClientRect();
      return { cls: el.className, visible: r.width > 50 && r.top >= 0 };
    });
    check('Erster Tab: sichtbarer Skip-Link', skip.cls.includes('skip-link') && skip.visible);
    await p.keyboard.press('Enter');
    check('Skip-Link springt zum Inhalt', (await active(p)).startsWith('main#inhalt'));
    // Fokus sichtbar (Outline vorhanden)
    await p.keyboard.press('Tab');
    const outline = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
    check('Sichtbarer Fokusindikator', outline !== 'none', outline);
    await ctx.close();
  }

  // --- 200 % Zoom (entspricht 640 CSS-px bei 1280 px Fenster) -------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 640, height: 450 }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    let worst = 0;
    for (const path of ['/', '/naturgarten/', '/naturpools-schwimmteiche/', '/impressionen/', '/team/', '/kontakt/']) {
      await p.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
      worst = Math.max(worst, await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth));
    }
    check('200 % Zoom: keine horizontale Überbreite', worst <= 0, `${worst}px`);
    await ctx.close();
  }

  // --- Touch-Ziele ---------------------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    const small = [];
    for (const path of ['/', '/kontakt/', '/impressionen/']) {
      await p.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
      const found = await p.evaluate(() =>
        [...document.querySelectorAll('a, button, input[type="radio"], summary')]
          .filter((el) => {
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('dialog:not([open]), .sr-only, .inquiry__hp, [hidden]')) return false;
            if (el.matches('.skip-link')) return false;
            const target = el.matches('input[type="radio"]') ? el.closest('label') : el;
            const r = target.getBoundingClientRect();
            if (r.width === 0) return false;
            // Links im Fliesstext sind nach WCAG 2.5.8 ausgenommen
            if (el.tagName === 'A' && getComputedStyle(el).display === 'inline' && el.closest('p')) return false;
            return r.height < 44 || r.width < 44;
          })
          .map((el) => `${el.tagName.toLowerCase()}.${el.className} "${el.textContent.trim().slice(0, 30)}"`),
      );
      small.push(...found.map((f) => `${path}: ${f}`));
    }
    check('Touch-Ziele ≥ 44 × 44 px', small.length === 0, small.slice(0, 8).join(' | '));
    await ctx.close();
  }
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} Prüfungen bestanden.`);
process.exit(failed.length ? 1 : 0);
