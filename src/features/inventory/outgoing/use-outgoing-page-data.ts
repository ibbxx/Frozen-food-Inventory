import { useQuery } from "@tanstack/react-query";

import { fetchProducts } from "../products/products-service";
import { inventoryQueryKeys } from "../shared/query-keys";

import {
  fetchOutgoingHistory,
} from "./outgoing-service";

export function useOutgoingPageData() {
  const productsQuery = useQuery({
    queryKey: inventoryQueryKeys.productList(),
    queryFn: fetchProducts,
  });

  const historyQuery = useQuery({
    queryKey: inventoryQueryKeys.outgoingHistory(8),
    queryFn: () => fetchOutgoingHistory(8),
  });

  return {
    historyQuery,
    productsQuery,
  };
}
