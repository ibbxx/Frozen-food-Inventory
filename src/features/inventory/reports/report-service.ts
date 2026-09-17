import {
  listIncomingItems,
  listOutgoingItems,
  listProducts,
} from "../shared/repository";

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

async function fetchIncomingItems(startDate: string): Promise<IncomingItem[]> {
  return listIncomingItems({
    endDate: formatDateValue(new Date()),
    startDate,
  });
}

async function fetchOutgoingItems(startDate: string): Promise<OutgoingItem[]> {
  return listOutgoingItems({
    endDate: formatDateValue(new Date()),
    startDate,
  });
}

export async function fetchInventoryReport(
  filters: InventoryReportFilters,
): Promise<InventoryReportPayload> {
  try {
    const [products, incomingItems, outgoingItems] = await Promise.all([
      listProducts(),
      fetchIncomingItems(filters.startDate),
      fetchOutgoingItems(filters.startDate),
    ]);

    return buildReportPayload(products, incomingItems, outgoingItems, filters);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal membangun laporan inventaris dari database.",
    );
  }
}
