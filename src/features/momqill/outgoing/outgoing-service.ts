import {
  listOutgoingItems,
  listProducts,
  recordOutgoingItem,
} from "../shared/repository";

import type {
  CreateOutgoingItemInput,
  OutgoingHistoryItem,
  OutgoingItem,
  Product,
} from "../types/database";

function mapOutgoingHistory(
  outgoingItems: OutgoingItem[],
  products: Product[],
): OutgoingHistoryItem[] {
  const productMap = new Map(products.map((product) => [product.id, product.product_name]));

  return outgoingItems.map((item) => ({
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
  try {
    return await listProducts();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal mengambil master produk untuk form barang keluar.",
    );
  }
}

export async function fetchOutgoingHistory(limit = 8): Promise<OutgoingHistoryItem[]> {
  try {
    const [outgoingItems, products] = await Promise.all([
      listOutgoingItems({ limit }),
      listProducts(),
    ]);

    return mapOutgoingHistory(outgoingItems, products).slice(0, limit);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal memuat riwayat barang keluar dari database.",
    );
  }
}

export async function createOutgoingItem(
  input: CreateOutgoingItemInput,
): Promise<OutgoingItem> {
  try {
    return await recordOutgoingItem(input);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal mencatat barang keluar ke database.",
    );
  }
}
