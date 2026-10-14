// Capturas de verificación: node tools/capturas.mjs <carpeta> (servir antes con python -m http.server 8091)
// Env: BASE (url), THEME (jhovin|mayorista|noche), SOLO (lista de páginas separadas por coma)
import { chromium } from 'file:///C:/Users/abner/dev/vanguard-saas/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE || 'http://127.0.0.1:8091/';
const THEME = process.env.THEME || 'jhovin';
const OUT = process.argv[2] || './shots';
const FONTS = process.env.FONTS; // carpeta opcional donde guardar las fuentes que carga la página
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [{ n: 'd', w: 1280, h: 800 }, { n: 'm430', w: 430, h: 932 }, { n: 'm375', w: 375, h: 812 }];
const fill = async p => { await p.evaluate(() => { S.cart = {}; add('P1012', 3); add('P1001', 2); add('P1005', 1); }); };
let PAGES = [
  { n: 'home', hash: '#/' },
  { n: 'cat', hash: '#/c/abarrotes' },
  { n: 'pdp', hash: '#/p/P1012' },
  { n: 'cart', hash: '#/', prep: async p => { await fill(p); await p.evaluate(() => openCart()); await p.waitForTimeout(400); } },
  { n: 'checkout', hash: '#/', prep: async p => { await fill(p); await p.evaluate(() => { location.hash = '#/checkout'; }); await p.waitForTimeout(400); } },
  { n: 'admin', hash: '#/admin/resumen' },
  { n: 'mega', hash: '#/', prep: async p => { await p.evaluate(() => mega(1)); await p.waitForTimeout(400); } },
  { n: 'entrega', hash: '#/', prep: async p => { await p.evaluate(() => entrega()); await p.waitForTimeout(400); } },
  // solo errores y desborde (sin captura salvo SHOTS_ALL)
  { n: 'ofertas', hash: '#/ofertas', quiet: true },
  { n: 'buscar', hash: '#/buscar/arroz', quiet: true },
  { n: 'bodega', hash: '#/bodega' },
  { n: 'envios', hash: '#/envios', quiet: true },
  { n: 'posib', hash: '#/posibilidades', quiet: true },
  { n: 'adm-ped', hash: '#/admin/pedidos', quiet: true },
  { n: 'adm-bod', hash: '#/admin/bodegas', quiet: true },
  { n: 'adm-prod', hash: '#/admin/productos', quiet: true },
  { n: 'adm-zon', hash: '#/admin/zonas', quiet: true },
  { n: 'adm-sync', hash: '#/admin/sync', quiet: true },
  { n: 'adm-mkt', hash: '#/admin/marketing', quiet: true },
  { n: 'ticket', hash: '#/', prep: async p => { await fill(p); await p.evaluate(() => { login('publico'); location.hash = '#/checkout'; }); await p.waitForTimeout(300); await p.evaluate(() => { document.querySelector('input[name=pay][value=ce]').checked = true; pagar(); }); await p.waitForTimeout(500); } },
  { n: 'pedidos', hash: '#/pedidos' },
];
if (process.env.SOLO) { const s = process.env.SOLO.split(','); PAGES = PAGES.filter(p => s.includes(p.n)); }

const browser = await chromium.launch();
const errores = [], desbordes = [];
for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
  await context.addInitScript(t => {
    if (!localStorage.getItem('jhovin-demo-v1')) localStorage.setItem('jhovin-demo-v1', JSON.stringify({ ent: { modo: 'delivery', zona: 'nc' }, theme: t }));
  }, THEME);
  for (const pg of PAGES) {
    const page = await context.newPage();
    page.on('console', m => { if (m.type() === 'error') errores.push(`${pg.n} ${vp.n} ${m.text()}`); });
    page.on('pageerror', e => errores.push(`${pg.n} ${vp.n} ${e.message}`));
    if (FONTS) page.on('response', async r => {
      if (!r.url().includes('fonts.gstatic.com')) return;
      fs.mkdirSync(FONTS, { recursive: true });
      try { fs.writeFileSync(path.join(FONTS, path.basename(new URL(r.url()).pathname)), await r.body()); } catch { }
    });
    await page.goto(BASE + pg.hash, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    if (pg.prep) await pg.prep(page);
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (ov > 0) desbordes.push({
      pagina: pg.n, viewport: vp.n, px: ov,
      elementos: await page.evaluate(() => [...document.querySelectorAll('body *')]
        .filter(e => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest('.rail,.hrail,.brands,nav.cats,.tblw'))
        .slice(0, 6).map(e => `${e.tagName}.${e.className} r=${Math.round(e.getBoundingClientRect().right)}`))
    });
    if (!pg.quiet || process.env.SHOTS_ALL) {
      const full = (vp.n === 'd' && ['home', 'pdp', 'admin'].includes(pg.n)) || (vp.n !== 'd' && pg.n === 'home');
      if (full) { // carga las imágenes diferidas antes de la captura completa
        await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)) } scrollTo(0, 0) });
        await page.waitForTimeout(500);
      }
      await page.screenshot({ path: path.join(OUT, `${pg.n}-${vp.n}.png`) });
      if (full) await page.screenshot({ path: path.join(OUT, `${pg.n}-${vp.n}-full.png`), fullPage: true });
    }
    await page.close();
  }
  await context.close();
}
await browser.close();
console.log(JSON.stringify({ errores, desbordes }, null, 2));
