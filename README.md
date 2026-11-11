# Bubu's Little World: Desa Keajaiban

Game simulasi desa edukatif untuk anak TK A (4–5 tahun). Bubu si beruang membantu penduduk Desa Keajaiban: berkebun, mengumpulkan bahan, membangun jembatan, lalu menyiapkan festival.

Game ini **tidak perlu install apa pun dan tidak perlu build**. Isinya hanya file HTML, CSS, dan JavaScript biasa, jadi cukup di-upload lalu di-deploy.

---

## Isi folder

```
bubus-little-world/
├── index.html        ← halaman utama (titik masuk game)
├── css/style.css     ← tampilan panel kayu, tombol, dll.
├── js/
│   ├── data.js       ← MISI, dialog, daftar tanaman (paling mudah diubah)
│   ├── sprites.js    ← semua gambar pixel art (dibuat dari kode, orisinal)
│   ├── audio.js      ← efek suara, musik, suara instruksi bahasa Indonesia
│   ├── world.js      ← peta desa & tabrakan
│   └── game.js       ← logika: gerak, kebun, misi, UI, simpan/muat
├── vercel.json       ← pengaturan Vercel (sudah siap)
├── package.json      ← info proyek (tidak ada dependensi)
└── README.md         ← panduan ini
```

---

## Cara main

| Perangkat | Gerak | Aksi |
|---|---|---|
| Laptop / PC | Tombol panah atau WASD | Spasi / Enter / E |
| HP / Tablet | Tombol arah di layar kiri | Tombol cakar merah di kanan |

Tombol kanan atas: 🔊 ulangi instruksi · 💡 bantuan (panah penunjuk) · 🌙 istirahat (ganti hari, tanaman tumbuh) · ♪ suara on/off · ⚙ halaman guru (**tahan 1,5 detik**).

**Alur permainan:**
1. Bicara dengan Kelinci (dekati lalu tekan aksi). Papan misi kiri atas menunjukkan apa yang dibutuhkan.
2. Di kebun: **gali → tanam → siram → istirahat (🌙) → siram lagi → istirahat → panen**. Tanaman tidak pernah mati; kalau lupa disiram, ia hanya berhenti tumbuh (muncul tetes air biru sebagai tanda).
3. Dekati penduduk, lalu ketuk barang di bagian bawah dialog untuk memasukkannya ke keranjang. Barang yang salah akan bergoyang dan Bubu berkata "coba kita periksa lagi".
4. Kumpulkan kayu (pohon), batu (bebatuan), daun (semak) untuk memperbaiki jembatan bersama Rubah.
5. Setelah jembatan jadi, seberangi sungai, bantu Bebek dan Tupai, dan mulailah Festival.

---

## Cara menjalankan di komputer (opsional)

Cukup **klik dua kali `index.html`**. Jika suara atau simpan progres tidak jalan, buka lewat server lokal: install Node.js, buka terminal di folder ini, ketik `npx serve .` lalu buka alamat yang muncul.

---

## TUTORIAL LANGKAH DEMI LANGKAH: dari ZIP sampai online

### Bagian A — Upload ke GitHub (tanpa coding, tanpa terminal)

1. Buka **https://github.com** → klik **Sign up** (kalau belum punya akun) → ikuti pendaftaran.
2. Setelah masuk, klik tombol **+** di kanan atas → **New repository**.
3. Isi **Repository name**: `bubus-little-world`. Pilih **Public**. **Jangan** centang apa pun lainnya. Klik **Create repository**.
4. Di halaman berikutnya, cari tulisan kecil **"uploading an existing file"** → klik.
5. Di komputer Anda, **ekstrak (unzip) file ZIP** ini sampai terlihat folder `bubus-little-world`. Buka foldernya.
6. Pilih **semua isi di dalam folder** (`index.html`, folder `css`, folder `js`, `vercel.json`, `package.json`, `README.md`). Tekan **Ctrl+A** lalu **drag** ke kotak upload di GitHub.
   > Penting: yang di-drag adalah *isi* folder, bukan folder luarnya, supaya `index.html` berada di paling atas repository.
7. Tunggu semua file selesai ter-upload (pastikan folder `css` dan `js` ikut ter-upload). Klik tombol hijau **Commit changes**.

### Bagian B — Deploy ke Vercel

