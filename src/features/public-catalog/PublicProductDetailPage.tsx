import {
  ArrowLeft,
  ChevronRight,
  PackageX,
  Store,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

import { ProductDetailActionCard } from "./components/ProductDetailActionCard";
import { ProductDetailGallery } from "./components/ProductDetailGallery";
import { ProductDetailInfo } from "./components/ProductDetailInfo";
import { ProductRelatedList } from "./components/ProductRelatedList";
import {
  usePublicProduct,
  usePublicRelatedProducts,
} from "./use-public-catalog";

export function PublicProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const productQuery = usePublicProduct(id);
  const product = productQuery.data;

  const relatedQuery = usePublicRelatedProducts(product?.category, id);

  // Update dynamic document title
  useEffect(() => {
    if (product) {
      document.title = `${product.product_name} — Katalog Karunrung Frozen Food`;
    } else {
      document.title = "Detail Produk — Karunrung Frozen Food";
    }
  }, [product]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-foreground">
      {/* Container with mobile-first safe padding; extra pb-24 for mobile sticky action bar */}
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-3.5 py-4 sm:px-6 sm:py-8 lg:px-8 pb-28 md:pb-12">
        {/* ── Top Navigation Bar & Breadcrumb ── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white px-3.5 py-2.5 shadow-2xs sm:px-4"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono text-muted-foreground overflow-x-auto py-1">
            <Link
              className="flex items-center gap-1 text-foreground hover:text-primary transition-colors font-semibold"
              to="/catalog"
            >
              <Store className="h-3.5 w-3.5 text-primary" />
              <span>Katalog</span>
            </Link>

            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />

            {product ? (
              <>
                <span className="truncate max-w-[120px] sm:max-w-none text-slate-700">
                  {product.category}
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                <span className="truncate max-w-[140px] sm:max-w-[240px] font-semibold text-foreground">
                  {product.product_name}
                </span>
              </>
            ) : (
              <span>Detail Produk</span>
            )}
          </div>

          <Button
            className="h-8 text-xs font-medium gap-1.5 border-border/80 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(-1)}
            type="button"
            variant="ghost"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali</span>
          </Button>
        </nav>

        {/* ── Main Content Area ── */}
        <main className="flex-1">
          {productQuery.isLoading ? (
            /* Loading Skeleton */
            <div className="rounded-xl border border-border bg-white p-4 sm:p-6 lg:p-8 shadow-xs">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="lg:col-span-5 space-y-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-10 w-3/4 rounded-md" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </div>
            </div>
          ) : productQuery.isError || !product ? (
            /* Error / Not Found State */
            <div className="grid min-h-[380px] place-items-center rounded-xl border border-dashed border-border bg-white p-8 text-center shadow-xs">
              <div className="max-w-md space-y-3">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-muted-foreground/60">
                  <PackageX className="h-7 w-7" />
                </div>
                <Badge variant="outline" className="font-mono text-[11px]">
                  404 &bull; PRODUK TIDAK DITEMUKAN
                </Badge>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  Produk Tidak Tersedia di Katalog
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Produk yang Anda cari mungkin telah diarsipkan, stoknya sedang tidak
                  dipublikasikan, atau tautan yang Anda buka tidak valid.
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <Button asChild className="h-10 text-xs font-semibold">
                    <Link to="/catalog">Kembali ke Katalog Utama</Link>
                  </Button>
                  <Button
                    className="h-10 text-xs font-medium"
                    onClick={() => productQuery.refetch()}
                    type="button"
                    variant="outline"
                  >
                    Muat Ulang
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Product Loaded Successfully */
            <div className="rounded-xl border border-border bg-white p-4 sm:p-6 lg:p-8 shadow-xs">
              {/* Asymmetric 2-column layout on Desktop */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
                {/* Left Column (5 cols): Product Gallery */}
                <div className="lg:col-span-5">
                  <ProductDetailGallery
                    category={product.category}
                    imageUrl={product.image_url}
                    productName={product.product_name}
                  />
                </div>

                {/* Right Column (7 cols): Information & Action */}
                <div className="lg:col-span-7 space-y-6">
                  <ProductDetailInfo product={product} />
                  <ProductDetailActionCard product={product} />
                </div>
              </div>

              {/* Related Products Section */}
              <ProductRelatedList
                category={product.category}
                products={relatedQuery.data ?? []}
              />
            </div>
          )}
        </main>

        {/* ── Footer Branding ── */}
        <footer className="mt-8 pt-4 border-t border-border/50 text-center font-mono text-[11px] text-muted-foreground/60">
          Karunrung Frozen Food &copy; {new Date().getFullYear()} &bull; Standar Rantai Dingin Terjamin
        </footer>
      </div>
    </div>
  );
}
