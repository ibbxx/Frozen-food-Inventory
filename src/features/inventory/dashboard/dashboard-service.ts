import {
  listIncomingItems,
  listOutgoingItems,
  listProducts,
} from "../shared/repository";

import type {
  DashboardMonthlyPoint,
  DashboardPayload,
  DashboardSummary,
  DashboardTrendPoint,
  IncomingItem,
  OutgoingItem,
  Product,
  StockAlert,
} from "../types/database";

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(baseDate: Date, offset: number): Date {
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + offset);
  return nextDate;
}

function startOfMonth(baseDate: Date, monthOffset = 0): Date {
  return new Date(baseDate.getFullYear(), baseDate.getMonth() + monthOffset, 1);
}

function formatDayLabel(dateValue: string): string {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
}

function formatMonthLabel(dateValue: Date): string {
  return dateValue.toLocaleDateString("id-ID", {
    month: "short",
  });
}

function sumQuantities<T extends IncomingItem | OutgoingItem>(rows: T[]): number {
  return rows.reduce((total, row) => total + row.quantity, 0);
}

function buildLowStockAlerts(products: Product[]): StockAlert[] {
  return products
    .filter((product) => product.current_stock <= product.min_stock)
    .sort((left, right) => left.current_stock - right.current_stock)
    .map((product) => ({
      id: product.id,
      product_name: product.product_name,
      current_stock: product.current_stock,
      min_stock: product.min_stock,
      gap: Math.max(product.min_stock - product.current_stock, 0),
    }));
}

function buildDailyTrend(
  incomingItems: IncomingItem[],
  outgoingItems: OutgoingItem[],
  today = new Date(),
): DashboardTrendPoint[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6);
    const key = formatDateKey(date);
    const incoming = sumQuantities(incomingItems.filter((item) => item.date === key));
    const outgoing = sumQuantities(outgoingItems.filter((item) => item.date === key));

    return {
      label: formatDayLabel(key),
      incoming,
      outgoing,
      net: incoming - outgoing,
    };
  });
}

function buildMonthlyComparison(
  incomingItems: IncomingItem[],
  outgoingItems: OutgoingItem[],
  today = new Date(),
): DashboardMonthlyPoint[] {
  return Array.from({ length: 6 }, (_, index) => {
    const monthStart = startOfMonth(today, index - 5);
    const monthKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`;
    const incoming = sumQuantities(
      incomingItems.filter((item) => item.date.startsWith(monthKey)),
    );
    const outgoing = sumQuantities(
      outgoingItems.filter((item) => item.date.startsWith(monthKey)),
    );

    return {
      label: formatMonthLabel(monthStart),
      incoming,
      outgoing,
    };
  });
}

function buildSummary(
  products: Product[],
  incomingItems: IncomingItem[],
  outgoingItems: OutgoingItem[],
): DashboardSummary {
  const todayKey = formatDateKey(new Date());
  const lowStockProducts = buildLowStockAlerts(products);

  return {
    totalProducts: products.length,
    incomingToday: sumQuantities(incomingItems.filter((item) => item.date === todayKey)),
    outgoingToday: sumQuantities(outgoingItems.filter((item) => item.date === todayKey)),
    lowStockCount: lowStockProducts.length,
  };
}

function buildDashboardPayload(
  products: Product[],
  incomingItems: IncomingItem[],
  outgoingItems: OutgoingItem[],
): DashboardPayload {
  return {
    summary: buildSummary(products, incomingItems, outgoingItems),
    dailyTrend: buildDailyTrend(incomingItems, outgoingItems),
    monthlyComparison: buildMonthlyComparison(incomingItems, outgoingItems),
    lowStockProducts: buildLowStockAlerts(products),
  };
}

async function fetchIncomingItems(): Promise<IncomingItem[]> {
  const since = formatDateKey(startOfMonth(new Date(), -5));
  return listIncomingItems({ startDate: since });
}

async function fetchOutgoingItems(): Promise<OutgoingItem[]> {
  const since = formatDateKey(startOfMonth(new Date(), -5));
  return listOutgoingItems({ startDate: since });
}

export async function fetchDashboardPayload(): Promise<DashboardPayload> {
  try {
    const [products, incomingItems, outgoingItems] = await Promise.all([
      listProducts(),
      fetchIncomingItems(),
      fetchOutgoingItems(),
    ]);

    return buildDashboardPayload(products, incomingItems, outgoingItems);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal menyusun ringkasan dashboard dari database.",
    );
  }
}
