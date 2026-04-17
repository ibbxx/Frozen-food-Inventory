import { useQuery } from "@tanstack/react-query";
import { fetchInventoryMonitoring } from "./inventory-service";

export function useInventoryMonitoring() {
  return useQuery({
    queryKey: ["momqill", "inventory", "monitoring"],
    queryFn: fetchInventoryMonitoring,
  });
}
