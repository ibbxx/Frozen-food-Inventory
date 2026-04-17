import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Package2, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToastMessage } from "../shared/ToastMessage";
import type { Product } from "../types/database";
import {
  createMomqillProduct,
  updateMomqillProduct,
  type ProductFormValues,
} from "./products-service";
import { ProductFormModal } from "./ProductFormModal";
import { useMomqillProducts } from "./use-products";

type ToastState =
  | {
      message: string;
      tone: "success" | "error";
    }
  | null;

function SummaryCard({
  title,
  value,
  description,
  icon,
  toneClassName,
}: {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  toneClassName: string;
}) {
  return (
    <Card className={`border-white/70 shadow-sm ${toneClassName}`}>
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <CardDescription className="text-slate-600">{title}</CardDescription>
          <CardTitle className="mt-2 text-3xl font-semibold text-slate-900">{value}</CardTitle>
        </div>
        <div className="rounded-2xl bg-white/80 p-3 shadow-sm">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}

function getStatus(product: Product) {
  if (product.current_stock <= 0) {
    return <Badge variant="danger">Stok Habis</Badge>;
  }

  if (product.current_stock <= product.min_stock) {
    return <Badge variant="warning">Perlu Restok</Badge>;
  }

  return <Badge variant="success">Aman</Badge>;
}

export function MomqillProductsPage() {
  const queryClient = useQueryClient();
  const productsQuery = useMomqillProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toastState, setToastState] = useState<ToastState>(null);

  const products = productsQuery.data ?? [];

  const summary = useMemo(
    () => ({
      total: products.length,
      low: products.filter((product) => product.current_stock <= product.min_stock && product.current_stock > 0)
        .length,
      out: products.filter((product) => product.current_stock <= 0).length,
    }),
    [products],
  );

  const createMutation = useMutation({
    mutationFn: createMomqillProduct,
    onSuccess: () => {
      setToastState({
        message: "Produk berhasil ditambahkan.",
        tone: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["momqill", "products"] });
      queryClient.invalidateQueries({ queryKey: ["momqill", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["momqill", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["momqill", "incoming", "products"] });
      queryClient.invalidateQueries({ queryKey: ["momqill", "outgoing", "products"] });
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
    onSuccess: () => {
      setToastState({
        message: "Produk berhasil diperbarui.",
        tone: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["momqill", "products"] });
      queryClient.invalidateQueries({ queryKey: ["momqill", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["momqill", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["momqill", "incoming", "products"] });
      queryClient.invalidateQueries({ queryKey: ["momqill", "outgoing", "products"] });
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
      <div className="grid gap-6">
        <Card className="border-red-100 bg-red-50">
          <CardHeader>
            <CardTitle>Produk gagal dimuat</CardTitle>
            <CardDescription>
              Data produk belum bisa diambil. Periksa koneksi lalu muat ulang halaman.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
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

      <section className="rounded-[28px] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-teal-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Master Produk
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Kelola daftar produk frozen food yang dipakai di seluruh alur barang masuk, barang keluar, dan monitoring stok.
            </p>
          </div>
          <Button onClick={handleCreate} size="sm" type="button">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          description="Jumlah produk aktif yang dikelola saat ini."
          icon={<Package2 className="h-5 w-5 text-cyan-600" />}
          title="Total Produk"
          toneClassName="bg-cyan-50"
          value={summary.total}
        />
        <SummaryCard
          description="Produk yang sudah menyentuh batas stok minimum."
          icon={<TriangleAlert className="h-5 w-5 text-amber-600" />}
          title="Perlu Restok"
          toneClassName="bg-amber-50"
          value={summary.low}
        />
        <SummaryCard
          description="Produk dengan stok nol dan perlu tindakan cepat."
          icon={<TriangleAlert className="h-5 w-5 text-red-600" />}
          title="Stok Habis"
          toneClassName="bg-red-50"
          value={summary.out}
        />
      </section>

      <Card className="border-cyan-100 shadow-sm">
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>
            Data produk Momqill yang dipakai di seluruh modul inventori.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">No</th>
                  <th className="pb-3 pr-4 font-medium">Nama Produk</th>
                  <th className="pb-3 pr-4 font-medium">Stok Saat Ini</th>
                  <th className="pb-3 pr-4 font-medium">Stok Minimum</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.length ? (
                  products.map((product, index) => (
                    <tr className="border-b last:border-b-0" key={product.id}>
                      <td className="py-4 pr-4">{index + 1}</td>
                      <td className="py-4 pr-4 font-medium text-slate-900">{product.product_name}</td>
                      <td className="py-4 pr-4">{product.current_stock}</td>
                      <td className="py-4 pr-4">{product.min_stock}</td>
                      <td className="py-4 pr-4">{getStatus(product)}</td>
                      <td className="py-4">
                        <Button onClick={() => handleEdit(product)} size="sm" type="button" variant="outline">
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-10 text-center text-slate-500" colSpan={6}>
                      Belum ada data produk. Tambahkan produk baru untuk mulai mengelola stok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
