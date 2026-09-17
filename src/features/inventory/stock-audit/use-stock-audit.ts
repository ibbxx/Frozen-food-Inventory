import { useQuery } from "@tanstack/react-query";

import { inventoryQueryKeys } from "../shared/query-keys";

import { fetchStockAuditHistory } from "./stock-audit-service";

export function useStockAudit() {
  return useQuery({
    queryKey: inventoryQueryKeys.stockAudit(),
    queryFn: fetchStockAuditHistory,
  });
}
