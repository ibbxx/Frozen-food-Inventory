import { ArrowRight, Layers } from "lucide-react";
import { Link } from "react-router-dom";

import type { PublicCatalogProduct } from "@/features/inventory/types/database";
import { Button } from "@/shared/ui/button";

import { createWhatsappLink } from "../public-catalog-service";

import { CatalogProductCard } from "./CatalogProductCard";

interface ProductRelatedListProps {
  category: string;
  products: PublicCatalogProduct[];
}

export function ProductRelatedList({ category, products }: ProductRelatedListProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 sm:mt-16 space-y-4 border-t border-border pt-8 sm:pt-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-primary uppercase tracking-wider">
            <Layers className="h-3.5 w-3.5" />
            <span>Koleksi Terkait</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Produk Lain di Kategori {category}
          </h2>
          <p className="text-xs text-muted-foreground">
            Pilihan produk beku berkualitas lainnya yang cocok untuk kebutuhan Anda.
          </p>
        </div>

        <Button
          asChild
          className="self-start sm:self-auto h-8 text-xs font-medium"
          variant="outline"
        >
          <Link to="/catalog">
            <span>Lihat Semua Katalog</span>
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Grid of related products */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <CatalogProductCard
            key={product.id}
            onWhatsappClick={() => undefined}
            product={product}
            whatsappLink={createWhatsappLink(product.product_name)}
          />
        ))}
      </div>
    </section>
  );
}
