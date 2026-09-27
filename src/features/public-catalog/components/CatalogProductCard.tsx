import { MessageCircleMore, Package2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import type { PublicCatalogProduct } from "@/features/inventory/types/database";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import { PublicStockBadge } from "../public-stock-status";

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Hubungi Toko";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

interface CatalogProductCardProps {
  onWhatsappClick: (product: PublicCatalogProduct) => void;
  product: PublicCatalogProduct;
  whatsappLink: string | null;
}

export function CatalogProductCard({
  onWhatsappClick,
  product,
  whatsappLink,
}: CatalogProductCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="group flex flex-col justify-between overflow-hidden border border-border bg-white shadow-2xs transition-all duration-150 hover:border-primary/40 hover:shadow-sm">
      <div>
        {/* Product Image Box linked to Detail */}
        <Link
          className="relative block aspect-[4/3] w-full overflow-hidden bg-slate-100 border-b border-border focus-visible:outline-hidden"
          to={`/catalog/${product.id}`}
        >
          {product.image_url && !imageError ? (
            <img
              alt={product.product_name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={() => setImageError(true)}
              src={product.image_url}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground/60">
              <Package2 className="h-8 w-8" />
              <span className="font-mono text-xs">Karunrung Frozen</span>
            </div>
          )}

          {/* Category Chip Floating on top-left */}
          <div className="absolute top-2.5 left-2.5 pointer-events-none">
            <span className="inline-flex items-center rounded-md border border-white/80 bg-white/95 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-800 shadow-2xs backdrop-blur-xs">
              {product.category}
            </span>
          </div>
        </Link>

        <CardHeader className="space-y-2 p-4 pb-2">
          <div className="flex items-center justify-between gap-2">
            <PublicStockBadge status={product.stock_status} />
            <span className="font-mono text-[10px] text-muted-foreground">
              SKU: {product.id.slice(0, 8)}
            </span>
          </div>
          <CardTitle className="font-display text-base sm:text-lg font-bold text-foreground leading-snug">
            <Link
              className="hover:text-primary transition-colors block focus-visible:outline-hidden"
              to={`/catalog/${product.id}`}
            >
              {product.product_name}
            </Link>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 py-2">
          <div className="font-mono text-lg font-bold text-foreground tabular-nums">
            {formatCurrency(product.public_price)}
          </div>
        </CardContent>
      </div>

      <CardFooter className="p-4 pt-2 flex flex-col gap-2">
        <Button
          asChild={Boolean(whatsappLink)}
          className="w-full h-11 text-xs sm:text-sm font-semibold gap-2 min-h-[44px]"
          disabled={!whatsappLink}
          onClick={() => onWhatsappClick(product)}
          type="button"
        >
          {whatsappLink ? (
            <a href={whatsappLink} rel="noreferrer" target="_blank">
              <MessageCircleMore className="h-4 w-4 shrink-0" />
              <span>Pesan via WhatsApp</span>
            </a>
          ) : (
            <span className="inline-flex items-center">
              <MessageCircleMore className="mr-2 h-4 w-4 shrink-0" />
              <span>Kontak Toko Belum Tersedia</span>
            </span>
          )}
        </Button>

        <Button
          asChild
          className="w-full h-8 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-slate-50 transition-colors"
          variant="ghost"
        >
          <Link to={`/catalog/${product.id}`}>
            Lihat Spesifikasi & Detail &rarr;
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

