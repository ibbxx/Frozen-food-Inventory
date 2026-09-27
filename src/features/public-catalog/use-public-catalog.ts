import { useQuery } from "@tanstack/react-query";

import {
  fetchPublicCatalogProducts,
  fetchPublicProductById,
  fetchRelatedPublicProducts,
} from "./public-catalog-service";

export function usePublicCatalog() {
  return useQuery({
    queryKey: ["public-catalog"],
    queryFn: fetchPublicCatalogProducts,
    staleTime: 1000 * 60 * 2, // 2 menit
  });
}

export function usePublicProduct(productId: string | undefined) {
  return useQuery({
    queryKey: ["public-product", productId],
    queryFn: () => (productId ? fetchPublicProductById(productId) : null),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 2,
  });
}

export function usePublicRelatedProducts(
  category: string | undefined,
  currentProductId: string | undefined,
  limit = 4,
) {
  return useQuery({
    queryKey: ["public-related-products", category, currentProductId],
    queryFn: () =>
      category && currentProductId
        ? fetchRelatedPublicProducts(category, currentProductId, limit)
        : [],
    enabled: Boolean(category && currentProductId),
    staleTime: 1000 * 60 * 2,
  });
}

