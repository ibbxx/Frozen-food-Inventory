import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import type { Product } from "../types/database";
import type { ProductFormValues } from "./products-service";

const productFormSchema = z.object({
  product_name: z.string().min(3, "Nama produk minimal 3 karakter."),
  current_stock: z.coerce.number().int().min(0, "Stok saat ini tidak boleh negatif."),
  min_stock: z.coerce.number().int().min(0, "Stok minimum tidak boleh negatif."),
});

interface ProductFormModalProps {
  initialProduct?: Product | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
}

export function ProductFormModal({
  initialProduct,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      product_name: "",
      current_stock: 0,
      min_stock: 0,
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset({
      product_name: initialProduct?.product_name ?? "",
      current_stock: initialProduct?.current_stock ?? 0,
      min_stock: initialProduct?.min_stock ?? 0,
    });
  }, [initialProduct, isOpen, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProduct ? "Edit Produk" : "Tambah Produk"}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">Nama Produk</label>
          <Input placeholder="Masukkan nama produk" {...register("product_name")} />
          {errors.product_name ? (
            <span className="text-xs text-destructive">{errors.product_name.message}</span>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Stok Saat Ini</label>
            <Input min="0" type="number" {...register("current_stock")} />
            {errors.current_stock ? (
              <span className="text-xs text-destructive">{errors.current_stock.message}</span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Stok Minimum</label>
            <Input min="0" type="number" {...register("min_stock")} />
            {errors.min_stock ? (
              <span className="text-xs text-destructive">{errors.min_stock.message}</span>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button onClick={onClose} type="button" variant="outline">
            Batal
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
