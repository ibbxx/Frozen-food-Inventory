# Frozen Flow — Sistem Inventaris Toko Frozen Food

Sistem manajemen inventaris modern untuk toko frozen food, dibangun dengan **React + Vite + Supabase**.

## Fitur Utama

- 🧊 **Manajemen Produk** — Katalog produk frozen food dengan kategori, harga publik, dan batas stok minimum
- 📦 **Kontrol Inventaris** — Pelacakan stok produk, stok minimum, dan status stok rendah
- 🔄 **Alur Pergerakan Stok** — Catat barang masuk, barang keluar, dan audit perubahan stok
- ⚠️ **Peringatan Otomatis** — Notifikasi stok menipis dan produk habis
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
- `supabase/combined_schema.sql`
- `supabase/seeds/`

Jika Supabase menampilkan `relation "supabase_migrations.schema_migrations" does not exist`, jalankan:
- `supabase/repair_supabase_migration_metadata.sql`

Panduan lengkap: `docs/FROZEN_FOOD_SUPABASE_SETUP.md`

## Teknologi Utama
- **Frontend**: React 18, Vite, TailwindCSS, Tanstack Query, React Router
- **Backend / DB**: Supabase (Auth, Postgres DB, Row Level Security) 
- **Validasi Formulir**: Zod + React Hook Form
