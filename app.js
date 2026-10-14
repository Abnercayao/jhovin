// Super Mayorista Jhovin · demo (SPA con rutas hash). Datos en data.js.
const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s), app = $('#app');
const money = n => 'S/ ' + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CAT = Object.fromEntries(CATS.map(c => [c[0], { id: c[0], n: c[1] }]));
const BYID = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
const KEY = 'jhovin-demo-v1';
let S = Object.assign({
  user: null, cart: {}, ent: { modo: 'delivery', zona: 'nc' }, theme: 'jhovin', orders: [], sols: [
    { id: 'S-001', neg: 'Bodega Doña Rosa', ruc: '10456789123', dni: '45678912', tel: '987654321', dir: 'Jr. Huallaga 230, Nueva Cajamarca', zona: 'nc', est: 'pendiente', f: '2026-10-13' },
    { id: 'S-002', neg: 'Minimarket El Paisa', ruc: '20601234567', dni: '41234567', tel: '954321876', dir: 'Av. Cajamarca 512, Ucrania', zona: 'ucr', est: 'pendiente', f: '2026-10-14' },
    { id: 'S-003', neg: 'Bodega San Martín', ruc: '10412398765', dni: '41239876', tel: '965412378', dir: 'Calle Lima 120, Yuracyacu', zona: 'yur', est: 'aprobada', f: '2026-10-02' }],
  zonas: ZONAS
}, (() => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} } })());
if (!['jhovin', 'mayorista', 'noche'].includes(S.theme)) S.theme = 'jhovin';
S.cart = Object.fromEntries(Object.entries(S.cart || {}).filter(([id, q]) => BYID[id] && Number.isInteger(q) && q > 0).map(([id, q]) => [id, Math.min(q, BYID[id].stock)]).filter(([, q]) => q > 0));
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)) } catch { } };
const tipo = () => S.user?.tipo === 'bodega' ? 'bodega' : 'publico';
const zona = () => S.zonas.find(z => z.id === S.ent.zona) || S.zonas[0];

