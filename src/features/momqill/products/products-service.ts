import { fallbackProducts } from "../mock/mock-data";
import { momqillSupabase } from "../lib/supabase";
import type { Product } from "../types/database";

export interface ProductFormValues {
  product_name: string;
  current_stock: number;
  min_stock: number;
}

function sortProducts(products: Product[]): Product[] {
  return [...products].sort((left, right) =>
    left.product_name.localeCompare(right.product_name),
  );
}

export async function fetchMomqillProducts(): Promise<Product[]> {
  if (!momqillSupabase) {
    return sortProducts(fallbackProducts);
  }

  const { data, error } = await momqillSupabase
    .from("products")
    .select("id, product_name, current_stock, min_stock, created_at")
    .order("product_name", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function createMomqillProduct(
  values: ProductFormValues,
): Promise<Product> {
  if (!momqillSupabase) {
    const nextProduct: Product = {
      id: crypto.randomUUID(),
      product_name: values.product_name,
      current_stock: values.current_stock,
      min_stock: values.min_stock,
      created_at: new Date().toISOString(),
    };

    fallbackProducts.unshift(nextProduct);
    return nextProduct;
  }

  const { data, error } = await momqillSupabase
    .from("products")
    .insert({
      product_name: values.product_name,
      current_stock: values.current_stock,
      min_stock: values.min_stock,
    } as never)
    .select("id, product_name, current_stock, min_stock, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateMomqillProduct(
  productId: string,
  values: ProductFormValues,
): Promise<Product> {
  if (!momqillSupabase) {
    const index = fallbackProducts.findIndex((product) => product.id === productId);

    if (index < 0) {
      throw new Error("Produk tidak ditemukan.");
    }

    const nextProduct: Product = {
      ...fallbackProducts[index],
      product_name: values.product_name,
      current_stock: values.current_stock,
      min_stock: values.min_stock,
    };

    fallbackProducts[index] = nextProduct;
    return nextProduct;
  }

  const { data, error } = await momqillSupabase
    .from("products")
    .update({
      product_name: values.product_name,
      current_stock: values.current_stock,
      min_stock: values.min_stock,
    } as never)
    .eq("id", productId)
    .select("id, product_name, current_stock, min_stock, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
