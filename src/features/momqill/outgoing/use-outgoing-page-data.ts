import { useQuery } from "@tanstack/react-query";

import { fetchMomqillProducts } from "../products/products-service";
import { momqillQueryKeys } from "../shared/query-keys";
import {
  fetchOutgoingHistory,
} from "./outgoing-service";

export function useOutgoingPageData() {
  const productsQuery = useQuery({
    queryKey: momqillQueryKeys.productList(),
    queryFn: fetchMomqillProducts,
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
