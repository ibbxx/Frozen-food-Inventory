import { zodResolver } from "@hookform/resolvers/zod";

import {
  AlertCircle,
  ImagePlus,
  Link2,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { compressImage, formatFileSize } from "@/shared/lib/image-compressor";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import type { ProductFormValues } from "./products-service";
import { useCategories } from "./use-categories";
import type { Product } from "../types/database";

const productFormSchema = z.object({
  product_name: z.string().min(3, "Nama produk minimal 3 karakter."),
  category: z.string().min(1, "Kategori harus dipilih."),
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

interface CompressionInfo {
  compressedSize: number;
  compressionRatio: number;
  originalSize: number;
}

export function ProductFormModal({
  initialProduct,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: categoryNames = [] } = useCategories();

  // States untuk pengelolaan gambar
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState<boolean>(false);
  const [compressionInfo, setCompressionInfo] = useState<CompressionInfo | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressError, setCompressError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      product_name: "",
      category: "",
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

    const currentImg = initialProduct?.image_url ?? "";
    reset({
      product_name: initialProduct?.product_name ?? "",
      category: initialProduct?.category ?? categoryNames[0] ?? "Daging",
      public_price: initialProduct?.public_price ?? null,
      image_url: currentImg,
      is_public: initialProduct?.is_public ?? true,
      current_stock: initialProduct?.current_stock ?? 0,
      min_stock: initialProduct?.min_stock ?? 0,
    });

    setPreviewUrl(currentImg || null);
    setSelectedFile(null);
    setIsImageRemoved(false);
    setCompressionInfo(null);
    setCompressError(null);
    setIsDragging(false);
    setShowUrlInput(false);
  }, [initialProduct, isOpen, reset]);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setCompressError("File yang dipilih harus berupa gambar (JPG, PNG, atau WebP).");
      return;
    }

    setCompressError(null);
    setIsCompressing(true);

    try {
      const result = await compressImage(file, {
        maxSizeBytes: 500 * 1024, // Maksimal 500 KB
        maxWidth: 1600,
        maxHeight: 1600,
      });

      setSelectedFile(result.file);
      setPreviewUrl(result.previewUrl);
      setIsImageRemoved(false);
      setCompressionInfo({
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio: result.compressionRatio,
      });
      // Kosongkan manual image_url saat menggunakan upload file
      setValue("image_url", "");
    } catch (err) {
      setCompressError(
        err instanceof Error ? err.message : "Gagal mengompresi gambar.",
      );
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    // Reset input value agar bisa memilih file yang sama jika diperlukan
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsImageRemoved(true);
    setCompressionInfo(null);
    setCompressError(null);
    setValue("image_url", "");
  };

  const handleFormSubmit = (values: ProductFormValues) => {
    onSubmit({
      ...values,
      imageFile: selectedFile,
      isImageRemoved,
      oldImageUrl: initialProduct?.image_url ?? null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProduct ? "Edit Produk" : "Tambah Produk"}
    >
      <form
        className="max-h-[75vh] space-y-4 overflow-y-auto pr-1"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
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
              {categoryNames.map((category) => (
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
            <Input
              min="0"
              placeholder="45000"
              step="1000"
              type="number"
              {...register("public_price")}
            />
            {errors.public_price ? (
              <span className="text-xs text-destructive">{errors.public_price.message}</span>
            ) : null}
          </div>
        </div>

        {/* Section Upload & Kelola Foto Produk */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Foto Produk</label>
            <span className="text-[11px] text-muted-foreground">Maks. 500 KB (Auto-kompres)</span>
          </div>

          {/* Kondisi 1: Pratinjau Gambar Aktif */}
          {previewUrl ? (
            <div className="flex items-center gap-3.5 rounded-xl border border-border bg-slate-50/70 p-3">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-white shadow-2xs">
                <img
                  alt="Preview produk"
                  className="h-full w-full object-cover"
                  src={previewUrl}
                />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-xs font-semibold text-foreground">
                    {selectedFile ? selectedFile.name : "Foto Produk Aktif"}
                  </span>
                  {selectedFile ? (
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      Siap Unggah
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                      Tersimpan
                    </span>
                  )}
                </div>

                {compressionInfo ? (
                  <p className="text-[11px] text-muted-foreground">
                    Ukuran:{" "}
                    <span className="font-mono font-medium text-foreground">
                      {formatFileSize(compressionInfo.compressedSize)}
                    </span>{" "}
                    <span className="text-emerald-600">
                      (Hemat {compressionInfo.compressionRatio}%)
                    </span>
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Format gambar optimal untuk katalog publik.
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    className="h-7 px-2.5 text-xs"
                    disabled={isCompressing || isSubmitting}
                    onClick={() => fileInputRef.current?.click()}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <ImagePlus className="mr-1.5 h-3.5 w-3.5" />
                    Ganti Foto
                  </Button>
                  <Button
                    className="h-7 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={isCompressing || isSubmitting}
                    onClick={handleRemoveImage}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Hapus Foto
                  </Button>
                </div>
              </div>
            </div>
          ) : isImageRemoved ? (
            /* Kondisi 2: Foto dihapus oleh user */
            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>Foto akan dihapus otomatis dari database & storage saat disimpan.</span>
              </div>
              <Button
                className="h-7 px-2 text-xs"
                onClick={() => {
                  setIsImageRemoved(false);
                  if (initialProduct?.image_url) {
                    setPreviewUrl(initialProduct.image_url);
                    setValue("image_url", initialProduct.image_url);
                  }
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                Batal Hapus
              </Button>
            </div>
          ) : (
            /* Kondisi 3: Belum ada foto, tampilkan Dropzone */
            <div
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-50"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDrop={handleDrop}
            >
              {isCompressing ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    Mengompres gambar ke &le; 500 KB...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 py-1">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="text-xs font-medium text-foreground">
                    <span className="text-primary hover:underline">Klik untuk unggah</span> atau seret
                    file ke sini
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Format JPG, PNG, WebP &bull; Otomatis dikompres maks. 500 KB
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
            onChange={handleFileInputChange}
            ref={fileInputRef}
            type="file"
          />

          {compressError ? (
            <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {compressError}
            </p>
          ) : null}

          {/* Opsi URL Eksternal (Collapsible) */}
          <div className="pt-1">
            <button
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setShowUrlInput((prev) => !prev)}
              type="button"
            >
              <Link2 className="h-3 w-3" />
              {showUrlInput ? "Sembunyikan URL manual" : "Atau gunakan URL gambar eksternal"}
            </button>

            {showUrlInput ? (
              <div className="mt-2 space-y-1">
                <Input
                  placeholder="https://..."
                  {...register("image_url", {
                    onChange: (e) => {
                      const val = e.target.value?.trim();
                      if (val) {
                        setPreviewUrl(val);
                        setSelectedFile(null);
                        setIsImageRemoved(false);
                        setCompressionInfo(null);
                      }
                    },
                  })}
                />
                {errors.image_url ? (
                  <span className="text-xs text-destructive">{errors.image_url.message}</span>
                ) : null}
              </div>
            ) : null}
          </div>
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
          <Button disabled={isSubmitting || isCompressing} type="submit">
            {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
