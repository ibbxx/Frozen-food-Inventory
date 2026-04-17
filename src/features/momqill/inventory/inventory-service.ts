import { fallbackProducts } from "../mock/mock-data";
import { momqillSupabase } from "../lib/supabase";
import type {
  InventoryMonitoringPayload,
  InventoryMonitoringRow,
  Product,
  StockStatus,
} from "../types/database";

function getStockStatus(product: Product): StockStatus {
  if (product.current_stock <= 0) {
    return "out";
  }

  if (product.current_stock <= product.min_stock) {
    return "low";
  }

  return "safe";
}

function getProgressPercent(product: Product): number {
  if (product.min_stock <= 0) {
    return product.current_stock > 0 ? 100 : 0;
  }

  const percentage = Math.round((product.current_stock / product.min_stock) * 100);
  return Math.max(0, Math.min(percentage, 100));
}

function buildMonitoringRows(products: Product[]): InventoryMonitoringRow[] {
  return products
    .map((product) => ({
      id: product.id,
      product_name: product.product_name,
      current_stock: product.current_stock,
      min_stock: product.min_stock,
      status: getStockStatus(product),
      progress_percent: getProgressPercent(product),
    }))
    .sort((left, right) => {
      const priority = { out: 0, low: 1, safe: 2 };
      return priority[left.status] - priority[right.status] || left.product_name.localeCompare(right.product_name);
    });
}

function buildInventoryMonitoringPayload(products: Product[]): InventoryMonitoringPayload {
  const rows = buildMonitoringRows(products);

  return {
    summary: {
      safe: rows.filter((row) => row.status === "safe").length,
      low: rows.filter((row) => row.status === "low").length,
      out: rows.filter((row) => row.status === "out").length,
    },
    rows,
  };
}

async function fetchProducts(): Promise<Product[]> {
  if (!momqillSupabase) {
    return fallbackProducts;
  }

  const { data, error } = await momqillSupabase
    .from("products")
    .select("id, product_name, current_stock, min_stock, created_at")
    .order("product_name", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchInventoryMonitoring(): Promise<InventoryMonitoringPayload> {
  const products = await fetchProducts();
  return buildInventoryMonitoringPayload(products);
}
