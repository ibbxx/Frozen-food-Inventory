/**
 * Daftar kategori fallback — digunakan sebagai initialData saat data dari
 * Supabase belum tersedia, sehingga form produk tetap bisa dipakai saat loading.
 *
 * Sumber kebenaran kategori kini ada di tabel `product_categories` di Supabase.
 */
export const productCategoryFallback: string[] = [
  "Daging",
  "Suki",
  "Paket Hemat",
  "Bumbu",
  "Sosis",
  "Mayo",
  "Bakso",
  "Kulit",
  "Snack Frozen",
  "Sapi",
  "Keju",
  "Saos",
  "Marinasi",
  "Sayuran Frozen",
  "Nuggets",
  "Kentang",
  "Ayam",
];

/**
 * @deprecated Gunakan `productCategoryFallback` atau data dinamis dari
 * `useCategories()`. Alias ini dipertahankan untuk backward-compat sementara
 * sambil migrasi berlangsung.
 */
export const productCategoryOptions = productCategoryFallback;
