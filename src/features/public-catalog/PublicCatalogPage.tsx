import { Filter, Snowflake, Store } from "lucide-react";
import { useMemo, useState } from "react";

import { productCategoryOptions } from "@/shared/lib/product-categories";
import { Button } from "@/shared/ui/button";

import { CatalogProductCard } from "./components/CatalogProductCard";
import {
  createWhatsappLink,
  storeOptions,
  type StoreOption,
} from "./public-catalog-service";
import { usePublicCatalog } from "./use-public-catalog";

const catalogFilters = ["Semua", ...productCategoryOptions] as const;

export function PublicCatalogPage() {
  const catalogQuery = usePublicCatalog();
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof catalogFilters)[number]>("Semua");
  const [selectedStore, setSelectedStore] = useState<StoreOption>("Hertasning");

  const filteredProducts = useMemo(() => {
    const products = catalogQuery.data ?? [];
    const normalizedKeyword = keyword.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "Semua" || product.category === selectedCategory;
      const matchesKeyword =
        !normalizedKeyword ||
        product.product_name.toLowerCase().includes(normalizedKeyword);

      return matchesCategory && matchesKeyword;
    });
  }, [catalogQuery.data, keyword, selectedCategory]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6fbff_0%,#ffffff_35%,#fffaf2_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-[32px] border border-white/80 bg-white/80 p-6 shadow-xl shadow-cyan-100/40 backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-3 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                <Snowflake className="h-4 w-4" />
                Live Catalog Momqil Frozen Food
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                  Katalog frozen food real-time untuk pelanggan Momqil.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600">
                  Cek produk favorit, filter kategori, lalu lanjutkan percakapan ke WhatsApp untuk konfirmasi stok di toko pilihan Anda.
                </p>
              </div>
            </div>

            <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex items-center gap-2 font-medium text-slate-900">
                <Store className="h-4 w-4 text-cyan-600" />
                Pilih toko tujuan
              </div>
              <div className="flex flex-wrap gap-2">
                {storeOptions.map((store) => (
                  <Button
                    key={store}
                    onClick={() => setSelectedStore(store)}
                    type="button"
                    variant={selectedStore === store ? "default" : "outline"}
                  >
                    {store}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-4 rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm md:grid-cols-[1.3fr_1fr]">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-700">Cari produk</span>
            <input
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Contoh: nugget, suki, paket hemat"
              value={keyword}
            />
          </label>

          <div className="grid gap-2 text-sm">
            <span className="flex items-center gap-2 font-medium text-slate-700">
              <Filter className="h-4 w-4" />
              Filter kategori
            </span>
            <div className="flex flex-wrap gap-2">
              {catalogFilters.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  type="button"
                  variant={selectedCategory === category ? "default" : "outline"}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        <main className="mt-8 flex-1">
          {catalogQuery.isLoading ? (
            <div className="grid min-h-[240px] place-items-center rounded-[28px] border border-slate-200 bg-white text-slate-500 shadow-sm">
              Memuat katalog Momqil...
            </div>
          ) : catalogQuery.isError ? (
            <div className="grid min-h-[240px] place-items-center rounded-[28px] border border-red-200 bg-white p-6 text-center text-red-600 shadow-sm">
              <div>
                <div className="text-lg font-semibold">Katalog belum bisa dimuat</div>
                <div className="mt-2 text-sm text-slate-600">
                  Pastikan akses internet stabil dan view publik Supabase sudah aktif.
                </div>
              </div>
            </div>
          ) : filteredProducts.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <CatalogProductCard
                  key={product.id}
                  onWhatsappClick={() => undefined}
                  product={product}
                  whatsappLink={createWhatsappLink(product.product_name, selectedStore)}
                />
              ))}
            </div>
          ) : (
            <div className="grid min-h-[220px] place-items-center rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-6 text-center text-slate-500">
              Tidak ada produk yang cocok dengan filter saat ini.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