// ---- íconos (trazos estilo Lucide, inline)
const IC = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  store: '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  package: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.7 4.73a2 2 0 0 0 2 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  down: '<path d="m6 9 6 6 6-6"/>', left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>',
  arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>', plus: '<path d="M5 12h14M12 5v14"/>', minus: '<path d="M5 12h14"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  tag: '<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  check: '<path d="M20 6 9 17l-5-5"/>', checkc: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  phone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
  cash: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  bank: '<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l8 5H4z"/>',
  book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
  sync: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  mega: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"/>',
  bike: '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
  map: '<path d="M14.1 5.55a2 2 0 0 0 1.79 0l3.66-1.83A1 1 0 0 1 21 4.62v12.76a1 1 0 0 1-.55.9l-4.55 2.27a2 2 0 0 1-1.79 0l-4.21-2.1a2 2 0 0 0-1.79 0l-3.66 1.83A1 1 0 0 1 3 19.38V6.62a1 1 0 0 1 .55-.9L8.1 3.45a2 2 0 0 1 1.79 0z"/><path d="M15 5.76v15M9 3.24v15"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
  building: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  send: '<path d="M14.54 21.69a.5.5 0 0 0 .94-.03l6.5-19a.5.5 0 0 0-.64-.63l-19 6.5a.5.5 0 0 0-.02.93l7.93 3.18a2 2 0 0 1 1.11 1.11z"/><path d="m21.85 2.15-10.94 10.94"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  trend: '<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  palette: '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2z"/>',
  pencil: '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
  db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
};
const ic = (n, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ''}</svg>`;
// esqueleto: la tarjeta deja de "brillar" cuando su foto termina de cargar
document.addEventListener('load', e => { if (e.target.tagName === 'IMG') e.target.closest('.ph')?.classList.add('ok') }, true);
const fillIcons = (root = document) => root.querySelectorAll('[data-i]').forEach(e => { if (!e.firstChild) e.innerHTML = ic(e.dataset.i) });

function toast(t) { const e = $('#toast'); e.innerHTML = ic('checkc') + esc(t); e.classList.add('on'); clearTimeout(e.t); e.t = setTimeout(() => e.classList.remove('on'), 2400) }

// ---- precios: escalas por volumen según tipo de cliente
function unit(p, q = 1, t = tipo()) {
  const tiers = TIERS[t]; let f = 1; for (const [m, x] of tiers) if (q >= m) f = x;
  // público: oferta fija; bodega: su escala, sin superar nunca la oferta pública
  const v = t === 'publico' && p.oferta ? p.oferta : Math.min(p.price * f, t === 'bodega' && p.oferta ? p.oferta : Infinity); return Math.round(v * 100) / 100
}
function volTxt(p) {
  const t = tipo(), tiers = TIERS[t].filter(x => x[0] > 1); if (t === 'publico' && p.oferta) return '';
  const [m] = tiers[tiers.length - 1]; return `${m}+ und: <b>${money(unit(p, m))}</b> c/u`
}

// ---- imágenes: foto del producto (assets/p/<id>.webp)
const img = p => window.FOTOS && FOTOS.has(p.id)
  ? `<img src="assets/p/${p.id}.webp" alt="${esc(p.n)}" loading="lazy" decoding="async" width="600" height="600">`
  : `<span class="noimg" role="img" aria-label="${esc(p.n)}">${ic('package')}</span>`;
// miniatura representativa por categoría (foto de estudio)
const THUMB = { abarrotes: 'P1001', aceites: 'P1014', fideos: 'P1021', conservas: 'P1028', lacteos: 'P1033', desayuno: 'P1043', menestras: 'P1050', condimentos: 'P1056', galletas: 'P1064', snacks: 'P1074', bebidas: 'P1079', gaseosas: 'P1087', cervezas: 'P1096', limpieza: 'P1104', cuidado: 'P1116', bebes: 'P1122', mascotas: 'P1127', descartables: 'P1131' };
const catImg = c => img(BYID[THUMB[c]] || PRODUCTS.find(p => p.c === c));
const nCat = c => PRODUCTS.filter(p => p.c === c).length;
const pct = p => Math.round(100 - p.oferta / p.price * 100);

function card(p) {
  const q = S.cart[p.id] || 0, t = tipo(), u = unit(p, Math.max(q, 1)), sale = p.oferta && t === 'publico', v = volTxt(p);
  return `<article class="card" data-id="${p.id}">
  <div class="bdgs">${sale ? `<span class="bdg sale">-${pct(p)}%</span>` : ''}${p.nuevo ? '<span class="bdg new">Nuevo</span>' : ''}${!p.stock ? '<span class="bdg out">Agotado</span>' : ''}</div>
  <a href="#/p/${p.id}" class="ph" tabindex="-1" aria-hidden="true">${img(p)}</a>
  <div class="cb"><span class="br">${esc(p.m)}</span><a class="nm" href="#/p/${p.id}">${esc(p.n)}</a>
  <div class="prices"><span class="pr">${money(u)}</span>${sale ? `<s>${money(p.price)}</s>` : ''}</div>
  <div class="pnote">${t === 'bodega' ? 'Precio bodega' : sale ? 'Precio de oferta' : 'Precio unitario'}</div>
  ${v ? `<div class="vol">${ic('layers')}<span>${v}</span></div>` : '<div class="vol empty"></div>'}
  <div class="add">${p.stock === 0 ? `<button class="btn o w" onclick="toast('Te avisaremos por WhatsApp')">${ic('bell')}Avísame</button>` : q ? qtyCtl(p.id, q) : `<button class="btn w" onclick="add('${p.id}',1)">${ic('plus')}Agregar</button>`}</div></div></article>`
}
const qtyCtl = (id, q) => `<div class="qty"><button onclick="add('${id}',-1)" aria-label="Quitar uno">${ic(q > 1 ? 'minus' : 'trash')}</button><span aria-live="polite">${q}</span><button onclick="add('${id}',1)" aria-label="Agregar uno">${ic('plus')}</button></div>`;
function add(id, d) {
  const p = BYID[id], prev = S.cart[id] || 0, q = Math.max(0, Math.min(p.stock, prev + d));
  if (q) S.cart[id] = q; else delete S.cart[id];
  if (d > 0 && q === prev) toast('Stock máximo disponible');
  else if (d > 0 && !prev) toast('Agregado al carrito');
  save(); hdr(); if ($('#drawer').classList.contains('on')) drawCart(); refresh(id)
}
// actualiza solo las tarjetas del producto (no resetea rieles ni carrusel); ficha y checkout se redibujan
function refresh(id) {
  const r = location.hash.split('/')[1];
  if (r === 'p' || r === 'checkout') return route(true);
  $$(`.card[data-id="${id}"]`).forEach(el => {
    const f = document.activeElement && el.contains(document.activeElement);
    el.outerHTML = card(BYID[id]);
    if (f) $(`.card[data-id="${id}"] .add button:last-child`)?.focus();
  })
}

// ---- totales y reglas
function totals() {
  const t = tipo(), items = Object.entries(S.cart).filter(([id]) => BYID[id]).map(([id, q]) => { const p = BYID[id], u = unit(p, q); return { p, q, u, s: u * q, ahorro: (p.price - u) * q } });
  const sub = Math.round(items.reduce((a, i) => a + i.s, 0) * 100) / 100, z = zona(); let env = 0;
  if (S.ent.modo === 'delivery') { env = z.costo; if (z.gratis && sub >= z.gratis) env = 0; }
  const min = t === 'bodega' ? 500 : 0;
  return { items, sub, env, tot: Math.round((sub + env) * 100) / 100, min, ok: sub > 0 && sub >= min, ahorro: items.reduce((a, i) => a + Math.max(0, i.ahorro), 0), z }
}

function hdr() {
  const n = Object.values(S.cart).reduce((a, b) => a + b, 0), c = $('#cnt');
  if (c.textContent !== String(n)) { c.textContent = n; c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump') }
  c.hidden = !n; $('#ctot').textContent = money(totals().sub);
  const z = zona(); $$('.dtxt').forEach(e => e.textContent = S.ent.modo === 'recojo' ? 'Recojo en tienda' : `Delivery a ${z.n.replace(' (radio urbano)', '')}`);
  $('#ulabel').textContent = S.user ? S.user.nombre.split(' ')[0] : 'Ingresar';
  $('#uhola').textContent = S.user ? 'Mi cuenta' : 'Hola, invitado';
  $('#who').innerHTML = S.user ? (S.user.tipo === 'bodega' ? `${ic('store')}Precios de bodega · mínimo S/500` : S.user.tipo === 'admin' ? `${ic('chart')}<a href="#/admin">Panel del negocio</a>` : `${ic('user')}Cliente final`) : `${ic('user')}Comprando como invitado`;
  $('#topmsg').innerHTML = tipo() === 'bodega' ? `${ic('store')}<span>Bodegas: precios mayoristas · mínimo S/500<span class="hide-s"> · reparto programado</span></span>` : `${ic('truck')}<span>Envío <b>gratis</b> desde S/300 en Nueva Cajamarca<span class="hide-s"> · Recojo en tienda sin costo</span></span>`;
  $$('.themes button[data-t]').forEach(b => { b.classList.toggle('on', b.dataset.t === S.theme); b.setAttribute('aria-pressed', b.dataset.t === S.theme) });
  document.documentElement.dataset.theme = S.theme
}
$$('.themes button[data-t]').forEach(b => b.onclick = () => { S.theme = b.dataset.t; save(); hdr() });

// ---- categorías + megamenú
$('#catnav').innerHTML = `<a href="#/ofertas" class="hot" data-c="ofertas">${ic('flame')}Ofertas</a>` + CATS.slice(0, 10).map(c => `<a href="#/c/${c[0]}" data-c="${c[0]}">${c[1]}</a>`).join('');
$('#megain').innerHTML = CATS.map(c => `<a href="#/c/${c[0]}" onclick="mega(0)">${catImg(c[0])}<span>${c[1]}<small>${nCat(c[0])} productos</small></span></a>`).join('');
let megaOn = false, rtAt = 0; // rtAt: el scroll al inicio tras cambiar de ruta mueve el botón bajo el mouse y dispara un mouseenter falso

function mega(on) { megaOn = !!on; $('#mega').classList.toggle('on', megaOn); $('#allcat').setAttribute('aria-expanded', megaOn) }
$('#cats').addEventListener('mouseleave', () => { if (matchMedia('(hover:hover)').matches) mega(0) });
document.addEventListener('click', e => { if (megaOn && !e.target.closest('#cats')) mega(0); if (!e.target.closest('.search')) $('#sug').style.display = 'none' });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { mega(0); closeCart(); closeM(); $('#sug').style.display = 'none' } });

// ---- buscador con sugerencias
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function find(q) { const w = norm(q).split(/\s+/).filter(Boolean); return PRODUCTS.filter(p => w.every(x => norm(p.n + ' ' + p.m + ' ' + CAT[p.c].n).includes(x))) }
$('#q').oninput = e => {
  const q = e.target.value.trim(), s = $('#sug'); if (q.length < 2) { s.style.display = 'none'; return }
  const all = find(q), r = all.slice(0, 6);
  s.innerHTML = r.length ? r.map(p => `<a href="#/p/${p.id}" onclick="$('#sug').style.display='none'">${img(p)}<span class="s-n">${esc(p.n)}</span><span class="s-p">${money(unit(p))}</span></a>`).join('') + `<a class="s-all" href="#/buscar/${encodeURIComponent(q)}" onclick="$('#sug').style.display='none'">Ver los ${all.length} resultados ${ic('arrow')}</a>` : `<a class="s-all" href="#/buscar/${encodeURIComponent(q)}">Sin coincidencias para “${esc(q)}”</a>`;
  s.style.display = 'block'
};
function buscar() { const q = $('#q').value.trim(); if (q) { location.hash = '#/buscar/' + encodeURIComponent(q); $('#sug').style.display = 'none'; $('#q').blur() } }

// ---- carrito
let lastFocus;
function openCart() { lastFocus = document.activeElement; drawCart(); $('#drawer').classList.add('on'); setTimeout(() => $('#drawer .pn-h .ib').focus(), 50) }
function closeCart() { if (!$('#drawer').classList.contains('on')) return; $('#drawer').classList.remove('on'); lastFocus?.focus?.() }
function drawCart() {
  const T = totals(), n = T.items.reduce((a, i) => a + i.q, 0);
  $('#cart-n').textContent = n ? `(${n})` : '';
  $('#cartbd').innerHTML = T.items.length ? freeBar(T) + T.items.map(i => `<div class="li"><a class="lim" href="#/p/${i.p.id}" onclick="closeCart()">${img(i.p)}</a><div><a class="ln" href="#/p/${i.p.id}" onclick="closeCart()">${esc(i.p.n)}</a><div class="lu">${money(i.u)} c/u${i.u < i.p.price ? ` · <em>ahorras ${money((i.p.price - i.u) * i.q)}</em>` : ''}</div>${qtyCtl(i.p.id, i.q)}</div><div class="lt">${money(i.s)}<button class="rm" onclick="add('${i.p.id}',-${i.q})" aria-label="Quitar ${esc(i.p.n)}">${ic('trash')}</button></div></div>`).join('')
    : `<div class="cart-empty"><span class="ico-c">${ic('cart')}</span><h3>Tu carrito está vacío</h3><p>Agrega productos y aprovecha los precios por volumen.</p><a class="btn" href="#/ofertas" onclick="closeCart()">Ver ofertas</a></div>`;
  $('#cartft').innerHTML = T.items.length ? `<div class="row"><span>Subtotal</span><b>${money(T.sub)}</b></div><div class="row"><span>Envío</span><b>${S.ent.modo === 'recojo' ? 'Recojo gratis' : T.env ? money(T.env) : 'Gratis'}</b></div>${T.ahorro > 0 ? `<div class="row sv"><span>Ahorro por volumen y ofertas</span><b>−${money(T.ahorro)}</b></div>` : ''}<div class="row tot"><span>Total</span><span>${money(T.tot)}</span></div>
  <button class="btn lg w" ${T.ok ? '' : 'disabled'} onclick="closeCart();location.hash='#/checkout'">${ic('lock')}Ir a pagar</button><button class="btn o w" onclick="closeCart()">Seguir comprando</button>` : ''
}
function freeBar(T) {
  const w = x => Math.min(100, x).toFixed(0);
  if (T.min && T.sub < T.min) return `<div class="note w" style="margin-top:14px">${ic('store')}<span>Pedido mínimo de bodega: te faltan <b>${money(T.min - T.sub)}</b></span></div><div class="prog r"><i style="width:${w(T.sub / T.min * 100)}%"></i></div>`;
  if (S.ent.modo === 'delivery' && T.z.gratis) return T.sub >= T.z.gratis ? `<div class="note" style="margin-top:14px">${ic('checkc')}<span>¡Tienes envío gratis!</span></div>` : `<div class="note y" style="margin-top:14px">${ic('truck')}<span>Agrega <b>${money(T.z.gratis - T.sub)}</b> más para envío gratis</span></div><div class="prog"><i style="width:${w(T.sub / T.z.gratis * 100)}%"></i></div>`;
  return S.ent.modo === 'delivery' ? `<div class="note y" style="margin-top:14px">${ic('truck')}<span>Envío a ${esc(T.z.n)}: ${money(T.z.costo)}</span></div>` : `<div class="note" style="margin-top:14px">${ic('store')}<span>Recojo en tienda sin costo</span></div>`
}

// ---- modales
function M(h) { if (!$('#modal').classList.contains('on')) lastFocus = document.activeElement; $('#mbody').innerHTML = h; $('#modal').classList.add('on'); setTimeout(() => ($('#mbody input,#mbody select,#mbody button') || $('#modal .x')).focus(), 60) }
function closeM() { if (!$('#modal').classList.contains('on')) return; $('#modal').classList.remove('on'); lastFocus?.focus?.() }
const optBtns = (cur, fn) => `<div class="opt"><button class="${cur === 'delivery' ? 'on' : ''}" aria-pressed="${cur === 'delivery'}" onclick="${fn}('delivery')">${ic('truck')}<b>Delivery</b><small>Hoy o mañana · desde ${money(Math.min(...S.zonas.map(z => z.costo)))}</small></button><button class="${cur === 'recojo' ? 'on' : ''}" aria-pressed="${cur === 'recojo'}" onclick="${fn}('recojo')">${ic('store')}<b>Recojo en tienda</b><small>Gratis · listo en 2 horas</small></button></div>`;
const setModo = m => { S.ent.modo = m; entrega() };
function entrega() {
  M(`<h2>¿Cómo quieres recibir tu pedido?</h2><p>Así te mostramos costos y tiempos reales.</p>${optBtns(S.ent.modo, 'setModo')}
  ${S.ent.modo === 'delivery' ? `<div class="f"><label>¿A dónde lo llevamos?<select id="zsel">${S.zonas.map(z => `<option value="${z.id}" ${z.id === S.ent.zona ? 'selected' : ''}>${esc(z.n)} — ${money(z.costo)}${z.gratis ? ` (gratis desde S/${z.gratis})` : ''}</option>`).join('')}</select><small>Repartimos hasta Rioja. ¿Tu zona no aparece? Escríbenos por WhatsApp.</small></label></div>` : `<div class="note y">${ic('pin')}<span>Super Mayorista Jhovin, Nueva Cajamarca. Te avisamos cuando esté listo (2 horas aprox.).</span></div>`}
  <button class="btn lg w" style="margin-top:18px" onclick="if($('#zsel'))S.ent.zona=$('#zsel').value;save();hdr();closeM();route(true)">Confirmar</button>`)
}
function cuenta() {
  if (S.user) return M(`<h2>Hola, ${esc(S.user.nombre)}</h2><p>Tipo de cuenta: <b>${S.user.tipo === 'bodega' ? 'Bodega aprobada' : S.user.tipo === 'admin' ? 'Administrador' : 'Cliente final'}</b></p><div class="quick" style="margin-top:16px"><button onclick="closeM();location.hash='#/pedidos'">${ic('package')}<span><b>Mis pedidos</b><small>Estado y tickets</small></span></button>${S.user.tipo === 'admin' ? `<button onclick="closeM();location.hash='#/admin'">${ic('chart')}<span><b>Panel del negocio</b><small>Pedidos, bodegas y precios</small></span></button>` : ''}<button onclick="S.user=null;save();hdr();closeM();route(true)">${ic('logout')}<span><b>Cerrar sesión</b><small>Seguir como invitado</small></span></button></div>`);
  M(`<h2>Ingresa a tu cuenta</h2><p>Revisa tus pedidos y, si eres bodega, tus precios mayoristas.</p><div class="f" style="margin-top:16px"><label>Correo o celular<input autocomplete="username" placeholder="tu@correo.com"></label><label>Contraseña<input type="password" autocomplete="current-password"></label>
  <button class="btn lg w" onclick="login('publico')">Ingresar</button><button class="btn o w" onclick="toast('Código enviado por WhatsApp (demo)')">${ic('chat')}Ingresar con código por WhatsApp</button></div>
  <div class="divider">Accesos rápidos de la demo</div><div class="quick"><button onclick="login('publico')">${ic('user')}<span><b>Cliente final</b><small>Precio público y ofertas</small></span></button><button onclick="login('bodega')">${ic('store')}<span><b>Bodega aprobada</b><small>Precios mayoristas · mínimo S/500</small></span></button><button onclick="login('admin')">${ic('chart')}<span><b>Dueño / administrador</b><small>Panel del negocio</small></span></button></div>
  <p class="center" style="margin-top:16px;font-size:14px">¿Tienes una bodega? <a class="link" href="#/bodega" onclick="closeM()">Solicita tu cuenta mayorista</a></p>`)
}
function login(t) { S.user = { tipo: t, nombre: t === 'bodega' ? 'Bodega San Martín' : t === 'admin' ? 'Jhovin Admin' : 'María Torres' }; save(); hdr(); closeM(); toast(t === 'bodega' ? 'Precios de bodega activados' : 'Bienvenido'); route(true) }

// ---- portada
const slides = [
  ['bodega', 'Precio mayorista', 'Precios de <em>mayorista</em> para tu bodega', 'Mientras más compras, menos pagas. Escalas por volumen en todo el catálogo.', '#/bodega', 'Quiero ser bodega', '#/ofertas', 'Ver ofertas'],
  ['reparto', 'Delivery', 'Envío <em>gratis</em> desde S/300', 'En todo el radio urbano de Nueva Cajamarca. Recojo en tienda sin costo.', '#/envios', 'Ver zonas y tarifas', '#/ofertas', 'Comprar ahora'],
  ['cervezas', 'Temporada', 'Cervezas y gaseosas <em>por caja</em>', 'Six packs y cajas al mejor precio de la zona para tu negocio o tu fiesta.', '#/c/cervezas', 'Comprar cervezas', '#/c/gaseosas', 'Ver gaseosas'],
  ['mayorista', 'Abarrotes', 'Arroz y azúcar <em>por saco</em>', 'Abastece tu negocio con sacos de 50 kg y precios por volumen.', '#/c/abarrotes', 'Ver abarrotes', '#/bodega', 'Precio bodega']];
let sl = 0, slT;
const rmotion = matchMedia('(prefers-reduced-motion: reduce)');
const secH = (t, sub, href, rail) => `<div class="sec"><div><h2>${t}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${href ? `<a class="more" href="${href}">Ver todo${ic('right')}</a>` : ''}${rail ? `<div class="arrows"><button onclick="railGo('${rail}',-1)" aria-label="Anteriores">${ic('left')}</button><button onclick="railGo('${rail}',1)" aria-label="Siguientes">${ic('right')}</button></div>` : ''}</div>`;
function railGo(id, d) { const r = $('#' + id); r.scrollBy({ left: d * r.clientWidth * .9 }) }
function home() {
  const of = PRODUCTS.filter(p => p.oferta && p.stock), top = PRODUCTS.filter(p => p.stock).sort((a, b) => b.stock - a.stock);
  const perk = (i, b, s) => `<div class="perk"><span class="ico-c">${ic(i)}</span><span><b>${b}</b><small>${s}</small></span></div>`;
  app.innerHTML = `<section class="hero" aria-roledescription="carrusel" aria-label="Promociones" onmouseenter="clearInterval(slT)" onmouseleave="autoSl()">${slides.map((s, i) => `<div class="slide ${i === sl ? 'on' : ''}" aria-hidden="${i !== sl}"><img src="assets/hero/${s[0]}.webp" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} width="1536" height="640"><div class="cap"><span class="eyebrow">${ic('tag')}${s[1]}</span><h2>${s[2]}</h2><p>${s[3]}</p><div class="hero-ctas"><a class="btn y lg" href="${s[4]}" ${i !== sl ? 'tabindex="-1"' : ''}>${s[5]}</a><a class="btn g lg" href="${s[6]}" ${i !== sl ? 'tabindex="-1"' : ''}>${s[7]}</a></div></div></div>`).join('')}
    <button class="hnav l" onclick="goSl(sl-1)" aria-label="Promoción anterior">${ic('left')}</button><button class="hnav r" onclick="goSl(sl+1)" aria-label="Promoción siguiente">${ic('right')}</button>
    <div class="dots">${slides.map((_, i) => `<button class="${i === sl ? 'on' : ''}" onclick="goSl(${i})" aria-label="Ver promoción ${i + 1}"></button>`).join('')}</div></section>
  <div class="perks">${perk('truck', 'Envío gratis desde S/300', 'En Nueva Cajamarca')}${perk('store', 'Recojo en tienda gratis', 'Listo en 2 horas')}${perk('layers', 'Precio por volumen', 'Más compras, menos pagas')}${perk('card', 'Paga como prefieras', 'Yape, Plin, tarjeta o efectivo')}</div>
  ${secH('Compra por categoría', '18 pasillos con todo para tu casa y tu negocio')}
  <div class="catcircles">${CATS.map(c => `<a href="#/c/${c[0]}"><span class="cc">${catImg(c[0])}</span>${c[1]}</a>`).join('')}</div>
  ${secH('Ofertas de la semana', 'Precios bajos por tiempo limitado', '#/ofertas', 'r-of')}<div class="rail" id="r-of">${of.slice(0, 14).map(card).join('')}</div>
  <div class="banners">
    <a class="bn dark" href="#/bodega"><span class="eyebrow">${ic('store')}Bodegas</span><h3>¿Tienes bodega o minimarket?</h3><p>Precios mayoristas hasta 19% menos. Pedido mínimo S/500.</p><span class="cta">Solicitar cuenta${ic('arrow')}</span><span class="art"><span class="ci">${img(BYID.P1005)}</span></span></a>
    <a class="bn red" href="#/envios"><h3>Llegamos hasta Rioja</h3><p>Ucrania, Segunda Jerusalén, Yuracyacu, Naranjos y más.</p><span class="cta">Ver tarifas${ic('arrow')}</span><span class="art"><span class="bigi">${ic('truck')}</span></span></a>
    <a class="bn yel" href="#/c/limpieza"><h3>Limpieza por caja</h3><p>Detergentes, lejía y papel al por mayor.</p><span class="cta">Comprar limpieza${ic('arrow')}</span><span class="art"><span class="ci">${img(BYID.P1107)}</span></span></a>
  </div>
  ${secH('Lo más vendido', 'Lo que más se llevan nuestros clientes', '#/buscar/', 'r-top')}<div class="rail" id="r-top">${top.slice(0, 14).map(card).join('')}</div>
  ${secH('Marcas que encuentras')}<div class="brands">${[...new Set(PRODUCTS.map(p => p.m))].slice(0, 24).map(m => `<a href="#/buscar/${encodeURIComponent(m)}">${esc(m)}</a>`).join('')}</div>
  ${secH('Para tu despensa', 'Abarrotes, aceites, conservas y lácteos')}<div class="grid g5">${PRODUCTS.filter(p => ['abarrotes', 'aceites', 'conservas', 'lacteos'].includes(p.c)).slice(0, 10).map(card).join('')}</div>
  <section class="band"><div><h2>Compra a precio <em>mayorista</em></h2><p>Regístrate como bodega y accede a escalas por volumen, crédito y reparto programado.</p></div><ol><li>Llenas el formulario con tu RUC</li><li>Te aprobamos en 24–48 horas</li><li>Compras con tus precios de bodega</li></ol><a class="btn y lg" href="#/bodega">Quiero ser bodega</a></section>`;
  autoSl()
}
function autoSl() { clearInterval(slT); if (!rmotion.matches) slT = setInterval(() => goSl(sl + 1), 6000) }
function goSl(i) {
  sl = (i + slides.length) % slides.length;
  $$('.slide').forEach((s, j) => { s.classList.toggle('on', j === sl); s.setAttribute('aria-hidden', j !== sl); s.querySelectorAll('a').forEach(a => j === sl ? a.removeAttribute('tabindex') : a.setAttribute('tabindex', '-1')) });
  $$('.dots button').forEach((s, j) => s.classList.toggle('on', j === sl))
}

// ---- listados (categoría, ofertas, búsqueda)
let F = { marcas: [], max: 0, ord: 'rel', oferta: false }, fOpen; // fOpen: panel de filtros abierto (undefined = por defecto según ancho)
const crumbs = (...a) => `<nav class="crumbs" aria-label="Ruta"><a href="#/">Inicio</a>${a.map(x => ic('right') + x).join('')}</nav>`;
function listado(titulo, list, crumb) {
  const marcas = [...new Set(list.map(p => p.m))].sort((a, b) => a.localeCompare(b));
  let r = list.filter(p => (!F.marcas.length || F.marcas.includes(p.m)) && (!F.max || unit(p) <= F.max) && (!F.oferta || p.oferta));
  if (F.ord === 'asc') r.sort((a, b) => unit(a) - unit(b)); if (F.ord === 'desc') r.sort((a, b) => unit(b) - unit(a)); if (F.ord === 'az') r.sort((a, b) => a.n.localeCompare(b.n));
  const open = (fOpen ?? innerWidth > 960) ? 'open' : '';
  app.innerHTML = `${crumbs(crumb || esc(titulo))}<div class="lhead"><h1>${esc(titulo)}</h1><span class="cnt">${r.length} productos</span><label class="sort">Ordenar<select onchange="F.ord=this.value;route(true)"><option value="rel">Relevancia</option><option value="asc" ${F.ord === 'asc' ? 'selected' : ''}>Menor precio</option><option value="desc" ${F.ord === 'desc' ? 'selected' : ''}>Mayor precio</option><option value="az" ${F.ord === 'az' ? 'selected' : ''}>A–Z</option></select></label></div>
  <div class="layout"><details class="filters" ${open} ontoggle="fOpen=this.open"><summary>${ic('layers')}Filtros${F.marcas.length || F.max || F.oferta ? ' (activos)' : ''}</summary><div class="fbody">
  <div class="fgroup"><h3>Marca</h3>${marcas.map(m => `<label class="chk"><input type="checkbox" ${F.marcas.includes(m) ? 'checked' : ''} onchange="tg('${esc(m.replace(/'/g, "\\'"))}')">${esc(m)}<small>${list.filter(p => p.m === m).length}</small></label>`).join('')}</div>
  <div class="fgroup"><h3>Precio máximo</h3><input type="range" min="0" max="200" step="5" value="${F.max || 200}" aria-label="Precio máximo" oninput="F.max=+this.value>=200?0:+this.value;this.nextElementSibling.textContent=F.max?'Hasta S/'+F.max:'Todos los precios'" onchange="route(true)"><small class="muted">${F.max ? 'Hasta S/' + F.max : 'Todos los precios'}</small></div>
  <div class="fgroup"><h3>Promociones</h3><label class="chk"><input type="checkbox" ${F.oferta ? 'checked' : ''} onchange="F.oferta=this.checked;route(true)">Solo ofertas</label></div>
  ${F.marcas.length || F.max || F.oferta ? `<button class="btn o w" onclick="F={marcas:[],max:0,ord:F.ord,oferta:false};route(true)">Limpiar filtros</button>` : ''}</div></details>
  <div class="grid">${r.map(card).join('') || `<div class="empty-st"><span class="ico-c">${ic('search')}</span><h2>No encontramos productos</h2><p class="muted">Prueba con otra palabra o quita algunos filtros.</p></div>`}</div></div>`
}
function tg(m) { F.marcas = F.marcas.includes(m) ? F.marcas.filter(x => x !== m) : [...F.marcas, m]; route(true) }

// ---- ficha de producto
let pv = 0, pq = 1;
const pqSet = d => { pq = Math.max(1, Math.min(BYID[location.hash.split('/')[2]]?.stock || 1, pq + d)); $('#pq').textContent = pq };
function pdp(id) {
  const p = BYID[id]; if (!p) return home();
  const t = tipo(), q = S.cart[p.id] || 0, rel = PRODUCTS.filter(x => x.c === p.c && x.id !== p.id).slice(0, 10), sale = p.oferta && t === 'publico', u = unit(p, Math.max(q, 1)), z = zona();
  const views = [['Vista', img(p)], ['Detalle', img(p)], [`Caja x${p.caja}`, `<div class="boxv"><div class="crate">${img(p).replace(/alt="[^"]*"/, 'alt=""').repeat(6)}</div><b>Caja de ${p.caja} unidades</b></div>`]];
  app.innerHTML = `${crumbs(`<a href="#/c/${p.c}">${CAT[p.c].n}</a>`, esc(p.n))}<div class="pdp">
  <div class="gal"><div class="thumbs" role="tablist" aria-label="Imágenes">${views.map((v, i) => `<button class="${i === pv ? 'on' : ''} ${i === 1 ? 'zoom' : ''}" role="tab" aria-selected="${i === pv}" onclick="pv=${i};pdp('${p.id}')" aria-label="${v[0]}">${img(p)}${i === 2 ? '<span>Caja</span>' : ''}</button>`).join('')}</div>
  <div class="stage ${pv === 1 ? 'z' : ''}" onmousemove="if(this.classList.contains('z')){const r=this.getBoundingClientRect();this.firstElementChild.style.transformOrigin=((event.clientX-r.left)/r.width*100)+'% '+((event.clientY-r.top)/r.height*100)+'%'}" onclick="if(pv<2){pv=pv?0:1;pdp('${p.id}')}">${pv === 2 ? views[2][1] : img(p)}<div class="bdgs">${sale ? `<span class="bdg sale">-${pct(p)}%</span>` : ''}${p.nuevo ? '<span class="bdg new">Nuevo</span>' : ''}</div></div></div>
  <div class="pinfo"><span class="br"><a href="#/buscar/${encodeURIComponent(p.m)}">${esc(p.m)}</a></span><h1>${esc(p.n)}</h1>
  <div class="meta"><span>Código ${p.sku}</span>${p.stock ? `<span class="pill ok">${ic('check')}${p.stock > 20 ? 'En stock' : 'Quedan ' + p.stock}</span>` : `<span class="pill r">${ic('alert')}Agotado</span>`}${t === 'bodega' ? `<span class="pill k">${ic('store')}Precio bodega</span>` : ''}</div>
  <div class="pbig"><span class="pr">${money(u)}</span>${sale ? `<s>${money(p.price)}</s><span class="pill r">Ahorras ${money(p.price - p.oferta)}</span>` : ''}</div>
  <p class="muted" style="font-size:14px">Precio por unidad${q ? ` con ${q} en tu carrito` : ''} · incluye IGV</p>
  <div class="panel"><h2>${ic('layers')}${t === 'bodega' ? 'Tus precios de bodega por volumen' : 'Precio por volumen'}</h2>
  ${sale ? '<p class="muted" style="font-size:14px">Producto en oferta: precio único para cualquier cantidad.</p>' : `<table class="t"><thead><tr><th>Cantidad</th><th class="num">Precio c/u</th><th class="num">Ahorro</th></tr></thead><tbody>${TIERS[t].map(([m], i, a) => `<tr class="${q >= m && (!a[i + 1] || q < a[i + 1][0]) ? 'on' : ''}"><td>${m}${a[i + 1] ? '–' + (a[i + 1][0] - 1) : ' a más'} und</td><td class="num">${money(unit(p, m))}</td><td class="num">${Math.round((1 - unit(p, m) / p.price) * 100)}%</td></tr>`).join('')}</tbody></table>`}
  ${t === 'publico' ? `<div class="note y" style="margin-top:12px">${ic('store')}<span>¿Compras para tu negocio? <a class="link" href="#/bodega">Regístrate como bodega</a> y accede a precios mayoristas.</span></div>` : ''}</div>
  ${p.stock ? `<div class="buy">${q ? qtyCtl(p.id, q) : `<div class="qty"><button onclick="pqSet(-1)" aria-label="Menos">${ic('minus')}</button><span id="pq" aria-live="polite">${pq}</span><button onclick="pqSet(1)" aria-label="Más">${ic('plus')}</button></div>`}<button class="btn lg" onclick="${q ? 'openCart()' : `add('${p.id}',pq)`}">${ic('cart')}${q ? 'Ver carrito' : 'Agregar al carrito'}</button></div>
  <button class="btn o w" style="margin-top:10px" onclick="S.cart['${p.id}']=Math.min(${p.stock},(S.cart['${p.id}']||0)+${p.caja});save();hdr();route(true);toast('Caja de ${p.caja} agregada')">${ic('package')}Agregar caja completa (${p.caja} und)</button>`
      : `<button class="btn o lg w" style="margin-top:18px" onclick="toast('Te avisaremos por WhatsApp')">${ic('bell')}Avísame cuando llegue</button>`}
  <div class="dinfo"><div><span class="ico-c">${ic('truck')}</span><span><b>Delivery a ${esc(z.n)}</b><small>${money(z.costo)}${z.gratis ? ` · gratis desde S/${z.gratis}` : ''} · <button class="link" onclick="entrega()">Cambiar</button></small></span></div><div><span class="ico-c">${ic('store')}</span><span><b>Recojo en tienda gratis</b><small>Nueva Cajamarca · listo en 2 horas</small></span></div></div>
  </div></div>
  <section class="box2" style="margin-top:16px"><h2>Detalles del producto</h2><dl class="specs"><div><dt>Marca</dt><dd>${esc(p.m)}</dd></div><div><dt>Categoría</dt><dd>${CAT[p.c].n}</dd></div><div><dt>Unidades por caja</dt><dd>${p.caja}</dd></div><div><dt>Código</dt><dd>${p.sku}</dd></div></dl></section>
  ${secH('También te puede interesar', '', `#/c/${p.c}`, 'r-rel')}<div class="rail" id="r-rel">${rel.map(card).join('')}</div>`
}

