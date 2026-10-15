#!/usr/bin/env node
/**
 * Labormessung von LCP, CLS und Übertragungsgrösse mit Chromium (Playwright).
 *   npm run preview   # anderes Terminal
 *   npm run perf
 * Profil «mobil»: 390 px, 4× CPU-Drosselung, ~1.6 Mbit/s, 150 ms RTT (ähnlich «Slow 4G»).
 */
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE ?? 'http://127.0.0.1:4321';
const PAGES = ['/', '/naturgarten/', '/naturpools-schwimmteiche/', '/impressionen/', '/team/', '/kontakt/'];
const profiles = [
  { name: 'Desktop', viewport: { width: 1440, height: 900 }, throttle: null },
  { name: 'Mobil (gedrosselt)', viewport: { width: 390, height: 844 }, throttle: { cpu: 4, down: 1.6e6 / 8, up: 750e3 / 8, latency: 150 } },
];

const browser = await chromium.launch();
for (const profile of profiles) {
  console.log(`\n${profile.name}`);
  for (const path of PAGES) {
    const ctx = await browser.newContext({ viewport: profile.viewport });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (profile.throttle) {
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.throttle.cpu });
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: profile.throttle.latency,
        downloadThroughput: profile.throttle.down,
        uploadThroughput: profile.throttle.up,
      });
    }
    let bytes = 0;
    cdp.on('Network.loadingFinished', (e) => (bytes += e.encodedDataLength));
    await page.addInitScript(() => {
      window.__lcp = 0;
      window.__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          window.__lcp = e.startTime;
          window.__lcpEl = e.element ? `${e.element.tagName.toLowerCase()}.${e.element.classList[0] ?? ''}` : e.url;
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    // LCP vor dem Scrollen lesen – danach würden weiter unten liegende Elemente mitzählen
    const { lcp, lcpEl } = await page.evaluate(() => ({ lcp: window.__lcp, lcpEl: window.__lcpEl }));
    // Scrollen, damit spätere Layoutverschiebungen erfasst werden
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 50));
      }
    });
    await page.waitForTimeout(500);
    const cls = await page.evaluate(() => window.__cls);
    console.log(
      `${path.padEnd(28)} LCP ${(lcp / 1000).toFixed(2)} s (${lcpEl})   CLS ${cls.toFixed(3)}   übertragen ${(bytes / 1024).toFixed(0)} KB`,
    );
    await ctx.close();
  }
}
await browser.close();
