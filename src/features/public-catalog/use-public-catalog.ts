import { useQuery } from "@tanstack/react-query";

import { fetchPublicCatalogProducts } from "./public-catalog-service";

export function usePublicCatalog() {
  return useQuery({
    queryKey: ["public-catalog"],
    queryFn: fetchPublicCatalogProducts,
  });
}
