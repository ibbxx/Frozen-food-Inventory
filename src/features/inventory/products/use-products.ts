import { useQuery } from "@tanstack/react-query";

import { inventoryQueryKeys } from "../shared/query-keys";

import { fetchProducts } from "./products-service";

export function useProducts() {
  return useQuery({
    queryKey: inventoryQueryKeys.productList(),
    queryFn: async () => {
      const data = await fetchProducts();
      try {
        localStorage.setItem("karunrung_cached_products", JSON.stringify(data));
      } catch {
        // Abaikan error penyimpanan localStorage
      }
      return data;
    },
    initialData: () => {
      try {
        const cached = localStorage.getItem("karunrung_cached_products");
        return cached ? JSON.parse(cached) : undefined;
      } catch {
        return undefined;
      }
    },
  });
}
