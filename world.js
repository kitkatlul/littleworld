/* ============================================================
   WORLD.JS — peta Desa Keajaiban (40 x 26 ubin) dan tabrakan.
   Ground: 0 rumput, 1 jalan, 2 air, 3 jembatan, 4 lapangan festival
   ============================================================ */
(function () {
  'use strict';
  const { W, H } = D;
  const ground = new Uint8Array(W * H);
  const objects = [];
  let nid = 0;
  const setG = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) ground[y * W + x] = v; };
  const fill = (x, y, w, h, v) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) setG(x + i, y + j, v); };
  const add = (type, x, y, w = 1, h = 1) => { const o = { id: type + (nid++), type, x, y, w, h }; objects.push(o); return o; };

  fill(28, 3, 10, 10, 4);      // lapangan festival
  fill(24, 0, 3, H, 2);        // sungai
  fill(3, 7, 21, 1, 1);        // jalan utama barat
  fill(27, 7, 7, 1, 1);        // jalan timur
  fill(24, 7, 3, 1, 3);        // jembatan
  fill(15, 6, 1, 11, 1);       // jalan ke bengkel & pasar
  fill(6, 5, 1, 3, 1);         // jalan rumah Bubu
  fill(15, 14, 8, 1, 1);       // jalan pasar

  add('house', 4, 2, 5, 4);
  add('workshop', 13, 2, 5, 4);
  add('stall', 17, 10, 3, 2);
  add('stage', 31, 3, 5, 2);
  [[1, 1], [2, 5], [10, 2], [12, 5], [20, 2], [22, 5], [1, 15], [3, 19], [8, 21], [11, 18], [21, 18], [22, 22], [5, 23], [14, 23], [19, 23],
   [30, 1], [36, 1], [38, 16], [30, 22], [34, 20], [37, 23]].forEach(p => add('tree', p[0], p[1]));
  [[9, 15], [5, 17], [20, 20], [22, 13], [12, 22], [29, 14], [33, 17], [36, 14]].forEach(p => add('rock', p[0], p[1]));
  [[10, 12], [11, 16], [21, 16], [2, 12], [13, 9], [28, 13], [35, 15], [38, 14]].forEach(p => add('bush', p[0], p[1]));

  const objGrid = new Array(W * H).fill(null);
  for (const o of objects) for (let j = 0; j < o.h; j++) for (let i = 0; i < o.w; i++) objGrid[(o.y + j) * W + o.x + i] = o;

  // Bunga hias (tidak menghalangi)
  const flowers = [];
  (function () {
    let s = 99; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    const used = new Set();
    let tries = 0;
    while (flowers.length < 55 && tries++ < 2000) {
      const x = (r() * W) | 0, y = (r() * H) | 0, i = y * W + x;
      if (ground[i] !== 0 || objGrid[i]) continue;
      if (x >= 3 && x <= 7 && y >= 9 && y <= 10) continue;                 // area kebun
      const key = x + ',' + y; if (used.has(key)) continue;
      if ([[9, 10], [18, 12], [18, 6], [23, 8], [32, 6], [28, 8], [29, 8], [31, 8], [33, 8], [35, 8], [6, 6]].some(p => p[0] === x && p[1] === y)) continue;
      used.add(key); flowers.push({ x, y, c: (r() * 4) | 0 });
    }
  })();

  const solid = new Uint8Array(W * H);
  function refresh(bridgeFixed) {
    for (let i = 0; i < W * H; i++) {
      const g = ground[i]; let s = 0;
      if (g === 2) s = 1; else if (g === 3 && !bridgeFixed) s = 1;
      if (objGrid[i]) s = 1;
      solid[i] = s;
    }
  }
  window.World = { W, H, ground, objects, objGrid, flowers, solid, refresh };
})();
