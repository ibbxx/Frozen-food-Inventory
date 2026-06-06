import { useQuery } from "@tanstack/react-query";

import { momqillQueryKeys } from "../shared/query-keys";

import {
  fetchIncomingHistory,
  fetchProductsForIncoming,
} from "./incoming-service";

export function useIncomingPageData() {
  const productsQuery = useQuery({
    queryKey: momqillQueryKeys.incomingProducts(),
    queryFn: fetchProductsForIncoming,
  });

  const historyQuery = useQuery({
    queryKey: momqillQueryKeys.incomingHistory(8),
    queryFn: () => fetchIncomingHistory(8),
  });

  return {
    historyQuery,
    productsQuery,
  };
}