// ---- checkout
const PAYS = [['mp', 'card', 'Tarjeta', 'Mercado Pago'], ['yape', 'phone', 'Yape', 'QR al instante'], ['plin', 'phone', 'Plin', 'QR al instante'], ['ce', 'cash', 'Contra entrega', 'Efectivo o POS'], ['tr', 'bank', 'Transferencia', 'BCP, BBVA, Interbank']];
const setModoCo = m => { S.ent.modo = m; save(); hdr(); checkout() };
function checkout() {
  const T = totals(); if (!T.items.length) { location.hash = '#/'; return }
  const d = new Date(), dias = [0, 1, 2].map(i => { const x = new Date(d); x.setDate(d.getDate() + i); return i ? x.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' }) : 'Hoy' });
  const pays = [...PAYS, ...(tipo() === 'bodega' ? [['cr', 'book', 'Crédito bodega', 'A 7 días']] : [])];
  app.innerHTML = `<ol class="stepper" aria-label="Pasos de compra"><li class="done"><i>${ic('check')}</i><span>Carrito</span></li><li class="sep" aria-hidden="true"></li><li class="cur"><i>2</i><span>Datos y entrega</span></li><li class="sep" aria-hidden="true"></li><li class="cur"><i>3</i><span>Pago</span></li><li class="sep" aria-hidden="true"></li><li><i>4</i><span>Ticket</span></li></ol>
  <div class="co"><div>
  <section class="box2"><h2><span class="n">1</span>Tus datos</h2>${S.user ? `<div class="guest"><span class="ico-c">${ic('user')}</span><span><b>${esc(S.user.nombre)}</b><br><small class="muted">${S.user.tipo === 'bodega' ? 'Bodega aprobada · precios mayoristas' : 'Cliente final'}</small></span></div>` : `<p class="muted" style="margin:-4px 0 14px;font-size:14px">Compra como invitado o <button class="link" onclick="cuenta()">inicia sesión</button>.</p><div class="f two"><label>Nombre completo<input id="cn" autocomplete="name" required></label><label>Celular (WhatsApp)<input id="ct" inputmode="tel" autocomplete="tel" required></label><label><span>DNI <small>(opcional)</small></span><input inputmode="numeric" maxlength="8"></label><label><span>Correo <small>(opcional)</small></span><input type="email" autocomplete="email"></label></div>`}</section>
  <section class="box2"><h2><span class="n">2</span>Entrega</h2>${optBtns(S.ent.modo, 'setModoCo')}
  ${S.ent.modo === 'delivery' ? `<div class="f two"><label>Zona<select onchange="S.ent.zona=this.value;save();hdr();checkout()">${S.zonas.map(z => `<option value="${z.id}" ${z.id === S.ent.zona ? 'selected' : ''}>${esc(z.n)} — ${money(z.costo)}</option>`).join('')}</select></label><label>Dirección y referencia<input id="cd" autocomplete="street-address" placeholder="Jr. ... / frente a ..."></label></div><button class="btn o sm" style="margin-top:12px" onclick="toast('Ubicación GPS capturada (demo)')">${ic('pin')}Usar mi ubicación actual</button>` : `<div class="note y">${ic('pin')}<span>Recoges en Super Mayorista Jhovin, Nueva Cajamarca. Sin costo.</span></div>`}
  <h3>Horario</h3><div class="slots">${dias.flatMap((dd, i) => ['8–11 a.m.', '11–2 p.m.', '3–6 p.m.', '6–9 p.m.'].map((h, j) => `<label><input type="radio" name="slot" ${i + j === 0 ? 'checked' : ''}><span>${dd}<small>${h}</small></span></label>`)).join('')}</div></section>
  <section class="box2"><h2><span class="n">3</span>Pago</h2><div class="pay">${pays.map(([v, i, l, s], k) => `<label><input type="radio" name="pay" value="${v}" ${k === 0 ? 'checked' : ''}>${ic(i)}<span>${l}<small>${s}</small></span></label>`).join('')}</div>
  <p class="muted" style="font-size:13px;margin-top:12px">Yape/Plin: mostramos el QR del negocio y el pedido se confirma al validar el pago. Tarjeta: pago seguro con Mercado Pago.</p>
  <label class="chk" style="margin-top:8px"><input type="checkbox" checked>Quiero recibir el estado de mi pedido por WhatsApp</label></section></div>
  <aside class="box2 sum"><h2>Resumen del pedido</h2>${T.items.map(i => `<div class="it">${img(i.p)}<span>${esc(i.p.n)}<small>${i.q} × ${money(i.u)}</small></span><b>${money(i.s)}</b></div>`).join('')}<hr>
  ${freeBar(T)}<div class="row"><span>Subtotal</span><b>${money(T.sub)}</b></div><div class="row"><span>Envío</span><b>${S.ent.modo === 'recojo' ? 'Gratis' : T.env ? money(T.env) : 'Gratis'}</b></div>${T.ahorro > 0 ? `<div class="row sv"><span>Ahorro</span><b>−${money(T.ahorro)}</b></div>` : ''}<div class="row tot"><span>Total</span><span>${money(T.tot)}</span></div>
  <div class="coupon"><input class="inp" placeholder="Cupón de descuento" aria-label="Cupón de descuento"><button class="btn o sm" onclick="toast('Cupón no válido (demo)')">Aplicar</button></div>
  <button class="btn lg w" style="margin-top:14px" ${T.ok ? '' : 'disabled'} onclick="pagar()">${ic('lock')}Pagar ${money(T.tot)}</button><p class="secure">${ic('shield')}Pago seguro · se emite ticket de compra</p></aside></div>`
}
function pagar() {
  const T = totals(); if (!T.ok) return;
  if (!S.user && (!$('#cn').value.trim() || !$('#ct').value.trim())) { toast('Completa nombre y celular'); ($('#cn').value.trim() ? $('#ct') : $('#cn')).focus(); return }
  if (!S.user && !/^9\d{8}$/.test($('#ct').value.replace(/\s/g, ''))) { toast('El celular debe tener 9 dígitos y empezar con 9'); $('#ct').focus(); return }
  const pay = $('input[name=pay]:checked').value;
  const go = () => {
    const o = { id: 'JH-' + String(10421 + S.orders.length), f: new Date().toLocaleString('es-PE'), cli: S.user?.nombre || $('#cn').value, tipo: tipo(), items: T.items.map(i => ({ n: i.p.n, q: i.q, u: i.u })), sub: T.sub, env: T.env, tot: T.tot, modo: S.ent.modo, zona: T.z.n, pay, est: ['ce', 'cr', 'tr'].includes(pay) ? 1 : 2 };
    S.orders.unshift(o); T.items.forEach(i => i.p.stock -= i.q); S.cart = {}; save(); hdr(); closeM(); location.hash = '#/ticket/' + o.id
  };
  window._go = go;
  if (pay === 'yape' || pay === 'plin') M(`<h2>Paga con ${pay === 'yape' ? 'Yape' : 'Plin'}</h2><p>Escanea el QR desde tu app o yapea al <b>9XX XXX XXX</b>.</p><div class="qr" role="img" aria-label="Código QR de pago (demo)"></div><p class="center" style="margin-bottom:14px">Monto: <b>${money(T.tot)}</b></p><button class="btn lg w" onclick="this.disabled=true;this.textContent='Validando pago…';setTimeout(_go,1200)">Ya pagué</button>`);
  else if (pay === 'mp') M(`<h2>Pago con tarjeta</h2><p>Formulario embebido (en la versión real: Payment Brick de Mercado Pago).</p><div class="f" style="margin-top:14px"><label>Número de tarjeta<input value="5031 7557 3453 0604" readonly></label><div class="two"><label>Vence<input value="11/30" readonly></label><label>CVV<input value="123" readonly></label></div></div><button class="btn lg w" style="margin-top:16px" onclick="this.disabled=true;this.textContent='Procesando…';setTimeout(_go,1400)">${ic('lock')}Pagar ${money(T.tot)}</button><p class="secure">${ic('info')}Datos de tarjeta de PRUEBA</p>`);
  else if (pay === 'tr') M(`<h2>Paga por transferencia</h2><p>Transfiere <b>${money(T.tot)}</b> y envíanos la constancia por WhatsApp. Tu pedido queda por confirmar hasta validar el pago.</p><div class="note y">${ic('bank')}<span>Cuenta BCP: XXX-XXXXXXXX-X-XX<br>CCI: XXX-XXX-XXXXXXXXXXXX-XX<br><small>Datos de ejemplo de la demo</small></span></div><button class="btn lg w" style="margin-top:16px" onclick="this.disabled=true;_go()">Ya transferí</button>`);
  else go()
}

// ---- ticket y pedidos
const EST = ['Recibido', 'Por confirmar pago', 'Pagado', 'Preparando', 'En camino', 'Entregado'];
const EST_I = ['receipt', 'clock', 'card', 'package', 'truck', 'home'];
const steps = o => `<ol class="tl" aria-label="Estado del pedido">${EST.map((e, i) => `<li class="${i <= o.est ? 'ok' : ''} ${i === o.est ? 'cur' : ''}" ${i === o.est ? 'aria-current="step"' : ''}><i>${ic(i <= o.est ? 'check' : EST_I[i])}</i>${e}</li>`).join('')}</ol>`;
const payName = v => ({ mp: 'Tarjeta', yape: 'Yape', plin: 'Plin', ce: 'Contra entrega', tr: 'Transferencia', cr: 'Crédito bodega' }[v] || v);
function ticket(id) {
  const o = S.orders.find(x => x.id === id); if (!o) return pedidos(id);
  app.innerHTML = `<div class="done-h"><span class="ico-c">${ic('check')}</span><h1>¡Gracias por tu compra!</h1><p>Pedido <b>${o.id}</b> · te avisaremos por WhatsApp cada cambio de estado.</p></div>${steps(o)}
  <div class="ticket"><div class="c"><img src="assets/logo.svg" alt="Super Mayorista Jhovin" width="150" height="126"><b>SUPER MAYORISTA JHOVIN</b><br>Todo para tu negocio<br>Nueva Cajamarca - San Martín</div><hr><div>TICKET DE COMPRA N° ${o.id}<br>Fecha: ${o.f}<br>Cliente: ${esc(o.cli)}${o.tipo === 'bodega' ? ' (BODEGA)' : ''}<br>Entrega: ${o.modo === 'recojo' ? 'Recojo en tienda' : 'Delivery - ' + esc(o.zona)}<br>Pago: ${payName(o.pay).toUpperCase()}</div><hr>
  ${o.items.map(i => `<div>${esc(i.n)}<div class="row"><span>${i.q} x ${i.u.toFixed(2)}</span><span>${(i.q * i.u).toFixed(2)}</span></div></div>`).join('')}<hr><div class="row"><span>SUBTOTAL</span><span>${o.sub.toFixed(2)}</span></div><div class="row"><span>ENVÍO</span><span>${o.env.toFixed(2)}</span></div><div class="row"><b>TOTAL S/</b><b>${o.tot.toFixed(2)}</b></div><hr><div class="c" style="font-size:11px">Documento interno, no es comprobante tributario.<br>Solicite su boleta o factura en tienda.</div></div>
  <div class="tk-act"><button class="btn o" onclick="print()">${ic('printer')}Imprimir / PDF</button><a class="btn o" href="#/pedidos">${ic('package')}Mis pedidos</a><a class="btn" href="#/">Seguir comprando</a></div>`
}
function pedidos(miss) {
  app.innerHTML = `${crumbs('Mis pedidos')}<div class="ahead"><h1>Mis pedidos</h1></div>
  <section class="box2"><form class="track" onsubmit="event.preventDefault();location.hash='#/ticket/'+$('#tk').value.trim().toUpperCase()"><label class="f" style="display:grid;gap:6px;font-weight:700;font-size:14px">Seguir un pedido<input id="tk" class="inp" placeholder="N° de pedido, ej. JH-10421" required></label><button class="btn lg">${ic('search')}Buscar</button></form>${miss ? `<div class="note w" style="margin-top:12px">${ic('alert')}<span>No encontramos el pedido ${esc(miss)} en este dispositivo.</span></div>` : ''}</section>
  ${S.orders.length ? S.orders.map(o => `<article class="ocard"><div class="oh"><b>${o.id}</b><span class="st ${o.est >= 5 ? 'ok' : o.est >= 2 ? 'ok' : 'w'}">${EST[o.est]}</span><span class="muted" style="font-size:13px">${o.f}</span><span class="tot">${money(o.tot)}</span></div>${steps(o)}<div class="of"><span>${o.items.length} productos · ${o.modo === 'recojo' ? 'Recojo en tienda' : 'Delivery ' + esc(o.zona)} · ${payName(o.pay)}</span><a class="btn o sm" href="#/ticket/${o.id}">${ic('receipt')}Ver ticket</a>${S.user?.tipo === 'bodega' ? `<button class="btn sm" onclick="recompra('${o.id}')">${ic('sync')}Volver a pedir</button>` : ''}</div></article>`).join('')
      : `<div class="empty-st"><span class="ico-c">${ic('package')}</span><h2>Aún no tienes pedidos</h2><p class="muted" style="margin-bottom:16px">Cuando compres, verás aquí el estado de cada pedido.</p><a class="btn" href="#/ofertas">Ver ofertas</a></div>`}`
}
function recompra(id) {
  const o = S.orders.find(x => x.id === id); let corto = 0;
  o.items.forEach(i => { const p = PRODUCTS.find(x => x.n === i.n), want = i.q + (p ? S.cart[p.id] || 0 : 0), q = p ? Math.min(p.stock, want) : 0; if (q < want) corto++; if (q) S.cart[p.id] = q });
  save(); hdr(); openCart(); toast(corto ? `Repetido con stock limitado en ${corto} producto${corto > 1 ? 's' : ''}` : 'Pedido repetido en el carrito')
}

// ---- bodega y envíos
function bodega() {
  app.innerHTML = `<section class="phero"><div><span class="eyebrow">${ic('store')}Cuenta mayorista</span><h1>Compra a precio <em>mayorista</em> para tu bodega</h1><p>Escalas por volumen en todo el catálogo, crédito para clientes frecuentes y reparto programado. Pedido mínimo S/500.</p></div><div class="stats"><span><b>-19%</b><small>vs precio público</small></span><span><b>24–48 h</b><small>aprobación</small></span></div></section>
  <div class="co" style="margin-top:20px"><section class="box2"><h2>Solicita tu cuenta de bodega</h2>
  <form class="f" onsubmit="event.preventDefault();solicitar(this)"><div class="two"><label>Nombre del negocio<input name="neg" required autocomplete="organization"></label><label>RUC<input name="ruc" required pattern="(10|20)\\d{9}" title="11 dígitos, inicia con 10 o 20" inputmode="numeric" maxlength="11"><small>11 dígitos, empieza con 10 o 20</small></label>
  <label>DNI del titular<input name="dni" required pattern="\\d{8}" title="8 dígitos" inputmode="numeric" maxlength="8"></label><label>Celular (WhatsApp)<input name="tel" required pattern="9\\d{8}" title="9 dígitos, empieza con 9" inputmode="tel" maxlength="9"></label></div>
  <label>Dirección del negocio<input name="dir" required autocomplete="street-address"></label><div class="two"><label>Zona<select name="zona">${S.zonas.map(z => `<option value="${z.id}">${esc(z.n)}</option>`).join('')}</select></label>
  <label>Tipo de negocio<select><option>Bodega</option><option>Minimarket</option><option>Restaurante</option><option>Distribuidor</option></select></label></div>
  <label><span>Foto del local o de la licencia <small>(opcional)</small></span><input type="file" accept="image/*"></label><label class="chk"><input type="checkbox" required>Acepto los términos y la política de privacidad</label><button class="btn lg">${ic('send')}Enviar solicitud</button></form></section>
  <aside><section class="box2"><h2>¿Cómo funciona?</h2><ol class="steps-v"><li><i>1</i><span><b>Llenas el formulario</b>Con tu RUC y datos del local.</span></li><li><i>2</i><span><b>Revisamos tus datos</b>En 24 a 48 horas.</span></li><li><i>3</i><span><b>Te avisamos por WhatsApp</b>Cuando tu cuenta esté aprobada.</span></li><li><i>4</i><span><b>Compras con precio de bodega</b>Ingresas y ves tus precios.</span></li></ol></section>
  <section class="box2"><h2>Beneficios</h2><ul class="checks"><li>${ic('checkc')}Hasta 19% menos que el precio público</li><li>${ic('checkc')}Volver a pedir en 1 clic</li><li>${ic('checkc')}Crédito a 7 días (previa evaluación)</li><li>${ic('checkc')}Reparto hasta Rioja</li></ul></section></aside></div>`
}
function solicitar(f) {
  const d = Object.fromEntries(new FormData(f)); S.sols.unshift({ id: 'S-' + String(S.sols.length + 1).padStart(3, '0'), ...d, est: 'pendiente', f: new Date().toISOString().slice(0, 10) }); save();
  app.innerHTML = `<div class="done-h"><span class="ico-c">${ic('send')}</span><h1>¡Solicitud enviada!</h1><p>Revisaremos tus datos y te avisaremos por WhatsApp en 24 a 48 horas.</p><p class="muted" style="margin:14px 0 18px">Demo: entra como administrador para aprobarla en el panel.</p><a class="btn lg" href="#/admin/bodegas">Ver en el panel</a></div>`
}
function envios() {
  app.innerHTML = `${crumbs('Zonas y tarifas')}<div class="ahead"><h1>Zonas y tarifas de envío</h1></div>
  <div class="info3"><div class="ic3"><span class="ico-c">${ic('truck')}</span><span><b>Gratis desde S/300</b><small>En el radio urbano de Nueva Cajamarca.</small></span></div><div class="ic3"><span class="ico-c">${ic('store')}</span><span><b>Recojo en tienda gratis</b><small>Listo en 2 horas aprox.</small></span></div><div class="ic3"><span class="ico-c">${ic('map')}</span><span><b>Hasta Rioja</b><small>Bodegas: pedido mínimo S/500.</small></span></div></div>
  <div class="tblw"><table class="t"><thead><tr><th>Zona</th><th>Distancia aprox.</th><th class="num">Costo</th></tr></thead><tbody>${S.zonas.map(z => `<tr><td><b>${esc(z.n)}</b></td><td>${z.km ? z.km + ' km' : 'Urbano'}</td><td class="num"><b>${money(z.costo)}</b>${z.gratis ? `<br><span class="pill ok">Gratis desde S/${z.gratis}</span>` : ''}</td></tr>`).join('')}</tbody></table></div>
  <p class="muted" style="margin-top:12px;font-size:14px">No llegamos más allá de Rioja. Las tarifas se confirman al despachar.</p>`
}

// ---- panel del negocio (demo)
function barChart(v, labels) {
  const W = innerWidth < 700 ? 360 : 640, H = 240, L = 46, B = 28, T = 16, max = 3000, bw = (W - L) / v.length, y = x => T + (H - T - B) * (1 - x / max);
  const grid = [0, 1000, 2000, 3000].map(g => `<line class="grid-l" x1="${L}" x2="${W}" y1="${y(g)}" y2="${y(g)}"/><text class="ax" x="${L - 8}" y="${y(g) + 4}" text-anchor="end">${g ? 'S/' + g / 1000 + 'k' : '0'}</text>`).join('');
  const peak = v.indexOf(Math.max(...v));
  const bars = v.map((x, i) => {
    const bx = L + i * bw + bw * .22, w = bw * .56, top = y(x), h = y(0) - top, r = 4;
    return `<g class="b" tabindex="0" role="img" aria-label="${labels[i]}: ${money(x)}"><title>${labels[i]}: ${money(x)}</title><rect class="hit" x="${L + i * bw}" y="${T}" width="${bw}" height="${H - T - B}"/><path class="bar" d="M${bx} ${y(0)}V${top + r}q0 -${r} ${r} -${r}h${w - 2 * r}q${r} 0 ${r} ${r}V${y(0)}Z"/>${i === v.length - 1 || (i === peak && (W > 400 || peak < v.length - 2)) ? `<text class="val" x="${bx + w / 2}" y="${top - 6}" text-anchor="middle">S/ ${x.toLocaleString('es-PE')}</text>` : ''}<text class="ax" x="${bx + w / 2}" y="${H - 8}" text-anchor="middle">${labels[i]}</text></g>`
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="Ventas web de los últimos 7 días">${grid}${bars}</svg>`
}
function admin(tab = 'resumen') {
  if (S.user?.tipo !== 'admin') { login('admin'); return }
  const tabs = [['resumen', 'chart', 'Resumen'], ['pedidos', 'package', 'Pedidos'], ['bodegas', 'store', 'Bodegas'], ['productos', 'tag', 'Productos y precios'], ['zonas', 'truck', 'Zonas de envío'], ['sync', 'sync', 'SiempreSoft'], ['marketing', 'mega', 'Banners y ofertas']];
  if (!tabs.some(t => t[0] === tab)) tab = 'resumen';
  const pend = S.sols.filter(s => s.est === 'pendiente').length;
  const kpi = (i, l, v, s, up) => `<div class="kpi"><div class="kh">${l}<span>${ic(i)}</span></div><b>${v}</b><small class="${up ? 'up' : ''}">${up ? ic('trend') : ''}${s}</small></div>`;
  let h = '';
  if (tab === 'resumen') {
    const web = S.orders.reduce((a, o) => a + o.tot, 0), v = [820, 1240, 960, 1530, 2100, 2680, 1900 + Math.round(web)];
    const labels = v.map((_, i) => { const x = new Date(); x.setDate(x.getDate() - 6 + i); return i === 6 ? 'Hoy' : x.toLocaleDateString('es-PE', { weekday: 'short' }).replace('.', '').replace(/^./, c => c.toUpperCase()) });
    const cats = [['Arroz y azúcar', 4820], ['Cervezas y licores', 3960], ['Aceites', 2710], ['Gaseosas', 2240], ['Limpieza', 1890]];
    h = `<div class="kpis">${kpi('cash', 'Ventas web hoy', money(1900 + web), '18% vs ayer', 1)}${kpi('receipt', 'Pedidos hoy', 23 + S.orders.length, '5 por preparar')}${kpi('cart', 'Ticket promedio', 'S/ 96.40', '6% vs semana pasada', 1)}${kpi('store', 'Bodegas activas', 41 + S.sols.filter(s => s.est === 'aprobada').length, `${pend} por aprobar`)}</div>
    <div class="charts"><section class="box2 chart" style="margin:0"><h2>Ventas web · últimos 7 días</h2><p class="sub">Soles por día, incluye pedidos de esta demo</p>${barChart(v, labels)}<div class="legend" style="margin-top:10px;font-weight:600;color:var(--mut)"><span>Total 7 días: <b style="color:var(--ink)">${money(v.reduce((a, b) => a + b, 0))}</b></span><span>Promedio diario: <b style="color:var(--ink)">${money(v.reduce((a, b) => a + b, 0) / 7)}</b></span><span>Mejor día: <b style="color:var(--ink)">${labels[v.indexOf(Math.max(...v))]}</b></span></div></section>
    <section class="box2 chart" style="margin:0"><h2>Ventas por tipo de cliente</h2><p class="sub">Participación del mes</p><div class="stack" role="img" aria-label="Bodegas 62%, público 38%"><i style="width:62%;background:var(--c1)"></i><i style="width:38%;background:var(--c2)"></i></div><div class="legend"><span><i style="background:var(--c1)"></i>Bodegas 62%</span><span><i style="background:var(--c2)"></i>Público 38%</span></div>
    <h2 style="margin-top:22px">Categorías más vendidas</h2><p class="sub">Soles del mes</p><div class="hbars">${cats.map(([n, x]) => `<div title="${n}: ${money(x)}"><span>${n}</span><em style="width:${x / cats[0][1] * 100}%"></em><span>S/ ${x.toLocaleString('es-PE')}</span></div>`).join('')}</div></section></div>
    <div class="kpis" style="margin-top:16px">${kpi('alert', 'Productos agotados', PRODUCTS.filter(p => !p.stock).length, 'Reponer desde caja')}${kpi('cart', 'Carritos abandonados', 7, 'Recordar por WhatsApp')}${kpi('users', 'Clientes nuevos', 12, 'Esta semana', 1)}${kpi('truck', 'Entregas a tiempo', '96%', 'Últimos 30 días', 1)}</div>`
  }
  if (tab === 'pedidos') h = `<div class="tblw"><table class="t"><thead><tr><th>Pedido</th><th>Cliente</th><th>Entrega</th><th class="num">Total</th><th>Estado</th></tr></thead><tbody>${[...S.orders, { id: 'JH-10418', cli: 'Bodega Doña Rosa', tipo: 'bodega', modo: 'delivery', zona: 'Nueva Cajamarca', tot: 812.4, est: 3 }, { id: 'JH-10417', cli: 'Carlos Ruiz', tipo: 'publico', modo: 'recojo', zona: '', tot: 96.5, est: 5 }].map((o, k) => `<tr><td><b>${o.id}</b></td><td>${esc(o.cli)}${o.tipo === 'bodega' ? ' <span class="pill k">Bodega</span>' : ''}</td><td>${o.modo === 'recojo' ? 'Recojo' : esc(o.zona)}</td><td class="num"><b>${money(o.tot)}</b></td><td><select aria-label="Estado de ${o.id}" onchange="${k < S.orders.length ? `S.orders[${k}].est=+this.value;save();` : ''}toast('Cliente notificado por WhatsApp')">${EST.map((e, i) => `<option value="${i}" ${i === o.est ? 'selected' : ''}>${e}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>`;
  if (tab === 'bodegas') h = `<div class="tblw"><table class="t"><thead><tr><th>Negocio</th><th>RUC / DNI</th><th>Zona</th><th>Fecha</th><th>Estado</th><th></th></tr></thead><tbody>${S.sols.map((s, i) => `<tr><td><b>${esc(s.neg)}</b><br><small class="muted">${esc(s.dir)} · ${esc(s.tel)}</small></td><td>${esc(s.ruc)}<br><small class="muted">${esc(s.dni)}</small></td><td>${esc((S.zonas.find(z => z.id === s.zona) || {}).n || '')}</td><td>${s.f}</td><td><span class="st ${s.est === 'aprobada' ? 'ok' : s.est === 'rechazada' ? 'r' : 'w'}">${s.est[0].toUpperCase() + s.est.slice(1)}</span></td><td>${s.est === 'pendiente' ? `<div class="tb-act"><button class="btn sm" onclick="S.sols[${i}].est='aprobada';save();admin('bodegas');toast('Aprobada · aviso enviado por WhatsApp')">${ic('check')}Aprobar</button><button class="btn o sm" onclick="S.sols[${i}].est='rechazada';save();admin('bodegas')">Rechazar</button></div>` : ''}</td></tr>`).join('')}</tbody></table></div><p class="muted" style="margin-top:12px;font-size:14px">Validación automática de RUC con SUNAT (opcional en la versión final).</p>`;
  if (tab === 'productos') h = `<p class="muted" style="margin-bottom:12px;font-size:14px">Catálogo: ${PRODUCTS.length} en la demo · 3.000+ en producción desde SiempreSoft.</p><div class="tblw"><table class="t"><thead><tr><th>Producto</th><th class="num">Stock</th><th class="num">Público</th><th class="num">Bodega</th><th class="num">Bodega 48+</th><th>Web</th></tr></thead><tbody>${PRODUCTS.slice(0, 25).map(p => `<tr><td><b>${esc(p.n)}</b><br><small class="muted">${p.sku}</small></td><td class="num">${p.stock || '<span class="st r">0</span>'}</td><td class="num">${money(p.price)}</td><td class="num">${money(unit(p, 1, 'bodega'))}</td><td class="num">${money(unit(p, 48, 'bodega'))}</td><td><input type="checkbox" checked aria-label="Visible en web" style="width:20px;height:20px;accent-color:var(--brand)"></td></tr>`).join('')}</tbody></table></div><p class="muted" style="margin-top:12px;font-size:14px">Precios, escalas y stock se sincronizan desde la caja. Desde aquí solo se gestionan fotos, descripción y visibilidad web.</p>`;
  if (tab === 'zonas') h = `<div class="tblw"><table class="t"><thead><tr><th>Zona</th><th>Costo S/</th><th>Gratis desde S/</th></tr></thead><tbody>${S.zonas.map((z, i) => `<tr><td><b>${esc(z.n)}</b></td><td><input class="inp inp-s" type="number" step="0.5" min="0" value="${z.costo}" aria-label="Costo ${esc(z.n)}" onchange="S.zonas[${i}].costo=Math.max(0,+this.value||0);this.value=S.zonas[${i}].costo;save();hdr();toast('Tarifa actualizada')"></td><td><input class="inp inp-s" type="number" min="0" value="${z.gratis || ''}" placeholder="—" aria-label="Gratis desde, ${esc(z.n)}" onchange="S.zonas[${i}].gratis=Math.max(0,+this.value||0);this.value=S.zonas[${i}].gratis||'';save();toast('Actualizado')"></td></tr>`).join('')}</tbody></table></div><p class="muted" style="margin-top:12px;font-size:14px">Tarifas estimadas para la demo, se ajustan con el dueño. Opcional: cálculo por distancia con mapa.</p>`;
  if (tab === 'sync') h = `<div class="kpis">${kpi('zap', 'Estado', '<span style="color:var(--ok)">Conectado</span>', 'SiempreSoft ERP')}<div class="kpi"><div class="kh">Última sincronización<span>${ic('clock')}</span></div><b id="ls">hace 3 min</b><small>Automática cada 5 min</small></div>${kpi('db', 'Productos sincronizados', '3.214', 'Precios y stock')}${kpi('send', 'Pedidos web a caja', 23 + S.orders.length, 'Para boleta o factura')}</div>
    <section class="box2" style="margin-top:16px"><h2>Flujo de datos</h2><div class="flow"><div class="node"><span class="ico-c">${ic('db')}</span><b>SiempreSoft (caja)</b><small>Stock, precios, escalas por volumen y productos nuevos</small></div><div class="arr">${ic('sync')}cada 5 min</div><div class="node"><span class="ico-c">${ic('globe')}</span><b>Tienda web</b><small>Pedidos pagados, clientes y reservas de stock vuelven a caja</small></div></div>
    <button class="btn" onclick="syncNow()">${ic('sync')}Sincronizar ahora</button><div class="log" id="log">[08:00:02] Sync OK · 3.214 productos · 12 precios cambiados · 48 stocks actualizados\n[08:05:01] Sync OK · 0 cambios\n[08:10:03] Pedido JH-10418 enviado a caja ✔</div></section>`;
  if (tab === 'marketing') h = `<section class="box2"><h2>Banners de portada</h2><div class="bnl">${slides.map(s => `<div><img src="assets/hero/${s[0]}.webp" alt="" loading="lazy"><span><b>${s[2].replace(/<\/?em>/g, '')}</b><small>${s[1]}</small></span><button class="btn o sm">${ic('pencil')}Editar</button></div>`).join('')}</div><button class="btn sm" style="margin-top:14px">${ic('plus')}Nuevo banner</button></section>
    <section class="box2"><h2>Promociones</h2><p class="muted" style="margin-bottom:14px">${PRODUCTS.filter(p => p.oferta).length} productos en oferta · cupones · combos (2x1, lleva 3 paga 2) · precio especial por fecha.</p><button class="btn sm">${ic('plus')}Crear promoción</button></section>`;
  app.innerHTML = `<div class="ahead"><h1>Panel del negocio</h1><span class="pill k">DEMO</span></div><div class="adm"><nav class="adm-nav" aria-label="Secciones del panel">${tabs.map(([k, i, l]) => `<a href="#/admin/${k}" class="${k === tab ? 'on' : ''}" ${k === tab ? 'aria-current="page"' : ''}>${ic(i)}${l}${k === 'bodegas' && pend ? ` <span class="badge">${pend}</span>` : ''}</a>`).join('')}</nav><div>${h}</div></div>`
}
function syncNow() { const l = $('#log'); l.textContent += '\n[' + new Date().toLocaleTimeString('es-PE') + '] Conectando a SiempreSoft…'; setTimeout(() => { if (!l.isConnected) return; l.textContent += '\n[' + new Date().toLocaleTimeString('es-PE') + '] Sync OK · 3.214 productos · 3 precios cambiados · 17 stocks actualizados'; $('#ls').textContent = 'ahora'; l.scrollTop = 1e9 }, 1300) }

function posibilidades() {
  const I = [['sync', 'Sincronización con SiempreSoft', 'Stock, precios y escalas en tiempo real desde la caja. Los pedidos web llegan a caja para emitir boleta o factura.', 'Incluido'],
  ['card', 'Mercado Pago, Yape y Plin', 'Tarjetas con Mercado Pago, QR de Yape/Plin con validación, contra entrega y transferencia.', 'Incluido'],
  ['chat', 'WhatsApp automático', 'Confirmación de pedido, cambios de estado, aviso de aprobación de bodega y recordatorio de carrito abandonado.', 'Opcional'],
  ['bot', 'Bot de Telegram para el dueño', 'Alertas de pedidos nuevos, bodegas por aprobar y stock bajo en el celular del dueño.', 'Opcional'],
  ['phone', 'App instalable (PWA)', 'La web se instala como app en el celular, con ícono propio y notificaciones.', 'Opcional'],
  ['receipt', 'Facturación electrónica', 'Boleta o factura desde la web vía SiempreSoft o un proveedor OSE/PSE.', 'Fase 2'],
  ['book', 'Crédito para bodegas', 'Línea de crédito por bodega, saldo, vencimientos y bloqueo automático por mora.', 'Opcional'],
  ['bike', 'App del repartidor', 'Lista de entregas del día, ruta en mapa, foto de entrega y cobro contra entrega.', 'Fase 2'],
  ['map', 'Envío por distancia con mapa', 'El cliente marca su casa en el mapa y el costo se calcula por kilómetro.', 'Opcional'],
  ['award', 'Programa de puntos', 'Puntos por compra canjeables y niveles para bodegas frecuentes.', 'Fase 2'],
  ['chart', 'Reportes avanzados', 'Lo más vendido por zona, bodegas top, horarios pico y productos sin rotación.', 'Incluido'],
  ['building', 'Multi-sede', 'Si Jhovin abre otra tienda: stock y precios por sede desde el mismo panel.', 'Fase 2']];
  app.innerHTML = `<section class="phero"><div><span class="eyebrow">${ic('rocket')}Hoja de ruta</span><h1>Posibilidades e <em>integraciones</em></h1><p>Lo que puede crecer la plataforma. Se definirá con el dueño qué entra en la entrega y qué en fases siguientes.</p></div><div class="stats"><span><b>${I.filter(i => i[3] === 'Incluido').length}</b><small>incluidas</small></span><span><b>${I.filter(i => i[3] === 'Opcional').length}</b><small>opcionales</small></span><span><b>${I.filter(i => i[3] === 'Fase 2').length}</b><small>fase 2</small></span></div></section>
  <div class="ints" style="margin-top:20px">${I.map(i => `<article class="int"><div class="ih"><span class="sq">${ic(i[0])}</span><span class="st ${i[3] === 'Incluido' ? 'ok' : i[3] === 'Opcional' ? 'w' : ''}">${i[3]}</span></div><h2>${i[1]}</h2><p>${i[2]}</p></article>`).join('')}</div>`
}

// ---- router
function route(keep) {
  const [r, a0] = location.hash.slice(2).split('/'); let a = a0; try { if (a0) a = decodeURIComponent(a0) } catch { }
  rtAt = Date.now(); if (!keep) { scrollTo(0, 0); pv = 0; pq = 1; fOpen = undefined; mega(0) } clearInterval(slT);
  $$('#catnav a').forEach(x => x.classList.toggle('on', (r === 'c' && x.dataset.c === a) || (r === 'ofertas' && x.dataset.c === 'ofertas')));
  if (!keep && (r === 'c' || r === 'ofertas' || r === 'buscar')) F = { marcas: [], max: 0, ord: 'rel', oferta: false };
  if (r === 'c' && CAT[a]) listado(CAT[a].n, PRODUCTS.filter(p => p.c === a));
  else if (r === 'ofertas') listado('Ofertas de la semana', PRODUCTS.filter(p => p.oferta));
  else if (r === 'buscar') listado(a ? `Resultados para “${a}”` : 'Todos los productos', a ? find(a) : PRODUCTS.slice().sort((x, y) => y.stock - x.stock), 'Búsqueda');
  else if (r === 'p') pdp(a); else if (r === 'checkout') checkout(); else if (r === 'ticket') ticket(a); else if (r === 'pedidos') pedidos();
  else if (r === 'bodega') bodega(); else if (r === 'envios') envios(); else if (r === 'admin') admin(a || 'resumen'); else if (r === 'posibilidades') posibilidades();
  else home();
  if (!keep) $('#q').value = r === 'buscar' ? a || '' : '';
}
fillIcons();
addEventListener('hashchange', () => route()); hdr(); route();
try { if (!localStorage.getItem(KEY)) setTimeout(() => { save(); entrega() }, 600) } catch { }
const TEMAS = { jhovin: 'Clásico rojo', mayorista: 'Mayorista amarillo', noche: 'Oscuro' };
function cycleTheme() { const k = Object.keys(TEMAS); S.theme = k[(k.indexOf(S.theme) + 1) % k.length]; save(); hdr(); toast('Estilo: ' + TEMAS[S.theme]) }
