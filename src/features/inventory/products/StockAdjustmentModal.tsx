import { zodResolver } from "@hookform/resolvers/zod";
import { Info, SlidersHorizontal } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import type { Product } from "../types/database";

const adjustmentSchema = z.object({
  // Sengaja tidak memakai z.coerce.number(): field kosong akan berubah menjadi
  // angka 0 dan berpotensi menolkan stok secara tidak sengaja.
  new_stock: z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined ? undefined : Number(value),
    z
      .number({
        required_error: "Stok fisik wajib diisi.",
        invalid_type_error: "Stok fisik harus berupa angka.",
      })
      .int("Stok fisik harus bilangan bulat.")
      .min(0, "Stok fisik tidak boleh negatif."),
  ),
  notes: z.string().trim().min(3, "Alasan penyesuaian minimal 3 karakter."),
});

export type StockAdjustmentFormValues = z.infer<typeof adjustmentSchema>;

interface StockAdjustmentModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: StockAdjustmentFormValues) => void;
  product: Product | null;
}

/**
 * Stok opname: menetapkan stok fisik hasil hitung ulang.
 * Berbeda dengan form produk, aksi ini selalu menghasilkan baris audit
 * (stock_logs) berisi stok lama, selisih, stok baru, pelaksana, dan alasan.
 */
export function StockAdjustmentModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
  product,
}: StockAdjustmentModalProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      new_stock: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset({
      new_stock: product?.current_stock ?? 0,
      notes: "",
    });
  }, [isOpen, product, reset]);

  // Nilai mentah dari input (bisa string saat field masih diketik/dikosongkan).
  const rawNewStock = watch("new_stock") as unknown;
  const currentStock = product?.current_stock ?? 0;
  const isNewStockFilled =
    rawNewStock !== "" &&
    rawNewStock !== null &&
    rawNewStock !== undefined &&
    Number.isFinite(Number(rawNewStock));
  const parsedNewStock = isNewStockFilled ? Number(rawNewStock) : null;
  const change = parsedNewStock === null ? 0 : parsedNewStock - currentStock;
  const hasChange = parsedNewStock !== null && change !== 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sesuaikan Stok (Stok Opname)">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-xl border border-border bg-slate-50/70 p-3.5">
          <p className="font-display text-sm font-semibold text-foreground">
            {product?.product_name ?? "-"}
          </p>
          <div className="mt-1 flex items-center justify-between font-mono text-xs text-muted-foreground">
            <span>
              Stok tercatat:{" "}
              <span className="font-semibold text-foreground">{currentStock}</span>
            </span>
            <span>Ambang min: {product?.min_stock ?? 0}</span>
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">
            Stok Fisik Hasil Hitung Ulang
          </label>
          <Input min="0" type="number" {...register("new_stock")} />
          {errors.new_stock ? (
            <span className="text-xs text-destructive">{errors.new_stock.message}</span>
          ) : null}
        </div>

        <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs text-slate-700">
          <div className="flex items-center gap-2 font-medium text-sky-900">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Selisih yang akan dicatat
          </div>
          <p className="mt-1 font-mono">
            {hasChange
              ? `${currentStock} → ${parsedNewStock} (${change > 0 ? "+" : ""}${change} pcs)`
              : parsedNewStock === null
                ? "Isi stok fisik hasil hitung ulang."
                : "Belum ada selisih dengan stok tercatat."}
          </p>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">
            Alasan Penyesuaian
          </label>
          <textarea
            className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Contoh: hasil stok opname 17 September, 2 pcs rusak"
            {...register("notes")}
          />
          {errors.notes ? (
            <span className="text-xs text-destructive">{errors.notes.message}</span>
          ) : null}
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-border bg-white p-3 text-[11px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Penyesuaian ini tercatat permanen pada audit stok beserta nama Anda dan
            alasannya. Stok tercatat di atas bisa saja sudah berubah sejak halaman
            dimuat — server yang menentukan selisih akhirnya.
          </span>
        </div>

        {parsedNewStock !== null && change === 0 ? (
          <p className="text-xs text-amber-700">
            Stok baru sama dengan stok tercatat, jadi tidak ada yang perlu disimpan.
          </p>
        ) : null}

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button disabled={isSubmitting} onClick={onClose} type="button" variant="outline">
            Batal
          </Button>
          <Button disabled={isSubmitting || !hasChange} type="submit">
            {isSubmitting ? "Menyimpan..." : "Simpan Penyesuaian"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
