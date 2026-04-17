import { useQuery } from "@tanstack/react-query";
import { fetchDashboardPayload } from "./dashboard-service";

export function useDashboardData() {
  return useQuery({
    queryKey: ["momqill", "dashboard"],
    queryFn: fetchDashboardPayload,
  });
}
