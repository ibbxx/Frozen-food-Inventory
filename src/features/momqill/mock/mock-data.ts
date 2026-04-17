import type {
  IncomingItem,
  OutgoingItem,
  Product,
  UserProfile,
} from "../types/database";

export const fallbackUser: UserProfile = {
  id: "91bd6c72-b49f-46a7-8d71-545d1db85aaa",
  email: "owner@momqill.id",
  role: "admin",
  created_at: "2026-04-17T08:00:00.000Z",
};

export const fallbackProducts: Product[] = [
  {
    id: "cce463cb-39ca-42cb-9806-1e03d1fb9aa1",
    product_name: "Nugget Ayam Original 500gr",
    current_stock: 48,
    min_stock: 20,
    created_at: "2026-04-01T08:00:00.000Z",
  },
  {
    id: "1fa0f4fe-2274-45c8-bd4b-cc6894feac77",
    product_name: "Sosis Sapi Premium 1kg",
    current_stock: 9,
    min_stock: 15,
    created_at: "2026-04-02T08:00:00.000Z",
  },
  {
    id: "e97478e1-2dfe-41c7-9590-9415b14d1d60",
    product_name: "Kentang Goreng Crinkle 1kg",
    current_stock: 22,
    min_stock: 12,
    created_at: "2026-04-03T08:00:00.000Z",
  },
  {
    id: "816f147e-5e47-4a8c-bd1c-fec32c197fec",
    product_name: "Dimsum Ayam Udang 250gr",
    current_stock: 6,
    min_stock: 10,
    created_at: "2026-04-05T08:00:00.000Z",
  },
  {
    id: "33fd6ecc-c78e-4e9c-8f1d-ec812ec2db89",
    product_name: "Tempura Kepiting 500gr",
    current_stock: 0,
    min_stock: 8,
    created_at: "2026-04-06T08:00:00.000Z",
  },
];

export const fallbackIncomingItems: IncomingItem[] = [
  {
    id: "d3ddadf5-b255-4162-b89c-5b771a8f85df",
    date: "2026-04-17",
    product_id: "cce463cb-39ca-42cb-9806-1e03d1fb9aa1",
    quantity: 20,
    supplier_name: "PT Dingin Jaya",
    created_at: "2026-04-17T08:12:00.000Z",
  },
  {
    id: "f0c8398e-2190-4768-b9ea-4ce6d0f09fd6",
    date: "2026-04-17",
    product_id: "e97478e1-2dfe-41c7-9590-9415b14d1d60",
    quantity: 12,
    supplier_name: "UD Beku Sentosa",
    created_at: "2026-04-17T09:42:00.000Z",
  },
  {
    id: "f5f54a97-f7b5-45e6-b2c7-9308b8f8ee29",
    date: "2026-04-15",
    product_id: "1fa0f4fe-2274-45c8-bd4b-cc6894feac77",
    quantity: 10,
    supplier_name: "CV Mitra Protein",
    created_at: "2026-04-15T10:20:00.000Z",
  },
  {
    id: "8cc5410f-46e6-4616-9e66-94bfb2e6dbd1",
    date: "2026-03-25",
    product_id: "816f147e-5e47-4a8c-bd1c-fec32c197fec",
    quantity: 16,
    supplier_name: "PT Segar Beku Nusantara",
    created_at: "2026-03-25T07:30:00.000Z",
  },
];

export const fallbackOutgoingItems: OutgoingItem[] = [
  {
    id: "7bc2a0dc-2200-4bc9-a996-4ca779db2f1c",
    date: "2026-04-17",
    product_id: "1fa0f4fe-2274-45c8-bd4b-cc6894feac77",
    quantity: 4,
    description: "Penjualan retail pagi",
    created_at: "2026-04-17T11:10:00.000Z",
  },
  {
    id: "6636f629-c333-434c-83f0-a7f95a7fd17c",
    date: "2026-04-17",
    product_id: "816f147e-5e47-4a8c-bd1c-fec32c197fec",
    quantity: 3,
    description: "Pesanan reseller",
    created_at: "2026-04-17T12:16:00.000Z",
  },
  {
    id: "c89ebd1e-f5cb-4371-b687-b9db5b714f89",
    date: "2026-04-16",
    product_id: "cce463cb-39ca-42cb-9806-1e03d1fb9aa1",
    quantity: 8,
    description: "Penjualan sore",
    created_at: "2026-04-16T15:00:00.000Z",
  },
  {
    id: "f7fc1c2d-08cc-4148-b5a5-b08d7f43a66e",
    date: "2026-03-29",
    product_id: "33fd6ecc-c78e-4e9c-8f1d-ec812ec2db89",
    quantity: 7,
    description: "Paket grosir",
    created_at: "2026-03-29T16:20:00.000Z",
  },
];
