/* ============================================================
   SPRITES.JS — semua gambar pixel art dibuat dari kode (orisinal).
   Tidak ada file gambar eksternal, jadi tidak mungkin "gambar rusak".
   ============================================================ */
(function () {
  'use strict';
  const S = window.S = {};
  function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; }
  function R(x, col, a, b, w, h) { x.fillStyle = col; x.fillRect(a, b, w, h); }
  function D(x, col, cx, cy, r) { x.fillStyle = col; for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + 1) x.fillRect(cx + i, cy + j, 1, 1); }
  let sd = 12345; function rnd() { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }
  const ri = n => (rnd() * n) | 0;

  /* ---------- Ubin tanah ---------- */
  S.grass = [0, 1, 2].map(v => {
    const [c, x] = cv(16, 16); R(x, '#7cc653', 0, 0, 16, 16);
    for (let i = 0; i < 9; i++) R(x, rnd() < .5 ? '#6bb446' : '#92d862', ri(15), ri(15), rnd() < .3 ? 2 : 1, 1);
    if (v === 2) { R(x, '#5ea63c', 4, 8, 1, 2); R(x, '#5ea63c', 6, 7, 1, 3); R(x, '#5ea63c', 8, 8, 1, 2); }
    return c;
  });
  S.path = [0, 1].map(() => {
    const [c, x] = cv(16, 16); R(x, '#dcb97d', 0, 0, 16, 16);
    for (let i = 0; i < 8; i++) R(x, rnd() < .5 ? '#c9a469' : '#ecd3a1', ri(15), ri(15), rnd() < .4 ? 2 : 1, 1);
    return c;
  });
  S.field = [0, 1].map(v => {
    const [c, x] = cv(16, 16); R(x, v ? '#e9d9a6' : '#e1cf99', 0, 0, 16, 16);
    for (let i = 0; i < 4; i++) R(x, '#cdb97f', ri(15), ri(15), 1, 1);
    return c;
  });
  S.water = [0, 1].map(f => {
    const [c, x] = cv(16, 16); R(x, '#4aa8e0', 0, 0, 16, 16); R(x, '#3d97cf', 0, f ? 6 : 12, 16, 2);
    R(x, '#9bdcf8', 2 + f * 4, 3, 5, 1); R(x, '#9bdcf8', 9 - f * 4, 9, 5, 1); R(x, '#9bdcf8', 3 + f * 3, 14, 4, 1);
    return c;
  });
  function soil(wet) {
    const [c, x] = cv(16, 16); R(x, wet ? '#5b3a21' : '#8e5c34', 0, 0, 16, 16);
    R(x, wet ? '#43291a' : '#6e4420', 0, 0, 16, 1); R(x, wet ? '#43291a' : '#6e4420', 0, 15, 16, 1);
    R(x, wet ? '#43291a' : '#6e4420', 0, 0, 1, 16); R(x, wet ? '#43291a' : '#6e4420', 15, 0, 1, 16);
    for (const y of [4, 8, 12]) R(x, wet ? '#4a2e19' : '#74481f', 2, y, 12, 1);
    if (wet) { R(x, '#7aa7d1', 4, 5, 2, 1); R(x, '#7aa7d1', 10, 9, 2, 1); R(x, '#7aa7d1', 6, 13, 2, 1); }
    return c;
  }
  S.soil = soil(false); S.soilWet = soil(true);
  S.patch = (() => {
    const [c, x] = cv(16, 16); x.drawImage(S.grass[1], 0, 0); const k = '#b98a50';
    for (const [a, b] of [[1, 1], [12, 1], [1, 14], [12, 14]]) R(x, k, a, b, 3, 1);
    for (const [a, b] of [[1, 2], [14, 2], [1, 12], [14, 12]]) R(x, k, a, b, 1, 2);
    return c;
  })();
  S.bridgeOk = (() => {
    const [c, x] = cv(16, 16); R(x, '#c98d52', 0, 1, 16, 14);
    for (const a of [3, 7, 11, 15]) R(x, '#a8702f', a, 1, 1, 14);
    R(x, '#7a4a26', 0, 0, 16, 2); R(x, '#7a4a26', 0, 14, 16, 2); R(x, '#e0aa70', 0, 2, 16, 1); return c;
  })();
  S.bridgeBroken = [0, 1, 2].map(i => {
    const [c, x] = cv(16, 16);
    if (i === 0) { R(x, '#c98d52', 0, 2, 9, 12); R(x, '#a8702f', 3, 2, 1, 12); R(x, '#a8702f', 7, 2, 1, 12); R(x, '#7a4a26', 0, 1, 9, 2); R(x, '#7a4a26', 0, 13, 9, 2); R(x, '#c98d52', 10, 4, 3, 3); }
    if (i === 1) { R(x, '#c98d52', 3, 3, 6, 3); R(x, '#a8702f', 3, 3, 6, 1); R(x, '#c98d52', 8, 10, 6, 3); R(x, '#a8702f', 8, 10, 6, 1); }
    if (i === 2) { R(x, '#c98d52', 7, 2, 9, 12); R(x, '#a8702f', 8, 2, 1, 12); R(x, '#a8702f', 12, 2, 1, 12); R(x, '#7a4a26', 7, 1, 9, 2); R(x, '#7a4a26', 7, 13, 9, 2); R(x, '#c98d52', 3, 8, 3, 3); }
    return c;
  });

  /* ---------- Tanaman (3 tahap: biji, tunas, siap panen) ---------- */
  const LEAF = { carrot: '#4fb24a', tomato: '#2f9e4f', corn: '#86c443', strawberry: '#2e9e4f', sunflower: '#2f9a3f' };
  S.plant = {};
  for (const k of ['carrot', 'tomato', 'corn', 'strawberry', 'sunflower']) {
    const st = [];
    { const [c, x] = cv(16, 16); R(x, '#6a4020', 5, 10, 6, 3); R(x, '#a06a3a', 6, 9, 4, 1); R(x, '#efe0a8', 7, 10, 2, 1); st.push(c); }
    {
      const [c, x] = cv(16, 16); const L = LEAF[k]; R(x, L, 7, 5, 2, 8); R(x, L, 4, 6, 3, 2); R(x, L, 9, 5, 3, 2); R(x, '#6a4020', 5, 12, 6, 2);
      if (k === 'sunflower') R(x, '#ffd23f', 7, 3, 2, 2);
      if (k === 'tomato') R(x, '#ffee58', 7, 3, 2, 2);
      if (k === 'strawberry') R(x, '#ffffff', 7, 3, 2, 2);
      if (k === 'carrot') { R(x, L, 6, 3, 1, 3); R(x, L, 9, 3, 1, 3); }
      if (k === 'corn') { R(x, L, 6, 1, 1, 5); R(x, L, 9, 2, 1, 4); }
      st.push(c);
    }
    {
      const [c, x] = cv(16, 16);
      if (k === 'carrot') { R(x, '#3fa34d', 5, 2, 2, 5); R(x, '#3fa34d', 7, 1, 2, 6); R(x, '#3fa34d', 9, 2, 2, 5); R(x, '#f28c28', 5, 7, 6, 3); R(x, '#e2761b', 6, 10, 4, 2); R(x, '#ffb25b', 6, 7, 2, 1); }
      if (k === 'tomato') { D(x, '#2e8b3e', 8, 8, 5); D(x, '#e53935', 5, 9, 2); D(x, '#e53935', 11, 8, 2); D(x, '#e53935', 8, 5, 2); R(x, '#ff9e9a', 4, 8, 1, 1); R(x, '#ff9e9a', 10, 7, 1, 1); R(x, '#ff9e9a', 7, 4, 1, 1); }
      if (k === 'corn') { R(x, '#4a9e3c', 7, 1, 2, 13); R(x, '#6cbf4f', 3, 4, 4, 2); R(x, '#6cbf4f', 9, 8, 4, 2); R(x, '#f7d84a', 9, 3, 3, 5); R(x, '#8bc34a', 9, 2, 3, 1); R(x, '#d4aa22', 10, 4, 1, 1); R(x, '#d4aa22', 10, 6, 1, 1); }
      if (k === 'strawberry') { D(x, '#2e9e4f', 8, 9, 5); R(x, '#e63950', 4, 9, 3, 3); R(x, '#e63950', 9, 8, 3, 3); R(x, '#e63950', 7, 11, 3, 3); R(x, '#ffe08a', 5, 10, 1, 1); R(x, '#ffe08a', 10, 9, 1, 1); R(x, '#ffe08a', 8, 12, 1, 1); }
      if (k === 'sunflower') { R(x, '#3e8e41', 7, 7, 2, 7); R(x, '#58b95a', 4, 10, 3, 2); R(x, '#58b95a', 9, 11, 3, 2); D(x, '#ffd23f', 8, 4, 4); D(x, '#6b3f1d', 8, 4, 2); }
      st.push(c);
    }
    S.plant[k] = st;
  }

  /* ---------- Ikon barang & UI (16x16) ---------- */
  S.icon = {};
  function ic(name, fn) { const [c, x] = cv(16, 16); fn(x); S.icon[name] = c; }
  ic('carrot', x => { for (let r = 0; r < 10; r++) { const w = Math.max(1, 6 - Math.floor(r * .6)); R(x, '#f28c28', 8 - Math.floor(w / 2), 5 + r, w, 1); } R(x, '#d9701a', 6, 8, 2, 1); R(x, '#d9701a', 8, 11, 1, 1); R(x, '#3fa34d', 6, 1, 1, 4); R(x, '#3fa34d', 8, 0, 1, 5); R(x, '#3fa34d', 10, 1, 1, 4); });
  ic('tomato', x => { D(x, '#e53935', 8, 9, 6); R(x, '#ff9e9a', 4, 6, 2, 2); R(x, '#2e8b3e', 5, 3, 6, 2); R(x, '#2e8b3e', 7, 1, 2, 3); });
  ic('corn', x => { R(x, '#f7d84a', 6, 2, 5, 11); for (let j = 3; j < 12; j += 2) { R(x, '#d4aa22', 7, j, 1, 1); R(x, '#d4aa22', 9, j, 1, 1); } R(x, '#5fbf4f', 4, 6, 3, 8); R(x, '#5fbf4f', 11, 6, 2, 7); R(x, '#4aa03d', 5, 12, 6, 3); });
  ic('strawberry', x => { R(x, '#e63950', 3, 5, 10, 4); R(x, '#e63950', 4, 9, 8, 2); R(x, '#e63950', 6, 11, 4, 2); R(x, '#e63950', 7, 13, 2, 1); R(x, '#2e9e4f', 4, 3, 8, 2); R(x, '#2e9e4f', 7, 1, 2, 2); R(x, '#ffe08a', 5, 7, 1, 1); R(x, '#ffe08a', 9, 6, 1, 1); R(x, '#ffe08a', 7, 9, 1, 1); R(x, '#ffe08a', 10, 9, 1, 1); });
  ic('sunflower', x => { D(x, '#ffd23f', 8, 8, 7); D(x, '#f0a800', 8, 8, 5); D(x, '#6b3f1d', 8, 8, 3); R(x, '#8a5a30', 7, 7, 1, 1); R(x, '#8a5a30', 9, 9, 1, 1); });
  ic('wood', x => { R(x, '#a0662f', 2, 5, 11, 7); R(x, '#7a4a22', 2, 5, 11, 1); R(x, '#7a4a22', 2, 11, 11, 1); R(x, '#7a4a22', 5, 7, 5, 1); D(x, '#d9a566', 12, 8, 3); D(x, '#b07a3c', 12, 8, 1); });
  ic('stone', x => { R(x, '#9aa0a6', 3, 7, 10, 6); R(x, '#9aa0a6', 4, 5, 8, 2); R(x, '#9aa0a6', 5, 13, 6, 1); R(x, '#c9ced3', 5, 6, 3, 2); R(x, '#6f757b', 9, 11, 4, 2); });
  ic('leaf', x => { D(x, '#52b24c', 8, 8, 5); R(x, '#6ccb66', 6, 5, 3, 2); for (let i = 0; i < 10; i++) R(x, '#2f7d32', 3 + i, 12 - i, 1, 1); });
  ic('star', x => { D(x, '#ffd23f', 8, 8, 5); R(x, '#ffd23f', 7, 0, 2, 16); R(x, '#ffd23f', 0, 7, 16, 2); R(x, '#fff2a8', 6, 6, 2, 2); });
  ic('stall', x => { for (let i = 0; i < 4; i++) R(x, i % 2 ? '#ffffff' : '#e5484d', i * 4, 2, 4, 5); R(x, '#9c6a35', 1, 7, 14, 7); R(x, '#7b5129', 1, 7, 14, 1); });
  ic('bridge', x => { R(x, '#c98d52', 0, 6, 16, 6); R(x, '#a8702f', 4, 6, 1, 6); R(x, '#a8702f', 9, 6, 1, 6); R(x, '#7a4a26', 0, 5, 16, 1); R(x, '#7a4a26', 0, 12, 16, 1); R(x, '#4aa8e0', 0, 13, 16, 3); });
  ic('speaker', x => { R(x, '#3f2713', 2, 6, 3, 4); R(x, '#3f2713', 5, 5, 2, 6); R(x, '#3f2713', 7, 3, 1, 10); R(x, '#3f2713', 10, 5, 1, 6); R(x, '#3f2713', 12, 3, 1, 10); });
  ic('note', x => { D(x, '#3f2713', 5, 12, 2); R(x, '#3f2713', 6, 3, 1, 9); R(x, '#3f2713', 6, 3, 6, 2); R(x, '#3f2713', 11, 3, 1, 7); D(x, '#3f2713', 10, 10, 2); });
  ic('mute', x => { R(x, '#3f2713', 2, 6, 3, 4); R(x, '#3f2713', 5, 5, 2, 6); R(x, '#3f2713', 7, 3, 1, 10); for (let i = 0; i < 6; i++) { R(x, '#d63031', 9 + i, 5 + i, 1, 1); R(x, '#d63031', 14 - i, 5 + i, 1, 1); } });
  ic('bulb', x => { D(x, '#ffd23f', 8, 6, 5); R(x, '#fff2a8', 6, 4, 2, 2); R(x, '#8d8f94', 6, 11, 4, 3); R(x, '#5f6166', 6, 13, 4, 1); });
  ic('moon', x => { D(x, '#ffe27a', 8, 8, 6); x.globalCompositeOperation = 'destination-out'; D(x, '#000', 11, 6, 5); x.globalCompositeOperation = 'source-over'; });
  ic('gear', x => { for (const [a, b] of [[7, 0], [7, 13], [0, 7], [13, 7], [2, 2], [11, 2], [2, 11], [11, 11]]) R(x, '#3f2713', a, b, 3, 3); D(x, '#3f2713', 8, 8, 5); x.globalCompositeOperation = 'destination-out'; D(x, '#000', 8, 8, 2); x.globalCompositeOperation = 'source-over'; });
  ic('paw', x => { D(x, '#fff', 8, 11, 4); D(x, '#fff', 3, 7, 2); D(x, '#fff', 6, 3, 2); D(x, '#fff', 10, 3, 2); D(x, '#fff', 13, 7, 2); });
  ic('close', x => { for (let i = 0; i < 12; i++) { R(x, '#fff', 2 + i, 2 + i, 2, 2); R(x, '#fff', 12 - i, 2 + i, 2, 2); } });
  ic('up', x => { for (let r = 0; r < 7; r++) R(x, '#fff', 7 - r, 4 + r, 1 + 2 * r, 1); });
  ic('down', x => { for (let r = 0; r < 7; r++) R(x, '#fff', 7 - r, 11 - r, 1 + 2 * r, 1); });
  ic('left', x => { for (let r = 0; r < 7; r++) R(x, '#fff', 4 + r, 7 - r, 1, 1 + 2 * r); });
  ic('right', x => { for (let r = 0; r < 7; r++) R(x, '#fff', 11 - r, 7 - r, 1, 1 + 2 * r); });
  ic('p0', x => { D(x, '#ffb347', 8, 11, 4); R(x, '#8a5a30', 0, 12, 16, 4); R(x, '#ffb347', 1, 4, 2, 1); R(x, '#ffb347', 13, 4, 2, 1); });
  ic('p1', x => { D(x, '#ffd23f', 8, 8, 4); for (const [a, b, w, h] of [[7, 0, 2, 3], [7, 13, 2, 3], [0, 7, 3, 2], [13, 7, 3, 2]]) R(x, '#ffd23f', a, b, w, h); });
  ic('p2', x => { D(x, '#ff7043', 8, 11, 4); R(x, '#5d4a7a', 0, 12, 16, 4); R(x, '#ff7043', 1, 5, 2, 1); R(x, '#ff7043', 13, 5, 2, 1); });
  S.drop = (() => { const [c, x] = cv(8, 10); R(x, '#3fa0ff', 4, 0, 1, 1); R(x, '#3fa0ff', 3, 1, 3, 1); R(x, '#3fa0ff', 3, 2, 3, 2); D(x, '#3fa0ff', 4, 6, 3); R(x, '#bfe3ff', 2, 5, 1, 2); return c; })();
  S.arrow = (() => {
    const [c, x] = cv(12, 12); R(x, '#3f2713', 3, 0, 6, 6); R(x, '#ffd23f', 4, 0, 4, 5);
    for (let r = 0; r < 6; r++) R(x, '#3f2713', r, 6 + r, 12 - 2 * r, 1);
    for (let r = 0; r < 5; r++) R(x, '#ffd23f', r + 1, 6 + r, 10 - 2 * r, 1); return c;
  })();

  /* ---------- Dunia: pohon, batu, semak, bunga ---------- */
  S.tree = (() => {
    const [c, x] = cv(16, 24); R(x, '#7a4a2a', 6, 15, 4, 9); R(x, '#5a3419', 6, 15, 1, 9);
    D(x, '#2e7a35', 8, 10, 8); D(x, '#3f9b3f', 7, 9, 7); D(x, '#58b84f', 6, 7, 4); R(x, '#8bdc72', 5, 5, 2, 1); R(x, '#8bdc72', 9, 8, 1, 1); R(x, '#2e7a35', 10, 12, 3, 1); return c;
  })();
  S.stump = (() => { const [c, x] = cv(16, 16); R(x, '#5a3419', 4, 8, 8, 6); R(x, '#7a4a2a', 4, 8, 8, 5); D(x, '#d9a566', 8, 8, 3); D(x, '#b07a3c', 8, 8, 1); return c; })();
  S.rock = (() => { const [c, x] = cv(16, 16); R(x, '#8c8f94', 3, 8, 10, 6); R(x, '#8c8f94', 4, 6, 8, 2); R(x, '#8c8f94', 5, 14, 6, 1); R(x, '#b9bcc1', 5, 7, 3, 2); R(x, '#62666b', 9, 12, 4, 2); return c; })();
  S.pebble = (() => { const [c, x] = cv(16, 16); R(x, '#8c8f94', 6, 11, 5, 3); R(x, '#b9bcc1', 7, 11, 2, 1); return c; })();
  S.bush = (() => { const [c, x] = cv(16, 16); D(x, '#2f8f3a', 8, 9, 6); D(x, '#46b04a', 7, 8, 5); D(x, '#6fd070', 5, 6, 2); R(x, '#e8506b', 9, 9, 2, 2); R(x, '#e8506b', 5, 11, 2, 2); return c; })();
  S.bushBare = (() => { const [c, x] = cv(16, 16); D(x, '#7aa65a', 8, 10, 4); D(x, '#8fbb6a', 7, 9, 3); return c; })();
  S.flowers = [['#ff7eb6', '#ffd1e6'], ['#ffffff', '#fff5a8'], ['#ffd23f', '#ffffff'], ['#b57bff', '#e5d1ff']].map(cols => [0, 1].map(f => {
    const [c, x] = cv(16, 16); R(x, '#3e9b3e', 7, 9 + f, 1, 4); R(x, '#3e9b3e', 5, 11, 2, 1);
    R(x, cols[0], 6 + f, 6 + f, 3, 3); R(x, cols[1], 7 + f, 7 + f, 1, 1); return c;
  }));

  /* ---------- Bangunan ---------- */
  function building(wt, ht, o) {
    const Wd = wt * 16, Hd = ht * 16, [c, x] = cv(Wd, Hd); const rh = Math.round(Hd * .55);
    R(x, o.wall, 0, rh - 4, Wd, Hd - rh + 4);
    for (let y = rh; y < Hd; y += 4) R(x, o.wallDk, 0, y, Wd, 1);
    R(x, o.wallDk, 0, Hd - 2, Wd, 2);
    if (o.chimney) { R(x, '#8d6e63', Wd - 20, 2, 7, rh - 4); R(x, '#6d4c41', Wd - 21, 2, 9, 2); }
    for (let r = 0; r < rh - 3; r++) { const ins = Math.floor((rh - 4 - r) * .45); R(x, (r % 5 === 4) ? o.roofDk : o.roof, ins, r, Wd - ins * 2, 1); }
    R(x, o.roofDk, 0, rh - 3, Wd, 3);
    const dw = 12, dx = ((Wd - dw) / 2) | 0;
    R(x, '#5b3a22', dx - 1, Hd - 17, dw + 2, 17); R(x, '#8a5a30', dx, Hd - 16, dw, 16); R(x, '#f4d35e', dx + dw - 4, Hd - 8, 2, 2);
    for (const wx of [Math.round(Wd * .16), Math.round(Wd * .72)]) { R(x, '#5b3a22', wx - 1, rh + 3, 12, 10); R(x, '#bfe6ff', wx, rh + 4, 10, 8); R(x, '#5b3a22', wx + 4, rh + 4, 1, 8); R(x, '#5b3a22', wx, rh + 7, 10, 1); }
    if (o.sign) { R(x, '#f4e1a1', dx - 2, Hd - 27, 16, 8); R(x, '#5b3a22', dx + 5, Hd - 26, 1, 6); R(x, '#5b3a22', dx + 3, Hd - 26, 5, 2); }
    return c;
  }
  S.house = building(5, 4, { wall: '#e8c48a', wallDk: '#d3a96d', roof: '#c8553d', roofDk: '#9e3f2c', chimney: true });
  S.workshop = building(5, 4, { wall: '#c9b79a', wallDk: '#b09e80', roof: '#4f6d8c', roofDk: '#3c556f', sign: true });
  function stall(open) {
    const [c, x] = cv(48, 32); R(x, '#9c6a35', 2, 16, 44, 16); R(x, '#7b5129', 2, 16, 44, 2); R(x, '#7b5129', 2, 30, 44, 2);
    if (open) { ['#e53935', '#f28c28', '#f7d84a', '#e63950', '#7ac74f'].forEach((col, i) => D(x, col, 7 + i * 8, 23, 3)); }
    else { R(x, '#e9c46a', 14, 20, 20, 8); R(x, '#c0392b', 18, 22, 12, 4); }
    R(x, '#6e4521', 2, 8, 2, 24); R(x, '#6e4521', 44, 8, 2, 24);
    for (let i = 0; i < 6; i++) { const col = open ? (i % 2 ? '#ffffff' : '#e5484d') : (i % 2 ? '#9aa3ad' : '#6c7580'); R(x, col, i * 8, 0, 8, 14); R(x, col, i * 8 + 2, 14, 4, 2); }
    return c;
  }
  S.stallOpen = stall(true); S.stallClosed = stall(false);
  S.stage = (() => {
    const [c, x] = cv(80, 32); R(x, '#b9824a', 0, 8, 80, 24); for (let i = 0; i < 80; i += 8) R(x, '#9c6a35', i, 8, 1, 24);
    R(x, '#c0392b', 0, 0, 80, 10); R(x, '#f4d35e', 0, 10, 80, 1); for (let i = 4; i < 80; i += 12) R(x, '#f4d35e', i, 4, 3, 3);
    R(x, '#8d6038', 30, 28, 20, 4); return c;
  })();
  S.bench = (() => { const [c, x] = cv(16, 16); R(x, '#8d5a2b', 1, 7, 14, 3); R(x, '#a9733a', 1, 7, 14, 1); R(x, '#8d5a2b', 1, 4, 14, 2); R(x, '#5b3a22', 2, 10, 2, 4); R(x, '#5b3a22', 12, 10, 2, 4); return c; })();
  S.table = (() => { const [c, x] = cv(16, 16); R(x, '#8d5a2b', 1, 7, 14, 7); R(x, '#ffffff', 1, 6, 14, 5); R(x, '#ef5350', 1, 8, 14, 1); D(x, '#e53935', 5, 5, 2); D(x, '#f7d84a', 10, 5, 2); R(x, '#f28c28', 7, 3, 2, 2); return c; })();
  S.pot = (() => { const [c, x] = cv(16, 16); R(x, '#c0623b', 4, 10, 8, 5); R(x, '#a14a2a', 3, 9, 10, 2); R(x, '#3e8e41', 7, 5, 2, 5); D(x, '#ffd23f', 8, 4, 3); D(x, '#6b3f1d', 8, 4, 1); return c; })();

  /* ---------- Bubu (beruang cokelat) ---------- */
  function bubu(dir, f) {
    const [c, x] = cv(16, 16);
    const FUR = '#a5703f', DK = '#7b4d29', SN = '#e6c496', OV = '#4f9a50', SH = '#f2a65a', BAG = '#8b5a2b', BT = '#5b3a22', EYE = '#1c1410', BAND = '#f2cf4f';
    const legs = () => {
      if (dir === 'left' || dir === 'right') { const a = f === 1 ? [4, 14, 9, 13] : f === 2 ? [6, 13, 7, 14] : [5, 14, 8, 14]; R(x, BT, a[0], a[1], 2, 2); R(x, BT, a[2], a[3], 2, 2); }
      else { R(x, BT, 5, f === 2 ? 13 : 14, 2, 2); R(x, BT, 9, f === 1 ? 13 : 14, 2, 2); }
    };
    if (dir === 'right') { x.translate(16, 0); x.scale(-1, 1); }
    if (dir === 'down') {
      R(x, DK, 3, 3, 3, 3); R(x, DK, 10, 3, 3, 3); R(x, '#d7a07a', 4, 4, 1, 1); R(x, '#d7a07a', 11, 4, 1, 1);
      R(x, FUR, 4, 3, 8, 7); R(x, BAND, 4, 4, 8, 1); R(x, EYE, 5, 5, 1, 2); R(x, EYE, 10, 5, 1, 2); R(x, SN, 6, 7, 4, 3); R(x, '#2b1a10', 7, 7, 2, 1);
      if (f === 3) { R(x, SH, 2, 6, 2, 3); R(x, FUR, 2, 5, 2, 1); R(x, SH, 12, 6, 2, 3); R(x, FUR, 12, 5, 2, 1); }
      else { R(x, SH, 3, 10, 2, 3); R(x, FUR, 3, 13, 2, 1); R(x, SH, 11, 10, 2, 3); R(x, FUR, 11, 13, 2, 1); }
      R(x, SH, 5, 10, 6, 2); R(x, OV, 5, 11, 6, 3); R(x, OV, 6, 10, 1, 1); R(x, OV, 9, 10, 1, 1); R(x, '#f4d35e', 6, 12, 1, 1); R(x, '#f4d35e', 9, 12, 1, 1);
    } else if (dir === 'up') {
      R(x, DK, 3, 3, 3, 3); R(x, DK, 10, 3, 3, 3); R(x, FUR, 4, 3, 8, 7); R(x, BAND, 4, 4, 8, 1);
      R(x, SH, 3, 10, 2, 3); R(x, SH, 11, 10, 2, 3); R(x, FUR, 3, 13, 2, 1); R(x, FUR, 11, 13, 2, 1);
      R(x, BAG, 5, 10, 6, 4); R(x, '#6e4521', 5, 10, 6, 1); R(x, '#c9a25f', 7, 12, 2, 1); R(x, OV, 4, 12, 1, 2); R(x, OV, 11, 12, 1, 2);
    } else {
      R(x, BAG, 10, 10, 3, 4); R(x, '#6e4521', 10, 10, 3, 1); R(x, DK, 8, 2, 3, 3);
      R(x, FUR, 4, 3, 8, 7); R(x, BAND, 4, 4, 8, 1); R(x, SN, 2, 7, 4, 3); R(x, '#2b1a10', 2, 7, 1, 1); R(x, EYE, 5, 5, 1, 2);
      R(x, SH, 5, 10, 5, 2); R(x, OV, 5, 11, 5, 3); R(x, SH, 6, 10, 2, 3); R(x, FUR, 6, 13, 2, 1);
    }
    legs();
    return c;
  }
  S.bubu = {};
  for (const d of ['down', 'up', 'left', 'right']) S.bubu[d] = [0, 1, 2, 3].map(f => bubu(d, f));

  /* ---------- Penduduk ---------- */
  const EYE = '#1c1410';
  function npc(kind) {
    const [c, x] = cv(16, 16);
    const body = (col, legs) => { R(x, col, 4, 10, 8, 4); R(x, legs, 5, 14, 2, 2); R(x, legs, 9, 14, 2, 2); };
    if (kind === 'rabbit') {
      R(x, '#f4f1ee', 5, 0, 2, 5); R(x, '#f4f1ee', 9, 0, 2, 5); R(x, '#f4a6b8', 6, 1, 1, 3); R(x, '#f4a6b8', 9, 1, 1, 3);
      R(x, '#f4f1ee', 4, 4, 8, 6); R(x, '#ecc65f', 3, 4, 10, 1); R(x, '#ecc65f', 5, 3, 6, 1);
      R(x, EYE, 5, 6, 1, 2); R(x, EYE, 10, 6, 1, 2); R(x, '#f4a6b8', 7, 8, 2, 1); R(x, '#fff', 7, 9, 2, 1);
      body('#7ab648', '#e6e1dc'); R(x, '#5a8f34', 6, 10, 4, 1); R(x, '#f4f1ee', 3, 11, 1, 2); R(x, '#f4f1ee', 12, 11, 1, 2);
    } else if (kind === 'fox') {
      R(x, '#e87b2e', 4, 1, 2, 3); R(x, '#e87b2e', 10, 1, 2, 3); R(x, '#3b2412', 4, 1, 2, 1); R(x, '#3b2412', 10, 1, 2, 1);
      R(x, '#e87b2e', 4, 3, 8, 7); R(x, '#ffd23f', 4, 2, 8, 2); R(x, '#fff3e0', 5, 7, 6, 3);
      R(x, EYE, 5, 5, 1, 2); R(x, EYE, 10, 5, 1, 2); R(x, '#2b1a10', 7, 7, 2, 1);
      body('#4a6fa5', '#3b2412'); R(x, '#e87b2e', 12, 10, 3, 4); R(x, '#fff3e0', 13, 12, 2, 2); R(x, '#e87b2e', 3, 11, 1, 2); R(x, '#e87b2e', 12, 11, 1, 1);
    } else if (kind === 'cat') {
      R(x, '#9aa0a6', 4, 2, 2, 2); R(x, '#9aa0a6', 10, 2, 2, 2); R(x, '#f4a6b8', 5, 3, 1, 1); R(x, '#f4a6b8', 10, 3, 1, 1);
      R(x, '#9aa0a6', 4, 3, 8, 7); R(x, '#6d737a', 7, 3, 2, 2); R(x, '#6d737a', 5, 4, 1, 1); R(x, '#6d737a', 10, 4, 1, 1);
      R(x, EYE, 5, 6, 1, 2); R(x, EYE, 10, 6, 1, 2); R(x, '#f4a6b8', 7, 8, 2, 1); R(x, '#fff', 2, 8, 2, 1); R(x, '#fff', 12, 8, 2, 1);
      body('#ffffff', '#6d737a'); R(x, '#4a90d9', 5, 11, 6, 3); R(x, '#9aa0a6', 3, 11, 1, 2); R(x, '#9aa0a6', 12, 11, 1, 2); R(x, '#9aa0a6', 13, 13, 2, 1);
    } else if (kind === 'duck') {
      R(x, '#ffd23f', 4, 3, 8, 7); R(x, '#3a7bd5', 4, 2, 8, 2); R(x, '#3a7bd5', 3, 3, 10, 1);
      R(x, EYE, 5, 5, 1, 2); R(x, EYE, 10, 5, 1, 2); R(x, '#ff9f1c', 5, 7, 6, 2); R(x, '#e07f00', 5, 8, 6, 1);
      R(x, '#ffd23f', 4, 10, 8, 4); R(x, '#3a7bd5', 5, 11, 6, 3); R(x, '#ffd23f', 3, 11, 1, 2); R(x, '#ffd23f', 12, 11, 1, 2);
      R(x, '#ff9f1c', 4, 14, 3, 2); R(x, '#ff9f1c', 9, 14, 3, 2);
    } else if (kind === 'squirrel') {
      R(x, '#c4793a', 11, 5, 4, 8); R(x, '#e0a36a', 13, 6, 2, 6);
      R(x, '#c4793a', 4, 2, 2, 2); R(x, '#c4793a', 10, 2, 2, 2);
      R(x, '#c4793a', 4, 3, 8, 7); R(x, '#f3dcb8', 5, 7, 6, 3); R(x, '#ff6fa5', 7, 0, 2, 3); R(x, '#ffd23f', 7, 0, 2, 1);
      R(x, EYE, 5, 5, 1, 2); R(x, EYE, 10, 5, 1, 2); R(x, '#2b1a10', 7, 7, 2, 1);
      body('#f3dcb8', '#8a5326'); R(x, '#e5484d', 5, 10, 6, 1); R(x, '#c4793a', 3, 11, 1, 2);
    }
    return c;
  }
  S.npc = {}; for (const k of ['rabbit', 'fox', 'cat', 'duck', 'squirrel']) S.npc[k] = npc(k);

  /* ---------- Util untuk DOM ---------- */
  S.iconEl = function (key, px) {
    const c = document.createElement('canvas'); c.width = 16; c.height = 16; c.className = 'pix';
    c.getContext('2d').drawImage(S.icon[key], 0, 0); c.style.width = c.style.height = px + 'px'; return c;
  };
  S.faceEl = function (id, px) {
    const c = document.createElement('canvas'); c.width = 16; c.height = 16; c.className = 'pix';
    c.getContext('2d').drawImage(S.npc[id], 0, 0); c.style.width = c.style.height = px + 'px'; return c;
  };
})();
