# Karunrung Frozen Food Design System

Dokumen ini mengunci fondasi desain untuk aplikasi **Karunrung Frozen Food Inventory**.
Semua komponen, halaman, dan interaksi wajib tunduk pada aturan di bawah ini.

---

## 1. Prinsip Utama & Mobile-First Floor

1. **Mobile-First Responsive Non-Negotiables**:
   - Desain dimulai dari layar ponsel (320px, 375px, 414px) sebelum meluas ke tablet (768px) dan desktop (1024px+).
   - Root `overflow-x: clip` pada `html` dan `body`, pantang ada *horizontal scroll bleed*.
   - Target sentuh minimum 44px (rekomendasi 48px) untuk semua tombol, link navigasi, dan input.
   - Tidak ada teks yang patah menjadi 2 baris pada tombol atau chip aksi (*no 2-line clickable text*).
   - Pada layar mobile, grid metrik dan bagian formulir otomatis kolaps menjadi 1 kolom (`grid-cols-1`).

2. **Anti-Slop Hard Rules**:
   - **No Gradient Hero**: Pantang menggunakan gradien latar belakang hero (termasuk gradien cyan/teal pastel). Gunakan permukaan padat (*cool-engineered paper*) dengan 1 aksen sinyal tegas.
   - **2+1 Font Discipline**: Pantang memakai 1 font untuk seluruh UI. Selalu pasangkan Display Face + Body Face + Mono Face.
   - **No Italic Headers**: Semua judul (`h1`, `h2`, `h3`, `h4`) selalu tegak (`font-style: normal`). Penekanan dibuat dengan bobot (*font-weight*), warna aksen, atau *hairline rule*.
   - **Asymmetric Layout**: Hindari simetri kaku yang seragam (*centred-everything*). Gunakan *biased layout* yang jelas.
   - **No Generic Icon Tiles**: Tidak ada kartu fitur dengan ikon melayang di kotak pastel pojok atas. Angka dan label memimpin informasi (*lead with type*).
   - **Aksen Terkendali**: Aksen *Electric Cobalt* tetap di bawah 5% luas tampilan total (hanya untuk status kritis, tombol utama, dan indikator aktif).

---

## 2. Palet Token Warna (OKLCH)

```css
:root {
  /* Paper (Latar Belakang Bersih Berkarakter Dingin) */
  --color-paper:       oklch(98.5% 0.005 250); /* #f8faff */
  --color-paper-card:  oklch(100% 0 0);        /* #ffffff */
  --color-paper-subtle: oklch(96.5% 0.008 250); /* #f0f4f9 */
  --color-paper-hover:  oklch(94.5% 0.012 250);

  /* Ink (Teks Kontras Tinggi, Terbaca Jelas) */
  --color-ink:         oklch(22% 0.02 258);    /* #181c24 - Charcoal pekat */
  --color-ink-muted:   oklch(45% 0.02 255);    /* #565e6d - Teks pendukung */
  --color-ink-subtle:  oklch(65% 0.015 255);   /* #8f96a3 - Border & caption */

  /* Hairline Rules */
  --color-rule:        oklch(91% 0.010 250);   /* 1px crisp hairline border */
  --color-rule-subtle: oklch(94% 0.006 250);

  /* Accent (Electric Arctic Cobalt - Signal < 5%) */
  --color-accent:      oklch(55% 0.22 256);    /* Cobalt murni */
  --color-accent-hover: oklch(48% 0.22 256);
  --color-accent-ink:  oklch(99% 0 0);         /* Teks di atas aksen */
  --color-accent-tint: oklch(95% 0.04 256);    /* Background tipis aksen */

  /* Semantic Alerts */
  --color-danger:      oklch(58% 0.22 25);     /* Merah peringatan stok habis */
  --color-danger-tint: oklch(96% 0.03 25);
  --color-warning:     oklch(70% 0.18 65);     /* Kuning/Amber restok */
  --color-warning-tint: oklch(96% 0.04 65);
  --color-success:     oklch(62% 0.17 150);    /* Hijau sukses/aman */
  --color-success-tint: oklch(96% 0.03 150);

  /* Technical Radii */
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   14px;
  --radius-full: 9999px;

  /* Snappy Motion */
  --ease-snappy: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-fast: 140ms;
}
```

---

## 3. Tipografi (2+1 Font Discipline)

- **Display Face**: **Space Grotesk** (`font-family: 'Space Grotesk', sans-serif;`)
  - Digunakan untuk: Judul Halaman (`h1`, `h2`), Nama Brand, Angka Rekapitulasi Utama.
  - Tracking: `-0.025em` (rapat, tegas, presisi instrumen).
  - Style: Normal (pantang miring).

- **Body Face**: **Inter** (`font-family: 'Inter', system-ui, sans-serif;`)
  - Digunakan untuk: Teks instruksi, deskripsi, form label, konten tabel umum.
  - Weight: 400 (regular), 500 (medium).

- **Mono Face**: **JetBrains Mono** (`font-family: 'JetBrains Mono', monospace;`)
  - Digunakan untuk: SKU Produk, Jumlah Stok, Tanggal Kedaluwarsa, Angka Selisih, Badge Status (`tabular-nums`).

---

## 4. Makrostruktur Aplikasi: Mobile-First Workbench

1. **Header & Navigasi Mobile**:
   - Bar atas kompak dengan tinggi 56px (`h-14`), latar `var(--color-paper-card)` dengan *hairline bottom border*.
   - Tombol hamburger responsif untuk membuka *Drawer Navigasi* penuh yang nyaman dioperasikan satu jempol.
   - Indikator status koneksi/shift aktif langsung terlihat di pojok bar atas.

2. **Drawer Navigasi Mobile**:
   - Meluncur mulus dari sisi kiri dengan overlay transparan berbobot.
   - Menu terorganisasi rapi:
     - **Operasional**: Dasbor, Monitoring Stok, Transaksi Stok, Audit Stok.
     - **Alur Barang**: Barang Masuk, Barang Keluar.
     - **Manajemen**: Master Produk, Laporan, Tim.
   - Tombol otomatis menutup drawer begitu link dipilih.
   - Di desktop (`md:block`), sidebar tetap menjadi kolom samping permanen selebar 260px.

3. **Komponen Header Halaman (Asymmetric Type-First Masthead)**:
   - Menggantikan `PageHero` lama.
   - Layout: Kiri berisi judul tebal Space Grotesk + deskripsi ringkas + chip status cold chain; Kanan berisi tombol aksi cepat (misal: `+ Tambah Produk`, `+ Input Masuk`).
   - Pada mobile: otomatis bertumpuk vertikal dengan tombol aksi membentang penuh (*full-width*) agar mudah ditekan.

4. **Bento Telemetry Cards (Menggantikan MetricCard)**:
   - Desain terstruktur: Angka stok berukuran besar monospasial (`text-2xl sm:text-3xl font-mono tabular-nums`).
   - Label di atas angka dengan huruf kapital mikro (`text-xs uppercase tracking-wider`).
   - Indikator selisih tren / badge status langsung inline tanpa kotak pastel mengapung.

5. **Tabel Inventori Responsif**:
   - Di mobile: pembungkus dengan *smooth touch-scrolling* (`overflow-x-auto`), header tabel lengket (*sticky header*), atau tampilan kartu bertingkat per item.
