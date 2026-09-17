import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  listIncomingItems,
  listOutgoingItems,
  listProducts,
} from "../shared/repository";

import { fetchDashboardPayload } from "./dashboard-service";

vi.mock("../shared/repository", () => ({
  listIncomingItems: vi.fn(),
  listOutgoingItems: vi.fn(),
  listProducts: vi.fn(),
}));

function expectedDashboardSinceDate() {
  return new Date(2026, 3 - 5, 1).toISOString().slice(0, 10);
}

describe("fetchDashboardPayload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-19T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds dashboard summary, trend, monthly comparison, and low stock alerts", async () => {
    vi.mocked(listProducts).mockResolvedValue([
      {
        id: "product-1",
        product_name: "Nugget Ayam Original 500gr",
        category: "Daging",
        public_price: 45000,
        image_url: null,
        is_public: true,
        current_stock: 12,
        min_stock: 10,
        created_at: "2026-04-01T00:00:00.000Z",
      },
      {
        id: "product-2",
        product_name: "Sosis Sapi Premium 1kg",
        category: "Daging",
        public_price: 52000,
        image_url: null,
        is_public: true,
        current_stock: 0,
        min_stock: 5,
        created_at: "2026-04-02T00:00:00.000Z",
      },
      {
        id: "product-3",
        product_name: "Kentang Goreng Crinkle 1kg",
        category: "Paket Hemat",
        public_price: 39000,
        image_url: null,
        is_public: true,
        current_stock: 20,
        min_stock: 8,
        created_at: "2026-04-03T00:00:00.000Z",
      },
    ]);
    vi.mocked(listIncomingItems).mockResolvedValue([
      {
        id: "incoming-today",
        date: "2026-04-19",
        product_id: "product-1",
        quantity: 7,
        supplier_name: "PT Beku Jaya",
        created_by: "user-1",
        created_at: "2026-04-19T08:00:00.000Z",
      },
      {
        id: "incoming-this-month",
        date: "2026-04-10",
        product_id: "product-3",
        quantity: 4,
        supplier_name: "PT Beku Jaya",
        created_by: "user-1",
        created_at: "2026-04-10T08:00:00.000Z",
      },
      {
        id: "incoming-previous-month",
        date: "2026-03-11",
        product_id: "product-1",
        quantity: 6,
        supplier_name: "PT Beku Jaya",
        created_by: "user-1",
        created_at: "2026-03-11T08:00:00.000Z",
      },
    ]);
    vi.mocked(listOutgoingItems).mockResolvedValue([
      {
        id: "outgoing-today",
        date: "2026-04-19",
        product_id: "product-2",
        quantity: 3,
        description: "Penjualan retail",
        created_by: "user-2",
        created_at: "2026-04-19T09:00:00.000Z",
      },
      {
        id: "outgoing-this-month",
        date: "2026-04-09",
        product_id: "product-1",
        quantity: 2,
        description: "Penjualan retail",
        created_by: "user-2",
        created_at: "2026-04-09T09:00:00.000Z",
      },
      {
        id: "outgoing-previous-month",
        date: "2026-03-15",
        product_id: "product-3",
        quantity: 5,
        description: "Penjualan retail",
        created_by: "user-2",
        created_at: "2026-03-15T09:00:00.000Z",
      },
    ]);

    const dashboard = await fetchDashboardPayload();
    const expectedSince = expectedDashboardSinceDate();

    expect(listIncomingItems).toHaveBeenCalledWith({
      startDate: expectedSince,
    });
    expect(listOutgoingItems).toHaveBeenCalledWith({
      startDate: expectedSince,
    });
    expect(dashboard.summary).toEqual({
      totalProducts: 3,
      incomingToday: 7,
      outgoingToday: 3,
      lowStockCount: 1,
    });
    expect(dashboard.dailyTrend).toHaveLength(7);
    expect(dashboard.dailyTrend[6]).toMatchObject({
      incoming: 7,
      outgoing: 3,
      net: 4,
    });
    expect(dashboard.monthlyComparison).toHaveLength(6);
    expect(dashboard.monthlyComparison[4]).toMatchObject({
      incoming: 6,
      outgoing: 5,
    });
    expect(dashboard.monthlyComparison[5]).toMatchObject({
      incoming: 11,
      outgoing: 5,
    });
    expect(dashboard.lowStockProducts).toEqual([
      {
        id: "product-2",
        product_name: "Sosis Sapi Premium 1kg",
        current_stock: 0,
        min_stock: 5,
        gap: 5,
      },
    ]);
  });
});
