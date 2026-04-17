# Frozen Flow — Sistem Inventaris Toko Frozen Food

Sistem manajemen inventaris modern untuk toko frozen food, dibangun dengan **React + Vite + Supabase**.

## Fitur Utama

- 🧊 **Manajemen Produk** — Katalog produk frozen food dengan SKU, merek, kategori, dan batas stok minimum
- 📦 **Kontrol Inventaris** — Pelacakan stok per batch, lokasi freezer, dan tanggal kedaluwarsa
- 🔄 **Alur Pergerakan Stok** — Catat setiap aktivitas masuk, keluar, pindah, dan penyesuaian
- ⚠️ **Peringatan Otomatis** — Notifikasi stok menipis dan produk mendekati kedaluwarsa (FEFO)
- 📊 **Dasbor Operasi** — Ringkasan KPI, peringatan kritis, dan pergerakan stok terkini
- 👥 **Manajemen Tim** — Peran berbasis akses saat ini: Admin dan Staf

## Menjalankan Aplikasi Secara Lokal

1. Salin `.env.example` menjadi `.env`
2. Isi variabel lingkungan terkait `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
3. Install dependensi:
   ```bash
   npm install
   ```
4. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

## Database
Gunakan skrip SQL berikut untuk melakukan setup tabel dan data bawaan:
- `supabase/migrations/`
- `supabase/seeds/`

Panduan lengkap: `docs/FROZEN_FOOD_SUPABASE_SETUP.md`

## Teknologi Utama
- **Frontend**: React 18, Vite, TailwindCSS, Tanstack Query, React Router
- **Backend / DB**: Supabase (Auth, Postgres DB, Row Level Security) 
- **Validasi Formulir**: Zod + React Hook Form
