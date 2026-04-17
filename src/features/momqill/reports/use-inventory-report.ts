import { useQuery } from "@tanstack/react-query";
import type { InventoryReportFilters } from "../types/database";
import { fetchInventoryReport } from "./report-service";

export function useInventoryReport(filters: InventoryReportFilters) {
  return useQuery({
    queryKey: ["momqill", "reports", filters],
    queryFn: () => fetchInventoryReport(filters),
  });
}
