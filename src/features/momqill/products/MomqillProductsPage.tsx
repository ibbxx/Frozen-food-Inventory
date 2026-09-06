import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { PageErrorState } from "../shared/PageErrorState";
import { invalidateAfterProductMutation } from "../shared/query-keys";
import { ToastMessage } from "../shared/ToastMessage";

import { ProductHeroSection } from "./components/ProductHeroSection";
import { ProductSummarySection } from "./components/ProductSummarySection";
import { ProductTable } from "./components/ProductTable";
import { ProductFormModal } from "./ProductFormModal";
import {
  createMomqillProduct,
  updateMomqillProduct,
  type ProductFormValues,
} from "./products-service";
import { useMomqillProducts } from "./use-products";

import type { Product } from "../types/database";


type ToastState =
  | {
      message: string;
      tone: "success" | "error";
    }
  | null;

export function MomqillProductsPage() {
  const queryClient = useQueryClient();
  const productsQuery = useMomqillProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toastState, setToastState] = useState<ToastState>(null);

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);

  const summary = useMemo(
    () => ({
      total: products.length,
      low: products.filter((product: Product) => product.current_stock <= product.min_stock && product.current_stock > 0)
        .length,
      out: products.filter((product: Product) => product.current_stock <= 0).length,
    }),
    [products],
  );

  const createMutation = useMutation({
    mutationFn: createMomqillProduct,
    onSuccess: async () => {
      setToastState({
        message: "Produk berhasil ditambahkan.",
        tone: "success",
      });
      await invalidateAfterProductMutation(queryClient);
      setIsModalOpen(false);
      setEditingProduct(null);
    },
    onError: (error) => {
      setToastState({
        message: error instanceof Error ? error.message : "Gagal menambahkan produk.",
        tone: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, values }: { productId: string; values: ProductFormValues }) =>
      updateMomqillProduct(productId, values),
    onSuccess: async () => {
      setToastState({
        message: "Produk berhasil diperbarui.",
        tone: "success",
      });
      await invalidateAfterProductMutation(queryClient);
      setIsModalOpen(false);
      setEditingProduct(null);
    },
    onError: (error) => {
      setToastState({
        message: error instanceof Error ? error.message : "Gagal memperbarui produk.",
        tone: "error",
      });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) {
      return;
    }

    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (values: ProductFormValues) => {
    if (editingProduct) {
      updateMutation.mutate({
        productId: editingProduct.id,
        values,
      });
      return;
    }

    createMutation.mutate(values);
  };

  if (productsQuery.isLoading && !products.length) {
    return <div className="page-loader">Memuat produk...</div>;
  }

  if (productsQuery.isError) {
    return (
      <PageErrorState
        description="Data produk belum bisa diambil. Periksa koneksi lalu muat ulang halaman."
        title="Produk gagal dimuat"
      />
    );
  }

  return (
    <div className="grid gap-6">
      {toastState ? (
        <ToastMessage
          message={toastState.message}
          onClose={() => setToastState(null)}
          tone={toastState.tone}
        />
      ) : null}

      <ProductHeroSection onCreate={handleCreate} />
      <ProductSummarySection summary={summary} />
      <ProductTable onEdit={handleEdit} products={products} />

      <ProductFormModal
        initialProduct={editingProduct}
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
