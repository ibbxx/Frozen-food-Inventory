import { useMemo } from "react";

import { useProducts } from "../products/use-products";

import { buildInventoryMonitoringPayload } from "./inventory-service";

export function useInventoryMonitoring() {
  const productsQuery = useProducts();

  const derivedData = useMemo(() => {
    if (!productsQuery.data) return undefined;
    return buildInventoryMonitoringPayload(productsQuery.data);
  }, [productsQuery.data]);

  return {
    ...productsQuery,
    data: derivedData,
  } as any;
}
