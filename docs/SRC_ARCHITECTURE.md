# Source Architecture

Struktur `src` sekarang dibagi jadi tiga layer utama:

- `src/app`
  Menyimpan bootstrap aplikasi: `router`, `providers`, `layout`, error boundary, dan metadata route.
- `src/shared`
  Menyimpan hal reusable lintas fitur: komponen UI dasar dan utilitas global seperti Supabase client, query client, env, dan helper.
- `src/features`
  Menyimpan use case/domain. Setiap fitur idealnya membawa page, hook, service, dan komponen lokalnya sendiri.

Aturan praktis:

- `app` boleh mengimpor dari `shared` dan `features`.
- `features` boleh mengimpor dari `shared`.
- `shared` tidak boleh tahu soal `app` atau fitur spesifik.
- Komponen reusable umum masuk `shared/ui`.
- Komponen yang hanya dipakai satu fitur tetap tinggal di folder fitur itu sendiri.
- Query key dan repository per domain sebaiknya dipusatkan di `features/<domain>/shared/*`.

Contoh pembacaan folder saat menambah kode:

- Tambah route/layout global: `src/app/*`
- Tambah tombol/input/card reusable: `src/shared/ui/*`
- Tambah logic produk/inventory/report: `src/features/momqill/*`
- Tambah helper global: `src/shared/lib/*`
- Tambah data access Momqill terpusat: `src/features/momqill/shared/repository.ts`

Kalau nanti mau lanjut refactor, langkah berikut yang paling masuk akal:

- Pecah `src/features/momqill` menjadi `dashboard`, `products`, `inventory`, `incoming`, `outgoing`, `reports`, dan `shared`.
- Tambahkan `index.ts` atau `index.js` per fitur untuk mengurangi import path yang panjang.
- Pisahkan service Supabase dan mapper data bila kompleksitas query mulai naik.
