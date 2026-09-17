import { useQuery } from "@tanstack/react-query";

import { fetchPublicCatalogProducts } from "./public-catalog-service";

export function usePublicCatalog() {
  return useQuery({
    queryKey: ["public-catalog"],
    queryFn: fetchPublicCatalogProducts,
    staleTime: 1000 * 60 * 2, // 2 menit
  });
}
