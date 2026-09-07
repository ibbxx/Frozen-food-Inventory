import { createDatabaseError, createMissingDatabaseConfigError } from "./database-error";
import { momqillSupabase } from "./supabase";

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

export interface DatabaseListOptions {
  endDate?: string;
  limit?: number;
  startDate?: string;
}

const PRODUCT_SELECT_FIELDS =
  "id, product_name, category, public_price, image_url, is_public, current_stock, min_stock, created_at";
const CATEGORY_SELECT_FIELDS = "id, name, created_at";
const INCOMING_SELECT_FIELDS =
  "id, date, product_id, quantity, supplier_name, created_by, created_at";
const OUTGOING_SELECT_FIELDS =
  "id, date, product_id, quantity, description, created_by, created_at";
const STOCK_LOG_SELECT_FIELDS =
  "id, product_id, source_transaction_id, old_stock, change_amount, new_stock, type, notes, created_by, created_at";

function getSupabaseClient() {
  if (!momqillSupabase) {
    throw createMissingDatabaseConfigError();
  }

  return momqillSupabase;
}

export async function fetchProductsFromDatabase(): Promise<Product[]> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT_FIELDS)
      .order("product_name", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw createDatabaseError("memuat daftar produk", error);
  }
}

export async function insertProductIntoDatabase(values: {
  category: Product["category"];
  current_stock: number;
  image_url: string;
  is_public: boolean;
  min_stock: number;
  product_name: string;
  public_price: number | null;
}): Promise<Product> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("products")
      .insert({
        product_name: values.product_name,
        category: values.category,
        public_price: values.public_price,
        image_url: values.image_url || null,
        is_public: values.is_public,
        current_stock: values.current_stock,
        min_stock: values.min_stock,
      } as never)
      .select(PRODUCT_SELECT_FIELDS)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw createDatabaseError("menyimpan produk baru", error);
  }
}

export async function updateProductInDatabase(
  productId: string,
  values: {
    category: Product["category"];
    current_stock: number;
    image_url: string;
    is_public: boolean;
    min_stock: number;
    product_name: string;
    public_price: number | null;
  },
): Promise<Product> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("products")
      .update({
        product_name: values.product_name,
        category: values.category,
        public_price: values.public_price,
        image_url: values.image_url || null,
        is_public: values.is_public,
        current_stock: values.current_stock,
        min_stock: values.min_stock,
      } as never)
      .eq("id", productId)
      .select(PRODUCT_SELECT_FIELDS)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw createDatabaseError("memperbarui produk", error);
  }
}

export async function fetchIncomingItemsFromDatabase(
  options: DatabaseListOptions = {},
): Promise<IncomingItem[]> {
  const supabase = getSupabaseClient();

  try {
    let query = supabase
      .from("incoming_items")
      .select(INCOMING_SELECT_FIELDS)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (options.startDate) {
      query = query.gte("date", options.startDate);
    }

    if (options.endDate) {
      query = query.lte("date", options.endDate);
    }

    if (typeof options.limit === "number") {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw createDatabaseError("memuat riwayat barang masuk", error);
  }
}

export async function fetchOutgoingItemsFromDatabase(
  options: DatabaseListOptions = {},
): Promise<OutgoingItem[]> {
  const supabase = getSupabaseClient();

  try {
    let query = supabase
      .from("outgoing_items")
      .select(OUTGOING_SELECT_FIELDS)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (options.startDate) {
      query = query.gte("date", options.startDate);
    }

    if (options.endDate) {
      query = query.lte("date", options.endDate);
    }

    if (typeof options.limit === "number") {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw createDatabaseError("memuat riwayat barang keluar", error);
  }
}

export async function fetchStockLogsFromDatabase(
  options: DatabaseListOptions = {},
): Promise<StockLog[]> {
  const supabase = getSupabaseClient();

  try {
    let query = supabase
      .from("stock_logs")
      .select(STOCK_LOG_SELECT_FIELDS)
      .order("created_at", { ascending: false });

    if (options.startDate) {
      query = query.gte("created_at", `${options.startDate}T00:00:00`);
    }

    if (options.endDate) {
      query = query.lte("created_at", `${options.endDate}T23:59:59`);
    }

    if (typeof options.limit === "number") {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw createDatabaseError("memuat audit stok", error);
  }
}

export async function fetchProfilesFromDatabase(): Promise<ProfileSummary[]> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .order("full_name", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw createDatabaseError("memuat profil staf", error);
  }
}

export async function processStockTransactionInDatabase(
  input: CreateStockTransactionInput,
): Promise<StockLog> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase.rpc("process_stock_transaction", {
      p_date: input.date,
      p_notes: input.notes || null,
      p_product_id: input.product_id,
      p_quantity: input.quantity,
      p_type: input.type,
    } as never);

    if (error) {
      throw error;
    }

    return data as StockLog;
  } catch (error) {
    throw createDatabaseError("memproses transaksi stok", error);
  }
}

export async function recordIncomingInDatabase(
  input: CreateIncomingItemInput,
): Promise<IncomingItem> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase.rpc("record_incoming", {
      p_date: input.date,
      p_product_id: input.product_id,
      p_quantity: input.quantity,
      p_supplier_name: input.supplier_name,
    } as never);

    if (error) {
      throw error;
    }

    return data as IncomingItem;
  } catch (error) {
    throw createDatabaseError("mencatat barang masuk", error);
  }
}

export async function recordOutgoingInDatabase(
  input: CreateOutgoingItemInput,
): Promise<OutgoingItem> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase.rpc("record_outgoing", {
      p_date: input.date,
      p_product_id: input.product_id,
      p_quantity: input.quantity,
      p_description: input.description || null,
    } as never);

    if (error) {
      throw error;
    }

    return data as OutgoingItem;
  } catch (error) {
    throw createDatabaseError("mencatat barang keluar", error);
  }
}

// ─── Kategori Produk ────────────────────────────────────────────────────────

export async function fetchCategoriesFromDatabase(): Promise<ProductCategoryRecord[]> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("product_categories")
      .select(CATEGORY_SELECT_FIELDS)
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw createDatabaseError("memuat daftar kategori", error);
  }
}

export async function insertCategoryIntoDatabase(
  name: string,
): Promise<ProductCategoryRecord> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("product_categories")
      .insert({ name: name.trim() } as never)
      .select(CATEGORY_SELECT_FIELDS)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw createDatabaseError("menyimpan kategori baru", error);
  }
}

export async function updateCategoryInDatabase(
  categoryId: string,
  name: string,
): Promise<ProductCategoryRecord> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("product_categories")
      .update({ name: name.trim() } as never)
      .eq("id", categoryId)
      .select(CATEGORY_SELECT_FIELDS)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw createDatabaseError("memperbarui kategori", error);
  }
}

export async function deleteCategoryFromDatabase(
  categoryId: string,
): Promise<void> {
  const supabase = getSupabaseClient();

  try {
    const { error } = await supabase
      .from("product_categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      throw error;
    }
  } catch (error) {
    throw createDatabaseError("menghapus kategori", error);
  }
}
