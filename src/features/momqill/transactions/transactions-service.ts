import {
  listProducts,
  listProfiles,
  listStockLogs,
  processStockTransaction,
} from "../shared/repository";
import { mapStockLogHistory } from "../shared/stock-log-history";

import type {
  CreateStockTransactionInput,
  Product,
  StockLog,
  StockLogHistoryItem,
} from "../types/database";

export async function fetchProductsForStockTransactions(): Promise<Product[]> {
  try {
    return await listProducts();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal mengambil daftar produk untuk transaksi stok.",
    );
  }
}

export async function fetchRecentStockLogs(limit = 12): Promise<StockLogHistoryItem[]> {
  try {
    const [logs, products, profiles] = await Promise.all([
      listStockLogs({ limit }),
      listProducts(),
      listProfiles(),
    ]);

    return mapStockLogHistory(logs, products, profiles).slice(0, limit);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal memuat riwayat transaksi stok.",
    );
  }
}

export async function createStockTransaction(
  input: CreateStockTransactionInput,
): Promise<StockLog> {
  try {
    return await processStockTransaction(input);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal memproses transaksi stok.",
    );
  }
}
