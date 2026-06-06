import { useQuery } from "@tanstack/react-query";

import { momqillQueryKeys } from "../shared/query-keys";

import { fetchInventoryReport } from "./report-service";

import type { InventoryReportFilters } from "../types/database";

export function useInventoryReport(filters: InventoryReportFilters) {
  return useQuery({
    queryKey: momqillQueryKeys.report(filters),
    queryFn: () => fetchInventoryReport(filters),
  });
}
