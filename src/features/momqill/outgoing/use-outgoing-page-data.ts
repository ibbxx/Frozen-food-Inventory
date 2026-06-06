import { useQuery } from "@tanstack/react-query";

import { momqillQueryKeys } from "../shared/query-keys";

import {
  fetchOutgoingHistory,
  fetchProductsForOutgoing,
} from "./outgoing-service";

export function useOutgoingPageData() {
  const productsQuery = useQuery({
    queryKey: momqillQueryKeys.outgoingProducts(),
    queryFn: fetchProductsForOutgoing,
  });

  const historyQuery = useQuery({
    queryKey: momqillQueryKeys.outgoingHistory(8),
    queryFn: () => fetchOutgoingHistory(8),
  });

  return {
    historyQuery,
    productsQuery,
  };
}
