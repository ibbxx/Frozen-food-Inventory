import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { useAuth } from "@/features/auth";

import { PageErrorState } from "../shared/PageErrorState";
import {
  invalidateAfterProductMutation,
  invalidateAfterStockAdjustmentMutation,
} from "../shared/query-keys";
import { ToastMessage } from "../shared/ToastMessage";

import { CategoryManageModal } from "./CategoryManageModal";
import { ProductHeroSection } from "./components/ProductHeroSection";
import { ProductSummarySection } from "./components/ProductSummarySection";
import { ProductTable } from "./components/ProductTable";
import { ProductFormModal } from "./ProductFormModal";
import {
  createProductWithImage,
  saveStockAdjustment,
  updateProductWithImage,
  type ProductFormValues,
} from "./products-service";
import {
  StockAdjustmentModal,
  type StockAdjustmentFormValues,
} from "./StockAdjustmentModal";
import { useProducts } from "./use-products";

import type { Product } from "../types/database";


type ToastState =
  | {
      message: string;
      tone: "success" | "error";
    }
  | null;

export function ProductsPage() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const productsQuery = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [toastState, setToastState] = useState<ToastState>(null);

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);

  // Jumlah produk per kategori — dipakai untuk menampilkan status pemakaian
  // kategori di "Kelola Kategori" dan proteksi hapus di sisi antarmuka.
  const categoryUsage = useMemo(() => {
    const usage: Record<string, number> = {};
    products.forEach((product: Product) => {
      usage[product.category] = (usage[product.category] ?? 0) + 1;
    });
    return usage;
  }, [products]);

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
    mutationFn: createProductWithImage,
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
      updateProductWithImage(productId, values),
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

  const adjustMutation = useMutation({
    mutationFn: ({
      productId,
      values,
    }: {
      productId: string;
      values: StockAdjustmentFormValues;
    }) => saveStockAdjustment(productId, values),
    onSuccess: async () => {
      setToastState({
        message: "Penyesuaian stok berhasil dicatat pada audit stok.",
        tone: "success",
      });
      await invalidateAfterStockAdjustmentMutation(queryClient);
      setAdjustingProduct(null);
    },
    onError: (error) => {
      setToastState({
        message:
          error instanceof Error ? error.message : "Gagal menyesuaikan stok produk.",
        tone: "error",
      });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleAdjustStock = (product: Product) => {
    setAdjustingProduct(product);
  };

  const handleCloseAdjustment = () => {
    if (adjustMutation.isPending) {
      return;
    }

    setAdjustingProduct(null);
  };

  const handleAdjustSubmit = (values: StockAdjustmentFormValues) => {
    if (!adjustingProduct) {
      return;
    }

    adjustMutation.mutate({ productId: adjustingProduct.id, values });
  };

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

      <ProductHeroSection
        onCreate={handleCreate}
        onManageCategories={isAdmin ? () => setIsCategoryModalOpen(true) : undefined}
      />
      <ProductSummarySection summary={summary} />
      <ProductTable
        onAdjustStock={handleAdjustStock}
        onEdit={handleEdit}
        products={products}
      />

      <StockAdjustmentModal
        isOpen={Boolean(adjustingProduct)}
        isSubmitting={adjustMutation.isPending}
        onClose={handleCloseAdjustment}
        onSubmit={handleAdjustSubmit}
        product={adjustingProduct}
      />

      <ProductFormModal
        initialProduct={editingProduct}
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      <CategoryManageModal
        categoryUsage={categoryUsage}
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
}
