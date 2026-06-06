import { useQuery } from "@tanstack/react-query";

import { momqillQueryKeys } from "../shared/query-keys";

import { fetchDashboardPayload } from "./dashboard-service";

export function useDashboardData() {
  return useQuery({
    queryKey: momqillQueryKeys.dashboard(),
    queryFn: fetchDashboardPayload,
  });
}
