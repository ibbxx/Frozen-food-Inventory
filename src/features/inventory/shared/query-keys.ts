import type { InventoryReportFilters } from "../types/database";
import type { QueryClient } from "@tanstack/react-query";

export const inventoryQueryKeys = {
  categoryList: () => ["inventory", "categories"] as const,
  dashboard: () => ["inventory", "dashboard"] as const,
  incoming: () => ["inventory", "incoming"] as const,
  incomingHistory: (limit = 8) => ["inventory", "incoming", "history", limit] as const,
  incomingProducts: () => ["inventory", "incoming", "products"] as const,
  inventory: () => ["inventory", "inventory"] as const,
  inventoryMonitoring: () => ["inventory", "inventory", "monitoring"] as const,
  outgoing: () => ["inventory", "outgoing"] as const,
  outgoingHistory: (limit = 8) => ["inventory", "outgoing", "history", limit] as const,
  outgoingProducts: () => ["inventory", "outgoing", "products"] as const,
  productList: () => ["inventory", "products"] as const,
  report: (filters: InventoryReportFilters) => ["inventory", "reports", filters] as const,
  reports: () => ["inventory", "reports"] as const,
  stockAudit: () => ["inventory", "stock-audit"] as const,
  stockLogs: (limit = 12) => ["inventory", "stock-logs", limit] as const,
  stockTransactionProducts: () => ["inventory", "stock-transaction", "products"] as const,
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
    inventoryQueryKeys.productList(),
    inventoryQueryKeys.inventory(),
    inventoryQueryKeys.dashboard(),
    inventoryQueryKeys.publicCatalog(),
  ]);
}

export async function invalidateAfterCategoryMutation(queryClient: QueryClient) {
  await invalidateMany(queryClient, [
    inventoryQueryKeys.categoryList(),
  ]);
}

export async function invalidateAfterIncomingMutation(queryClient: QueryClient) {
  await invalidateMany(queryClient, [
    inventoryQueryKeys.incoming(),
    inventoryQueryKeys.productList(),
    inventoryQueryKeys.inventory(),
    inventoryQueryKeys.dashboard(),
    inventoryQueryKeys.publicCatalog(),
  ]);
}

export async function invalidateAfterOutgoingMutation(queryClient: QueryClient) {
  await invalidateMany(queryClient, [
    inventoryQueryKeys.outgoing(),
    inventoryQueryKeys.productList(),
    inventoryQueryKeys.inventory(),
    inventoryQueryKeys.dashboard(),
    inventoryQueryKeys.publicCatalog(),
  ]);
}

export async function invalidateAfterStockTransactionMutation(queryClient: QueryClient) {
  await invalidateMany(queryClient, [
    inventoryQueryKeys.stockLogs(),
    inventoryQueryKeys.stockAudit(),
    inventoryQueryKeys.productList(),
    inventoryQueryKeys.inventory(),
    inventoryQueryKeys.dashboard(),
    inventoryQueryKeys.publicCatalog(),
  ]);
}
