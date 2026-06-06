import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchIncomingItemsFromDatabase,
  fetchProductsFromDatabase,
  recordOutgoingInDatabase,
} from "../lib/momqill-database";

import {
  listIncomingItems,
  listProducts,
  recordOutgoingItem,
} from "./repository";

vi.mock("../lib/momqill-database", () => ({
  fetchIncomingItemsFromDatabase: vi.fn(),
  fetchOutgoingItemsFromDatabase: vi.fn(),
  fetchProductsFromDatabase: vi.fn(),
  insertProductIntoDatabase: vi.fn(),
  recordIncomingInDatabase: vi.fn(),
  recordOutgoingInDatabase: vi.fn(),
  updateProductInDatabase: vi.fn(),
}));

describe("momqill repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads products through the database layer", async () => {
    vi.mocked(fetchProductsFromDatabase).mockResolvedValue([
      {
        id: "product-1",
        product_name: "Nugget Ayam Original 500gr",
        category: "Daging",
        public_price: 45000,
        image_url: null,
        is_public: true,
        current_stock: 24,
        min_stock: 8,
        created_at: "2026-04-19T10:00:00.000Z",
      },
    ]);

    await expect(listProducts()).resolves.toEqual([
      {
        id: "product-1",
        product_name: "Nugget Ayam Original 500gr",
        category: "Daging",
        public_price: 45000,
        image_url: null,
        is_public: true,
        current_stock: 24,
        min_stock: 8,
        created_at: "2026-04-19T10:00:00.000Z",
      },
    ]);
  });

  it("passes filter options to incoming reads", async () => {
    vi.mocked(fetchIncomingItemsFromDatabase).mockResolvedValue([
      {
        id: "incoming-1",
        date: "2026-04-19",
        product_id: "product-1",
        quantity: 4,
        supplier_name: "PT Beku Jaya",
        created_by: "user-1",
        created_at: "2026-04-19T09:00:00.000Z",
      },
    ]);

    await listIncomingItems({
      endDate: "2026-04-19",
      limit: 8,
      startDate: "2026-04-01",
    });

    expect(fetchIncomingItemsFromDatabase).toHaveBeenCalledWith({
      endDate: "2026-04-19",
      limit: 8,
      startDate: "2026-04-01",
    });
  });

  it("writes outgoing transactions through the atomic RPC path", async () => {
    vi.mocked(recordOutgoingInDatabase).mockResolvedValue({
      id: "outgoing-1",
      date: "2026-04-19",
      product_id: "product-1",
      quantity: 2,
      description: "Penjualan retail",
      created_by: "user-2",
      created_at: "2026-04-19T10:00:00.000Z",
    });

    await expect(
      recordOutgoingItem({
        date: "2026-04-19",
        description: "Penjualan retail",
        product_id: "product-1",
        quantity: 2,
      }),
    ).resolves.toMatchObject({
      id: "outgoing-1",
      quantity: 2,
      created_by: "user-2",
    });
  });
});
