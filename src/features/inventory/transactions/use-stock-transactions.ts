import { useQuery } from "@tanstack/react-query";

import { fetchProducts } from "../products/products-service";
import { inventoryQueryKeys } from "../shared/query-keys";

import {
  fetchRecentStockLogs,
} from "./transactions-service";

export function useStockTransactionsPageData() {
  const productsQuery = useQuery({
    queryKey: inventoryQueryKeys.productList(),
    queryFn: fetchProducts,
  });

  const logsQuery = useQuery({
    queryKey: inventoryQueryKeys.stockLogs(12),
    queryFn: () => fetchRecentStockLogs(12),
  });

  return {
    logsQuery,
    productsQuery,
  };
}
