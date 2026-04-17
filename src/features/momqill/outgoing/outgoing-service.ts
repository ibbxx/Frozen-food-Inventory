import {
  fallbackOutgoingItems,
  fallbackProducts,
} from "../mock/mock-data";
import { momqillSupabase } from "../lib/supabase";
import type {
  CreateOutgoingItemInput,
  OutgoingHistoryItem,
  OutgoingItem,
  Product,
} from "../types/database";

function sortDescendingByDate<T extends { date: string; created_at: string }>(rows: T[]): T[] {
  return [...rows].sort((left, right) => {
    const leftKey = `${left.date}T${left.created_at.slice(11)}`;
    const rightKey = `${right.date}T${right.created_at.slice(11)}`;
    return rightKey.localeCompare(leftKey);
  });
}

function mapOutgoingHistory(
  outgoingItems: OutgoingItem[],
  products: Product[],
): OutgoingHistoryItem[] {
  const productMap = new Map(products.map((product) => [product.id, product.product_name]));

  return sortDescendingByDate(outgoingItems).map((item) => ({
    id: item.id,
    date: item.date,
    product_id: item.product_id,
    product_name: productMap.get(item.product_id) || "Produk tidak ditemukan",
    quantity: item.quantity,
    description: item.description,
    created_at: item.created_at,
  }));
}

export async function fetchProductsForOutgoing(): Promise<Product[]> {
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

export async function fetchOutgoingHistory(limit = 8): Promise<OutgoingHistoryItem[]> {
  if (!momqillSupabase) {
    return mapOutgoingHistory(fallbackOutgoingItems.slice(0, limit), fallbackProducts).slice(0, limit);
  }

  const { data: outgoingItems, error: outgoingError } = await momqillSupabase
    .from("outgoing_items")
    .select("id, date, product_id, quantity, description, created_at")
    .order("date", { ascending: false })
    .limit(limit);

  if (outgoingError) {
    throw outgoingError;
  }

  const { data: products, error: productsError } = await momqillSupabase
    .from("products")
    .select("id, product_name, current_stock, min_stock, created_at");

  if (productsError) {
    throw productsError;
  }

  return mapOutgoingHistory(outgoingItems, products).slice(0, limit);
}

export async function createOutgoingItem(
  input: CreateOutgoingItemInput,
): Promise<OutgoingItem> {
  if (!momqillSupabase) {
    const selectedProduct = fallbackProducts.find((product) => product.id === input.product_id);

    if (!selectedProduct) {
      throw new Error("Produk tidak ditemukan.");
    }

    if (input.quantity > selectedProduct.current_stock) {
      throw new Error("Jumlah keluar melebihi stok yang tersedia.");
    }

    selectedProduct.current_stock -= input.quantity;

    const nextItem: OutgoingItem = {
      id: crypto.randomUUID(),
      date: input.date,
      product_id: input.product_id,
      quantity: input.quantity,
      description: input.description || null,
      created_at: new Date().toISOString(),
    };

    fallbackOutgoingItems.unshift(nextItem);
    return nextItem;
  }

  const { data, error } = await momqillSupabase.rpc(
    "record_outgoing_item" as never,
    {
      p_date: input.date,
      p_product_id: input.product_id,
      p_quantity: input.quantity,
      p_description: input.description || null,
    } as never,
  );

  if (error) {
    throw error;
  }

  return data as OutgoingItem;
}
