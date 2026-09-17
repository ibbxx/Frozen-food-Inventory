import { useQuery } from "@tanstack/react-query";

import { inventoryQueryKeys } from "../shared/query-keys";

import { fetchDashboardPayload } from "./dashboard-service";

export function useDashboardData() {
  return useQuery({
    queryKey: inventoryQueryKeys.dashboard(),
    queryFn: fetchDashboardPayload,
  });
}
