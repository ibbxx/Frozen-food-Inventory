
import type { Database, PublicCatalogProduct } from "@/features/inventory/types/database";
import { appEnv } from "@/shared/lib/env";
import { publicSupabase } from "@/shared/lib/public-supabase";
import { supabase as authSupabase } from "@/shared/lib/supabase";

import type { SupabaseClient } from "@supabase/supabase-js";

interface ProductFallbackRow {
  category: string;
  current_stock: number;
  id: string;
  image_url: string | null;
  product_name: string;
  public_price: number | null;
}

export function getStoreWhatsappNumber(): string {
  const rawNumber = appEnv.publicWhatsappNumber || "6282191024232";
  const cleaned = rawNumber.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    return `62${cleaned.slice(1)}`;
  }
  return cleaned || "6282191024232";
}

function getCatalogClient(): SupabaseClient<Database> {
  // Gunakan authSupabase jika tersedia (agar admin/staff yang login dapat langsung melihat preview),
  // atau publicSupabase untuk pengunjung anonim.
  const client = (authSupabase || publicSupabase) as SupabaseClient<Database> | null;

  if (!client) {
    throw new Error(
      "Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY untuk membuka katalog publik.",
    );
  }

  return client;
}

export async function fetchPublicCatalogProducts(): Promise<PublicCatalogProduct[]> {
  const client = getCatalogClient();

  try {
    // 1. Coba ambil dari view public_catalog_products terlebih dahulu
    const { data: viewData, error: viewError } = await client
      .from("public_catalog_products")
      .select("id, product_name, category, public_price, image_url, stock_status")
      .order("category", { ascending: true })
      .order("product_name", { ascending: true });

    if (!viewError && Array.isArray(viewData) && viewData.length > 0) {
      return viewData;
    }

    // 2. Fallback: Jika view kosong atau mengembalikan error RLS, ambil langsung dari tabel products
    const { data: rawTableData, error: tableError } = await client
      .from("products")
      .select("id, product_name, category, public_price, image_url, current_stock")
      .eq("is_public", true)
      .order("category", { ascending: true })
      .order("product_name", { ascending: true });

    const tableData = rawTableData as unknown as ProductFallbackRow[] | null;

    if (!tableError && Array.isArray(tableData) && tableData.length > 0) {
      return tableData.map((item) => ({
        id: item.id,
        product_name: item.product_name,
        category: item.category,
        public_price: item.public_price,
        image_url: item.image_url,
        stock_status:
          item.current_stock > 10
            ? "available"
            : item.current_stock > 0
              ? "limited"
              : "out",
      }));
    }

    // Jika view berhasil tapi memang belum ada data produk sama sekali
    if (!viewError && viewData) {
      return viewData;
    }

    if (viewError && tableError) {
      throw viewError;
    }

    return [];
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal memuat katalog publik Karunrung Frozen Food.",
    );
  }
}

export function createWhatsappLink(productName: string): string | null {
  const number = getStoreWhatsappNumber();
  if (!number) {
    return null;
  }

  const message = `Halo admin Karunrung Frozen Food, saya lihat di katalog website, apakah ${productName} ready?`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export async function fetchPublicProductById(id: string): Promise<PublicCatalogProduct | null> {
  const client = getCatalogClient();

  try {
    // 1. Coba dari view public_catalog_products
    const { data: viewData, error: viewError } = await client
      .from("public_catalog_products")
      .select("id, product_name, category, public_price, image_url, stock_status")
      .eq("id", id)
      .maybeSingle();

    if (!viewError && viewData) {
      return viewData;
    }

    // 2. Fallback: tabel products
    const { data: rawTableData, error: tableError } = await client
      .from("products")
      .select("id, product_name, category, public_price, image_url, current_stock")
      .eq("id", id)
      .eq("is_public", true)
      .maybeSingle();

    const tableData = rawTableData as unknown as ProductFallbackRow | null;

    if (!tableError && tableData) {
      return {
        id: tableData.id,
        product_name: tableData.product_name,
        category: tableData.category,
        public_price: tableData.public_price,
        image_url: tableData.image_url,
        stock_status:
          tableData.current_stock > 10
            ? "available"
            : tableData.current_stock > 0
              ? "limited"
              : "out",
      };
    }

    return null;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal memuat detail produk dari katalog.",
    );
  }
}

export async function fetchRelatedPublicProducts(
  category: string,
  currentId: string,
  limit = 4,
): Promise<PublicCatalogProduct[]> {
  const client = getCatalogClient();

  try {
    // 1. Coba dari view
    const { data: viewData, error: viewError } = await client
      .from("public_catalog_products")
      .select("id, product_name, category, public_price, image_url, stock_status")
      .eq("category", category)
      .neq("id", currentId)
      .limit(limit);

    if (!viewError && Array.isArray(viewData) && viewData.length > 0) {
      return viewData;
    }

    // 2. Fallback dari tabel products
    const { data: rawTableData, error: tableError } = await client
      .from("products")
      .select("id, product_name, category, public_price, image_url, current_stock")
      .eq("is_public", true)
      .eq("category", category)
      .neq("id", currentId)
      .limit(limit);

    const tableData = rawTableData as unknown as ProductFallbackRow[] | null;

    if (!tableError && Array.isArray(tableData) && tableData.length > 0) {
      return tableData.map((item) => ({
        id: item.id,
        product_name: item.product_name,
        category: item.category,
        public_price: item.public_price,
        image_url: item.image_url,
        stock_status:
          item.current_stock > 10
            ? "available"
            : item.current_stock > 0
              ? "limited"
              : "out",
      }));
    }

    return [];
  } catch {
    return [];
  }
}

export function createDetailedWhatsappLink({
  currentUrl,
  product,
  quantity = 1,
}: {
  currentUrl?: string;
  product: PublicCatalogProduct;
  quantity?: number;
}): string | null {
  const number = getStoreWhatsappNumber();
  if (!number) {
    return null;
  }

  const formattedPrice =
    product.public_price !== null
      ? new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(product.public_price)
      : "Hubungi Toko";

  const totalEstimate =
    product.public_price !== null && quantity > 1
      ? new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(product.public_price * quantity)
      : null;

  const lines = [
    `Halo Admin Karunrung Frozen Food, saya ingin memesan produk berikut:`,
    `• Nama Produk : *${product.product_name}*`,
    `• Kategori    : ${product.category}`,
    `• SKU         : ${product.id.slice(0, 8)}`,
    `• Harga       : ${formattedPrice}`,
    quantity > 1 ? `• Estimasi Qty: ${quantity} pcs` : null,
    totalEstimate ? `• Estimasi Total: ${totalEstimate}` : null,
    currentUrl ? `\nTautan Produk:\n${currentUrl}` : null,
    `\nApakah stok saat ini masih tersedia? Terima kasih!`,
  ].filter(Boolean);

  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
}
