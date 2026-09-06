import { useQuery } from "@tanstack/react-query";

import { fetchPublicCatalogProducts } from "./public-catalog-service";

export function usePublicCatalog(store?: string) {
  return useQuery({
    queryKey: ["public-catalog", store ?? "all"],
    queryFn: fetchPublicCatalogProducts,
    staleTime: 1000 * 60 * 2, // 2 menit
  });
}
