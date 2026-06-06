import { MessageCircleMore } from "lucide-react";

import type { PublicCatalogProduct } from "@/features/momqill/types/database";
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
    return "Hubungi admin";
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
  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-cyan-100 via-white to-amber-100">
        {product.image_url ? (
          <img
            alt={product.product_name}
            className="h-full w-full object-cover"
            loading="lazy"
            src={product.image_url}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
            Foto produk menyusul
          </div>
        )}
      </div>

      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {product.category}
          </span>
          <PublicStockBadge status={product.stock_status} />
        </div>
        <CardTitle className="text-lg leading-snug text-slate-900">
          {product.product_name}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-xl font-semibold tracking-tight text-slate-900">
          {formatCurrency(product.public_price)}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          asChild={Boolean(whatsappLink)}
          className="w-full"
          disabled={!whatsappLink}
          onClick={() => onWhatsappClick(product)}
          type="button"
        >
          {whatsappLink ? (
            <a href={whatsappLink} rel="noreferrer" target="_blank">
              <MessageCircleMore className="mr-2 h-4 w-4" />
              Pesan via WhatsApp
            </a>
          ) : (
            <span className="inline-flex items-center">
              <MessageCircleMore className="mr-2 h-4 w-4" />
              Nomor WhatsApp belum diatur
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
