import type { InventoryReportFilters } from "../types/database";
import type { QueryClient } from "@tanstack/react-query";

export const momqillQueryKeys = {
  dashboard: () => ["momqill", "dashboard"] as const,
  incoming: () => ["momqill", "incoming"] as const,
  incomingHistory: (limit = 8) => ["momqill", "incoming", "history", limit] as const,
  incomingProducts: () => ["momqill", "incoming", "products"] as const,
  inventory: () => ["momqill", "inventory"] as const,
  inventoryMonitoring: () => ["momqill", "inventory", "monitoring"] as const,
  outgoing: () => ["momqill", "outgoing"] as const,
  outgoingHistory: (limit = 8) => ["momqill", "outgoing", "history", limit] as const,
  outgoingProducts: () => ["momqill", "outgoing", "products"] as const,
  productList: () => ["momqill", "products"] as const,
  report: (filters: InventoryReportFilters) => ["momqill", "reports", filters] as const,
  reports: () => ["momqill", "reports"] as const,
  stockAudit: () => ["momqill", "stock-audit"] as const,
  stockLogs: (limit = 12) => ["momqill", "stock-logs", limit] as const,
  stockTransactionProducts: () => ["momqill", "stock-transaction", "products"] as const,
  publicCatalog: () => ["public-catalog"] as const,
};

async function invalidateMany(
  queryClient: QueryClient,
  queryKeys: ReadonlyArray<ReadonlyArray<unknown>>,
) {
  await Promise.all(
    queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
}

export async function invalidateAfterProductMutation(queryClient: QueryClient) {
  await invalidateMany(queryClient, [
    momqillQueryKeys.productList(),
    momqillQueryKeys.inventory(),
    momqillQueryKeys.dashboard(),
    momqillQueryKeys.publicCatalog(),
  ]);
}

export async function invalidateAfterIncomingMutation(queryClient: QueryClient) {
  await invalidateMany(queryClient, [
    momqillQueryKeys.incoming(),
    momqillQueryKeys.productList(),
    momqillQueryKeys.inventory(),
    momqillQueryKeys.dashboard(),
    momqillQueryKeys.publicCatalog(),
  ]);
}

export async function invalidateAfterOutgoingMutation(queryClient: QueryClient) {
  await invalidateMany(queryClient, [
    momqillQueryKeys.outgoing(),
    momqillQueryKeys.productList(),
    momqillQueryKeys.inventory(),
    momqillQueryKeys.dashboard(),
    momqillQueryKeys.publicCatalog(),
  ]);
}

export async function invalidateAfterStockTransactionMutation(queryClient: QueryClient) {
  await invalidateMany(queryClient, [
    momqillQueryKeys.stockLogs(),
    momqillQueryKeys.stockAudit(),
    momqillQueryKeys.productList(),
    momqillQueryKeys.inventory(),
    momqillQueryKeys.dashboard(),
    momqillQueryKeys.publicCatalog(),
  ]);
}
