import { useQuery } from "@tanstack/react-query";

import { productCategoryFallback } from "@/shared/lib/product-categories";

import { momqillQueryKeys } from "../shared/query-keys";

import { fetchCategories } from "./categories-service";

const STALE_TIME = 1000 * 60 * 5; // 5 menit — kategori jarang berubah

const fallbackRecords = productCategoryFallback.map((name, idx) => ({
  id: `fallback-${idx}`,
  name,
  created_at: "",
}));

/**
 * Mengambil daftar nama kategori sebagai `string[]`.
 * Digunakan oleh dropdown `<select>` di form produk.
 */
export function useCategories() {
  return useQuery({
    queryKey: momqillQueryKeys.categoryList(),
    queryFn: fetchCategories,
    select: (data) => data.map((c) => c.name),
    initialData: fallbackRecords,
    staleTime: STALE_TIME,
  });
}

/**
 * Mengambil daftar kategori lengkap sebagai `ProductCategoryRecord[]` (id + name).
 * Digunakan oleh `CategoryManageModal` yang membutuhkan id untuk operasi edit/hapus.
 */
export function useCategoryRecords() {
  return useQuery({
    queryKey: momqillQueryKeys.categoryList(),
    queryFn: fetchCategories,
    initialData: fallbackRecords,
    staleTime: STALE_TIME,
  });
}
