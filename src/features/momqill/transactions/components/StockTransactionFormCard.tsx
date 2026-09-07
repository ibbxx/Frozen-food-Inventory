import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Package,
  PlusCircle,
  Search,
} from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

import type { Product } from "../../types/database";
import type { BaseSyntheticEvent, ChangeEvent, RefObject } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

interface TransactionFormValues {
  date: string;
  notes: string;
  product_id: string;
  quantity: number;
  type: "incoming" | "outgoing";
}

interface StockTransactionFormCardProps {
  errors: FieldErrors<TransactionFormValues>;
  isSubmitting: boolean;
  onProductSearchChange: (value: string) => void;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  onTypeChange?: (type: "incoming" | "outgoing") => void;
  pickProduct: (product: Product) => void;
  productSearch: string;
  productSearchRef: RefObject<HTMLInputElement | null>;
  products: Product[];
  register: UseFormRegister<TransactionFormValues>;
  selectedProduct: Product | undefined;
  selectedType: "incoming" | "outgoing";
  stockExceeded: boolean;
}

export function StockTransactionFormCard({
  errors,
  isSubmitting,
  onProductSearchChange,
  onSubmit,
  onTypeChange,
  pickProduct,
  productSearch,
  productSearchRef,
  products,
  register,
  selectedProduct,
  selectedType,
  stockExceeded,
}: StockTransactionFormCardProps) {
  return (
    <Card className="border-border bg-white shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PlusCircle className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="font-display text-base sm:text-lg font-bold">
              Input Transaksi Cepat
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Tekan tombol <kbd className="rounded border border-border bg-white px-1.5 py-0.5 text-[10px] font-mono font-bold text-foreground">/</kbd> untuk mencari produk secara cepat.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <form className="space-y-4" onSubmit={onSubmit}>
          {/* Tipe Transaksi Segmented Switcher */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tipe Transaksi
            </label>
            <input type="hidden" {...register("type")} />
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  selectedType === "incoming"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs ring-1 ring-emerald-600/20"
                    : "border-border bg-white text-muted-foreground hover:bg-slate-50 hover:text-foreground"
                }`}
                onClick={() => onTypeChange?.("incoming")}
                type="button"
              >
                <ArrowDownLeft
                  className={`h-4 w-4 ${
                    selectedType === "incoming"
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                  }`}
                />
                <span>Barang Masuk (+)</span>
              </button>

              <button
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  selectedType === "outgoing"
                    ? "border-primary bg-primary/10 text-primary shadow-2xs ring-1 ring-primary/20"
                    : "border-border bg-white text-muted-foreground hover:bg-slate-50 hover:text-foreground"
                }`}
                onClick={() => onTypeChange?.("outgoing")}
                type="button"
              >
                <ArrowUpRight
                  className={`h-4 w-4 ${
                    selectedType === "outgoing"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <span>Barang Keluar (-)</span>
              </button>
            </div>
          </div>

          {/* Cari & Pilih Produk */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pilih Produk
              </label>
              {selectedProduct ? (
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Terpilih
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Wajib dipilih
                </span>
              )}
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9 text-sm"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  onProductSearchChange(event.target.value)
                }
                placeholder="Ketik nama produk..."
                ref={productSearchRef}
                value={productSearch}
              />
            </div>

            {/* List Pilihan Produk */}
            <div className="grid max-h-40 gap-1.5 overflow-y-auto rounded-lg border border-border bg-slate-50/50 p-1.5">
              {products.length ? (
                products.map((product) => {
                  const isActive = selectedProduct?.id === product.id;
                  return (
                    <button
                      className={`flex items-center justify-between rounded-md border p-2 text-left text-xs transition-all cursor-pointer ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary shadow-2xs font-semibold"
                          : "border-transparent bg-white text-foreground hover:border-border hover:bg-slate-100/80"
                      }`}
                      key={product.id}
                      onClick={() => pickProduct(product)}
                      type="button"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="truncate font-medium">{product.product_name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {product.category}
                        </div>
                      </div>
                      <div className="shrink-0 text-right font-mono">
                        <span className="text-[10px] text-muted-foreground">Stok: </span>
                        <span className="font-bold text-foreground">
                          {product.current_stock}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-6 px-3 text-center text-xs text-muted-foreground">
                  <Package className="h-5 w-5 text-slate-400 mb-1" />
                  <span>Tidak ada produk yang cocok dengan &quot;{productSearch}&quot;</span>
                </div>
              )}
            </div>

            <input type="hidden" {...register("product_id")} />
            {errors.product_id ? (
              <p className="text-xs text-destructive">{errors.product_id.message}</p>
            ) : null}
          </div>

          {/* Tanggal & Jumlah Mutasi */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tanggal
              </label>
              <Input className="text-sm" type="date" {...register("date")} />
              {errors.date ? (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Jumlah Mutasi (pcs)
              </label>
              <Input
                className="font-mono text-sm"
                min="1"
                placeholder="1"
                type="number"
                {...register("quantity")}
              />
              {errors.quantity ? (
                <p className="text-xs text-destructive">{errors.quantity.message}</p>
              ) : null}
            </div>
          </div>

          {/* Konteks Stok Produk Terpilih */}
          <div className="rounded-lg border border-border bg-slate-50/70 p-3 text-xs">
            <div className="flex items-center justify-between text-muted-foreground font-mono text-[11px]">
              <span>Konteks Stok Fisik:</span>
              <span>
                {selectedProduct ? `Ambang Min: ${selectedProduct.min_stock}` : "-"}
              </span>
            </div>
            <div className="mt-1 font-medium text-foreground">
              {selectedProduct ? (
                <div className="flex items-center justify-between">
                  <span className="truncate max-w-[200px] text-slate-700">
                    {selectedProduct.product_name}
                  </span>
                  <span className="font-mono">
                    Stok Saat Ini: <strong className="text-foreground">{selectedProduct.current_stock} pcs</strong>
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground italic">
                  Pilih produk terlebih dahulu untuk melihat kalkulasi stok.
                </span>
              )}
            </div>
            {selectedType === "outgoing" && stockExceeded ? (
              <div className="mt-2 rounded bg-red-50 border border-red-200 p-1.5 text-xs font-medium text-red-700">
                ⚠️ Jumlah keluar melebihi stok fisik saat ini ({selectedProduct?.current_stock} pcs).
              </div>
            ) : null}
          </div>

          {/* Catatan / Keterangan Transaksi */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Catatan Transaksi
            </label>
            <textarea
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Contoh: Supplier CV Laut Segar / Pengiriman outlet cabang"
              {...register("notes")}
            />
            {errors.notes ? (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
            ) : null}
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <Button
              className="w-full font-semibold cursor-pointer"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Menyimpan Transaksi..." : "Simpan Transaksi Stok"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
