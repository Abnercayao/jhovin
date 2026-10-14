// QA adversarial de la demo: node tools/qa.mjs
// Levanta python -m http.server (8093) salvo que BASE apunte a otra URL (ej. la web publicada).
// Env: BASE=https://abnercayao.github.io/jhovin/   SOLO=texto (filtra pruebas por nombre)   AXE=0 (omite axe)   SMOKE=1 (solo carga: portada, imágenes, consola)
import { chromium } from 'file:///C:/Users/abner/dev/vanguard-saas/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

let Axe = null;
if (process.env.AXE !== '0') { try { const m = await import('file:///C:/Users/abner/dev/vanguard-saas/node_modules/@axe-core/playwright/dist/index.mjs'); Axe = m.default ?? m.AxeBuilder } catch { } }

const ROOT = fileURLToPath(new URL('..', import.meta.url)), PORT = 8093, KEY = 'jhovin-demo-v1', SOLO = (process.env.SOLO || '').toLowerCase();
let BASE = process.env.BASE, srv;
if (!BASE) {
  srv = spawn('python', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  BASE = `http://127.0.0.1:${PORT}/`;
  for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE)).ok) break } catch { } await new Promise(r => setTimeout(r, 200)) }
}
if (!BASE.endsWith('/')) BASE += '/';
const browser = await chromium.launch(), results = [];
const wait = ms => new Promise(r => setTimeout(r, ms));

// ---------- datos y reglas de negocio calculadas de forma independiente (no con las funciones de la app)
const boot = await browser.newPage(); await boot.goto(BASE);
const D = await boot.evaluate(() => JSON.parse(JSON.stringify({ P: PRODUCTS, T: TIERS, Z: ZONAS, C: CATS.map(c => [c[0], c[1]]), F: [...FOTOS] })));
await boot.close();
const r2 = x => Math.round(x * 100) / 100, byId = id => D.P.find(p => p.id === id);
const fac = (t, q) => { let f = 1; for (const [m, x] of D.T[t]) if (q >= m) f = x; return f };
// público: oferta fija o escala; bodega: escala, y nunca más caro que la oferta pública
const U = (p, q, t) => t === 'publico' ? (p.oferta ? p.oferta : r2(p.price * fac('publico', q))) : r2(Math.min(p.price * fac('bodega', q), p.oferta || Infinity));
const fmt = n => ('S/ ' + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })).replace(/\u00a0/g, ' ');
const nz = s => String(s).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
const num = t => parseFloat(String(t).replace(/[^0-9.]/g, ''));
const exp = (cart, tipo = 'publico', modo = 'delivery', zid = 'nc', zonas = D.Z) => {
  const cents = Object.entries(cart).reduce((a, [id, q]) => a + Math.round(U(byId(id), q, tipo) * 100) * q, 0), z = zonas.find(x => x.id === zid);
  let env = 0; if (modo === 'delivery') { env = z.costo; if (z.gratis && cents >= z.gratis * 100) env = 0 }
  return { sub: cents / 100, env, tot: r2(cents / 100 + env) };
};
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const catName = Object.fromEntries(D.C);
const found = q => D.P.filter(p => norm(q).split(/\s+/).filter(Boolean).every(w => norm(p.n + ' ' + p.m + ' ' + catName[p.c]).includes(w)));
const stocked = D.P.filter(p => p.stock >= 60), plains = stocked.filter(p => !p.oferta), plain = plains[0];
const cheap = plains.slice().sort((a, b) => a.price - b.price)[0], big = plains.slice().sort((a, b) => b.price - a.price)[0];
const mid = plains.find(p => p.id !== cheap.id && p.id !== big.id && p.price > 8 && p.price < 30);
const oos = D.P.find(p => !p.stock), lowStock = D.P.filter(p => p.stock > 0).sort((a, b) => a.stock - b.stock)[0];
const sale = D.P.find(p => p.oferta && p.stock >= 20), longest = D.P.slice().sort((a, b) => b.n.length - a.n.length)[0];
// cantidad mínima de p para que su subtotal alcance `target`
const qFor = (p, tipo, target) => { for (let q = 1; q <= 400; q++) if (U(p, q, tipo) * q >= target) return q };
// combinación de productos cuyo subtotal sea exactamente `cents` (frontera de envío gratis / mínimo bodega)
const sums = {};
function exact(cents, tipo) {
  if (!sums[tipo]) {
    const m = sums[tipo] = new Map(), L = D.P.filter(p => p.stock), c = (p, q) => Math.round(U(p, q, tipo) * 100) * q;
    for (const p of L) for (let q = 1; q <= Math.min(p.stock, 80); q++) { const k = c(p, q); if (!m.has(k)) m.set(k, { [p.id]: q }) }
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) for (const qa of [1, 2, 3]) for (const qb of [1, 2, 3, 4, 5, 6]) { const k = c(L[i], qa) + c(L[j], qb); if (!m.has(k)) m.set(k, { [L[i].id]: qa, [L[j].id]: qb }) }
  }
  const hit = sums[tipo].get(cents); if (hit) return hit;
  // ampliado: dos productos con hasta 20 + 60 unidades (tabla de centavos precalculada)
  const L = D.P.filter(p => p.stock), tab = L.map(p => Array.from({ length: Math.min(p.stock, 60) + 1 }, (_, q) => q ? Math.round(U(p, q, tipo) * 100) * q : 0));
  for (let i = 0; i < L.length; i++) for (let j = 0; j < L.length; j++) { if (i === j) continue; for (let qa = 1; qa <= Math.min(20, tab[i].length - 1); qa++) { const rest = cents - tab[i][qa]; if (rest <= 0) break; const qb = tab[j].indexOf(rest); if (qb > 0) return { [L[i].id]: qa, [L[j].id]: qb } } }
}

