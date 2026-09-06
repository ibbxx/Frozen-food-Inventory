import { Filter, RefreshCw, Search, Store } from "lucide-react";
import { useMemo, useState } from "react";

import { productCategoryOptions } from "@/shared/lib/product-categories";
import { Badge } from "@/shared/ui/badge";
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
  const [selectedStore, setSelectedStore] = useState<StoreOption>("Hertasning");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [keyword, setKeyword] = useState<string>("");

  const catalogQuery = usePublicCatalog(selectedStore);

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
    <div className="min-h-screen bg-[hsl(var(--background))] text-foreground">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-3.5 py-4 sm:px-6 sm:py-8 lg:px-8">
        {/* Asymmetric Masthead (No bloated gradients) */}
        <header className="rounded-lg border border-border bg-white p-4 sm:p-6 lg:p-8 shadow-xs">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default" className="gap-1.5 py-1">
                  <img src="/logo-icon.png" alt="" className="h-3.5 w-3.5 object-contain" />
                  KATALOG RESMI KARUNRUNG FROZEN FOOD
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">
                  Update Stok Terakhir &bull; Hari Ini
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
                Katalog Frozen Food &bull; Stok Real-Time
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Pilih cabang toko tujuan Anda, temukan produk beku favorit, dan hubungkan langsung
                ke tim kasir via WhatsApp untuk pemesanan cepat.
              </p>
            </div>

            {/* Store Picker */}
            <div className="rounded-md border border-border bg-slate-50 p-3 sm:p-4 space-y-2 shrink-0">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <Store className="h-3.5 w-3.5 text-primary" />
                Pilih Cabang Pengambilan:
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {storeOptions.map((store) => (
                  <Button
                    className="h-9 px-3 text-xs"
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

        {/* Mobile First Toolbar: Search & Touch-Scrollable Category Chips */}
        <section className="mt-4 sm:mt-6 space-y-3">
          {/* Search Input & Refresh Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                className="h-11 w-full rounded-md border border-border bg-white pl-10 pr-4 text-sm text-foreground shadow-2xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-sans"
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Cari nugget, dimsum, kentang, bakso..."
                value={keyword}
              />
            </div>
            <Button
              aria-label="Segarkan katalog"
              className="h-11 px-3 text-xs shrink-0 gap-1.5"
              disabled={catalogQuery.isFetching}
              onClick={() => catalogQuery.refetch()}
              title="Segarkan data katalog"
              type="button"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 ${catalogQuery.isFetching ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline font-medium">Segarkan</span>
            </Button>
          </div>

          {/* Category Chips: Horizontal Touch-Scroll Bar on Mobile */}
          <div className="flex items-center gap-2 overflow-x-auto touch-scroll py-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground shrink-0 hidden sm:inline-flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filter:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {catalogFilters.map((category) => (
                <button
                  className={`h-8 px-3 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-120 cursor-pointer ${
                    selectedCategory === category
                      ? "bg-primary text-white font-semibold shadow-2xs"
                      : "border border-border bg-white text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                  }`}
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <main className="mt-5 sm:mt-6 flex-1">
          {catalogQuery.isLoading ? (
            <div className="grid min-h-[260px] place-items-center rounded-lg border border-border bg-white p-8 text-center text-xs font-mono text-muted-foreground">
              Memuat katalog produk Karunrung Frozen Food...
            </div>
          ) : catalogQuery.isError ? (
            <div className="grid min-h-[260px] place-items-center rounded-lg border border-red-200 bg-red-50/50 p-6 text-center text-red-700">
              <div>
                <div className="font-display text-base font-bold">Katalog Belum Bisa Dimuat</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Periksa koneksi internet Anda atau hubungi admin toko.
                </div>
                <Button
                  className="mt-3 h-8 text-xs"
                  onClick={() => catalogQuery.refetch()}
                  type="button"
                  variant="outline"
                >
                  Coba Lagi
                </Button>
              </div>
            </div>
          ) : filteredProducts.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            <div className="grid min-h-[220px] place-items-center rounded-lg border border-dashed border-border bg-white/60 p-6 text-center text-xs font-mono text-muted-foreground">
              <div>
                <p>
                  Tidak ada produk yang cocok dengan kata kunci &ldquo;{keyword}&rdquo; pada kategori {selectedCategory}.
                </p>
                {(keyword || selectedCategory !== "Semua") && (
                  <Button
                    className="mt-3 h-8 text-xs"
                    onClick={() => {
                      setKeyword("");
                      setSelectedCategory("Semua");
                    }}
                    type="button"
                    variant="outline"
                  >
                    Reset Filter
                  </Button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
