import { useQuery } from "@tanstack/react-query";

import { inventoryQueryKeys } from "../shared/query-keys";

import { fetchInventoryReport } from "./report-service";

import type { InventoryReportFilters } from "../types/database";

export function useInventoryReport(filters: InventoryReportFilters) {
  return useQuery({
    queryKey: inventoryQueryKeys.report(filters),
    queryFn: () => fetchInventoryReport(filters),
  });
}
