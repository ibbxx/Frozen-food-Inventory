import type { Database, PublicCatalogProduct } from "@/features/momqill/types/database";
import { appEnv } from "@/shared/lib/env";
import { publicSupabase } from "@/shared/lib/public-supabase";

import type { SupabaseClient } from "@supabase/supabase-js";

const typedPublicSupabase = publicSupabase as SupabaseClient<Database> | null;

export const storeOptions = ["Hertasning", "Paccerakang"] as const;
export type StoreOption = (typeof storeOptions)[number];

function getPublicClient() {
  if (!typedPublicSupabase) {
    throw new Error(
      "Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY untuk membuka katalog publik.",
    );
  }

  return typedPublicSupabase;
}

export async function fetchPublicCatalogProducts(): Promise<PublicCatalogProduct[]> {
  const supabase = getPublicClient();

  try {
    const { data, error } = await supabase
      .from("public_catalog_products")
      .select("id, product_name, category, public_price, image_url, stock_status")
      .order("category", { ascending: true })
      .order("product_name", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal memuat katalog publik Momqill.",
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
