import { useQuery } from "@tanstack/react-query";

import { inventoryQueryKeys } from "../shared/query-keys";

import { fetchCategories } from "./categories-service";

const STALE_TIME = 1000 * 60 * 5; // 5 menit — kategori jarang berubah

/**
 * Daftar nama kategori untuk dropdown form produk.
 *
 * Sumber kebenaran kategori adalah tabel `product_categories` di Supabase.
 * Tidak ada lagi daftar kategori hardcoded di frontend: saat data belum selesai
 * dimuat, komponen pemanggil harus menampilkan keadaan memuat / kosong.
 */
export function useCategories() {
  return useQuery({
    queryKey: inventoryQueryKeys.categoryList(),
    queryFn: fetchCategories,
    select: (data: { name: string }[]) => data.map((category) => category.name),
    staleTime: STALE_TIME,
  });
}

/**
 * Daftar kategori lengkap (id + name) untuk halaman "Kelola Kategori".
 * Sumbernya sama dengan `useCategories()` sehingga tidak mungkin berbeda.
 */
export function useCategoryRecords() {
  return useQuery({
    queryKey: inventoryQueryKeys.categoryList(),
    queryFn: fetchCategories,
    staleTime: STALE_TIME,
  });
}
