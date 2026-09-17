import {
  listProducts,
  listProfiles,
  listStockLogs,
} from "../shared/repository";
import { mapStockLogHistory } from "../shared/stock-log-history";

import type { StockLogHistoryItem } from "../types/database";

export async function fetchStockAuditHistory(): Promise<StockLogHistoryItem[]> {
  try {
    const [logs, products, profiles] = await Promise.all([
      listStockLogs(),
      listProducts(),
      listProfiles(),
    ]);

    return mapStockLogHistory(logs, products, profiles);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Gagal memuat audit stok.",
    );
  }
}

function fileStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function exportStockAuditToExcel(
  rows: StockLogHistoryItem[],
): Promise<void> {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(
    rows.map((row, index) => ({
      No: index + 1,
      Waktu: row.created_at,
      Produk: row.product_name,
      Tipe: row.type,
      "Stok Lama": row.old_stock,
      Perubahan: row.change_amount,
      "Stok Baru": row.new_stock,
      Staf: row.staff_name,
      Catatan: row.notes || "",
    })),
  );
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Stok");
  XLSX.writeFile(workbook, `audit-stok-${fileStamp()}.xlsx`);
}
