import {
  listIncomingItems,
  listOutgoingItems,
  listProducts,
  listStockLogs,
} from "../shared/repository";

import type {
  IncomingItem,
  InventoryReportFilters,
  InventoryReportPayload,
  InventoryReportRow,
  OutgoingItem,
  Product,
  StockLog,
} from "../types/database";

/**
 * Tanggal efektif sebuah baris penyesuaian stok.
 * stock_logs tidak memiliki kolom tanggal bisnis seperti incoming/outgoing,
 * jadi tanggalnya diambil dari waktu pencatatan (created_at).
 */
function adjustmentDateKey(log: StockLog): string {
  return log.created_at.slice(0, 10);
}

function sumQuantities<T extends { quantity: number }>(rows: T[]): number {
  return rows.reduce((total, row) => total + row.quantity, 0);
}

function sumChanges(logs: StockLog[]): number {
  return logs.reduce((total, log) => total + log.change_amount, 0);
}

function buildReportRows(
  products: Product[],
  incomingItems: IncomingItem[],
  outgoingItems: OutgoingItem[],
  adjustments: StockLog[],
  filters: InventoryReportFilters,
): InventoryReportRow[] {
  return products.map((product) => {
    const productAdjustments = adjustments.filter(
      (log) => log.product_id === product.id,
    );

    const inRangeIncoming = incomingItems.filter(
      (item) => item.product_id === product.id && item.date >= filters.startDate && item.date <= filters.endDate,
    );
    const inRangeOutgoing = outgoingItems.filter(
      (item) => item.product_id === product.id && item.date >= filters.startDate && item.date <= filters.endDate,
    );
    const inRangeAdjustments = productAdjustments.filter(
      (log) => {
        const dateKey = adjustmentDateKey(log);
        return dateKey >= filters.startDate && dateKey <= filters.endDate;
      },
    );

    const afterEndIncoming = incomingItems.filter(
      (item) => item.product_id === product.id && item.date > filters.endDate,
    );
    const afterEndOutgoing = outgoingItems.filter(
      (item) => item.product_id === product.id && item.date > filters.endDate,
    );
    const afterEndAdjustments = productAdjustments.filter(
      (log) => adjustmentDateKey(log) > filters.endDate,
    );

    const totalIncoming = sumQuantities(inRangeIncoming);
    const totalOutgoing = sumQuantities(inRangeOutgoing);
    const totalAdjustment = sumChanges(inRangeAdjustments);

    // Stok akhir periode dihitung mundur dari stok tercatat sekarang, dengan
    // memperhitungkan SELURUH perubahan setelah periode: masuk, keluar, dan
    // penyesuaian stok opname. Karena setiap perubahan stok selalu punya baris
    // ledger, hasilnya rekonsiliasi: stok awal + masuk - keluar + penyesuaian = stok akhir.
    const closingStock =
      product.current_stock -
      sumQuantities(afterEndIncoming) +
      sumQuantities(afterEndOutgoing) -
      sumChanges(afterEndAdjustments);
    const openingStock =
      closingStock - totalIncoming + totalOutgoing - totalAdjustment;

    return {
      id: product.id,
      product_name: product.product_name,
      opening_stock: openingStock,
      total_incoming: totalIncoming,
      total_outgoing: totalOutgoing,
      total_adjustment: totalAdjustment,
      closing_stock: closingStock,
    };
  });
}

function buildReportPayload(
  products: Product[],
  incomingItems: IncomingItem[],
  outgoingItems: OutgoingItem[],
  adjustments: StockLog[],
  filters: InventoryReportFilters,
): InventoryReportPayload {
  const rows = buildReportRows(
    products,
    incomingItems,
    outgoingItems,
    adjustments,
    filters,
  );

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

async function fetchIncomingItems(startDate: string): Promise<IncomingItem[]> {
  return listIncomingItems({ startDate });
}

async function fetchOutgoingItems(startDate: string): Promise<OutgoingItem[]> {
  return listOutgoingItems({ startDate });
}

/**
 * Hanya baris penyesuaian yang diambil dari ledger: baris masuk/keluar sudah
 * dibaca dari tabel transaksinya (sumber yang sama dengan mutasi stok),
 * sehingga tidak ada pergerakan yang dihitung dua kali.
 */
async function fetchStockAdjustments(startDate: string): Promise<StockLog[]> {
  const logs = await listStockLogs({ startDate });

  return logs.filter((log) => log.type === "adjustment");
}

export async function fetchInventoryReport(
  filters: InventoryReportFilters,
): Promise<InventoryReportPayload> {
  try {
    const [products, incomingItems, outgoingItems, adjustments] = await Promise.all([
      listProducts(),
      fetchIncomingItems(filters.startDate),
      fetchOutgoingItems(filters.startDate),
      fetchStockAdjustments(filters.startDate),
    ]);

    return buildReportPayload(
      products,
      incomingItems,
      outgoingItems,
      adjustments,
      filters,
    );
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal membangun laporan inventaris dari database.",
    );
  }
}
