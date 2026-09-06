import { useQuery } from "@tanstack/react-query";

import { fetchMomqillProducts } from "../products/products-service";
import { momqillQueryKeys } from "../shared/query-keys";

import {
  fetchIncomingHistory,
} from "./incoming-service";

export function useIncomingPageData() {
  const productsQuery = useQuery({
    queryKey: momqillQueryKeys.productList(),
    queryFn: fetchMomqillProducts,
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
