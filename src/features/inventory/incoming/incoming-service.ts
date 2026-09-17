import {
  listIncomingItems,
  listProducts,
  recordIncomingItem,
} from "../shared/repository";

import type {
  CreateIncomingItemInput,
  IncomingHistoryItem,
  IncomingItem,
  Product,
} from "../types/database";

function mapIncomingHistory(
  incomingItems: IncomingItem[],
  products: Product[],
): IncomingHistoryItem[] {
  const productMap = new Map(products.map((product) => [product.id, product.product_name]));

  return incomingItems.map((item) => ({
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
  try {
    return await listProducts();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal mengambil master produk untuk form barang masuk.",
    );
  }
}

export async function fetchIncomingHistory(limit = 8): Promise<IncomingHistoryItem[]> {
  try {
    const [incomingItems, products] = await Promise.all([
      listIncomingItems({ limit }),
      listProducts(),
    ]);

    return mapIncomingHistory(incomingItems, products).slice(0, limit);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal memuat riwayat barang masuk dari database.",
    );
  }
}

export async function createIncomingItem(
  input: CreateIncomingItemInput,
): Promise<IncomingItem> {
  try {
    return await recordIncomingItem(input);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal mencatat barang masuk ke database.",
    );
  }
}
