// Prueba funcional de reglas de negocio: node tools/prueba.mjs (servir antes con python -m http.server 8091)
import { chromium } from 'file:///C:/Users/abner/dev/vanguard-saas/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const BASE = process.env.BASE || 'http://127.0.0.1:8091/';
const b = await chromium.launch(), p = await b.newPage(), err = [];
p.on('pageerror', e => err.push(e.message)); p.on('console', m => m.type() === 'error' && err.push(m.text()));
await p.addInitScript(() => localStorage.setItem('jhovin-demo-v1', JSON.stringify({ ent: { modo: 'delivery', zona: 'nc' } })));
await p.goto(BASE + '#/', { waitUntil: 'networkidle' });
const ev = f => p.evaluate(f);
// envío: S/3 bajo S/300 en Nueva Cajamarca, gratis desde S/300; otra zona siempre cobra; recojo gratis
assert.equal(await ev(() => { S.cart = { P1001: 1 }; return totals().env }), 3);
assert.equal(await ev(() => { S.cart = { P1005: 2 }; return totals().env }), 0);
assert.equal(await ev(() => { S.ent.zona = 'rio'; return totals().env }), 20);
assert.equal(await ev(() => { S.ent.modo = 'recojo'; return totals().env }), 0);
// precio por volumen: público 12+ = 0.92; bodega 48+ = 0.81
assert.equal(await ev(() => unit(BYID.P1001, 12, 'publico')), Math.round(23.9 * 0.92 * 100) / 100);
assert.equal(await ev(() => unit(BYID.P1001, 48, 'bodega')), Math.round(23.9 * 0.81 * 100) / 100);
// bodega: mínimo S/500 bloquea el pago
assert.equal(await ev(() => { login('bodega'); S.cart = { P1001: 2 }; return totals().ok }), false);
assert.equal(await ev(() => { S.cart = { P1005: 3 }; return totals().ok }), true);
// tarjeta: agregar actualiza solo esa tarjeta (sin redibujar la página)
await ev(() => { S.user = null; S.cart = {}; S.ent = { modo: 'delivery', zona: 'nc' }; location.hash = '#/c/abarrotes' }); await p.waitForTimeout(300);
await ev(() => { window._marca = document.querySelector('.grid'); add('P1001', 1) });
assert.equal(await ev(() => window._marca === document.querySelector('.grid') && !!document.querySelector('.card[data-id="P1001"] .qty')), true);
// invitado: el pago exige nombre y celular; luego ticket interno
await ev(() => { location.hash = '#/checkout' }); await p.waitForTimeout(300);
await ev(() => { document.querySelector('input[name=pay][value=ce]').checked = true; pagar() });
assert.match(p.url(), /#\/checkout$/);
await p.fill('#cn', 'Cliente Prueba'); await p.fill('#ct', '900000000');
await ev(() => { document.querySelector('input[name=pay][value=ce]').checked = true; pagar() }); await p.waitForTimeout(300);
assert.match(p.url(), /#\/ticket\/JH-/);
assert.match(await p.textContent('.ticket'), /Documento interno, no es comprobante tributario/);
// panel: aprobar bodega y editar zona
await ev(() => { location.hash = '#/admin/bodegas' }); await p.waitForTimeout(300);
await p.click('text=Aprobar >> nth=0');
assert.equal(await ev(() => S.sols[0].est), 'aprobada');
await ev(() => { location.hash = '#/admin/zonas' }); await p.waitForTimeout(300);
await p.fill('input[aria-label="Costo Ucrania"]', '6'); await p.press('input[aria-label="Costo Ucrania"]', 'Tab');
assert.equal(await ev(() => S.zonas.find(z => z.id === 'ucr').costo), 6);
assert.deepEqual(err, []);
await b.close(); console.log('OK: reglas de negocio verificadas');