1. Buka **https://vercel.com** → **Sign Up** → pilih **Continue with GitHub** → izinkan.
2. Di dashboard klik **Add New… → Project**.
3. Cari repository `bubus-little-world` → klik **Import**.
4. **Biarkan semua pengaturan apa adanya.** Framework Preset: *Other*. Jangan isi Build Command. Klik **Deploy**.
5. Tunggu ±30 detik. Setelah muncul konfeti, klik gambar pratinjau atau **Visit** untuk membuka game Anda. Alamatnya mirip `bubus-little-world.vercel.app`.

### Bagian C — Mengganti game lama `petualanganbubu.vercel.app`

Jika ingin tetap memakai alamat lama: buka proyek **petualanganbubu** di Vercel → **Settings → Git** → hubungkan ke repository baru ini, atau cukup ganti isi repository lama dengan file-file baru (upload ulang & commit), lalu Vercel otomatis deploy ulang.

### Bagian D — Mengubah game setelah online

Di GitHub, buka file (misalnya `js/data.js`) → klik ikon pensil ✏️ → ubah teks → **Commit changes**. Vercel akan otomatis memperbarui situs dalam ±1 menit.

---

## Belajar mengubah isi game (tanpa paham coding)

Semua misi ada di `js/data.js`. Contoh satu misi:

```js
{
  id: 'q1', npc: 'rabbit', kind: 'give',
  need: { carrot: 2 },          // butuh 2 wortel
  reward: { wood: 1 },          // hadiah 1 kayu
  say: 'Hai! Ayo bantu Kelinci menanam dua wortel!',   // kalimat yang diucapkan
  lack: 'Belum ada wortel. Ayo gali tanah, ...',        // petunjuk jika barang belum ada
  thanks: 'Hebat! ...'                                  // ucapan terima kasih
}
```
- Ubah angka `2` untuk mengganti jumlah.
- Nama barang yang boleh dipakai: `carrot`, `tomato`, `corn`, `strawberry`, `sunflower`, `wood`, `stone`, `leaf`.
- Nama penduduk (`npc`): `rabbit`, `cat`, `fox`, `duck`, `squirrel`.

---

## Catatan suara
Suara instruksi memakai *speech synthesis* bawaan browser. Jika perangkat tidak memiliki suara bahasa Indonesia, game **tidak rusak**: kalimat tetap tampil sebagai teks di layar dan efek suara + musik tetap berbunyi. Pada HP/tablet Android dan iPad, suara Indonesia biasanya sudah tersedia (pengaturan: *Text-to-speech*).

## Halaman guru / orang tua
Tahan tombol ⚙ selama 1,5 detik. Halaman ini hanya berisi **catatan aktivitas bermain** (jumlah misi, berhitung, berkebun, bantuan yang dipakai, dll.), bukan penilaian atau diagnosis kemampuan anak.

## Status pengembangan (jujur)

**Sudah ada & sudah diuji otomatis di Chromium (34 pengecekan lulus, 0 error console):**
gerak 4 arah, tabrakan (rumah, sungai, jembatan rusak), kamera mengikuti, interaksi NPC, kebun (gali/tanam/siram/tumbuh/panen), inventaris bertambah dan berkurang, pilihan salah ditolak, 5 misi berurutan, jembatan berubah setelah diperbaiki, Bebek menyeberang, pasar terbuka, festival (lampu, dekorasi, penduduk berkumpul, penghargaan "Sahabat Desa Hebat"), simpan & muat progres, tombol mute, bantuan panah, halaman guru, tampilan kontrol sentuh.

**Belum sempat diuji / belum ada:**
- Belum diuji di HP/tablet sungguhan (hanya emulasi layar di browser). Mohon coba langsung dan beri tahu jika ada tombol yang terasa kurang nyaman.
- Suara instruksi bahasa Indonesia belum bisa diuji di sini (tergantung perangkat Anda).
- Belum diuji di Safari/iOS.
- **Belum diimplementasikan dari rancangan awal:** tantangan pola merah-kuning, tantangan jalur/ubin jalan yang disusun anak, penyusunan material berurutan di bengkel (saat ini pembangunan memakai keranjang bahan), proyek bengkel lain (pagar, bangku), suara lingkungan desa, dan beberapa animasi (menyiram/membawa barang). Semuanya dapat ditambah di tahap berikutnya.
