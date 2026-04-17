import {
  fallbackIncomingItems,
  fallbackProducts,
} from "../mock/mock-data";
import { momqillSupabase } from "../lib/supabase";
import type {
  CreateIncomingItemInput,
  IncomingHistoryItem,
  IncomingItem,
  Product,
} from "../types/database";

function sortDescendingByDate<T extends { date: string; created_at: string }>(rows: T[]): T[] {
  return [...rows].sort((left, right) => {
    const leftKey = `${left.date}T${left.created_at.slice(11)}`;
    const rightKey = `${right.date}T${right.created_at.slice(11)}`;
    return rightKey.localeCompare(leftKey);
  });
}

function mapIncomingHistory(
  incomingItems: IncomingItem[],
  products: Product[],
): IncomingHistoryItem[] {
  const productMap = new Map(products.map((product) => [product.id, product.product_name]));

  return sortDescendingByDate(incomingItems).map((item) => ({
    id: item.id,
    date: item.date,
    product_id: item.product_id,
    product_name: productMap.get(item.product_id) || "Produk tidak ditemukan",
    quantity: item.quantity,
    supplier_name: item.supplier_name,
    created_at: item.created_at,
  }));
}

export async function fetchProductsForIncoming(): Promise<Product[]> {
  if (!momqillSupabase) {
    return [...fallbackProducts].sort((left, right) =>
      left.product_name.localeCompare(right.product_name),
    );
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

export async function fetchIncomingHistory(limit = 8): Promise<IncomingHistoryItem[]> {
  if (!momqillSupabase) {
    return mapIncomingHistory(fallbackIncomingItems.slice(0, limit), fallbackProducts).slice(0, limit);
  }

  const { data: incomingItems, error: incomingError } = await momqillSupabase
    .from("incoming_items")
    .select("id, date, product_id, quantity, supplier_name, created_at")
    .order("date", { ascending: false })
    .limit(limit);

  if (incomingError) {
    throw incomingError;
  }

  const { data: products, error: productsError } = await momqillSupabase
    .from("products")
    .select("id, product_name, current_stock, min_stock, created_at");

  if (productsError) {
    throw productsError;
  }

  return mapIncomingHistory(incomingItems, products).slice(0, limit);
}

export async function createIncomingItem(
  input: CreateIncomingItemInput,
): Promise<IncomingItem> {
  if (!momqillSupabase) {
    const selectedProduct = fallbackProducts.find((product) => product.id === input.product_id);

    if (!selectedProduct) {
      throw new Error("Produk tidak ditemukan.");
    }

    selectedProduct.current_stock += input.quantity;

    const nextItem: IncomingItem = {
      id: crypto.randomUUID(),
      date: input.date,
      product_id: input.product_id,
      quantity: input.quantity,
      supplier_name: input.supplier_name,
      created_at: new Date().toISOString(),
    };

    fallbackIncomingItems.unshift(nextItem);
    return nextItem;
  }

  const { data, error } = await momqillSupabase.rpc(
    "record_incoming_item" as never,
    {
      p_date: input.date,
      p_product_id: input.product_id,
      p_quantity: input.quantity,
      p_supplier_name: input.supplier_name,
    } as never,
  );

  if (error) {
    throw error;
  }

  return data as IncomingItem;
}
