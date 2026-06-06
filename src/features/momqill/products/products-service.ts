import {
  createProduct,
  listProducts,
  updateProduct,
} from "../shared/repository";

import type { Product } from "../types/database";

export interface ProductFormValues {
  category: Product["category"];
  product_name: string;
  public_price: number | null;
  image_url: string;
  is_public: boolean;
  current_stock: number;
  min_stock: number;
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
    return await createProduct(values);
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
    return await updateProduct(productId, values);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal memperbarui data produk di database.",
    );
  }
}
