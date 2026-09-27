import { Package2, Snowflake, ShieldCheck, ZoomIn } from "lucide-react";
import { useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProductDetailGalleryProps {
  category: string;
  imageUrl: string | null;
  productName: string;
}

export function ProductDetailGallery({
  category,
  imageUrl,
  productName,
}: ProductDetailGalleryProps) {
  const [imageError, setImageError] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const hasValidImage = Boolean(imageUrl) && !imageError;

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image Box */}
      <div className="group relative aspect-[4/3] sm:aspect-square w-full overflow-hidden rounded-xl border border-border bg-slate-100 shadow-2xs">
        {hasValidImage ? (
          <>
            <img
              alt={productName}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              onError={() => setImageError(true)}
              src={imageUrl!}
            />
            {/* Click to zoom overlay trigger */}
            <button
              aria-label="Perbesar foto produk"
              className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-hidden"
              onClick={() => setIsZoomOpen(true)}
              type="button"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 font-mono text-xs font-semibold text-slate-800 shadow-md">
                <ZoomIn className="h-3.5 w-3.5 text-primary" />
                Perbesar Foto
              </span>
            </button>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground/60">
            <Package2 className="h-14 w-14 stroke-1 text-muted-foreground/40" />
            <span className="font-mono text-xs tracking-wider uppercase">
              Foto Produk Dalam Pembaruan
            </span>
            <span className="font-display text-sm font-semibold text-foreground/70">
              Karunrung Frozen Food
            </span>
          </div>
        )}

        {/* Floating Category Chip on top-left */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="inline-flex items-center rounded-md border border-white/80 bg-white/95 px-2.5 py-1 font-mono text-xs font-semibold text-slate-800 shadow-xs backdrop-blur-xs">
            {category}
          </span>
        </div>
      </div>

      {/* Cold Chain Assurance Strip */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-white p-2.5 shadow-2xs">
          <Snowflake className="h-4 w-4 shrink-0 text-blue-600" />
          <div className="leading-tight">
            <div className="font-mono text-[10px] text-muted-foreground uppercase">
              Standar Suhu
            </div>
            <div className="font-mono font-semibold text-slate-800 text-[11px] sm:text-xs">
              Maksimal -18&deg;C
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-white p-2.5 shadow-2xs">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <div className="leading-tight">
            <div className="font-mono text-[10px] text-muted-foreground uppercase">
              Jaminan Mutu
            </div>
            <div className="font-sans font-medium text-slate-800 text-[11px] sm:text-xs">
              Higienis & Tersegel
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Dialog Modal */}
      {hasValidImage && (
        <Dialog onOpenChange={setIsZoomOpen} open={isZoomOpen}>
          <DialogContent className="max-w-3xl overflow-hidden border border-border p-2 sm:p-4 bg-white/95 backdrop-blur-md">
            <div className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-50">
              <img
                alt={productName}
                className="h-full w-full object-contain"
                src={imageUrl!}
              />
            </div>
            <div className="px-2 pt-1 pb-2 flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span>{productName}</span>
              <span className="uppercase">{category}</span>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
