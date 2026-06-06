import { useQuery } from "@tanstack/react-query";

import { momqillQueryKeys } from "../shared/query-keys";

import { fetchStockAuditHistory } from "./stock-audit-service";

export function useStockAudit() {
  return useQuery({
    queryKey: momqillQueryKeys.stockAudit(),
    queryFn: fetchStockAuditHistory,
  });
}
