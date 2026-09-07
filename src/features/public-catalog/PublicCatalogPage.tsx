import { Package2, Store } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { CatalogProductCard } from "./components/CatalogProductCard";
import {
  CatalogFilterBar,
  type CatalogFilters,
} from "./components/CatalogFilterBar";
import {
  createWhatsappLink,
  storeOptions,
  type StoreOption,
} from "./public-catalog-service";
import { usePublicCatalog } from "./use-public-catalog";

const DEFAULT_FILTERS: CatalogFilters = {
  keyword: "",
  category: "Semua",
  stockStatus: "all",
  sort: "name-asc",
};

export function PublicCatalogPage() {
  const [selectedStore, setSelectedStore] = useState<StoreOption>("Hertasning");
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);

  const catalogQuery = usePublicCatalog(selectedStore);

  const filteredProducts = useMemo(() => {
    const products = catalogQuery.data ?? [];
    const normalizedKeyword = filters.keyword.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesCategory =
        filters.category === "Semua" || product.category === filters.category;

      const matchesKeyword =
        !normalizedKeyword ||
        product.product_name.toLowerCase().includes(normalizedKeyword);

      const matchesStock =
        filters.stockStatus === "all" ||
        product.stock_status === filters.stockStatus;

      return matchesCategory && matchesKeyword && matchesStock;
    });

    // Sort
    return [...filtered].sort((a, b) => {
      switch (filters.sort) {
        case "name-asc":
          return a.product_name.localeCompare(b.product_name, "id");
        case "name-desc":
          return b.product_name.localeCompare(a.product_name, "id");
        case "price-asc": {
          const pa = a.public_price ?? Infinity;
          const pb = b.public_price ?? Infinity;
          return pa - pb;
        }
        case "price-desc": {
          const pa = a.public_price ?? -Infinity;
          const pb = b.public_price ?? -Infinity;
          return pb - pa;
        }
        default:
          return 0;
      }
    });
  }, [catalogQuery.data, filters]);

  const totalAll = catalogQuery.data?.length ?? 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-foreground">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-3.5 py-4 sm:px-6 sm:py-8 lg:px-8">

        {/* ── Masthead ── */}
        <header className="rounded-lg border border-border bg-white p-4 shadow-xs sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default" className="gap-1.5 py-1">
                  <img
                    alt=""
                    className="h-3.5 w-3.5 object-contain"
                    src="/logo-icon.png"
                  />
                  KATALOG RESMI KARUNRUNG FROZEN FOOD
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">
                  Update Stok Terakhir &bull; Hari Ini
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                Katalog Frozen Food &bull; Stok Real-Time
              </h1>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Pilih cabang toko tujuan Anda, temukan produk beku favorit, dan hubungkan langsung
                ke tim kasir via WhatsApp untuk pemesanan cepat.
              </p>
            </div>


          </div>
        </header>

        {/* ── Structured Filter Bar ── */}
        <CatalogFilterBar
          filters={filters}
          isFetching={catalogQuery.isFetching}
          onFiltersChange={setFilters}
          onRefresh={() => catalogQuery.refetch()}
          totalAll={totalAll}
          totalVisible={filteredProducts.length}
        />

        {/* ── Product Grid ── */}
        <main className="mt-5 flex-1 sm:mt-6">
          {catalogQuery.isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  className="flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-2xs"
                  key={index}
                >
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="flex flex-1 flex-col space-y-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="mt-auto pt-2">
                      <Skeleton className="h-9 w-full rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : catalogQuery.isError ? (
            <div className="grid min-h-[260px] place-items-center rounded-lg border border-red-200 bg-red-50/50 p-6 text-center text-red-700">
              <div>
                <div className="font-display text-base font-bold">
                  Katalog Belum Bisa Dimuat
                </div>
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
          ) : filteredProducts.length > 0 ? (
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
            <div className="grid min-h-[220px] place-items-center rounded-lg border border-dashed border-border bg-white/60 p-6 text-center">
              <div className="space-y-2">
                <Package2 className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="font-mono text-xs text-muted-foreground">
                  Tidak ada produk yang cocok dengan filter saat ini.
                </p>
                <Button
                  className="mt-1 h-8 text-xs"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  type="button"
                  variant="outline"
                >
                  Reset Semua Filter
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* Footer spacing */}
        <div className="mt-8 pb-4 text-center font-mono text-[11px] text-muted-foreground/50">
          Karunrung Frozen Food &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
