import { useQuery } from "@tanstack/react-query";

import { momqillQueryKeys } from "../shared/query-keys";

import {
  fetchProductsForStockTransactions,
  fetchRecentStockLogs,
} from "./transactions-service";

export function useStockTransactionsPageData() {
  const productsQuery = useQuery({
    queryKey: momqillQueryKeys.stockTransactionProducts(),
    queryFn: fetchProductsForStockTransactions,
  });

  const logsQuery = useQuery({
    queryKey: momqillQueryKeys.stockLogs(12),
    queryFn: () => fetchRecentStockLogs(12),
  });

  return {
    logsQuery,
    productsQuery,
  };
}
