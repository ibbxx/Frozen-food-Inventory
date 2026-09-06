import {
  deleteProductImageFromStorage,
  uploadProductImage,
} from "../lib/storage-service";
import {
  createProduct,
  listProducts,
  updateProduct,
} from "../shared/repository";

import type { Product } from "../types/database";

export interface ProductFormValues {
  category: Product["category"];
  current_stock: number;
  image_url: string;
  imageFile?: File | null;
  is_public: boolean;
  isImageRemoved?: boolean;
  min_stock: number;
  oldImageUrl?: string | null;
  product_name: string;
  public_price: number | null;
}

export async function fetchMomqillProducts(): Promise<Product[]> {
  try {
    return await listProducts();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal mengambil daftar produk dari database.",
    );
  }
}

export async function createMomqillProduct(
  values: ProductFormValues,
): Promise<Product> {
  try {
    let finalImageUrl = values.image_url?.trim() || "";

    // Unggah file jika pengguna memilih file gambar baru
    if (values.imageFile) {
      finalImageUrl = await uploadProductImage(values.imageFile);
    }

    return await createProduct({
      category: values.category,
      current_stock: values.current_stock,
      image_url: finalImageUrl,
      is_public: values.is_public,
      min_stock: values.min_stock,
      product_name: values.product_name,
      public_price: values.public_price,
    });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal menyimpan produk baru ke database.",
    );
  }
}

export async function updateMomqillProduct(
  productId: string,
  values: ProductFormValues,
): Promise<Product> {
  try {
    let finalImageUrl = values.image_url?.trim() || "";

    // 1. Jika pengguna secara eksplisit menghapus foto di form web
    if (values.isImageRemoved) {
      finalImageUrl = "";
      if (values.oldImageUrl) {
        // Hapus file foto lama di Supabase Storage agar tidak ada sampah
        await deleteProductImageFromStorage(values.oldImageUrl);
      }
    } else if (values.imageFile) {
      // 2. Jika ada foto baru yang diunggah
      finalImageUrl = await uploadProductImage(values.imageFile);

      // Hapus foto lama di storage jika sebelumnya menggunakan file Supabase Storage
      if (values.oldImageUrl && values.oldImageUrl !== finalImageUrl) {
        await deleteProductImageFromStorage(values.oldImageUrl);
      }
    }

    return await updateProduct(productId, {
      category: values.category,
      current_stock: values.current_stock,
      image_url: finalImageUrl,
      is_public: values.is_public,
      min_stock: values.min_stock,
      product_name: values.product_name,
      public_price: values.public_price,
    });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal memperbarui data produk di database.",
    );
  }
}
