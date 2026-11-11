/* ============================================================
   AUDIO.JS — efek suara, musik lembut, dan suara instruksi.
   Semua suara dibuat dari kode (tanpa file mp3), jadi tidak ada file hilang.
   ============================================================ */
(function () {
  'use strict';
  let ctx = null, master = null, muted = false, mt = null, festival = false, step = 0;
  const Snd = window.Snd = {};

  Snd.init = function () {
    if (!ctx) {
      try {
        const C = window.AudioContext || window.webkitAudioContext;
        ctx = new C(); master = ctx.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ctx.destination); music();
      } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    if ('speechSynthesis' in window) { try { speechSynthesis.getVoices(); } catch (e) { } }
  };

  function tone(f, t, d, type, v) {
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.03);
  }
  const SFX = {
    pop: [[660, 0, .08]],
    gather: [[330, 0, .06], [440, .06, .09]],
    dig: [[120, 0, .08, 'sawtooth'], [90, .07, .09, 'sawtooth']],
    plant: [[392, 0, .08], [523, .08, .1]],
    water: [[800, 0, .05, 'sine'], [700, .06, .05, 'sine'], [600, .12, .07, 'sine']],
    harvest: [[523, 0, .08], [659, .08, .08], [784, .16, .14]],
    wrong: [[220, 0, .15, 'triangle'], [196, .15, .2, 'triangle']],
    win: [[523, 0, .1], [659, .1, .1], [784, .2, .1], [1047, .3, .35]],
    build: [[150, 0, .07], [150, .15, .07], [200, .3, .12]],
    sleep: [[392, 0, .3, 'sine'], [330, .3, .3, 'sine'], [262, .6, .5, 'sine']]
  };
  Snd.sfx = function (n) {
    if (!ctx || muted) return; const s = SFX[n]; if (!s) return; const t = ctx.currentTime;
    s.forEach(a => tone(a[0], t + a[1], a[2], a[3] || 'square', 0.07));
  };

  const MEL = [262, 330, 392, 330, 294, 392, 440, 392, 262, 330, 392, 523, 440, 392, 330, 294];
  function music() {
    clearInterval(mt);
    mt = setInterval(() => {
      if (!ctx || muted) return; const t = ctx.currentTime + 0.02; const f = MEL[step % MEL.length];
      tone(f, t, festival ? .25 : .5, 'triangle', .035);
      if (step % 4 === 0) tone(f / 2, t, .9, 'sine', .03);
      if (festival && step % 2 === 1) tone(f * 2, t, .15, 'square', .02);
      step++;
    }, festival ? 260 : 460);
  }
  Snd.festival = function (on) { festival = on; if (ctx) music(); };
  Snd.setMuted = function (m) {
    muted = m; if (master) master.gain.value = m ? 0 : 1;
    if (m && 'speechSynthesis' in window) { try { speechSynthesis.cancel(); } catch (e) { } }
  };
  Snd.isMuted = () => muted;

  // Suara instruksi bahasa Indonesia. Jika perangkat tidak punya suara Indonesia,
  // teks tetap tampil di layar (caption) sehingga game tidak rusak.
  Snd.speak = function (text) {
    if (muted || !('speechSynthesis' in window)) return false;
    try {
      const voices = speechSynthesis.getVoices() || [];
      const id = voices.find(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith('id'));
      if (voices.length && !id) return false;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = 'id-ID'; if (id) u.voice = id; u.rate = .85; u.pitch = 1.25;
      speechSynthesis.speak(u); return true;
    } catch (e) { return false; }
  };
})();
