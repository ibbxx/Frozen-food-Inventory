import { useQuery } from "@tanstack/react-query";
import {
  fetchIncomingHistory,
  fetchProductsForIncoming,
} from "./incoming-service";

export function useIncomingPageData() {
  const productsQuery = useQuery({
    queryKey: ["momqill", "incoming", "products"],
    queryFn: fetchProductsForIncoming,
  });

  const historyQuery = useQuery({
    queryKey: ["momqill", "incoming", "history"],
    queryFn: () => fetchIncomingHistory(8),
  });

  return {
    historyQuery,
    productsQuery,
  };
}
