import type { Database, PublicCatalogProduct } from "@/features/momqill/types/database";
import { appEnv } from "@/shared/lib/env";
import { publicSupabase } from "@/shared/lib/public-supabase";
import { supabase as authSupabase } from "@/shared/lib/supabase";

import type { SupabaseClient } from "@supabase/supabase-js";

export const storeOptions = ["Hertasning", "Paccerakang"] as const;
export type StoreOption = (typeof storeOptions)[number];

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
    const { data: tableData, error: tableError } = await client
      .from("products")
      .select("id, product_name, category, public_price, image_url, current_stock")
      .eq("is_public", true)
      .order("category", { ascending: true })
      .order("product_name", { ascending: true });

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

export function createWhatsappLink(productName: string, store: StoreOption): string | null {
  if (!appEnv.publicWhatsappNumber) {
    return null;
  }

  const message = `Halo admin Momqil, saya lihat di katalog website, apakah ${productName} di toko ${store} ready?`;
  return `https://wa.me/${appEnv.publicWhatsappNumber}?text=${encodeURIComponent(message)}`;
}
