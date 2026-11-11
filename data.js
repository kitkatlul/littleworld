/* ============================================================
   DATA.JS — semua isi permainan (misi, dialog, konstanta).
   Mau menambah misi? Cukup tambah satu blok di QUESTS.
   ============================================================ */
(function () {
  'use strict';
  window.D = {
    TS: 16, W: 40, H: 26,
    CROPS: ['carrot', 'tomato', 'corn', 'strawberry', 'sunflower'],
    MATS: ['wood', 'stone', 'leaf'],
    NAMES: {
      carrot: 'wortel', tomato: 'tomat', corn: 'jagung', strawberry: 'stroberi',
      sunflower: 'bunga matahari', wood: 'kayu', stone: 'batu', leaf: 'daun'
    },
    NPC_NAMES: { rabbit: 'Kelinci', cat: 'Kucing', fox: 'Rubah', duck: 'Bebek', squirrel: 'Tupai' },

    // Misi berurutan. kind: 'give' (beri barang) atau 'build' (bangun).
    QUESTS: [
      {
        id: 'q1', npc: 'rabbit', kind: 'give', need: { carrot: 2 }, reward: { wood: 1 },
        say: 'Hai! Ayo bantu Kelinci menanam dua wortel!',
        lack: 'Belum ada wortel. Ayo gali tanah, tanam, dan siram di kebun!',
        thanks: 'Hebat! Dua wortel untuk Kelinci. Terima kasih, Bubu!'
      },
      {
        id: 'q2', npc: 'cat', kind: 'give', need: { tomato: 2 }, reward: { stone: 1 },
        say: 'Kucing butuh dua tomat untuk membuka pasar. Ayo bantu!',
        lack: 'Kita butuh tomat. Ayo tanam bibit tomat di kebun!',
        thanks: 'Yeay! Pasar Persahabatan sudah buka!'
      },
      {
        id: 'q3', npc: 'fox', kind: 'build', need: { wood: 3, stone: 1 }, reward: {},
        say: 'Jembatan rusak! Ayo kumpulkan tiga kayu dan satu batu!',
        lack: 'Kita butuh kayu dari pohon dan batu dari bebatuan. Ayo jelajahi desa!',
        thanks: 'Hore! Jembatannya sudah jadi!'
      },
      {
        id: 'q4', npc: 'duck', kind: 'give', need: { strawberry: 2 }, reward: { leaf: 1 },
        say: 'Bebek sudah di seberang! Ayo ambilkan dua stroberi!',
        lack: 'Ayo tanam stroberi di kebun, lalu siram ya!',
        thanks: 'Enak sekali! Terima kasih, Bubu!'
      },
      {
        id: 'q5', npc: 'squirrel', kind: 'give', need: { sunflower: 2, corn: 1, leaf: 2 }, reward: {},
        say: 'Ayo siapkan festival! Kita butuh dua bunga matahari, satu jagung, dan dua daun!',
        lack: 'Untuk festival kita butuh bunga matahari, jagung, dan daun. Ayo siapkan!',
        thanks: 'Festival dimulai! Kamu Sahabat Desa Hebat!'
      }
    ],

    CHAT: {
      rabbit: ['Wortel itu enak sekali!', 'Kebun ini cantik kalau dirawat.', 'Tanaman butuh air supaya tumbuh.'],
      cat: ['Mari belanja di pasar!', 'Meong! Hari yang indah.', 'Terima kasih sudah membantu desa.'],
      fox: ['Aku suka membangun!', 'Kayu dan batu bisa jadi apa saja.', 'Ayo cari bahan di sekitar desa.'],
      duck: ['Kwek! Sungainya segar.', 'Aku ingin pulang ke rumahku.', 'Kwek kwek! Terima kasih!'],
      squirrel: ['Aku suka pesta!', 'Festival pasti seru.', 'Ayo kita menari bersama!']
    },
    CHAT_FEST: ['Hore! Festival yang seru!', 'Terima kasih, Bubu!', 'Desa kita indah sekali!'],

    // Dekorasi festival yang muncul setelah misi terakhir
    DECOR: [
      { t: 'table', x: 30, y: 9 }, { t: 'table', x: 34, y: 9 },
      { t: 'pot', x: 29, y: 5 }, { t: 'pot', x: 37, y: 5 }, { t: 'pot', x: 28, y: 11 }, { t: 'pot', x: 37, y: 11 },
      { t: 'bench', x: 31, y: 11 }, { t: 'bench', x: 34, y: 11 }
    ]
  };
})();
