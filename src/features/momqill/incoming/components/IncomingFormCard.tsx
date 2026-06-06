import { ArrowDownLeft } from "lucide-react";

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
import type { IncomingFormValues } from "../incoming-form";
import type { FormEventHandler } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

interface IncomingFormCardProps {
  errors: FieldErrors<IncomingFormValues>;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  products: Product[];
  register: UseFormRegister<IncomingFormValues>;
}

export function IncomingFormCard({
  errors,
  isSubmitting,
  onSubmit,
  products,
  register,
}: IncomingFormCardProps) {
  return (
    <Card className="border-cyan-100 shadow-sm">
      <CardHeader>
        <CardTitle>Barang Masuk</CardTitle>
        <CardDescription>
          Catat penerimaan stok dari supplier dan tambahkan stok produk secara atomik.
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Jumlah</label>
              <Input min="1" type="number" {...register("quantity")} />
              {errors.quantity ? (
                <span className="text-xs text-destructive">{errors.quantity.message}</span>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Nama Supplier</label>
              <Input placeholder="Masukkan nama supplier" {...register("supplier_name")} />
              {errors.supplier_name ? (
                <span className="text-xs text-destructive">{errors.supplier_name.message}</span>
              ) : null}
            </div>
          </div>

          <Button disabled={isSubmitting} type="submit">
            <ArrowDownLeft className="mr-2 h-4 w-4" />
            {isSubmitting ? "Menyimpan..." : "Simpan Barang Masuk"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
