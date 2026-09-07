import {
  createCategory as repoCreateCategory,
  deleteCategory as repoDeleteCategory,
  listCategories as repoListCategories,
  updateCategory as repoUpdateCategory,
} from "../shared/repository";

import type { ProductCategoryRecord } from "../types/database";

export async function fetchCategories(): Promise<ProductCategoryRecord[]> {
  try {
    return await repoListCategories();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal mengambil daftar kategori dari database.",
    );
  }
}

export async function createCategory(name: string): Promise<ProductCategoryRecord> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Nama kategori tidak boleh kosong.");
  }

  try {
    return await repoCreateCategory(trimmed);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal menyimpan kategori baru ke database.",
    );
  }
}

export async function updateCategory(
  categoryId: string,
  name: string,
): Promise<ProductCategoryRecord> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Nama kategori tidak boleh kosong.");
  }

  try {
    return await repoUpdateCategory(categoryId, trimmed);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal memperbarui kategori di database.",
    );
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    return await repoDeleteCategory(categoryId);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal menghapus kategori dari database.",
    );
  }
}
