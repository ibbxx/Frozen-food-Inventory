import {
  deleteCategoryFromDatabase,
  fetchCategoriesFromDatabase,
  fetchIncomingItemsFromDatabase,
  fetchOutgoingItemsFromDatabase,
  fetchProfilesFromDatabase,
  fetchProductsFromDatabase,
  fetchStockLogsFromDatabase,
  insertCategoryIntoDatabase,
  insertProductIntoDatabase,
  processStockTransactionInDatabase,
  recordIncomingInDatabase,
  recordOutgoingInDatabase,
  type DatabaseListOptions,
  updateCategoryInDatabase,
  updateProductInDatabase,
} from "../lib/momqill-database";

import type {
  CreateIncomingItemInput,
  CreateOutgoingItemInput,
  CreateStockTransactionInput,
  IncomingItem,
  OutgoingItem,
  ProductCategoryRecord,
  ProfileSummary,
  Product,
  StockLog,
} from "../types/database";

interface ProductPayload {
  category: Product["category"];
  current_stock: number;
  image_url: string;
  is_public: boolean;
  min_stock: number;
  product_name: string;
  public_price: number | null;
}

export type ListOptions = DatabaseListOptions;

// ─── Kategori ───────────────────────────────────────────────────────────────

export async function listCategories(): Promise<ProductCategoryRecord[]> {
  return fetchCategoriesFromDatabase();
}

export async function createCategory(name: string): Promise<ProductCategoryRecord> {
  return insertCategoryIntoDatabase(name);
}

export async function updateCategory(
  categoryId: string,
  name: string,
): Promise<ProductCategoryRecord> {
  return updateCategoryInDatabase(categoryId, name);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  return deleteCategoryFromDatabase(categoryId);
}

// ─── Produk ──────────────────────────────────────────────────────────────────

export async function listProducts(): Promise<Product[]> {
  return fetchProductsFromDatabase();
}

export async function createProduct(values: ProductPayload): Promise<Product> {
  return insertProductIntoDatabase(values);
}

export async function updateProduct(
  productId: string,
  values: ProductPayload,
): Promise<Product> {
  return updateProductInDatabase(productId, values);
}

export async function listIncomingItems(
  options: ListOptions = {},
): Promise<IncomingItem[]> {
  return fetchIncomingItemsFromDatabase(options);
}

export async function listOutgoingItems(
  options: ListOptions = {},
): Promise<OutgoingItem[]> {
  return fetchOutgoingItemsFromDatabase(options);
}

export async function listStockLogs(options: ListOptions = {}): Promise<StockLog[]> {
  return fetchStockLogsFromDatabase(options);
}

export async function listProfiles(): Promise<ProfileSummary[]> {
  return fetchProfilesFromDatabase();
}

export async function processStockTransaction(
  input: CreateStockTransactionInput,
): Promise<StockLog> {
  return processStockTransactionInDatabase(input);
}

export async function recordIncomingItem(
  input: CreateIncomingItemInput,
): Promise<IncomingItem> {
  return recordIncomingInDatabase(input);
}

export async function recordOutgoingItem(
  input: CreateOutgoingItemInput,
): Promise<OutgoingItem> {
  return recordOutgoingInDatabase(input);
}
