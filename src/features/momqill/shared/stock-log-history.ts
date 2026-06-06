import type {
  ProfileSummary,
  Product,
  StockLog,
  StockLogHistoryItem,
} from "../types/database";

export function mapStockLogHistory(
  logs: StockLog[],
  products: Product[],
  profiles: ProfileSummary[],
): StockLogHistoryItem[] {
  const productMap = new Map(products.map((product) => [product.id, product.product_name]));
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile.full_name]));

  return logs.map((log) => ({
    id: log.id,
    product_name: productMap.get(log.product_id) || "Produk tidak ditemukan",
    staff_name: profileMap.get(log.created_by) || "Staf tidak ditemukan",
    old_stock: log.old_stock,
    change_amount: log.change_amount,
    new_stock: log.new_stock,
    type: log.type,
    notes: log.notes,
    created_at: log.created_at,
  }));
}
