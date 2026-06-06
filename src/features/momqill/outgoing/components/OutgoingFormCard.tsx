import { AlertTriangle, ArrowUpRight } from "lucide-react";

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
import type { OutgoingFormValues } from "../outgoing-form";
import type { FormEventHandler } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

interface OutgoingFormCardProps {
  errors: FieldErrors<OutgoingFormValues>;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  products: Product[];
  register: UseFormRegister<OutgoingFormValues>;
  selectedProductStock: number;
  stockExceeded: boolean;
}

export function OutgoingFormCard({
  errors,
  isSubmitting,
  onSubmit,
  products,
  register,
  selectedProductStock,
  stockExceeded,
}: OutgoingFormCardProps) {
  return (
    <Card className="border-cyan-100 shadow-sm">
      <CardHeader>
        <CardTitle>Barang Keluar</CardTitle>
        <CardDescription>
          Catat stok keluar secara real-time dan cegah salah input sebelum tersimpan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Tanggal</label>
            <Input type="date" {...register("date")} />
            {errors.date ? (
              <span className="text-xs text-destructive">{errors.date.message}</span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Produk</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register("product_id")}
            >
              <option value="">Pilih produk</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.product_name}
                </option>
              ))}
            </select>
            {errors.product_id ? (
              <span className="text-xs text-destructive">{errors.product_id.message}</span>
            ) : null}
          </div>

          <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Jumlah Keluar</label>
              <Input min="1" type="number" {...register("quantity")} />
              {errors.quantity ? (
                <span className="text-xs text-destructive">{errors.quantity.message}</span>
              ) : null}
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-slate-700">
              Stok saat ini:{" "}
              <span className="font-semibold text-slate-900">{selectedProductStock}</span>
            </div>
          </div>

          {stockExceeded ? (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Jumlah keluar tidak boleh melebihi stok tersedia.
            </div>
          ) : null}

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Keterangan</label>
            <textarea
              className="min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Contoh: Penjualan retail, reseller, barang rusak, atau promo."
              {...register("description")}
            />
            {errors.description ? (
              <span className="text-xs text-destructive">{errors.description.message}</span>
            ) : null}
          </div>

          <Button disabled={isSubmitting || stockExceeded} type="submit">
            <ArrowUpRight className="mr-2 h-4 w-4" />
            {isSubmitting ? "Menyimpan..." : "Simpan Barang Keluar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
