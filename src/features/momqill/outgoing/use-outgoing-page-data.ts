import { useQuery } from "@tanstack/react-query";
import {
  fetchOutgoingHistory,
  fetchProductsForOutgoing,
} from "./outgoing-service";

export function useOutgoingPageData() {
  const productsQuery = useQuery({
    queryKey: ["momqill", "outgoing", "products"],
    queryFn: fetchProductsForOutgoing,
  });

  const historyQuery = useQuery({
    queryKey: ["momqill", "outgoing", "history"],
    queryFn: () => fetchOutgoingHistory(8),
  });

  return {
    historyQuery,
    productsQuery,
  };
}
