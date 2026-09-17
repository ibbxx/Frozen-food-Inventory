import { useQuery } from "@tanstack/react-query";

import { fetchProducts } from "../products/products-service";
import { inventoryQueryKeys } from "../shared/query-keys";

import {
  fetchIncomingHistory,
} from "./incoming-service";

export function useIncomingPageData() {
  const productsQuery = useQuery({
    queryKey: inventoryQueryKeys.productList(),
    queryFn: fetchProducts,
  });

  const historyQuery = useQuery({
    queryKey: inventoryQueryKeys.incomingHistory(8),
    queryFn: () => fetchIncomingHistory(8),
  });

  return {
    historyQuery,
    productsQuery,
  };
}
