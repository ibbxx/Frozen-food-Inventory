import {
  Check,
  Minus,
  Plus,
  MessageCircleMore,
  Share2,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { PublicCatalogProduct } from "@/features/inventory/types/database";
import { Button } from "@/shared/ui/button";

import { createDetailedWhatsappLink } from "../public-catalog-service";

interface ProductDetailActionCardProps {
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

export function ProductDetailActionCard({ product }: ProductDetailActionCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const whatsappLink = createDetailedWhatsappLink({
    currentUrl,
    product,
    quantity,
  });

  const estimatedTotal =
    product.public_price !== null ? product.public_price * quantity : null;

  const handleShare = async () => {
    const url = currentUrl || window.location.href;
    const shareData = {
      title: `${product.product_name} - Karunrung Frozen Food`,
      text: `Lihat ketersediaan ${product.product_name} di Katalog Resmi Karunrung Frozen Food:`,
      url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback silent
    }
  };

  const isOutOfStock = product.stock_status === "out";

  return (
    <>
      {/* ── Desktop / Inline Action Card ── */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-xs space-y-4">
        <div className="space-y-1">
          <div className="font-display text-sm font-bold text-foreground">
            Rencana Pemesanan
          </div>
          <p className="text-xs text-muted-foreground">
            Sesuaikan perkiraan jumlah pesanan untuk diteruskan langsung ke WhatsApp admin.
          </p>
        </div>

        {/* Quantity Controller */}
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-slate-50/60 p-3">
          <div className="leading-tight">
            <span className="font-mono text-[11px] text-muted-foreground uppercase block">
              Jumlah Kemasan
            </span>
            <span className="font-mono text-sm font-semibold text-foreground">
              {quantity} pack
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-white rounded-md border border-border p-1 shadow-2xs">
            <button
              aria-label="Kurangi kuantitas"
              className="grid h-8 w-8 place-items-center rounded text-muted-foreground hover:bg-slate-100 hover:text-foreground active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
              disabled={quantity <= 1}
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              type="button"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <span className="min-w-[32px] text-center font-mono text-sm font-bold tabular-nums">
              {quantity}
            </span>

            <button
              aria-label="Tambah kuantitas"
              className="grid h-8 w-8 place-items-center rounded text-muted-foreground hover:bg-slate-100 hover:text-foreground active:scale-95 transition-all"
              onClick={() => setQuantity((prev) => prev + 1)}
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Total Price Estimate */}
        {estimatedTotal !== null && (
          <div className="flex items-center justify-between border-t border-dashed border-border pt-3">
            <span className="font-mono text-xs text-muted-foreground">
              Estimasi Total ({quantity} pack):
            </span>
            <span className="font-mono text-lg font-bold text-foreground tabular-nums">
              {formatCurrency(estimatedTotal)}
            </span>
          </div>
        )}

        {/* WhatsApp Direct CTA */}
        <Button
          asChild={Boolean(whatsappLink)}
          className="w-full h-12 min-h-[48px] text-sm font-semibold gap-2 shadow-sm btn-tactile"
          disabled={!whatsappLink}
          type="button"
          variant={isOutOfStock ? "outline" : "default"}
        >
          {whatsappLink ? (
            <a href={whatsappLink} rel="noreferrer" target="_blank">
              <MessageCircleMore className="h-4 w-4 shrink-0" />
              <span>
                {isOutOfStock
                  ? "Tanyakan Restock via WhatsApp"
                  : "Pesan Sekarang via WhatsApp"}
              </span>
            </a>
          ) : (
            <span>Nomor WhatsApp Toko Belum Dikonfigurasi</span>
          )}
        </Button>

        {/* Secondary: Share Button */}
        <Button
          className="w-full h-10 min-h-[40px] text-xs font-medium gap-2 border-border/80"
          onClick={handleShare}
          type="button"
          variant="outline"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Tautan Berhasil Disalin!</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Bagikan Tautan Produk Ini</span>
            </>
          )}
        </Button>

        <p className="text-center font-mono text-[10px] text-muted-foreground/70">
          Pesanan akan langsung diproses oleh kasir Karunrung Frozen Food.
        </p>
      </div>

      {/* ── Mobile Sticky Bottom Action Bar (< md) ── */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-white/95 p-3 backdrop-blur-md shadow-lg md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-2">
          {/* Price preview on mobile bar */}
          <div className="flex-1 min-w-0 pr-1">
            <span className="font-mono text-[10px] uppercase text-muted-foreground block truncate">
              {quantity} pack &bull; Total
            </span>
            <span className="font-mono text-sm font-bold text-foreground truncate block tabular-nums">
              {formatCurrency(estimatedTotal)}
            </span>
          </div>

          {/* Share icon button */}
          <button
            aria-label="Bagikan Tautan Produk"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-border bg-slate-50 text-foreground active:scale-95 transition-all"
            onClick={handleShare}
            type="button"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Share2 className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {/* WhatsApp CTA */}
          <Button
            asChild={Boolean(whatsappLink)}
            className="h-11 min-h-[44px] flex-2 px-3 text-xs font-semibold gap-1.5 shadow-sm"
            disabled={!whatsappLink}
            type="button"
          >
            {whatsappLink ? (
              <a href={whatsappLink} rel="noreferrer" target="_blank">
                <MessageCircleMore className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {isOutOfStock ? "Tanya Restock" : "Pesan via WA"}
                </span>
              </a>
            ) : (
              <span>Hubungi Toko</span>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