// ---------- arnés
const mk = async ({ vp = { width: 1280, height: 800 }, mobile = false, seed = true, state = {} } = {}) => {
  const ctx = await browser.newContext({ viewport: vp, locale: 'es-PE', timezoneId: 'America/Lima', ...(mobile ? { isMobile: true, hasTouch: true } : {}) });
  if (seed) await ctx.addInitScript(([k, s]) => { try { if (!localStorage.getItem(k)) localStorage.setItem(k, s) } catch { } }, [KEY, JSON.stringify({ ent: { modo: 'delivery', zona: 'nc' }, ...state })]);
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => m.type() === 'error' && errs.push('console: ' + m.text().slice(0, 160)));
  p.on('requestfailed', r => !/ABORTED/.test(r.failure()?.errorText || '') && errs.push('requestfailed: ' + r.url()));
  return { ctx, p, errs };
};
async function T(name, fn, opt) {
  if (SOLO && !name.toLowerCase().includes(SOLO)) return;
  const t0 = Date.now(), { ctx, p, errs } = await mk(opt); let r;
  try { await fn(p, { ctx, errs }); if (errs.length) throw new Error('errores de consola/red: ' + errs.join(' ; ')); r = { name, ok: true } }
  catch (e) { if (process.env.DEBUG) console.log(e.stack); r = { name, ok: false, msg: String(e.message).split('\n').filter(l => !/^\s*(at |\+|-|$)/.test(l)).join(' | ').slice(0, 1500) } }
  r.ms = Date.now() - t0; results.push(r); console.log((r.ok ? 'PASS ' : 'FAIL ') + name + ` (${(r.ms / 1000).toFixed(1)}s)` + (r.ok ? '' : '\n       -> ' + r.msg)); await ctx.close();
}
const open = async (p, hash = '#/') => { await p.goto(BASE + hash); await p.waitForSelector('#app > *'); await p.waitForTimeout(100) };
const url = async (p, re, o) => { await p.waitForURL(re, o); await p.waitForTimeout(150) };
const nav = async (p, h) => { await p.evaluate(h => { location.hash = h }, h); await p.waitForTimeout(160) };
const ev = (p, f, a) => p.evaluate(f, a);
const row = (p, root, label) => p.evaluate(([root, label]) => { const r = [...document.querySelectorAll(root + ' .row')].find(e => e.firstElementChild.textContent.trim().startsWith(label)); return r ? r.lastElementChild.textContent.replace(/\s+/g, ' ').trim() : null }, [root, label]);
const money0 = t => /gratis/i.test(t) ? 0 : num(t);
const brokenImgs = p => p.evaluate(async () => {
  const all = [...document.images]; all.forEach(i => { i.loading = 'eager' });
  await Promise.all(all.map(i => i.complete ? 0 : new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); setTimeout(r, 5000) })));
  return all.filter(i => !(i.complete && i.naturalWidth > 0)).map(i => i.currentSrc || i.src);
});
const overflow = p => p.evaluate(() => {
  const d = document.documentElement, over = d.scrollWidth - innerWidth;
  const who = over > 0 ? [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest('.rail,.brands,nav.cats,.tblw,.catlinks,.mega,.drawer,.modal,.toast')).slice(0, 4).map(e => `${e.tagName}.${e.className}`) : [];
  return { over, bodyOver: document.body.scrollWidth - innerWidth, who };
});
async function axe(p) {
  if (!Axe) return [];
  const r = await new Axe({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return r.violations.filter(v => ['serious', 'critical'].includes(v.impact)).map(v => `axe ${v.impact} ${v.id} x${v.nodes.length} (${v.nodes[0].target.join(' ')})`);
}
// compra rápida por la interfaz real: agrega con add(), abre el carrito, "Ir a pagar"
async function toCheckout(p, cart) {
  await ev(p, c => { for (const [id, q] of Object.entries(c)) add(id, q) }, cart);
  await p.click('.cartb'); await p.waitForSelector('#drawer.on'); await p.waitForTimeout(250);
  await p.click('#cartft .btn.lg'); await url(p, /#\/checkout/); await p.waitForSelector('.stepper');
}
async function guestPay(p, m) {
  await p.fill('#cn', 'Cliente QA'); await p.fill('#ct', '987654321');
  await p.click(`.pay label:has(input[value=${m}])`); await p.click('.sum .btn.lg');
  if (['yape', 'plin', 'mp', 'tr'].includes(m)) { await p.waitForSelector('#modal.on #mbody .btn'); await p.waitForTimeout(100); await p.click('#mbody .btn.lg') }
  await url(p, /#\/ticket\/JH-/, { timeout: 6000 }); await p.waitForSelector('.ticket');
}
const login = async (p, who) => { await p.click('button[aria-label="Mi cuenta"]'); await p.waitForSelector('#modal.on .quick'); await p.click(`.quick button:has-text("${who}")`); await p.waitForTimeout(200) };
const setRange = (p, v) => ev(p, v => { const r = document.querySelector('.filters input[type=range]'); r.value = v; r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })) }, v);
const cardsPrices = p => p.evaluate(() => [...document.querySelectorAll('.grid .card .pr')].map(e => parseFloat(e.textContent.replace(/[^0-9.]/g, ''))));

// =====================================================================================
if (process.env.SMOKE) {
  await T('SMOKE portada + imágenes + consola', async p => {
    await open(p); await p.waitForSelector('.hero');
    const rot = await brokenImgs(p); assert.deepEqual(rot, [], 'imágenes rotas');
    assert.ok((await p.locator('.card').count()) > 10);
  });
} else {

await T('01 portada: carga, carrusel (flechas, puntos, autoavance), rieles, categorías, modal inicial', async p => {
  await p.goto(BASE); await p.waitForSelector('.hero');
  assert.match(await p.title(), /Jhovin/);
  assert.equal(await p.locator('.slide').count(), 4); assert.equal(await p.locator('.slide.on').count(), 1);
  assert.equal(await p.locator('.catcircles a').count(), D.C.length);
  assert.equal(await p.locator('.perk').count(), 4);
  assert.ok(await p.locator('#r-of .card').count() >= 8 && await p.locator('#r-top .card').count() >= 8, 'rieles con productos');
  assert.match(await p.textContent('#topmsg'), /gratis.*S\/300/);
  await p.waitForSelector('#modal.on', { timeout: 3000 });
  assert.match(await p.textContent('#mbody'), /¿Cómo quieres recibir/);
  await p.keyboard.press('Escape'); assert.equal(await p.locator('#modal.on').count(), 0, 'Escape cierra el modal');
  const cur = () => ev(p, () => [...document.querySelectorAll('.slide')].findIndex(s => s.classList.contains('on')));
  assert.equal(await cur(), 0);
  await p.click('.hnav.r'); assert.equal(await cur(), 1);
  await p.click('.hnav.l'); await p.click('.hnav.l'); assert.equal(await cur(), 3, 'la flecha izquierda da la vuelta');
  await p.click('.dots button:nth-child(2)'); assert.equal(await cur(), 1);
  assert.equal(await ev(p, () => document.querySelectorAll('.slide[aria-hidden=false]').length), 1);
  await p.mouse.move(640, 5); await wait(6600); assert.equal(await cur(), 2, 'autoavance a los 6 s');
  await p.click('button[onclick="railGo(\'r-of\',1)"]'); await wait(700);
  assert.ok(await ev(p, () => document.getElementById('r-of').scrollLeft) > 50, 'flecha del riel desplaza');
  await p.click('.catcircles a:first-child'); await url(p, /#\/c\/abarrotes/); assert.match(await p.textContent('h1'), /Arroz y azúcar/);
  await p.reload(); await wait(1200); assert.equal(await p.locator('#modal.on').count(), 0, 'el modal inicial no reaparece tras cerrarlo');
}, { seed: false });

await T('02 buscador: sugerencias, resultados, tildes, vacío, Enter, Escape, XSS, rutas raras', async p => {
  await open(p);
  const n = found('arroz').length;
  await p.fill('#q', 'arroz'); await p.waitForSelector('#sug a');
  assert.equal(await p.locator('#sug a:not(.s-all)').count(), Math.min(6, n));
  assert.match(await p.textContent('#sug .s-all'), new RegExp(`Ver los ${n} resultados`));
  assert.deepEqual(await brokenImgs(p), [], 'miniaturas de sugerencias');
  await p.click('#sug .s-all'); await url(p, /#\/buscar\/arroz/);
  assert.equal(+(await p.textContent('.lhead .cnt')).match(/\d+/)[0], n); assert.equal(await p.locator('.grid .card').count(), n);
  assert.equal(await p.inputValue('#q'), 'arroz');
  await p.fill('#q', 'arr'); await p.waitForSelector('#sug a'); await p.click('#sug a:not(.s-all) >> nth=0');
  assert.match(p.url(), /#\/p\/P\d+/); assert.equal(await ev(p, () => getComputedStyle(document.getElementById('sug')).display), 'none');
  assert.ok(found('azucar').length > 0 && found('azucar').length === found('azúcar').length, 'tildes');
  await p.fill('#q', 'AZUCAR  '); await p.press('#q', 'Enter'); await url(p, /#\/buscar\/AZUCAR/);
  assert.equal(await p.locator('.grid .card').count(), found('azucar').length, 'mayúsculas/sin tilde');
  await p.fill('#q', 'zzzxq'); await p.waitForSelector('#sug'); assert.match(await p.textContent('#sug'), /Sin coincidencias/);
  await p.press('#q', 'Enter'); await url(p, /zzzxq/); assert.match(await p.textContent('.empty-st'), /No encontramos productos/);
  await p.fill('#q', 'a'); assert.equal(await ev(p, () => getComputedStyle(document.getElementById('sug')).display), 'none', '1 letra no sugiere');
  await p.fill('#q', 'ar'); await p.waitForSelector('#sug a'); await p.keyboard.press('Escape');
  assert.equal(await ev(p, () => getComputedStyle(document.getElementById('sug')).display), 'none', 'Escape cierra sugerencias');
  await p.fill('#q', 'ar'); await p.waitForSelector('#sug a'); await p.mouse.click(3, 300);
  assert.equal(await ev(p, () => getComputedStyle(document.getElementById('sug')).display), 'none', 'clic fuera cierra');
  await p.fill('#q', '<img src=x onerror="window.__x=1">'); await p.press('#q', 'Enter'); await wait(300);
  assert.equal(await ev(p, () => window.__x), undefined, 'XSS en el buscador'); assert.equal(await p.locator('#app img[src="x"]').count(), 0);
  await p.fill('#q', 'pack 6/12'); await p.press('#q', 'Enter'); await wait(300);
  assert.match(await p.textContent('h1'), /pack 6\/12/, 'consulta con barra');
  await nav(p, '#/buscar/100%'); assert.ok((await p.textContent('#app')).length > 20, '#/buscar/100% (porcentaje suelto) no rompe la página');
  await nav(p, '#/buscar/'); assert.match(await p.textContent('h1'), /Todos los productos/);
});

await T('03 categoría: megamenú, filtros de marca, precio, orden, ofertas, limpiar, vacío', async p => {
  await open(p);
  await p.click('#allcat'); await p.waitForSelector('#mega.on'); await p.click('#megain a[href="#/c/abarrotes"]'); await url(p, /#\/c\/abarrotes/); await p.mouse.move(640, 600);
  assert.equal(await p.locator('#mega.on').count(), 0, 'el megamenú se cierra al elegir');
  const list = D.P.filter(x => x.c === 'abarrotes'), brands = [...new Set(list.map(x => x.m))].sort((a, b) => a.localeCompare(b));
  assert.equal(await p.locator('.grid .card').count(), list.length); assert.equal(await p.locator('#catnav a.on').count(), 1);
  const chk = p.locator('.fgroup:has(h3:text("Marca")) .chk');
  assert.equal(await chk.count(), brands.length);
  await chk.nth(0).click(); await p.waitForTimeout(100);
  assert.equal(await p.locator('.grid .card').count(), list.filter(x => x.m === brands[0]).length);
  assert.deepEqual([...new Set(await p.locator('.grid .card .br').allTextContents())], [brands[0]]);
  assert.match(await p.textContent('.filters summary'), /activos/);
  await p.locator('.fgroup:has(h3:text("Marca")) .chk').nth(1).click(); await p.waitForTimeout(100);
  assert.equal(await p.locator('.grid .card').count(), list.filter(x => [brands[0], brands[1]].includes(x.m)).length, 'dos marcas = unión');
  await p.click('button:has-text("Limpiar filtros")'); await p.waitForTimeout(100);
  assert.equal(await p.locator('.grid .card').count(), list.length); assert.doesNotMatch(await p.textContent('.filters summary'), /activos/);
  const sorted = list.map(x => U(x, 1, 'publico')).sort((a, b) => a - b), medPrice = Math.ceil(sorted[Math.floor(sorted.length / 2)] / 5) * 5;
  await setRange(p, medPrice); await p.waitForTimeout(150);
  const pr = await cardsPrices(p); assert.ok(pr.length > 0 && pr.every(v => v <= medPrice), 'todos ≤ precio máximo');
  assert.equal(pr.length, list.filter(x => U(x, 1, 'publico') <= medPrice).length);
  await p.selectOption('.sort select', 'asc'); const asc = await cardsPrices(p); assert.deepEqual(asc, asc.slice().sort((a, b) => a - b), 'orden ascendente');
  await p.selectOption('.sort select', 'desc'); const desc = await cardsPrices(p); assert.deepEqual(desc, desc.slice().sort((a, b) => b - a), 'orden descendente');
  assert.equal(await p.inputValue('.sort select'), 'desc', 'el orden se conserva al refrescar');
  await p.selectOption('.sort select', 'az'); const nm = await p.locator('.grid .card .nm').allTextContents();
  assert.deepEqual(nm, await ev(p, a => a.slice().sort((x, y) => x.localeCompare(y)), nm), 'orden A–Z');
  await p.click('button:has-text("Limpiar filtros")');
  await p.locator('.fgroup:has(h3:text("Promociones")) .chk').click(); await p.waitForTimeout(100);
  const sl = list.filter(x => x.oferta);
  assert.equal(await p.locator('.grid .card').count(), sl.length); assert.equal(await p.locator('.grid .card .bdg.sale').count(), sl.length, 'solo ofertas con insignia');
  await setRange(p, 5); await p.waitForTimeout(150);
  const e = sl.filter(x => U(x, 1, 'publico') <= 5).length; assert.equal(await p.locator('.grid .card').count(), e);
  if (!e) assert.match(await p.textContent('.empty-st'), /No encontramos productos/);
  await nav(p, '#/c/aceites'); assert.equal(await p.locator('.grid .card').count(), D.P.filter(x => x.c === 'aceites').length, 'los filtros se reinician al cambiar de categoría');
  await nav(p, '#/ofertas'); const of = D.P.filter(x => x.oferta);
  assert.equal(await p.locator('.grid .card').count(), of.length); assert.equal(await p.locator('.grid .card .bdg.sale').count(), of.length);
  const miss = await ev(p, () => PRODUCTS.filter(x => x.oferta && !document.querySelector(`.card[data-id="${x.id}"]`)).length); assert.equal(miss, 0);
});

await T('03b filtros en celular: el panel sigue abierto al marcar una marca', async p => {
  await open(p, '#/c/abarrotes');
  assert.equal(await ev(p, () => document.querySelector('details.filters').open), false, 'cerrado por defecto en móvil');
  await p.click('.filters summary'); assert.equal(await ev(p, () => document.querySelector('details.filters').open), true);
  await p.locator('.fgroup:has(h3:text("Marca")) .chk').first().click(); await p.waitForTimeout(150);
  assert.equal(await ev(p, () => document.querySelector('details.filters').open), true, 'tras marcar una marca el panel de filtros debe seguir abierto');
}, { vp: { width: 430, height: 932 }, mobile: true });

await T('03c filtros de marca: las 18 categorías, cada marca por separado', async p => {
  await open(p);
  const bad = await ev(p, async () => {
    const out = [], tick = () => new Promise(r => setTimeout(r, 8));
    for (const c of CATS.map(c => c[0])) {
      location.hash = '#/c/' + c; await tick(); await tick();
      const total = PRODUCTS.filter(p => p.c === c);
      const boxes = () => [...document.querySelectorAll('.fgroup:first-of-type .chk input')];
      for (let i = 0; i < boxes().length; i++) {
        const lab = boxes()[i].parentElement.childNodes[1].textContent.trim();
        boxes()[i].click(); await tick();
        const want = total.filter(p => p.m === lab).length, got = document.querySelectorAll('.grid .card').length;
        if (want !== got) out.push(`${c}/${lab}: esperado ${want}, hay ${got}`);
        boxes()[i].click(); await tick();
      }
    }
    return out;
  });
  assert.deepEqual(bad, []);
});

await T('04 ficha: precios por volumen, cantidad, agregar, caja, tope de stock, agotado, oferta, galería', async p => {
  await open(p, '#/p/' + plain.id);
  assert.equal(nz(await p.textContent('h1')), plain.n); assert.equal(nz(await p.textContent('.pbig .pr')), fmt(plain.price));
  assert.equal(await p.locator('.panel table tbody tr').count(), D.T.publico.length);
  await p.click('button[aria-label="Menos"]'); assert.equal(await p.textContent('#pq'), '1', 'no baja de 1');
  for (let i = 0; i < 5; i++) await p.click('button[aria-label="Más"]'); assert.equal(await p.textContent('#pq'), '6');
  await p.click('button:has-text("Agregar al carrito")'); await p.waitForTimeout(150);
  assert.equal(await ev(p, id => S.cart[id], plain.id), 6); assert.equal(await p.textContent('#cnt'), '6');
  assert.equal(nz(await p.textContent('.pbig .pr')), fmt(U(plain, 6, 'publico')), 'precio del escalón 6+');
  assert.equal(nz(await p.textContent('#ctot')), fmt(6 * U(plain, 6, 'publico')));
  assert.equal(await p.locator('.panel tbody tr.on').count(), 1);
  for (let i = 0; i < 6; i++) await p.click('.buy button[aria-label="Agregar uno"]'); await p.waitForTimeout(100);
  assert.equal(nz(await p.textContent('.pbig .pr')), fmt(U(plain, 12, 'publico')), 'precio del escalón 12+');
  await p.click('button:has-text("Agregar caja completa")'); await p.waitForTimeout(150);
  assert.equal(await ev(p, id => S.cart[id], plain.id), Math.min(plain.stock, 12 + plain.caja), 'agregar caja suma las unidades de la caja');
  assert.equal(await p.locator('button:has-text("Ver carrito")').count(), 1);
  await p.click('button:has-text("Ver carrito")'); await p.waitForSelector('#drawer.on'); await p.keyboard.press('Escape');
  await ev(p, id => add(id, -S.cart[id]), plain.id);
  // tope de stock
  await nav(p, '#/p/' + lowStock.id);
  for (let i = 0; i < lowStock.stock + 3; i++) await p.click('button[aria-label="Más"]');
  assert.equal(await p.textContent('#pq'), String(lowStock.stock), 'el selector no pasa del stock');
  await p.click('button:has-text("Agregar al carrito")'); await p.waitForTimeout(100);
  await p.click('.buy button[aria-label="Agregar uno"]'); await p.waitForTimeout(150);
  assert.equal(await ev(p, id => S.cart[id], lowStock.id), lowStock.stock); assert.match(await p.textContent('#toast'), /Stock máximo/);
  await p.click('button:has-text("Agregar caja completa")'); assert.equal(await ev(p, id => S.cart[id], lowStock.id), lowStock.stock, 'la caja tampoco pasa del stock');
  await ev(p, id => add(id, -S.cart[id]), lowStock.id);
  // agotado
  await nav(p, '#/p/' + oos.id);
  assert.match(await p.textContent('.meta'), /Agotado/); assert.equal(await p.locator('button:has-text("Agregar al carrito")').count(), 0);
  await p.click('button:has-text("Avísame cuando llegue")'); assert.deepEqual(await ev(p, () => S.cart), {});
  await nav(p, '#/c/' + oos.c); assert.match(await p.textContent(`.card[data-id="${oos.id}"] .add`), /Avísame/); assert.match(await p.textContent(`.card[data-id="${oos.id}"] .bdgs`), /Agotado/);
  // oferta
  await nav(p, '#/p/' + sale.id);
  assert.equal(nz(await p.textContent('.pbig .pr')), fmt(sale.oferta)); assert.equal(nz(await p.textContent('.pbig s')), fmt(sale.price)); assert.match(await p.textContent('.panel'), /precio único/);
  // galería
  await p.click('.thumbs button:nth-child(3)'); assert.equal(await p.locator('.boxv .crate img').count(), 6);
  await p.click('.thumbs button:nth-child(2)'); assert.equal(await p.locator('.stage.z').count(), 1); await p.click('.stage'); assert.equal(await p.locator('.stage.z').count(), 0);
  await nav(p, '#/p/NOEXISTE'); assert.equal(await p.locator('.hero').count(), 1, 'producto inexistente cae a la portada');
});

await T('05 carrito: tarjeta +/−/papelera, cabecera, carrusel intacto, cajón, totales, barra de envío, vaciar, persistencia', async p => {
  await open(p, '#/c/' + cheap.c);
  const card = id => `.card[data-id="${id}"]`;
  await p.click(`${card(cheap.id)} .add .btn`); await p.waitForTimeout(120);
  assert.match(await p.textContent('#toast'), /Agregado al carrito/); assert.equal(await p.textContent('#cnt'), '1'); assert.equal(nz(await p.textContent('#ctot')), fmt(U(cheap, 1, 'publico')));
  await p.click(`${card(cheap.id)} .qty button[aria-label="Agregar uno"]`); assert.equal(await p.textContent(`${card(cheap.id)} .qty span`), '2');
  await p.click(`${card(cheap.id)} .qty button[aria-label="Quitar uno"]`); await p.click(`${card(cheap.id)} .qty button[aria-label="Quitar uno"]`);
  assert.equal(await p.locator(`${card(cheap.id)} .qty`).count(), 0, 'vuelve el botón Agregar'); assert.equal(await ev(p, () => document.getElementById('cnt').hidden), true);
  await p.click(`${card(cheap.id)} .add .btn`); await p.click(`${card(cheap.id)} .qty button[aria-label="Agregar uno"]`);
  await nav(p, '#/p/' + mid.id); await p.click('button:has-text("Agregar al carrito")');
  await p.click('.cartb'); await p.waitForSelector('#drawer.on'); await p.waitForTimeout(250);
  assert.equal(await ev(p, () => !!document.activeElement.closest('#drawer')), true, 'el foco entra al cajón');
  assert.equal(await p.locator('#cartbd .li').count(), 2); assert.deepEqual(await ev(p, () => S.cart), { [cheap.id]: 2, [mid.id]: 1 });
  let E = exp({ [cheap.id]: 2, [mid.id]: 1 });
  const chk = async E => { assert.equal(await row(p, '#cartft', 'Subtotal'), fmt(E.sub)); assert.equal(money0(await row(p, '#cartft', 'Envío')), E.env); assert.equal(await row(p, '#cartft', 'Total'), fmt(E.tot)) };
  await chk(E);
  assert.match(await p.textContent('#cartbd .note'), new RegExp('Agrega ' + fmt(300 - E.sub).replace('.', '\\.') + ' más para envío gratis'));
  await p.click(`#cartbd .li:has-text("${mid.n}") button[aria-label="Agregar uno"]`); await p.waitForTimeout(100);
  await chk(exp({ [cheap.id]: 2, [mid.id]: 2 }));
  await p.click(`#cartbd .li:has-text("${mid.n}") .rm`); await p.waitForTimeout(100);
  assert.equal(await p.locator('#cartbd .li').count(), 1); await chk(exp({ [cheap.id]: 2 }));
  await p.keyboard.press('Escape'); await p.waitForTimeout(150); assert.equal(await p.locator('#drawer.on').count(), 0, 'Escape cierra el cajón');
  assert.equal(await ev(p, () => document.activeElement.classList.contains('cartb')), true, 'el foco vuelve al botón del carrito');
  await p.click('.cartb'); await p.waitForSelector('#drawer.on'); await p.mouse.click(10, 400); await p.waitForTimeout(150); assert.equal(await p.locator('#drawer.on').count(), 0, 'clic en el fondo cierra');
  // envío gratis desde S/300
  await ev(p, id => add(id, 2), big.id); await p.click('.cartb'); await p.waitForSelector('#drawer.on'); await p.waitForTimeout(200);
  const E2 = exp({ [cheap.id]: 2, [big.id]: 2 }); assert.ok(E2.sub >= 300, 'dato de prueba: ≥ S/300'); await chk(E2);
  assert.match(await p.textContent('#cartbd'), /¡Tienes envío gratis!/); assert.equal(await row(p, '#cartft', 'Envío'), 'Gratis');
  // vaciar con la papelera
  for (const id of [cheap.id, big.id]) await p.click(`#cartbd .li:has-text("${byId(id).n}") .rm`);
  await p.waitForTimeout(100); assert.match(await p.textContent('#cartbd'), /Tu carrito está vacío/); assert.equal(await p.locator('#cartft .btn').count(), 0);
  await p.click('.cart-empty .btn'); await url(p, /#\/ofertas/);
  // persistencia
  await ev(p, id => add(id, 3), cheap.id); await p.reload(); await p.waitForSelector('#app > *');
  assert.equal(await p.textContent('#cnt'), '3'); assert.deepEqual(await ev(p, () => S.cart), { [cheap.id]: 3 });
});

await T('05b el carrusel y los rieles no se reinician al agregar desde la portada', async p => {
  await open(p);
  await p.click('.hnav.r'); await p.click('button[onclick="railGo(\'r-of\',1)"]'); await wait(700);
  const before = await ev(p, () => document.getElementById('r-of').scrollLeft);
  await ev(p, () => document.querySelector('#r-of .card .add .btn').click()); await p.waitForTimeout(150);
  assert.equal(await ev(p, () => document.getElementById('r-of').scrollLeft), before, 'el riel conserva su posición');
  assert.equal(await ev(p, () => [...document.querySelectorAll('.slide')].findIndex(s => s.classList.contains('on'))), 1);
});

for (const m of ['mp', 'yape', 'plin', 'ce', 'tr']) await T(`06 checkout invitado → ticket (${m})`, async p => {
  await open(p, '#/c/' + plain.c);
  const cart = { [plain.id]: 2, [cheap.id]: 1 }, E = exp(cart);
  await toCheckout(p, cart);
  assert.equal(await p.locator('.stepper li').count() > 0, true);
  assert.match(await p.textContent('.sum'), new RegExp(E.tot.toFixed(2).replace('.', '\\.')));
  // obligatorios: nombre y celular
  await p.click('.sum .btn.lg'); assert.match(p.url(), /#\/checkout$/); assert.match(await p.textContent('#toast'), /Completa nombre y celular/);
  await p.fill('#cn', '   '); await p.fill('#ct', '987654321'); await p.click('.sum .btn.lg'); assert.match(p.url(), /#\/checkout$/, 'nombre en blanco');
  await p.fill('#cn', 'Cliente QA'); await p.fill('#ct', 'abc'); await p.click('.sum .btn.lg'); assert.match(p.url(), /#\/checkout$/, 'celular inválido ("abc") no debe pasar');
  await p.fill('#ct', ''); await p.click('.sum .btn.lg'); assert.equal(await ev(p, () => document.activeElement.id), 'ct', 'el foco va al campo que falta');
  assert.equal(await p.locator('.pay label').count(), 5, 'invitado ve 5 métodos de pago');
  await guestPay(p, m);
  const T_ = nz(await p.textContent('.ticket'));
  assert.match(T_, /Documento interno, no es comprobante tributario/); assert.match(T_, new RegExp('N° JH-10421'));
  assert.match(T_, new RegExp('Pago: ' + { mp: 'TARJETA', yape: 'YAPE', plin: 'PLIN', ce: 'CONTRA ENTREGA', tr: 'TRANSFERENCIA' }[m]));
  assert.equal(nz(await p.locator('.ticket .row:has-text("TOTAL S/") b:last-child').textContent()), E.tot.toFixed(2), 'total del ticket');
  assert.match(T_, new RegExp(`2 x ${U(plain, 2, 'publico').toFixed(2)}`));
  assert.equal(nz(await p.textContent('.tl li.cur')), m === 'ce' || m === 'tr' ? 'Por confirmar pago' : 'Pagado', 'estado inicial según el método');
  assert.equal(await ev(p, () => document.getElementById('cnt').hidden), true); assert.deepEqual(await ev(p, () => S.cart), {});
  assert.equal(await ev(p, id => PRODUCTS.find(x => x.id === id).stock, plain.id), plain.stock - 2, 'descuenta stock');
  const o = await ev(p, () => S.orders); assert.equal(o.length, 1); assert.equal(o[0].tot, E.tot);
  await p.click('.tk-act a:has-text("Mis pedidos")'); await url(p, /#\/pedidos/);
  assert.match(await p.textContent('.ocard'), new RegExp('JH-10421[\\s\\S]*' + E.tot.toFixed(2).replace('.', '\\.')));
  await nav(p, '#/ticket/JH-10421'); await p.reload(); await p.waitForSelector('.ticket'); assert.match(await p.textContent('.ticket'), /JH-10421/, 'el ticket sobrevive al recargar');
});

await T('06b pagar: doble envío, método Yape cancelado, carrito vacío en checkout', async p => {
  await open(p, '#/c/' + plain.c); await toCheckout(p, { [cheap.id]: 1 });
  await p.fill('#cn', 'Cliente QA'); await p.fill('#ct', '987654321');
  await p.click('.pay label:has(input[value=ce])');
  await ev(p, () => { pagar(); pagar() }); await p.waitForTimeout(300);
  assert.equal(await ev(p, () => S.orders.length), 1, 'dos pagar() seguidos crean un solo pedido');
  assert.ok((await ev(p, () => S.orders[0].tot)) > 0 && (await ev(p, () => S.orders[0].items.length)) > 0, 'sin pedidos vacíos');
  await nav(p, '#/checkout'); await p.waitForTimeout(200); assert.match(p.url(), /#\/$/, 'checkout sin carrito vuelve a la portada');
});

await T('07 envío: S/3 bajo S/300, gratis desde S/300 (frontera exacta), zonas, recojo, persistencia', async p => {
  await open(p, '#/c/' + plain.c);
  const e300 = exact(30000, 'publico'); assert.ok(e300, 'dato: combinación de exactamente S/300.00');
  const cart = e300, below = (() => { for (let c = 29999; c > 29500; c--) { const x = exact(c, 'publico'); if (x) return { c, x } } })();
  // bajo 300 → 3
  await ev(p, c => { for (const [id, q] of Object.entries(c)) add(id, q) }, below.x);
  assert.equal(await ev(p, () => totals().env), 3, `subtotal ${below.c / 100} paga S/3`);
  await ev(p, () => { S.cart = {}; save(); hdr() });
  // exactamente 300 → gratis
  await ev(p, c => { for (const [id, q] of Object.entries(c)) add(id, q) }, cart);
  const T1 = await ev(p, () => totals()); assert.equal(T1.env, 0, `con subtotal exacto S/300.00 (${JSON.stringify(cart)}) el envío es gratis; la app calculó sub=${T1.sub}`);
  await p.click('.cartb'); await p.waitForSelector('#drawer.on'); await p.waitForTimeout(200); assert.equal(await row(p, '#cartft', 'Envío'), 'Gratis'); await p.keyboard.press('Escape');
  await ev(p, () => { S.cart = {}; save(); hdr() });
  // otra zona cobra su tarifa, incluso con más de S/300
  await ev(p, c => { for (const [id, q] of Object.entries(c)) add(id, q) }, { [big.id]: 3 });
  for (const z of D.Z.filter(z => z.id !== 'nc')) {
    await p.click('.dlv'); await p.waitForSelector('#modal.on #zsel'); await p.selectOption('#zsel', z.id); await p.click('#mbody .btn.lg'); await p.waitForTimeout(120);
    assert.equal(await ev(p, () => totals().env), z.costo, `zona ${z.n}`);
    assert.match(await p.textContent('.dtxt'), new RegExp('Delivery a ' + z.n.split(' (')[0]));
  }
  await p.click('.cartb'); await p.waitForSelector('#drawer.on'); await p.waitForTimeout(200); assert.equal(money0(await row(p, '#cartft', 'Envío')), 20, 'Rioja S/20');
  await p.keyboard.press('Escape');
  // recojo gratis
  await p.click('.dlv'); await p.waitForSelector('#modal.on'); await p.click('#mbody .opt button:has-text("Recojo en tienda")'); await p.click('#mbody .btn.lg'); await p.waitForTimeout(150);
  assert.equal(await ev(p, () => totals().env), 0); assert.match(await p.textContent('.dtxt'), /Recojo en tienda/);
  await p.click('.cartb'); await p.waitForSelector('#drawer.on'); await p.waitForTimeout(200); assert.equal(await row(p, '#cartft', 'Envío'), 'Recojo gratis'); await p.keyboard.press('Escape');
  // en checkout: cambiar zona actualiza el resumen
  await ev(p, () => { S.ent = { modo: 'delivery', zona: 'nc' }; save(); hdr() }); await nav(p, '#/checkout');
  await p.selectOption('.co select', 'ucr'); await p.waitForTimeout(150);
  assert.equal(money0(await row(p, '.sum', 'Envío')), 5); assert.equal(await row(p, '.sum', 'Total'), fmt(exp({ [big.id]: 3 }, 'publico', 'delivery', 'ucr').tot));
  await p.click('.opt button:has-text("Recojo en tienda")'); await p.waitForTimeout(150); assert.equal(await row(p, '.sum', 'Envío'), 'Gratis');
  await p.reload(); await p.waitForSelector('.sum'); assert.deepEqual(await ev(p, () => S.ent), { modo: 'recojo', zona: 'ucr' }, 'la entrega elegida persiste');
});

await T('08 bodega: login, precios ≤ público, mínimo S/500 (cajón y checkout), frontera exacta, crédito, ticket', async p => {
  await open(p, '#/c/abarrotes'); await login(p, 'Bodega aprobada');
  assert.match(await p.textContent('.who'), /Precios de bodega/); assert.match(await p.textContent('#topmsg'), /mínimo S\/500/);
  for (const c of ['abarrotes', 'cervezas', 'limpieza']) {
    await nav(p, '#/c/' + c);
    const bad = await ev(p, () => [...document.querySelectorAll('.grid .card')].map(e => [e.dataset.id, parseFloat(e.querySelector('.pr').textContent.replace(/[^0-9.]/g, ''))]));
    for (const [id, v] of bad) { const q = byId(id); assert.equal(v, U(q, 1, 'bodega'), `precio bodega ${id}`); assert.ok(v <= U(q, 1, 'publico'), `bodega ${id} (${v}) no puede costar más que el público (${U(q, 1, 'publico')})`) }
  }
  assert.equal(await p.locator('.card .pnote:has-text("Precio bodega")').count() > 0, true);
  // bajo el mínimo
  await ev(p, id => add(id, 2), cheap.id); const sub = exp({ [cheap.id]: 2 }, 'bodega').sub;
  await p.click('.cartb'); await p.waitForSelector('#drawer.on'); await p.waitForTimeout(200);
  assert.equal(await p.locator('#cartft .btn.lg[disabled]').count(), 1, '"Ir a pagar" deshabilitado bajo S/500');
  assert.match(await p.textContent('#cartbd .note'), new RegExp('te faltan ' + fmt(500 - sub).replace('.', '\\.'))); await p.keyboard.press('Escape');
  await nav(p, '#/checkout'); assert.equal(await p.locator('.sum .btn.lg[disabled]').count(), 1, 'botón Pagar deshabilitado en checkout');
  await ev(p, () => pagar()); assert.equal(await ev(p, () => S.orders.length), 0, 'pagar() forzado no crea pedido bajo el mínimo');
  // frontera exacta S/500.00
  const e500 = exact(50000, 'bodega'); assert.ok(e500, 'dato: combinación de S/500.00 exactos a precio bodega');
  await ev(p, c => { S.cart = c; save(); hdr(); route(true) }, e500);
  assert.equal(await ev(p, () => totals().ok), true, `con S/500.00 exactos (${JSON.stringify(e500)}) se puede pagar; sub=${await ev(p, () => totals().sub)}`);
  // sobre el mínimo: pagar con crédito
  const big2 = { [big.id]: qFor(big, 'bodega', 520) }, E = exp(big2, 'bodega'); await ev(p, c => { S.cart = c; save(); hdr(); route(true) }, big2);
  assert.equal(await p.locator('.sum .btn.lg[disabled]').count(), 0); assert.equal(await p.locator('.pay label').count(), 6, 'la bodega ve además Crédito bodega');
  assert.equal(await row(p, '.sum', 'Total'), fmt(E.tot));
  assert.equal(await p.locator('#cn').count(), 0, 'una cuenta no vuelve a pedir nombre y celular');
  await p.click('.pay label:has(input[value=cr])'); await p.click('.sum .btn.lg'); await url(p, /#\/ticket\//);
  const t = nz(await p.textContent('.ticket')); assert.match(t, /\(BODEGA\)/); assert.match(t, /CRÉDITO BODEGA/); assert.equal(nz(await p.textContent('.tl li.cur')), 'Por confirmar pago');
  // cerrar sesión → precios públicos
  await p.click('button[aria-label="Mi cuenta"]'); await p.click('.quick button:has-text("Cerrar sesión")'); await nav(p, '#/c/abarrotes');
  assert.match(await p.textContent('.who'), /invitado/); assert.equal(await p.locator('.card .pnote:has-text("Precio bodega")').count(), 0);
});

await T('08b precios: la app coincide con las reglas en 136 productos × 9 cantidades × 2 tipos, y bodega nunca supera al público', async p => {
  await open(p);
  const qs = [1, 2, 5, 6, 11, 12, 47, 48, 100];
  const got = await ev(p, qs => PRODUCTS.flatMap(x => qs.flatMap(q => ['publico', 'bodega'].map(t => [x.id, q, t, unit(x, q, t)]))), qs);
  const bad = got.filter(([id, q, t, v]) => v !== U(byId(id), q, t)).map(([id, q, t, v]) => `${id} q${q} ${t}: app ${v} vs regla ${U(byId(id), q, t)}`);
  assert.deepEqual(bad.slice(0, 8), [], `${bad.length} diferencias`);
  const worse = []; for (const x of D.P) for (const q of qs) if (U(x, q, 'bodega') > U(x, q, 'publico')) worse.push(`${x.id} q${q} bodega ${U(x, q, 'bodega')} > público ${U(x, q, 'publico')}`);
  assert.deepEqual(worse.slice(0, 8), [], `bodega más cara que público (${worse.length} casos)`);
});

await T('09 formulario de bodega → panel → aprobar / rechazar', async p => {
  await open(p); await p.click('.topbar a[href="#/bodega"]'); await url(p, /#\/bodega/);
  const sols0 = await ev(p, () => S.sols.length), fill = async o => { for (const [k, v] of Object.entries(o)) await p.fill(`form input[name=${k}]`, v) };
  const base = { neg: 'Bodega QA <b>x</b>', ruc: '20123456789', dni: '12345678', tel: '912345678', dir: 'Jr. QA 123' };
  for (const [bad, val] of [['ruc', '30123456789'], ['ruc', '2012345678'], ['dni', '1234567'], ['tel', '812345678'], ['tel', '91234567']]) {
    await fill(base); await p.fill(`form input[name=${bad}]`, val); await p.check('form input[type=checkbox]'); await p.click('form .btn.lg');
    assert.equal(await ev(p, () => S.sols.length), sols0, `${bad}=${val} debe rechazarse`); assert.equal(await p.locator('.done-h').count(), 0);
  }
  await fill(base); await p.uncheck('form input[type=checkbox]'); await p.click('form .btn.lg'); assert.equal(await ev(p, () => S.sols.length), sols0, 'sin aceptar términos no envía');
  await p.fill('form input[name=neg]', ''); await p.check('form input[type=checkbox]'); await p.click('form .btn.lg'); assert.equal(await ev(p, () => S.sols.length), sols0, 'nombre vacío');
  await fill(base); await p.selectOption('form select[name=zona]', 'ucr'); await p.click('form .btn.lg');
  await p.waitForSelector('.done-h'); assert.match(await p.textContent('.done-h'), /Solicitud enviada/);
  await p.click('.done-h .btn'); await url(p, /#\/admin\/bodegas/); await p.waitForSelector('.adm-nav');
  const rows = p.locator('.adm tbody tr'); assert.equal(await rows.count(), sols0 + 1);
  const first = rows.first(); assert.match(await first.textContent(), /Bodega QA <b>x<\/b>/, 'el nombre se muestra escapado'); assert.match(await first.textContent(), /Pendiente/); assert.match(await first.textContent(), /Ucrania/);
  assert.equal(await p.locator('.adm td b b').count(), 0, 'sin HTML inyectado');
  assert.equal(nz(await p.textContent('.adm-nav a[href="#/admin/bodegas"] .badge')), '3');
  await first.locator('button:has-text("Aprobar")').click(); await p.waitForTimeout(150);
  assert.match(await p.locator('.adm tbody tr').first().textContent(), /Aprobada/); assert.equal(nz(await p.textContent('.adm-nav a[href="#/admin/bodegas"] .badge')), '2');
  await p.locator('.adm tbody tr').nth(1).locator('button:has-text("Rechazar")').click(); await p.waitForTimeout(150);
  assert.match(await p.locator('.adm tbody tr').nth(1).textContent(), /Rechazada/); assert.equal(await ev(p, () => S.sols.filter(s => s.est === 'pendiente').length), 1);
  await p.click('.adm-nav a[href="#/admin/resumen"]'); await p.waitForSelector('.kpis');
  assert.equal(nz(await p.locator('.kpi:has-text("Bodegas activas") b').textContent()), '43', '41 + 1 aprobada de origen + 1 nueva');
});

await T('10 panel: 7 pestañas, tarifa de zona (incluye valores negativos), estado de pedidos, sincronización', async p => {
  await open(p, '#/c/' + plain.c); await toCheckout(p, { [cheap.id]: 1 }); await guestPay(p, 'ce'); // pedido real hecho como invitado
  await login(p, 'Dueño'); await p.click('.who a'); await url(p, /#\/admin/); await p.waitForSelector('.adm-nav');
  const tabs = ['resumen', 'pedidos', 'bodegas', 'productos', 'zonas', 'sync', 'marketing'];
  assert.equal(await p.locator('.adm-nav a').count(), tabs.length);
  for (const t of tabs) {
    await p.click(`.adm-nav a[href="#/admin/${t}"]`); await p.waitForTimeout(150);
    assert.equal(await p.locator(`.adm-nav a.on[href="#/admin/${t}"]`).count(), 1, t); assert.ok(nz(await p.textContent('.adm > div:last-child')).length > 40, `pestaña ${t} con contenido`);
  }
  await p.click('.adm-nav a[href="#/admin/resumen"]'); await p.waitForSelector('.kpi'); assert.equal(await p.locator('.kpi').count(), 8); assert.equal(await p.locator('svg .b').count(), 7); assert.equal(await p.locator('.hbars > div').count(), 5);
  await p.click('.adm-nav a[href="#/admin/productos"]'); await p.waitForTimeout(150); assert.equal(await p.locator('.adm tbody tr').count(), 25);
  await p.click('.adm-nav a[href="#/admin/marketing"]'); await p.waitForTimeout(150); assert.equal(await p.locator('.bnl > div').count(), 4); assert.deepEqual(await brokenImgs(p), []);
  // sincronizar y salir antes de que termine no debe romper
  await p.click('.adm-nav a[href="#/admin/sync"]'); await p.click('button:has-text("Sincronizar ahora")'); await p.click('.adm-nav a[href="#/admin/zonas"]'); await wait(1700);
  await p.click('.adm-nav a[href="#/admin/sync"]'); await p.click('button:has-text("Sincronizar ahora")'); await wait(1700);
  assert.match(await p.textContent('#log'), /Conectando a SiempreSoft[\s\S]*Sync OK · 3\.214 productos · 3 precios/); assert.equal(await p.textContent('#ls'), 'ahora');
  // tarifa de zona
  await p.click('.adm-nav a[href="#/admin/zonas"]'); await p.waitForTimeout(150); assert.equal(await p.locator('.adm tbody tr').count(), D.Z.length);
  const inp = n => `input[aria-label="Costo ${n}"]`;
  await p.fill(inp('Ucrania'), '8'); await p.press(inp('Ucrania'), 'Tab'); assert.equal(await ev(p, () => S.zonas.find(z => z.id === 'ucr').costo), 8);
  await p.fill(inp('Ucrania'), '-5'); await p.press(inp('Ucrania'), 'Tab');
  assert.ok((await ev(p, () => S.zonas.find(z => z.id === 'ucr').costo)) >= 0, 'una tarifa negativa no debe aceptarse');
  await p.fill(inp('Ucrania'), '8'); await p.press(inp('Ucrania'), 'Tab');
  await p.fill('input[aria-label="Gratis desde, Ucrania"]', '100'); await p.press('input[aria-label="Gratis desde, Ucrania"]', 'Tab');
  await ev(p, () => { S.ent = { modo: 'delivery', zona: 'ucr' }; save(); hdr() });
  await ev(p, id => add(id, 1), cheap.id);
  assert.equal(await ev(p, () => totals().env), 8, 'tarifa editada aplica al envío');
  await ev(p, id => add(id, 20), big.id); assert.equal(await ev(p, () => totals().env), 0, '"gratis desde" editado aplica');
  await ev(p, () => { S.cart = {}; save(); hdr() });
  // el pedido real aparece en el panel y se puede cambiar su estado
  await nav(p, '#/admin/pedidos'); assert.match(await p.textContent('.adm tbody tr'), /JH-10421[\s\S]*Cliente QA/);
  await p.selectOption('.adm tbody tr:first-child select', '5'); assert.equal(await ev(p, () => S.orders[0].est), 5);
  await nav(p, '#/pedidos'); assert.match(await p.textContent('.ocard .st'), /Entregado/);
  await nav(p, '#/admin/resumen'); assert.equal(nz(await p.locator('.kpi:has-text("Pedidos hoy") b').textContent()), '24');
  await nav(p, '#/admin/inventada'); assert.ok(nz(await p.textContent('.adm > div:last-child')).length > 10, 'pestaña de panel inexistente muestra el resumen');
});

await T('11 temas: 3 estilos (botones), persisten, sin desborde; y en celular el botón rota', async p => {
  await open(p);
  const bg = async () => ev(p, () => [document.documentElement.dataset.theme, getComputedStyle(document.body).backgroundColor, getComputedStyle(document.querySelector('.hdr')).backgroundColor, getComputedStyle(document.documentElement).getPropertyValue('--brand')]);
  const seen = {};
  for (const t of ['jhovin', 'mayorista', 'noche']) {
    await p.click(`.themes button[data-t=${t}]`); await p.waitForTimeout(150);
    const [th, b, h, br] = await bg(); assert.equal(th, t); seen[t] = [b, h, br].join('|');
    assert.equal(await p.locator(`.themes button[data-t=${t}][aria-pressed=true]`).count(), 1);
    for (const hsh of ['#/', '#/c/gaseosas', '#/p/' + plain.id, '#/envios', '#/bodega', '#/admin/resumen']) { await nav(p, hsh); const o = await overflow(p); assert.ok(o.over <= 0, `${t} ${hsh} desborda ${o.over}px ${o.who}`) }
    await p.reload(); await p.waitForSelector('#app > *'); assert.equal((await bg())[0], t, 'el tema persiste');
  }
  assert.notEqual(seen.jhovin, seen.noche, 'el tema oscuro cambia los colores'); assert.equal(new Set(Object.values(seen)).size, 3, 'los 3 temas son distintos');
});

await T('11b temas en celular: botón único que rota', async p => {
  await open(p); assert.equal(await p.locator('.tcy').isVisible(), true); assert.equal(await p.locator('.themes button[data-t=noche]').isVisible(), false);
  const seq = []; for (let i = 0; i < 4; i++) { await p.click('.tcy'); await p.waitForTimeout(120); seq.push(await ev(p, () => document.documentElement.dataset.theme)) }
  assert.deepEqual(seq, ['mayorista', 'noche', 'jhovin', 'mayorista']);
}, { vp: { width: 375, height: 812 }, mobile: true });

await T('12 mis pedidos: seguimiento, volver a pedir (bodega), tope de stock, escapado', async p => {
  await open(p, '#/pedidos'); assert.match(await p.textContent('.empty-st'), /Aún no tienes pedidos/);
  await p.fill('#tk', 'jh-99999'); await p.click('.track .btn'); await url(p, /#\/ticket\/JH-99999/); assert.match(await p.textContent('.note.w'), /No encontramos el pedido JH-99999/);
  await nav(p, '#/ticket/<img src=x onerror=window.__y=1>'); await wait(200); assert.equal(await ev(p, () => window.__y), undefined, 'XSS en la ruta del ticket'); assert.equal(await p.locator('#app img[src="x"]').count(), 0);
  await login(p, 'Bodega aprobada');
  const two = { [big.id]: qFor(big, 'bodega', 520) }, prev = await ev(p, id => BYID[id].stock, big.id);
  await toCheckout(p, two); await p.click('.pay label:has(input[value=cr])'); await p.click('.sum .btn.lg'); await url(p, /#\/ticket\//);
  await nav(p, '#/pedidos');
  await p.fill('#tk', 'jh-10421'); await p.click('.track .btn'); await url(p, /#\/ticket\/JH-10421/); assert.match(await p.textContent('.ticket'), /JH-10421/, 'buscar el pedido en minúsculas');
  await nav(p, '#/pedidos'); assert.equal(await p.locator('.ocard').count(), 1);
  await p.click('.ocard button:has-text("Volver a pedir")'); await p.waitForSelector('#drawer.on');
  assert.deepEqual(await ev(p, () => S.cart), two, 'repite exactamente las cantidades del pedido'); assert.match(await p.textContent('#toast'), /Pedido repetido/);
  await p.keyboard.press('Escape');
  // agotar el stock y volver a pedir: no se puede exceder el stock disponible
  await ev(p, ([id, s]) => { BYID[id].stock = 1; S.cart = {}; }, [big.id, prev]);
  await p.click('.ocard button:has-text("Volver a pedir")'); await p.waitForTimeout(200);
  const c = await ev(p, () => S.cart); for (const [id, q] of Object.entries(c)) assert.ok(q <= byId(id).stock && q <= 1, `volver a pedir no debe superar el stock (${id}: ${q})`);
  await p.keyboard.press('Escape'); await ev(p, id => { BYID[id].stock = 0; S.cart = {} }, big.id);
  await p.click('.ocard button:has-text("Volver a pedir")'); await p.waitForTimeout(200);
  assert.deepEqual(await ev(p, () => S.cart), {}, 'un producto agotado no vuelve al carrito');
  await nav(p, '#/pedidos'); await ev(p, () => { S.user = { tipo: 'publico', nombre: 'María Torres' }; save(); route(true) });
  assert.equal(await p.locator('.ocard button:has-text("Volver a pedir")').count(), 0, 'cliente final no ve "Volver a pedir"');
});

await T('13 robustez: rutas inválidas, hash malformado, almacenamiento dañado o viejo', async p => {
  await open(p);
  for (const h of ['#/zzz', '#/c/nope', '#/p/NOPE', '#/p/', '#/buscar/%', '#/buscar/%E0%A4%A', '#/ticket/', '#/ticket/JH-0', '#/admin/zzz', '#/c/abarrotes/extra', '#/checkout', '#//', '#', '#/ofertas/x']) {
    await nav(p, h); assert.ok(nz(await p.textContent('#app')).length > 20, `ruta ${h} deja la página vacía`);
  }
});

await T('13b almacenamiento: JSON dañado y carrito con ids/cantidades inválidas', async p => {
  await p.goto(BASE); await p.evaluate(k => localStorage.setItem(k, '{bad json'), KEY); await p.reload(); await p.waitForSelector('#app > *');
  assert.ok(await p.locator('.hero').count() === 1, 'JSON dañado → arranca limpio');
  await p.evaluate(([k, a, b, c]) => localStorage.setItem(k, JSON.stringify({ ent: { modo: 'delivery', zona: 'nc' }, cart: { P9999: 3, [a]: -2, [b]: 'x', [c]: 2 } })), [KEY, plain.id, mid.id, cheap.id]);
  await p.reload(); await p.waitForSelector('#app > *'); await p.waitForTimeout(200);
  assert.equal(await p.textContent('#cnt'), '2', 'el contador solo cuenta cantidades válidas');
  assert.equal(nz(await p.textContent('#ctot')), fmt(2 * U(cheap, 1, 'publico')));
  assert.deepEqual(await ev(p, () => S.cart), { [cheap.id]: 2 });
}, { seed: false });

await T('14 rastreo de enlaces: todas las rutas #/… de portada, categorías y fichas renderizan sin errores (1280)', async p => {
  await open(p);
  const r = await ev(p, async () => {
    const tick = () => new Promise(r => setTimeout(r, 8)), seen = new Set(), bad = [];
    const hrefs = () => [...document.querySelectorAll('a[href^="#/"]')].map(a => a.getAttribute('href'));
    const queue = ['#/', '#/ofertas', '#/envios', '#/bodega', '#/pedidos', '#/posibilidades', '#/admin/resumen', ...CATS.map(c => '#/c/' + c[0]), ...PRODUCTS.map(p => '#/p/' + p.id)];
    while (queue.length) {
      const h = queue.shift(); if (seen.has(h)) continue; seen.add(h);
      location.hash = h; await tick(); await tick();
      const txt = document.getElementById('app').innerText.trim();
      if (txt.length < 20) bad.push(h + ' vacía');
      if (document.documentElement.scrollWidth > innerWidth) bad.push(h + ' desborda ' + (document.documentElement.scrollWidth - innerWidth));
      if (document.querySelector('.noimg')) bad.push(h + ' usa dibujo SVG en lugar de foto');
      for (const x of hrefs()) if (!seen.has(x) && !queue.includes(x) && !x.startsWith('#/ticket') && !x.startsWith('#/buscar/') && x !== '#/c/undefined') queue.push(x);
      if (seen.size > 600) break;
    }
    return { n: seen.size, bad };
  });
  assert.ok(r.n > 150, 'visitó ' + r.n); assert.deepEqual(r.bad.slice(0, 10), [], `${r.bad.length} rutas con problemas de ${r.n}`);
});

await T('14b rastreo en 375 px: las 136 fichas y 18 categorías sin desborde (nombre más largo incluido)', async p => {
  await open(p);
  const bad = await ev(p, async () => {
    const tick = () => new Promise(r => setTimeout(r, 8)), bad = [];
    for (const h of [...CATS.map(c => '#/c/' + c[0]), ...PRODUCTS.map(p => '#/p/' + p.id), '#/ofertas', '#/buscar/']) {
      location.hash = h; await tick(); await tick();
      const o = document.documentElement.scrollWidth - innerWidth; if (o > 0) bad.push(h + ' +' + o);
    }
    return bad;
  });
  assert.deepEqual(bad.slice(0, 10), [], `${bad.length} desbordes`);
}, { vp: { width: 375, height: 812 } });

await T('15 recursos: las 136 fotos, 4 portadas y logos responden 200 con peso razonable', async p => {
  const urls = [...D.F.map(id => `assets/p/${id}.webp`), ...['bodega', 'reparto', 'cervezas', 'mayorista'].map(h => `assets/hero/${h}.webp`), 'assets/logo.svg', 'assets/logo-h.svg', 'assets/icono.svg', 'robots.txt', 'app.js', 'app.css', 'data.js'];
  const bad = []; let big = 0;
  for (const u of urls) { const r = await fetch(BASE + u); const b = await r.arrayBuffer(); if (!r.ok || !b.byteLength) bad.push(u + ' ' + r.status); if (b.byteLength > 400000) big++ }
  assert.deepEqual(bad, []); assert.equal(big, 0, 'imágenes de más de 400 KB');
  assert.equal(D.F.length, D.P.length, 'todas las fichas tienen foto');
  const html = await (await fetch(BASE)).text(); assert.match(html, /<meta name="robots" content="noindex,nofollow">/); assert.match(await (await fetch(BASE + 'robots.txt')).text(), /Disallow: \//);
});

// ---------- matriz de viewports: desborde, errores, imágenes rotas y axe en cada pantalla y estado
for (const vp of [{ width: 1280, height: 800 }, { width: 430, height: 932 }, { width: 375, height: 812 }]) {
  await T(`16 responsive ${vp.width}px: sin scroll horizontal, 0 errores, 0 imágenes rotas${Axe ? ', axe sin serios/críticos' : ''}`, async (p, { errs }) => {
    await open(p); const fails = [];
    // pedido de ejemplo para el ticket
    await toCheckout(p, { [plain.id]: 2, [big.id]: 1 }); await guestPay(p, 'ce');
    const states = [
      ['inicio', '#/'], ['ofertas', '#/ofertas'], ['categoría', '#/c/cervezas'], ['categoría limpieza', '#/c/limpieza'], ['búsqueda', '#/buscar/arroz'], ['búsqueda vacía', '#/buscar/zzzq'],
      ['ficha', '#/p/' + plain.id], ['ficha oferta', '#/p/' + sale.id], ['ficha agotado', '#/p/' + oos.id], ['ficha nombre largo', '#/p/' + longest.id], ['envíos', '#/envios'], ['bodega', '#/bodega'], ['mis pedidos', '#/pedidos'], ['ticket', '#/ticket/JH-10421'],
      ['posibilidades', '#/posibilidades'],
      ['checkout', '#/checkout', async () => { await ev(p, ([a, b]) => { S.cart = {}; add(a, 2); add(b, 1) }, [plain.id, big.id]) }],
      ['carrito abierto', '#/', async () => { await ev(p, ([a, b]) => { S.cart = {}; add(a, 2); add(b, 1); openCart() }, [plain.id, big.id]); await p.waitForTimeout(300) }, async () => { await ev(p, () => closeCart()) }],
      ['modal entrega', '#/', async () => { await ev(p, () => entrega()); await p.waitForTimeout(150) }, async () => { await ev(p, () => closeM()) }],
      ['modal cuenta', '#/', async () => { await ev(p, () => cuenta()); await p.waitForTimeout(150) }, async () => { await ev(p, () => closeM()) }],
      ['megamenú', '#/', async () => { await ev(p, () => mega(1)); await p.waitForTimeout(250) }, async () => { await ev(p, () => mega(0)) }],
      ['sugerencias', '#/', async () => { await p.fill('#q', 'arroz'); await p.waitForTimeout(150) }, async () => { await p.fill('#q', ''); await ev(p, () => { document.getElementById('sug').style.display = 'none' }) }],
      ['pago Yape', '#/checkout', async () => { await p.fill('#cn', 'Cliente QA'); await p.fill('#ct', '987654321'); await p.click('.pay label:has(input[value=yape])'); await p.click('.sum .btn.lg'); await p.waitForSelector('#modal.on .qr'); await p.waitForTimeout(150) }, async () => { await ev(p, () => closeM()) }],
      ['pago tarjeta', '#/checkout', async () => { await p.click('.pay label:has(input[value=mp])'); await p.click('.sum .btn.lg'); await p.waitForSelector('#modal.on'); await p.waitForTimeout(150) }, async () => { await ev(p, () => closeM()) }],
      ...['resumen', 'pedidos', 'bodegas', 'productos', 'zonas', 'sync', 'marketing'].map(t => ['panel ' + t, '#/admin/' + t]),
    ];
    for (const [name, hash, prep, post] of states) {
      const e0 = errs.length; await nav(p, hash); if (prep) await prep(); await p.waitForTimeout(250);
      const o = await overflow(p); if (o.over > 0 || o.bodyOver > 0) fails.push(`${name}: scroll horizontal +${Math.max(o.over, o.bodyOver)}px (${o.who.join(', ')})`);
      const rot = await brokenImgs(p); if (rot.length) fails.push(`${name}: imágenes rotas ${rot.slice(0, 3).join(',')}`);
      if (errs.length > e0) fails.push(`${name}: errores ${errs.slice(e0).join(' ; ')}`);
      if (process.env.AXE !== '0') for (const v of await axe(p)) fails.push(`${name}: ${v}`);
      if (post) await post();
    }
    // sesión de bodega y tema oscuro: mismas comprobaciones en pantallas clave
    await nav(p, '#/'); await ev(p, () => { S.user = null; save(); hdr(); route(true) }); await login(p, 'Bodega aprobada'); for (const t of ['noche', 'mayorista']) {
      await ev(p, t => { S.theme = t; save(); hdr() }, t);
      for (const [name, hash] of [['inicio', '#/'], ['categoría', '#/c/abarrotes'], ['ficha', '#/p/' + plain.id], ['checkout', '#/checkout'], ['panel', '#/admin/resumen'], ['ticket', '#/ticket/JH-10421']]) {
        await nav(p, hash); await p.waitForTimeout(200);
        const o = await overflow(p); if (o.over > 0) fails.push(`tema ${t} ${name}: scroll horizontal +${o.over}px`);
        for (const v of await axe(p)) fails.push(`tema ${t} ${name}: ${v}`);
      }
    }
    if (fails.length) throw new Error(fails.length + ' problemas: ' + fails.join(' || '));
    errs.length = 0;
  }, { vp });
}

} // fin !SMOKE

await browser.close(); srv?.kill();
const ko = results.filter(r => !r.ok);
console.log(`\nRESUMEN: ${results.length - ko.length} pasaron, ${ko.length} fallaron de ${results.length}`);
for (const r of ko) console.log(' - ' + r.name);
process.exit(ko.length ? 1 : 0);
