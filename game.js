/* ============================================================
   GAME.JS — logika utama: gerak, kebun, misi, UI, simpan/muat.
   Alur: Jelajah -> Temukan -> Rencana -> Lakukan -> Amati -> Perbaiki -> Buka
   ============================================================ */
(function () {
  'use strict';
  const { W, H, TS } = D;
  const $ = id => document.getElementById(id);
  const cvs = $('game'), ctx = cvs.getContext('2d');
  const KEY = 'bubu-little-world-v1';
  const ALL = [...D.CROPS, ...D.MATS];
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const SPD = 62;
  const PLOT_X = 3, PLOT_Y = 9, PLOT_COLS = 5, PLOT_ROWS = 2;

  let SC = 3, VW = 320, VH = 180, time = 0, last = 0;
  const cam = { x: 0, y: 0 };
  let G = null, npcs = [], parts = [], floats = [], hint = null, groundCv = null;
  let running = false, cheer = 0, capTimer = null, lastSay = '', stepT = 0;
  let dlg = { q: null, npc: null, basket: {}, wrong: 0, locked: false };
  const keys = {}, touch = {};

  /* ---------------- Data permainan & simpan ---------------- */
  function fresh() {
    return {
      v: 1,
      player: { x: 6 * TS + 8, y: 6 * TS + 12, dir: 'down' },
      inv: { carrot: 0, tomato: 0, corn: 0, strawberry: 0, sunflower: 0, wood: 0, stone: 0, leaf: 0 },
      plots: Array.from({ length: PLOT_COLS * PLOT_ROWS }, () => ({ dug: false, crop: null, stage: 0, watered: false })),
      q: 0, day: 1, period: 0, actions: 0, sel: 'carrot', res: {}, muted: false, modal: null,
      stats: { quests: 0, count: 0, build: 0, plant: 0, water: 0, harvest: 0, dig: 0, gather: 0, help: 0, wrong: 0, days: 1, acts: 0, heard: 0 }
    };
  }
  function load() {
    try {
      const s = localStorage.getItem(KEY); if (!s) return null; const o = JSON.parse(s);
      if (!o || o.v !== 1) return null; const f = fresh();
      const g = Object.assign(f, o, { inv: Object.assign(f.inv, o.inv), stats: Object.assign(f.stats, o.stats), modal: null });
      return g;
    } catch (e) { return null; }
  }
  function save() { try { const c = Object.assign({}, G, { modal: null }); localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { } }
  const curQuest = () => D.QUESTS[G.q] || null;

  /* ---------------- Ukuran layar ---------------- */
  function resize() {
    const w = innerWidth, h = innerHeight;
    SC = Math.max(2, Math.min(8, Math.floor(h / 176), Math.floor(w / 128)));
    VW = Math.ceil(w / SC); VH = Math.ceil(h / SC);
    cvs.width = VW; cvs.height = VH; cvs.style.width = w + 'px'; cvs.style.height = h + 'px';
    ctx.imageSmoothingEnabled = false;
  }

  /* ---------------- Dunia ---------------- */
  function buildGround() {
    const c = document.createElement('canvas'); c.width = W * TS; c.height = H * TS; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
      const g = World.ground[ty * W + tx]; let img;
      if (g === 1) img = S.path[(tx + ty) & 1]; else if (g === 3) img = S.path[0]; else if (g === 4) img = S.field[(tx + ty) & 1];
      else { const v = (tx * 7 + ty * 13) % 7; img = S.grass[v === 0 ? 2 : (v & 1)]; }
      x.drawImage(img, tx * TS, ty * TS);
    }
    groundCv = c;
  }
  const NPC_HOME = { rabbit: [9, 10], cat: [18, 12], fox: [18, 6], duck: [23, 8], squirrel: [32, 6] };
  const NPC_FEST = { rabbit: [29, 8], cat: [33, 8], fox: [35, 8], duck: [31, 8], squirrel: [32, 6] };
  const PATHS_FEST = { rabbit: [[9, 7], [29, 7], [29, 8]], cat: [[15, 12], [15, 7], [33, 7], [33, 8]], fox: [[18, 7], [35, 7], [35, 8]], duck: [[31, 8]], squirrel: [] };
  const PATH_DUCK = [[23, 7], [28, 7], [28, 8]];
  const tpx = t => [t[0] * TS + 8, t[1] * TS + 12];
  function placeNpcs() {
    npcs = Object.keys(NPC_HOME).map((id, i) => {
      let t = NPC_HOME[id]; if (G.q >= 5) t = NPC_FEST[id]; else if (G.q >= 3 && id === 'duck') t = [28, 8];
      const p = tpx(t); return { id, x: p[0], y: p[1], path: [], phase: i * 1.7 };
    });
  }
  function startPath(id, list) { const n = npcs.find(a => a.id === id); if (n) n.path = list.map(tpx); }

  function solidPx(px, py) {
    const tx = Math.floor(px / TS), ty = Math.floor(py / TS);
    if (tx < 0 || ty < 0 || tx >= W || ty >= H) return true;
    return World.solid[ty * W + tx] === 1;
  }
  function blocked(x, y) {
    for (const [a, b] of [[x - 5, y - 6], [x + 5, y - 6], [x - 5, y], [x + 5, y]]) if (solidPx(a, b)) return true;
    for (const n of npcs) if (Math.abs(x - n.x) < 10 && Math.abs(y - n.y) < 6) return true;
    return false;
  }
  function tryMove(dx, dy) {
    const p = G.player;
    if (blocked(p.x, p.y)) { p.x += dx; p.y += dy; return; } // jika terjepit, boleh keluar
    if (!blocked(p.x + dx, p.y)) p.x += dx;
    if (!blocked(p.x, p.y + dy)) p.y += dy;
  }
  function nearestNpc() {
    const p = G.player; let best = null, bd = 1e9;
    for (const n of npcs) { const d = Math.hypot(n.x - p.x, (n.y - 4) - (p.y - 4)); if (d < 24 && d < bd) { bd = d; best = n; } }
    return best;
  }
  function facing() {
    const p = G.player, v = DIRS[p.dir];
    for (const d of [8, 14, 20]) {
      const tx = Math.floor((p.x + v[0] * d) / TS), ty = Math.floor((p.y - 4 + v[1] * d) / TS);
      if (tx < 0 || ty < 0 || tx >= W || ty >= H) continue;
      const px = tx - PLOT_X, py = ty - PLOT_Y;
      if (px >= 0 && px < PLOT_COLS && py >= 0 && py < PLOT_ROWS) return { k: 'plot', i: py * PLOT_COLS + px };
      const o = World.objGrid[ty * W + tx];
      if (o && (o.type === 'tree' || o.type === 'rock' || o.type === 'bush')) return { k: 'res', o };
      if (o && o.type === 'house') return { k: 'house' };
    }
    return null;
  }

  /* ---------------- Efek visual ---------------- */
  function burst(x, y, cols, n, spd) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, s = (0.3 + Math.random()) * (spd || 30);
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, life: .5 + Math.random() * .5, col: cols[(Math.random() * cols.length) | 0], sz: 1 + ((Math.random() * 2) | 0) });
    }
  }
  function floater(key, x, y) { floats.push({ key, x, y, t: 0 }); }
  function caption(text, ms) {
    const el = $('caption'); el.textContent = text; el.classList.remove('hidden');
    clearTimeout(capTimer); capTimer = setTimeout(() => el.classList.add('hidden'), ms || 4500);
  }
  function say(text) { lastSay = text; caption(text); G.stats.heard++; Snd.speak(text); }

  /* ---------------- Waktu: pagi / siang / sore ---------------- */
  function tick() {
    G.actions++; G.stats.acts++;
    if (G.actions % 5 === 0 && G.period < 2) {
      G.period++; renderDay();
      if (G.period === 2) { caption('Hari sudah sore. Bubu mengantuk, ayo istirahat!', 4000); pulse('btnRest', 4000); }
    }
    save();
  }
  function pulse(id, ms) { const el = $(id); el.classList.add('pulse'); setTimeout(() => el.classList.remove('pulse'), ms); }

  function newDay() {
    G.day++; G.stats.days++; G.period = 0; G.actions = 0; G.res = {};
    for (const p of G.plots) { if (p.crop && p.watered && p.stage < 2) p.stage++; p.watered = false; }
    save(); renderDay();
  }
  function doRest() {
    if (G.modal) return; G.modal = 'rest'; Snd.sfx('sleep');
    $('fade').classList.add('on');
    setTimeout(() => {
      newDay(); $('fade').classList.remove('on');
      setTimeout(() => { G.modal = null; say('Selamat pagi! Ayo lihat kebunnya!'); }, 800);
    }, 1000);
  }

  /* ---------------- Aksi pemain ---------------- */
  function act() {
    if (!running || G.modal) return;
    const n = nearestNpc(); if (n) { openNpc(n); return; }
    const t = facing(); if (!t) { Snd.sfx('pop'); return; }
    const p = G.player;
    if (t.k === 'house') { doRest(); return; }
    if (t.k === 'res') {
      const o = t.o, mat = { tree: 'wood', rock: 'stone', bush: 'leaf' }[o.type];
      if (G.res[o.id]) { caption('Sudah diambil. Besok tumbuh lagi!', 2500); Snd.sfx('pop'); return; }
      G.res[o.id] = true; G.inv[mat]++; G.stats.gather++; Snd.sfx('gather');
      burst(o.x * TS + 8, o.y * TS + 8, ['#8bdc72', '#d9a566', '#c9ced3'], 6, 30);
      floater(mat, o.x * TS + 8, o.y * TS); renderBar(); renderBoard(); tick(); return;
    }
    if (t.k === 'plot') plotAct(t.i);
  }
  function plotAct(i) {
    const pl = G.plots[i], tx = PLOT_X + (i % PLOT_COLS), ty = PLOT_Y + ((i / PLOT_COLS) | 0), cx = tx * TS + 8, cy = ty * TS + 8;
    if (!pl.dug) { pl.dug = true; G.stats.dig++; Snd.sfx('dig'); burst(cx, cy + 4, ['#8e5c34', '#6e4420', '#b98a50'], 8, 35); tick(); return; }
    if (!pl.crop) {
      pl.crop = G.sel; pl.stage = 0; pl.watered = false; G.stats.plant++; Snd.sfx('plant');
      burst(cx, cy, ['#efe0a8', '#8e5c34'], 5, 20); tick(); return;
    }
    if (pl.stage >= 2) {
      G.inv[pl.crop]++; G.stats.harvest++; Snd.sfx('harvest'); floater(pl.crop, cx, cy - 4);
      burst(cx, cy, ['#ffd23f', '#ffffff', '#8bdc72'], 10, 40);
      pl.crop = null; pl.stage = 0; pl.watered = false; renderBar(); renderBoard(); tick(); return;
    }
    if (!pl.watered) {
      pl.watered = true; G.stats.water++; Snd.sfx('water'); burst(cx, cy - 4, ['#3fa0ff', '#bfe3ff'], 10, 25); tick(); return;
    }
    Snd.sfx('pop'); caption('Sudah disiram. Ayo istirahat supaya tanaman tumbuh!', 3500); pulse('btnRest', 3500);
  }

  /* ---------------- Dialog & pengiriman barang ---------------- */
  function openNpc(n) {
    G.modal = 'dialog'; const q = curQuest();
    dlg = { q: null, npc: n.id, basket: {}, wrong: 0, locked: false };
    $('dialog').classList.remove('hidden');
    const face = $('dFace').getContext('2d'); face.clearRect(0, 0, 16, 16); face.drawImage(S.npc[n.id], 0, 0);
    if (q && q.npc === n.id) {
      dlg.q = q;
      const have = Object.keys(q.need).some(k => G.inv[k] > 0);
      setDText(have ? q.say : q.lack);
    } else {
      const lines = G.q >= 5 ? D.CHAT_FEST : D.CHAT[n.id];
      setDText(lines[(Math.random() * lines.length) | 0]);
    }
    renderDialog();
  }
  function setDText(t) { $('dText').textContent = t; lastSay = t; G.stats.heard++; Snd.speak(t); }
  function renderDialog() {
    const slots = $('dSlots'), own = $('dOwn'); slots.innerHTML = ''; own.innerHTML = '';
    const q = dlg.q; if (!q) return;
    for (const k in q.need) for (let i = 0; i < q.need[k]; i++) {
      const filled = (dlg.basket[k] || 0) > i; const b = document.createElement('button');
      b.className = 'slot' + (filled ? ' full' : ' ghost'); b.appendChild(S.iconEl(k, 36));
      b.onclick = () => { if (!dlg.locked && (dlg.basket[k] || 0) > i) removeFromBasket(k); };
      slots.appendChild(b);
    }
    for (const k of ALL) {
      if (G.inv[k] > 0) {
        const b = document.createElement('button'); b.className = 'slot' + (dlg.wrong >= 2 && q.need[k] ? ' need' : '');
        b.appendChild(S.iconEl(k, 36)); const s = document.createElement('span'); s.className = 'badge'; s.textContent = G.inv[k]; b.appendChild(s);
        b.onclick = () => { if (!dlg.locked) addToBasket(k, b); };
        own.appendChild(b);
      }
    }
  }
  function addToBasket(k, el) {
    const q = dlg.q; if (!q) return;
    if (!q.need[k] || (dlg.basket[k] || 0) >= q.need[k]) {
      dlg.wrong++; G.stats.wrong++; Snd.sfx('wrong');
      if (el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
      setDText('Hmm, coba kita periksa lagi, ya!'); if (dlg.wrong === 2) renderDialog(); return;
    }
    G.inv[k]--; dlg.basket[k] = (dlg.basket[k] || 0) + 1; Snd.sfx('pop'); renderBar(); renderBoard(); renderDialog();
    if (Object.keys(q.need).every(n => (dlg.basket[n] || 0) >= q.need[n])) finishQuest(q);
  }
  function removeFromBasket(k) { dlg.basket[k]--; G.inv[k]++; Snd.sfx('pop'); renderBar(); renderBoard(); renderDialog(); }
  function returnBasket() { for (const k in dlg.basket) G.inv[k] += dlg.basket[k]; dlg.basket = {}; }
  function closeDialog() {
    if (dlg.locked) return;
    returnBasket(); dlg.q = null; $('dialog').classList.add('hidden'); G.modal = null; renderBar(); renderBoard(); save();
  }

  function finishQuest(q) {
    dlg.locked = true; G.stats.quests++; if (q.kind === 'give') G.stats.count++; else G.stats.build++;
    Snd.sfx(q.kind === 'build' ? 'build' : 'win'); setTimeout(() => Snd.sfx('win'), q.kind === 'build' ? 500 : 0);
    for (const k in q.reward) { G.inv[k] += q.reward[k]; }
    dlg.basket = {}; G.q++;
    setDText(q.thanks); renderDialog();
    const p = G.player;
    setTimeout(() => {
      $('dialog').classList.add('hidden'); dlg.locked = false; dlg.q = null; G.modal = null;
      cheer = 1.6; burst(p.x, p.y - 8, ['#ffd23f', '#ff7eb6', '#7ee8fa', '#8bdc72'], 24, 55);
      for (const k in q.reward) floater(k, p.x, p.y - 12);
      if (q.id === 'q3') { World.refresh(true); startPath('duck', PATH_DUCK); }
      if (q.id === 'q5') startFestival();
      autoSel(); renderAll(); save();
      const nq = curQuest(); if (nq) setTimeout(() => { if (!G.modal) say(nq.say); }, 1400);
    }, 2600);
  }
  function autoSel() { const q = curQuest(); if (!q) return; const c = Object.keys(q.need).find(k => D.CROPS.includes(k)); if (c) G.sel = c; }
  function startFestival() {
    Snd.festival(true);
    for (const id in PATHS_FEST) if (PATHS_FEST[id].length) startPath(id, PATHS_FEST[id]);
    setTimeout(() => { burst(32 * TS, 6 * TS, ['#ff7eb6', '#ffd23f', '#7ee8fa', '#b57bff', '#8bdc72'], 60, 70); Snd.sfx('win'); }, 1500);
    setTimeout(() => { if (!G.modal) { G.modal = 'award'; $('award').classList.remove('hidden'); setTimeout(() => Snd.speak('Hore! Kamu Sahabat Desa Hebat!'), 300); } }, 6500);
  }

  /* ---------------- Bantuan bertahap ---------------- */
  function useHint() {
    if (!running || G.modal) return; const q = curQuest(); G.stats.help++;
    if (!q) { say('Desa sudah ramai! Ayo bermain bebas.'); return; }
    const p = G.player; const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const plotPos = i => ({ x: (PLOT_X + (i % PLOT_COLS)) * TS + 8, y: (PLOT_Y + ((i / PLOT_COLS) | 0)) * TS + 4, i });
    let target = null, text = '';
    const missing = Object.keys(q.need).find(k => G.inv[k] < q.need[k]);
    if (!missing) { const n = npcs.find(a => a.id === q.npc); target = { x: n.x, y: n.y - 14 }; text = 'Sudah cukup! Ayo bawa ke ' + D.NPC_NAMES[q.npc] + '!'; }
    else if (D.CROPS.includes(missing)) {
      const idx = G.plots.map((pl, i) => i);
      const pick = f => { const l = idx.filter(f).map(plotPos); l.sort((a, b) => dist(a, p) - dist(b, p)); return l[0]; };
      let t;
      if ((t = pick(i => G.plots[i].crop === missing && G.plots[i].stage >= 2))) { target = t; text = 'Tanamannya sudah siap! Ayo panen!'; }
      else if ((t = pick(i => G.plots[i].crop === missing && !G.plots[i].watered))) { target = t; text = 'Tanamannya haus. Ayo siram!'; }
      else if (G.plots.some(pl => pl.crop === missing)) { text = 'Sudah disiram. Ayo istirahat supaya tanaman tumbuh!'; pulse('btnRest', 6000); }
      else if ((t = pick(i => G.plots[i].dug && !G.plots[i].crop))) { target = t; G.sel = missing; renderBar(); text = 'Ayo tanam bibit ' + D.NAMES[missing] + '!'; }
      else if ((t = pick(i => !G.plots[i].dug))) { target = t; G.sel = missing; renderBar(); text = 'Ayo gali tanahnya dulu!'; }
      else { target = plotPos(0); text = 'Ayo periksa kebunnya!'; }
    } else {
      const type = { wood: 'tree', stone: 'rock', leaf: 'bush' }[missing];
      const l = World.objects.filter(o => o.type === type && !G.res[o.id]).map(o => ({ x: o.x * TS + 8, y: o.y * TS - 4 }));
      l.sort((a, b) => dist(a, p) - dist(b, p));
      if (l[0]) { target = l[0]; text = 'Ayo cari ' + D.NAMES[missing] + ' di sini!'; } else text = 'Besok ' + D.NAMES[missing] + ' tumbuh lagi. Ayo istirahat!';
    }
    hint = target ? { x: target.x, y: target.y, t: 8 } : null; say(text);
  }

  /* ---------------- Antarmuka (DOM) ---------------- */
  function renderAll() { renderBoard(); renderBar(); renderDay(); renderProgress(); renderMute(); }
  function renderBoard() {
    const q = curQuest(), fc = $('boardFace').getContext('2d'), nd = $('boardNeeds'); fc.clearRect(0, 0, 16, 16); nd.innerHTML = '';
    if (!q) { fc.drawImage(S.icon.star, 0, 0); nd.appendChild(S.iconEl('star', 24)); return; }
    fc.drawImage(S.npc[q.npc], 0, 0);
    for (const k in q.need) {
      const g = document.createElement('div'); g.className = 'ngroup';
      for (let i = 0; i < q.need[k]; i++) { const e = S.iconEl(k, 28); if (G.inv[k] + (dlg.basket[k] || 0) <= i) e.classList.add('dim'); g.appendChild(e); }
      nd.appendChild(g);
    }
  }
  function renderBar() {
    const bar = $('invbar'); bar.innerHTML = '';
    for (const k of ALL) {
      const b = document.createElement('button'); const isCrop = D.CROPS.includes(k);
      b.className = 'slot' + (isCrop ? ' seed' : '') + (isCrop && G.sel === k ? ' sel' : '');
      b.appendChild(S.iconEl(k, 32));
      if (G.inv[k] > 0) { const s = document.createElement('span'); s.className = 'badge'; s.textContent = G.inv[k]; b.appendChild(s); }
      if (isCrop) b.onclick = () => { G.sel = k; Snd.sfx('pop'); renderBar(); save(); };
      bar.appendChild(b);
      if (k === 'sunflower') { const sp = document.createElement('div'); sp.className = 'sep'; bar.appendChild(sp); }
    }
  }
  function renderDay() {
    const d = $('daybox'); d.innerHTML = '';
    for (let i = 0; i < 3; i++) { const e = S.iconEl('p' + i, 22); if (i !== G.period) e.classList.add('dim'); d.appendChild(e); }
    const t = document.createElement('span'); t.textContent = G.day; d.appendChild(t);
  }
  function renderProgress() {
    const p = $('progress'); p.innerHTML = '';
    [['carrot', 1], ['stall', 2], ['bridge', 3], ['star', 5]].forEach(a => { const e = S.iconEl(a[0], 26); if (G.q < a[1]) e.classList.add('locked'); p.appendChild(e); });
  }
  function renderMute() { const b = $('btnMute'); b.innerHTML = ''; b.appendChild(S.iconEl(G.muted ? 'mute' : 'note', 30)); }
  function renderTeacher() {
    const s = G.stats;
    const rows = [
      ['Misi diselesaikan', s.quests], ['Aktivitas berhitung berhasil', s.count], ['Aktivitas membangun selesai', s.build],
      ['Berkebun: menggali / menanam / menyiram / memanen', `${s.dig} / ${s.plant} / ${s.water} / ${s.harvest}`],
      ['Bahan dikumpulkan dari desa', s.gather], ['Bantuan digunakan', s.help + ' kali'], ['Mencoba kembali (pilihan belum tepat)', s.wrong + ' kali'],
      ['Jumlah hari dimainkan', s.days], ['Total aksi (tap / sentuh)', s.acts], ['Instruksi suara/teks ditampilkan', s.heard]
    ];
    const aspects = [
      ['Kognitif', 'mengelompokkan & menghitung barang', s.count],
      ['Pemecahan masalah', 'mencoba kembali & memakai petunjuk', s.wrong + s.help],
      ['Motorik halus', 'tap, memilih, menaruh ke keranjang', s.acts],
      ['Bahasa', 'mendengar instruksi sederhana', s.heard],
      ['Sosial-emosional', 'membantu penduduk desa', s.quests],
      ['Sains sederhana', 'merawat & memanen tanaman', s.water + s.harvest]
    ];
    $('tBody').innerHTML = '<table>' + rows.map(r => `<tr><td>${r[0]}</td><td><b>${r[1]}</b></td></tr>`).join('') + '</table>' +
      '<h3>Aspek yang dilatih (jumlah aktivitas)</h3><table>' + aspects.map(r => `<tr><td><b>${r[0]}</b><br><small>${r[1]}</small></td><td><b>${r[2]}</b></td></tr>`).join('') + '</table>';
  }

  /* ---------------- Update & Render ---------------- */
  function update(dt) {
    time += dt; const p = G.player; let moving = false;
    if (!G.modal) {
      const dx = ((keys.ArrowRight || keys.d || touch.right) ? 1 : 0) - ((keys.ArrowLeft || keys.a || touch.left) ? 1 : 0);
      const dy = ((keys.ArrowDown || keys.s || touch.down) ? 1 : 0) - ((keys.ArrowUp || keys.w || touch.up) ? 1 : 0);
      if (dx || dy) {
        if (dx && dy) { if (!(p.dir === 'left' || p.dir === 'right') || (dx > 0 ? 'right' : 'left') !== p.dir) { /* keep */ } }
        if (dx && !dy) p.dir = dx > 0 ? 'right' : 'left'; else if (dy && !dx) p.dir = dy > 0 ? 'down' : 'up';
        else if (p.dir !== (dx > 0 ? 'right' : 'left') && p.dir !== (dy > 0 ? 'down' : 'up')) p.dir = dx > 0 ? 'right' : 'left';
        const l = Math.hypot(dx, dy), sp = SPD * dt / l; tryMove(dx * sp, dy * sp); moving = true;
        stepT += dt; if (stepT > .32) { stepT = 0; }
      }
    }
    p.moving = moving; p.anim = (p.anim || 0) + (moving ? dt : 0); if (!moving) p.anim = 0;
    cheer = Math.max(0, cheer - dt);
    for (const n of npcs) {
      if (n.path.length) {
        const t = n.path[0], dx = t[0] - n.x, dy = t[1] - n.y, d = Math.hypot(dx, dy), s = 40 * dt;
        if (d <= s) { n.x = t[0]; n.y = t[1]; n.path.shift(); } else { n.x += dx / d * s; n.y += dy / d * s; }
      }
    }
    parts = parts.filter(a => { a.life -= dt; a.x += a.vx * dt; a.y += a.vy * dt; a.vy += 90 * dt; return a.life > 0; });
    floats = floats.filter(f => { f.t += dt; return f.t < 1.2; });
    if (hint) { hint.t -= dt; if (hint.t <= 0) hint = null; }
    const tx = p.x - VW / 2, ty = p.y - VH / 2 - 6;
    const mx = W * TS - VW, my = H * TS - VH;
    const gx = mx < 0 ? mx / 2 : Math.max(0, Math.min(mx, tx)), gy = my < 0 ? my / 2 : Math.max(0, Math.min(my, ty));
    cam.x += (gx - cam.x) * Math.min(1, dt * 7); cam.y += (gy - cam.y) * Math.min(1, dt * 7);
  }

  function drawObj(o) {
    const x = o.x * TS, y = o.y * TS;
    switch (o.type) {
      case 'tree': ctx.drawImage(G.res[o.id] ? S.stump : S.tree, x, G.res[o.id] ? y : y - 8); break;
      case 'rock': ctx.drawImage(G.res[o.id] ? S.pebble : S.rock, x, y); break;
      case 'bush': ctx.drawImage(G.res[o.id] ? S.bushBare : S.bush, x, y); break;
      case 'house': ctx.drawImage(S.house, x, y); break;
      case 'workshop': ctx.drawImage(S.workshop, x, y); break;
      case 'stall': ctx.drawImage(G.q >= 2 ? S.stallOpen : S.stallClosed, x, y + 0); break;
      case 'stage': ctx.drawImage(S.stage, x, y); break;
    }
  }
  function shadow(x, y) { ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(Math.round(x) - 5, Math.round(y) - 1, 10, 3); }

  function render() {
    ctx.fillStyle = '#233a24'; ctx.fillRect(0, 0, VW, VH);
    const cx = Math.round(cam.x), cy = Math.round(cam.y);
    ctx.save(); ctx.translate(-cx, -cy);
    ctx.drawImage(groundCv, 0, 0);
    const wf = ((time * 2) | 0) & 1;
    const tx0 = Math.max(0, (cx >> 4) - 1), tx1 = Math.min(W - 1, ((cx + VW) >> 4) + 1), ty0 = Math.max(0, (cy >> 4) - 1), ty1 = Math.min(H - 1, ((cy + VH) >> 4) + 1);
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      const g = World.ground[ty * W + tx]; if (g !== 2 && g !== 3) continue;
      ctx.drawImage(S.water[wf], tx * TS, ty * TS);
      if (g === 2) {
        const L = tx > 0 ? World.ground[ty * W + tx - 1] : 2, Rr = tx < W - 1 ? World.ground[ty * W + tx + 1] : 2;
        ctx.fillStyle = '#e6d79c';
        if (L !== 2 && L !== 3) ctx.fillRect(tx * TS, ty * TS, 2, TS);
        if (Rr !== 2 && Rr !== 3) ctx.fillRect(tx * TS + 14, ty * TS, 2, TS);
      } else ctx.drawImage(G.q >= 3 ? S.bridgeOk : S.bridgeBroken[tx - 24], tx * TS, ty * TS);
    }
    for (const f of World.flowers) ctx.drawImage(S.flowers[f.c][wf], f.x * TS, f.y * TS);
    G.plots.forEach((pl, i) => {
      const px = (PLOT_X + (i % PLOT_COLS)) * TS, py = (PLOT_Y + ((i / PLOT_COLS) | 0)) * TS;
      ctx.drawImage(!pl.dug ? S.patch : (pl.watered ? S.soilWet : S.soil), px, py);
      if (pl.crop) ctx.drawImage(S.plant[pl.crop][pl.stage], px, py);
    });
    // Entitas yang diurutkan berdasarkan posisi Y
    const ents = [];
    for (const o of World.objects) ents.push({ y: (o.y + o.h) * TS, d: () => drawObj(o) });
    if (G.q >= 5) for (const dc of D.DECOR) ents.push({ y: (dc.y + 1) * TS, d: () => ctx.drawImage(S[dc.t], dc.x * TS, dc.y * TS) });
    for (const n of npcs) ents.push({ y: n.y, d: () => { const b = Math.sin(time * 3 + n.phase) > .7 ? -1 : 0; shadow(n.x, n.y); ctx.drawImage(S.npc[n.id], Math.round(n.x) - 8, Math.round(n.y) - 15 + b); } });
    const p = G.player;
    ents.push({
      y: p.y, d: () => {
        const f = cheer > 0 ? 3 : (p.moving ? 1 + (((p.anim * 8) | 0) & 1) : 0); const jump = cheer > 0 ? -Math.abs(Math.sin(time * 10)) * 3 : 0;
        shadow(p.x, p.y); ctx.drawImage(S.bubu[cheer > 0 ? 'down' : p.dir][f], Math.round(p.x) - 8, Math.round(p.y) - 15 + Math.round(jump));
      }
    });
    ents.sort((a, b) => a.y - b.y); for (const e of ents) e.d();
    // Tetesan air di tanaman yang haus
    G.plots.forEach((pl, i) => {
      if (pl.crop && !pl.watered && pl.stage < 2) {
        const px = (PLOT_X + (i % PLOT_COLS)) * TS, py = (PLOT_Y + ((i / PLOT_COLS) | 0)) * TS;
        ctx.drawImage(S.drop, px + 4, py - 6 + Math.round(Math.sin(time * 4 + i) * 1.5));
      }
    });
    if (G.q >= 5) drawLights();
    if (hint) ctx.drawImage(S.arrow, Math.round(hint.x) - 6, Math.round(hint.y - 16 + Math.sin(time * 6) * 3));
    for (const a of parts) { ctx.fillStyle = a.col; ctx.fillRect(Math.round(a.x), Math.round(a.y), a.sz, a.sz); }
    for (const f of floats) { ctx.globalAlpha = Math.max(0, 1 - f.t / 1.2); ctx.drawImage(S.icon[f.key], Math.round(f.x) - 8, Math.round(f.y - 8 - f.t * 18)); ctx.globalAlpha = 1; }
    ctx.restore();
    const tint = G.q >= 5 ? 'rgba(60,40,120,.22)' : (G.period === 0 ? 'rgba(255,220,150,.10)' : G.period === 2 ? 'rgba(255,110,50,.20)' : null);
    if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, 0, VW, VH); }
  }
  function drawLights() {
    const cols = ['#ff5d73', '#ffd23f', '#7ee8fa', '#8bdc72', '#ff9ff3'];
    for (const base of [2 * TS + 8, 13 * TS + 4]) {
      ctx.fillStyle = '#5b3a22'; ctx.fillRect(28 * TS + 2, base - 4, 2, 40); ctx.fillRect(38 * TS - 4, base - 4, 2, 40);
      for (let i = 0; i <= 40; i++) {
        const x = 28 * TS + 3 + i * 3.1, y = base + Math.sin(i / 40 * Math.PI) * 7;
        ctx.fillStyle = '#3f2713'; ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
        if (i % 4 === 0) {
          const on = (((time * 3) | 0) + i / 4) % 2 === 0; const c = cols[(i / 4) % cols.length];
          ctx.globalAlpha = on ? .35 : .15; ctx.fillStyle = c; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 1, 5, 5);
          ctx.globalAlpha = 1; ctx.fillStyle = c; ctx.fillRect(Math.round(x) - 1, Math.round(y), 3, 3);
        }
      }
    }
  }

  function frame(t) {
    const dt = Math.min(.05, (t - last) / 1000 || 0); last = t;
    if (running && G) { update(dt); render(); }
    requestAnimationFrame(frame);
  }

  /* ---------------- Mulai & kontrol ---------------- */
  function startGame(fresh_) {
    Snd.init();
    if (fresh_) { try { localStorage.removeItem(KEY); } catch (e) { } G = fresh(); } else G = load() || fresh();
    G.modal = null; Snd.setMuted(!!G.muted); World.refresh(G.q >= 3); placeNpcs(); buildGround(); Snd.festival(G.q >= 5); autoSel();
    $('start').classList.add('hidden'); $('hud').classList.remove('hidden'); $('award').classList.add('hidden');
    renderAll(); resize(); running = true;
    const p = G.player; cam.x = p.x - VW / 2; cam.y = p.y - VH / 2;
    const q = curQuest();
    setTimeout(() => { if (G.q === 0 && G.stats.acts === 0) say('Hai! Aku Bubu! ' + q.say.replace(/^Hai! /, '')); else if (q) say(q.say); else say('Desa sudah ramai! Ayo bermain bebas.'); }, 400);
  }

  function setup() {
    resize(); addEventListener('resize', resize); addEventListener('orientationchange', () => setTimeout(resize, 200));
    const bind = (id, key) => { $(id).appendChild(S.iconEl(key, 30)); };
    bind('btnSay', 'speaker'); bind('btnHint', 'bulb'); bind('btnRest', 'moon'); bind('btnTeacher', 'gear');
    $('btnA').appendChild(S.iconEl('paw', 44));
    for (const b of document.querySelectorAll('.xbtn')) b.appendChild(S.iconEl('close', 24));
    for (const b of document.querySelectorAll('#dpad button')) b.appendChild(S.iconEl(b.dataset.d, 26));
    $('dSpeak').appendChild(S.iconEl('speaker', 26));
    $('startBubu').getContext('2d').drawImage(S.bubu.down[0], 0, 0);
    $('awardStar').getContext('2d').drawImage(S.icon.star, 0, 0);

    try { if (localStorage.getItem(KEY)) $('btnContinue').classList.remove('hidden'); } catch (e) { }
    $('btnPlay').onclick = () => startGame(true);
    $('btnContinue').onclick = () => startGame(false);

    $('btnSay').onclick = () => { if (lastSay) { caption(lastSay); Snd.speak(lastSay); } };
    $('btnHint').onclick = useHint; $('btnRest').onclick = doRest;
    $('btnMute').onclick = () => { G.muted = !G.muted; Snd.setMuted(G.muted); renderMute(); save(); };
    $('dClose').onclick = closeDialog; $('dSpeak').onclick = () => { if (lastSay) Snd.speak(lastSay); };
    $('btnAward').onclick = () => { $('award').classList.add('hidden'); G.modal = null; save(); renderAll(); };
    $('tClose').onclick = () => { $('teacher').classList.add('hidden'); G.modal = null; };
    $('tReset').onclick = () => { if (confirm('Hapus semua progres dan mulai dari awal?')) { try { localStorage.removeItem(KEY); } catch (e) { } location.reload(); } };

    // Tombol guru: tahan 1,5 detik agar anak tidak membukanya tidak sengaja
    let holdT = null; const tb = $('btnTeacher');
    tb.addEventListener('pointerdown', () => { holdT = setTimeout(() => { if (G.modal) return; G.modal = 'teacher'; renderTeacher(); $('teacher').classList.remove('hidden'); }, 1500); });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) tb.addEventListener(ev, () => clearTimeout(holdT));
    tb.addEventListener('click', () => { if (!G.modal) caption('Tahan tombol ini 2 detik untuk halaman guru/orang tua.', 3000); });

    addEventListener('keydown', e => {
      if (e.repeat) return; const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; keys[k] = true;
      if (k === ' ' || k === 'Enter' || k === 'e') { e.preventDefault(); act(); }
      if (k === 'm' && G) $('btnMute').click(); if (k === 'r' && G) $('btnSay').click(); if (k === 'h' && G) useHint();
      if (k === 'Escape' && G && G.modal === 'dialog') closeDialog();
      if (k.startsWith('Arrow')) e.preventDefault();
    });
    addEventListener('keyup', e => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; keys[k] = false; });
    addEventListener('blur', () => { for (const k in keys) keys[k] = false; for (const k in touch) touch[k] = 0; });

    for (const b of document.querySelectorAll('#dpad button')) {
      const d = b.dataset.d;
      b.addEventListener('pointerdown', e => { e.preventDefault(); touch[d] = 1; try { b.setPointerCapture(e.pointerId); } catch (_) { } });
      for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(ev, () => { touch[d] = 0; });
    }
    $('btnA').addEventListener('pointerdown', e => { e.preventDefault(); act(); });
    document.body.addEventListener('contextmenu', e => e.preventDefault());
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) document.body.classList.add('touch');
    requestAnimationFrame(frame);
  }

  // Untuk pengujian otomatis
  window.__bubu = { get G() { return G; }, act, doRest, openNpc, startGame, npcs: () => npcs, addToBasket, getDlg: () => dlg, curQuest, useHint };

  window.addEventListener('error', e => { const m = $('errmsg'); if (m) { m.textContent = 'Oops: ' + e.message; m.classList.remove('hidden'); } });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
