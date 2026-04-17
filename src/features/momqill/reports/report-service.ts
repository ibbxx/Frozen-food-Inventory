import {
  fallbackIncomingItems,
  fallbackOutgoingItems,
  fallbackProducts,
} from "../mock/mock-data";
import { momqillSupabase } from "../lib/supabase";
import type {
  IncomingItem,
  InventoryReportFilters,
  InventoryReportPayload,
  InventoryReportRow,
  OutgoingItem,
  Product,
} from "../types/database";

function formatDateValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function sumQuantities<T extends { quantity: number }>(rows: T[]): number {
  return rows.reduce((total, row) => total + row.quantity, 0);
}

function buildReportRows(
  products: Product[],
  incomingItems: IncomingItem[],
  outgoingItems: OutgoingItem[],
  filters: InventoryReportFilters,
): InventoryReportRow[] {
  return products.map((product) => {
    const inRangeIncoming = incomingItems.filter(
      (item) => item.product_id === product.id && item.date >= filters.startDate && item.date <= filters.endDate,
    );
    const inRangeOutgoing = outgoingItems.filter(
      (item) => item.product_id === product.id && item.date >= filters.startDate && item.date <= filters.endDate,
    );
    const afterEndIncoming = incomingItems.filter(
      (item) => item.product_id === product.id && item.date > filters.endDate,
    );
    const afterEndOutgoing = outgoingItems.filter(
      (item) => item.product_id === product.id && item.date > filters.endDate,
    );

    const totalIncoming = sumQuantities(inRangeIncoming);
    const totalOutgoing = sumQuantities(inRangeOutgoing);
    const closingStock =
      product.current_stock - sumQuantities(afterEndIncoming) + sumQuantities(afterEndOutgoing);
    const openingStock = closingStock - totalIncoming + totalOutgoing;

    return {
      id: product.id,
      product_name: product.product_name,
      opening_stock: openingStock,
      total_incoming: totalIncoming,
      total_outgoing: totalOutgoing,
      closing_stock: closingStock,
    };
  });
}

function buildReportPayload(
  products: Product[],
  incomingItems: IncomingItem[],
  outgoingItems: OutgoingItem[],
  filters: InventoryReportFilters,
): InventoryReportPayload {
  const rows = buildReportRows(products, incomingItems, outgoingItems, filters);

  return {
    filters,
    rows,
    summary: {
      totalProducts: rows.length,
      totalIncoming: rows.reduce((total, row) => total + row.total_incoming, 0),
      totalOutgoing: rows.reduce((total, row) => total + row.total_outgoing, 0),
    },
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

async function fetchIncomingItems(startDate: string): Promise<IncomingItem[]> {
  if (!momqillSupabase) {
    return fallbackIncomingItems.filter((item) => item.date >= startDate);
  }

  const { data, error } = await momqillSupabase
    .from("incoming_items")
    .select("id, date, product_id, quantity, supplier_name, created_at")
    .gte("date", startDate)
    .lte("date", formatDateValue(new Date()))
    .order("date", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

async function fetchOutgoingItems(startDate: string): Promise<OutgoingItem[]> {
  if (!momqillSupabase) {
    return fallbackOutgoingItems.filter((item) => item.date >= startDate);
  }

  const { data, error } = await momqillSupabase
    .from("outgoing_items")
    .select("id, date, product_id, quantity, description, created_at")
    .gte("date", startDate)
    .lte("date", formatDateValue(new Date()))
    .order("date", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchInventoryReport(
  filters: InventoryReportFilters,
): Promise<InventoryReportPayload> {
  const [products, incomingItems, outgoingItems] = await Promise.all([
    fetchProducts(),
    fetchIncomingItems(filters.startDate),
    fetchOutgoingItems(filters.startDate),
  ]);

  return buildReportPayload(products, incomingItems, outgoingItems, filters);
}
