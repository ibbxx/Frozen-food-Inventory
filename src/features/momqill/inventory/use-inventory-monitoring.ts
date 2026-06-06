import { useQuery } from "@tanstack/react-query";

import { momqillQueryKeys } from "../shared/query-keys";

import { fetchInventoryMonitoring } from "./inventory-service";

export function useInventoryMonitoring() {
  return useQuery({
    queryKey: momqillQueryKeys.inventoryMonitoring(),
    queryFn: fetchInventoryMonitoring,
  });
}
