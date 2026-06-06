import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { productCategoryOptions } from "@/shared/lib/product-categories";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import type { ProductFormValues } from "./products-service";
import type { Product } from "../types/database";

const productFormSchema = z.object({
  product_name: z.string().min(3, "Nama produk minimal 3 karakter."),
  category: z.enum(productCategoryOptions),
  public_price: z.preprocess(
    (value) => (value === "" || value === null ? null : Number(value)),
    z.number().min(0, "Harga publik tidak boleh negatif.").nullable(),
  ),
  image_url: z.string().trim().url("Masukkan URL gambar yang valid.").or(z.literal("")),
  is_public: z.boolean(),
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
      category: "Daging",
      public_price: null,
      image_url: "",
      is_public: true,
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
      category: initialProduct?.category ?? "Daging",
      public_price: initialProduct?.public_price ?? null,
      image_url: initialProduct?.image_url ?? "",
      is_public: initialProduct?.is_public ?? true,
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
            <label className="text-sm font-medium text-slate-700">Kategori</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register("category")}
            >
              {productCategoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category ? (
              <span className="text-xs text-destructive">{errors.category.message}</span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Harga Publik</label>
            <Input min="0" placeholder="45000" step="1000" type="number" {...register("public_price")} />
            {errors.public_price ? (
              <span className="text-xs text-destructive">{errors.public_price.message}</span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">URL Gambar</label>
          <Input placeholder="https://..." {...register("image_url")} />
          {errors.image_url ? (
            <span className="text-xs text-destructive">{errors.image_url.message}</span>
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

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
          <input className="h-4 w-4" type="checkbox" {...register("is_public")} />
          Tampilkan produk ini di katalog publik
        </label>

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
