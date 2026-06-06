import { Search } from "lucide-react";


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
    <Card className="border-cyan-100 shadow-sm">
      <CardHeader>
        <CardTitle>Input Stok Cepat</CardTitle>
        <CardDescription>
          Fokuskan kursor ke pencarian dengan tombol <kbd className="rounded bg-slate-100 px-2 py-1 text-xs">/</kbd>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Cari Produk</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  onProductSearchChange(event.target.value)
                }
                placeholder="Ketik nama produk untuk filter"
                ref={productSearchRef}
                value={productSearch}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Pilih Produk</label>
            <div className="grid max-h-48 gap-2 overflow-y-auto rounded-2xl border border-slate-200 p-2">
              {products.length ? (
                products.map((product) => {
                  const isActive = selectedProduct?.id === product.id;
                  return (
                    <button
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                        isActive
                          ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                          : "border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50/60"
                      }`}
                      key={product.id}
                      onClick={() => pickProduct(product)}
                      type="button"
                    >
                      <div className="font-medium">{product.product_name}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {product.category} · stok saat ini {product.current_stock}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
                  Tidak ada produk yang cocok dengan pencarian ini.
                </div>
              )}
            </div>
            <input type="hidden" {...register("product_id")} />
            {errors.product_id ? (
              <span className="text-xs text-destructive">{errors.product_id.message}</span>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Tipe Transaksi</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register("type")}
              >
                <option value="incoming">Masuk</option>
                <option value="outgoing">Keluar</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Tanggal</label>
              <Input type="date" {...register("date")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Jumlah</label>
              <Input min="1" type="number" {...register("quantity")} />
              {errors.quantity ? (
                <span className="text-xs text-destructive">{errors.quantity.message}</span>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="font-medium text-slate-900">Konteks stok</div>
              <div className="mt-1">
                {selectedProduct
                  ? `${selectedProduct.product_name} memiliki stok ${selectedProduct.current_stock}.`
                  : "Pilih produk untuk melihat stok saat ini."}
              </div>
              {selectedType === "outgoing" && stockExceeded ? (
                <div className="mt-2 text-xs font-medium text-red-600">
                  Jumlah keluar melebihi stok saat ini. Validasi akhir tetap dilakukan di database.
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Catatan</label>
            <textarea
              className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Contoh: Supplier PT Laut Beku / Penjualan outlet"
              {...register("notes")}
            />
            {errors.notes ? (
              <span className="text-xs text-destructive">{errors.notes.message}</span>
            ) : null}
          </div>

          <div className="flex justify-end">
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Memproses..." : "Simpan Transaksi"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
