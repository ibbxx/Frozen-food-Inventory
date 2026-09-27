import { Info, Sparkles, ThermometerSnowflake, Warehouse } from "lucide-react";

import type { PublicCatalogProduct } from "@/features/inventory/types/database";

import { PublicStockBadge } from "../public-stock-status";

interface ProductDetailInfoProps {
  product: PublicCatalogProduct;
}

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

export function ProductDetailInfo({ product }: ProductDetailInfoProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Top Meta: SKU & Stock Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PublicStockBadge status={product.stock_status} />
        <span className="font-mono text-xs text-muted-foreground">
          SKU: <strong className="text-foreground">{product.id.slice(0, 8)}</strong>
        </span>
      </div>

      {/* Title & Category Line */}
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          {product.product_name}
        </h1>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
          Kategori: <span className="font-semibold text-foreground">{product.category}</span>
        </p>
      </div>

      {/* Price Showcase Card */}
      <div className="rounded-xl border border-border bg-slate-50/70 p-4 sm:p-5">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Harga Resmi Katalog
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground tabular-nums">
            {formatCurrency(product.public_price)}
          </span>
          <span className="font-sans text-xs text-muted-foreground">
            / kemasan
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Warehouse className="h-3.5 w-3.5 text-primary" />
          <span>Harga terikat stok aktif gudang Karunrung Makassar</span>
        </div>
      </div>

      {/* Bento Specifications Box */}
      <div className="rounded-xl border border-border bg-white p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Spesifikasi & Kondisi Penyimpanan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-border/70 bg-slate-50/50 p-3">
            <span className="font-mono text-[10px] text-muted-foreground uppercase block mb-0.5">
              Suhu Penyimpanan
            </span>
            <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
              <ThermometerSnowflake className="h-3.5 w-3.5 text-blue-600" />
              Freezer &le; -18&deg;C
            </span>
          </div>

          <div className="rounded-lg border border-border/70 bg-slate-50/50 p-3">
            <span className="font-mono text-[10px] text-muted-foreground uppercase block mb-0.5">
              Status Kesegaran
            </span>
            <span className="font-sans font-semibold text-slate-800">
              {product.stock_status === "available"
                ? "Ready Stock (Stok Aman)"
                : product.stock_status === "limited"
                  ? "Stok Terbatas (Segera Pesan)"
                  : "Stok Habis / Dalam Restok"}
            </span>
          </div>
        </div>

        {/* Cold-Chain Handling Guide */}
        <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-xs text-slate-700">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block text-blue-900">
                Petunjuk Penanganan Frozen Food:
              </span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] leading-relaxed text-blue-800/90">
                <li>Simpan segera ke dalam freezer setelah paket tiba di tujuan.</li>
                <li>Lakukan proses thawing (pencairan) di chiller sebelum diolah.</li>
                <li>Hindari membekukan ulang bahan yang sudah dicairkan sempurna.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
