import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  listIncomingItems,
  listOutgoingItems,
  listProducts,
  listStockLogs,
} from "../shared/repository";

import { fetchInventoryReport } from "./report-service";

vi.mock("../shared/repository", () => ({
  listIncomingItems: vi.fn(),
  listOutgoingItems: vi.fn(),
  listProducts: vi.fn(),
  listStockLogs: vi.fn(),
}));

function buildProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: "product-1",
    product_name: "Nugget Ayam Original 500gr",
    category: "Daging",
    public_price: 45000,
    image_url: null,
    is_public: true,
    current_stock: 10,
    min_stock: 4,
    created_at: "2026-04-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("fetchInventoryReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-19T10:00:00.000Z"));
    vi.mocked(listStockLogs).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds opening stock, movement totals, and summary from repository data", async () => {
    vi.mocked(listProducts).mockResolvedValue([buildProduct()]);
    vi.mocked(listIncomingItems).mockResolvedValue([
      {
        id: "incoming-in-range",
        date: "2026-04-10",
        product_id: "product-1",
        quantity: 5,
        supplier_name: "PT Beku Jaya",
        created_by: "user-1",
        created_at: "2026-04-10T08:00:00.000Z",
      },
      {
        id: "incoming-after-end",
        date: "2026-05-02",
        product_id: "product-1",
        quantity: 3,
        supplier_name: "PT Beku Jaya",
        created_by: "user-1",
        created_at: "2026-05-02T08:00:00.000Z",
      },
    ]);
    vi.mocked(listOutgoingItems).mockResolvedValue([
      {
        id: "outgoing-in-range",
        date: "2026-04-12",
        product_id: "product-1",
        quantity: 2,
        description: "Penjualan toko",
        created_by: "user-2",
        created_at: "2026-04-12T09:00:00.000Z",
      },
      {
        id: "outgoing-after-end",
        date: "2026-05-03",
        product_id: "product-1",
        quantity: 1,
        description: "Penjualan toko",
        created_by: "user-2",
        created_at: "2026-05-03T09:00:00.000Z",
      },
    ]);

    const report = await fetchInventoryReport({
      startDate: "2026-04-01",
      endDate: "2026-04-30",
    });

    expect(listIncomingItems).toHaveBeenCalledWith({
      startDate: "2026-04-01",
    });
    expect(listOutgoingItems).toHaveBeenCalledWith({
      startDate: "2026-04-01",
    });
    expect(report.rows).toEqual([
      {
        id: "product-1",
        product_name: "Nugget Ayam Original 500gr",
        opening_stock: 5,
        total_incoming: 5,
        total_outgoing: 2,
        total_adjustment: 0,
        closing_stock: 8,
      },
    ]);
    expect(report.summary).toEqual({
      totalProducts: 1,
      totalIncoming: 5,
      totalOutgoing: 2,
    });
  });

  it("counts stock adjustments once and keeps the report reconciled", async () => {
    vi.mocked(listProducts).mockResolvedValue([buildProduct({ current_stock: 12 })]);
    vi.mocked(listIncomingItems).mockResolvedValue([
      {
        id: "incoming-in-range",
        date: "2026-04-10",
        product_id: "product-1",
        quantity: 5,
        supplier_name: "PT Beku Jaya",
        created_by: "user-1",
        created_at: "2026-04-10T08:00:00.000Z",
      },
      {
        id: "incoming-after-end",
        date: "2026-05-02",
        product_id: "product-1",
        quantity: 3,
        supplier_name: "PT Beku Jaya",
        created_by: "user-1",
        created_at: "2026-05-02T08:00:00.000Z",
      },
    ]);
    vi.mocked(listOutgoingItems).mockResolvedValue([]);
    vi.mocked(listStockLogs).mockResolvedValue([
      {
        id: "log-incoming",
        product_id: "product-1",
        source_transaction_id: "incoming-in-range",
        old_stock: 7,
        change_amount: 5,
        new_stock: 12,
        type: "incoming",
        notes: "PT Beku Jaya",
        created_by: "user-1",
        created_at: "2026-04-10T08:00:00.000Z",
      },
      {
        id: "adjustment-in-range",
        product_id: "product-1",
        source_transaction_id: null,
        old_stock: 12,
        change_amount: -1,
        new_stock: 11,
        type: "adjustment",
        notes: "1 pcs kemasan rusak",
        created_by: "user-1",
        created_at: "2026-04-15T08:00:00.000Z",
      },
      {
        id: "adjustment-after-end",
        product_id: "product-1",
        source_transaction_id: null,
        old_stock: 8,
        change_amount: 4,
        new_stock: 12,
        type: "adjustment",
        notes: "Stok opname Mei",
        created_by: "user-1",
        created_at: "2026-05-02T08:00:00.000Z",
      },
    ]);

    const report = await fetchInventoryReport({
      startDate: "2026-04-01",
      endDate: "2026-04-30",
    });

    expect(listStockLogs).toHaveBeenCalledWith({ startDate: "2026-04-01" });

    const [row] = report.rows;

    // Baris ledger bertipe incoming tidak boleh dihitung sebagai penyesuaian.
    expect(row.total_adjustment).toBe(-1);
    expect(row.closing_stock).toBe(5);
    expect(row.opening_stock).toBe(1);

    // Rekonsiliasi: stok awal + masuk - keluar + penyesuaian = stok akhir
    expect(
      row.opening_stock +
        row.total_incoming -
        row.total_outgoing +
        row.total_adjustment,
    ).toBe(row.closing_stock);
  });
});
