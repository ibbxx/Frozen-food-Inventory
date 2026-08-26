import { useQuery } from "@tanstack/react-query";

import { fetchMomqillProducts } from "../products/products-service";
import { momqillQueryKeys } from "../shared/query-keys";
import {
  fetchRecentStockLogs,
} from "./transactions-service";

export function useStockTransactionsPageData() {
  const productsQuery = useQuery({
    queryKey: momqillQueryKeys.productList(),
    queryFn: fetchMomqillProducts,
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
