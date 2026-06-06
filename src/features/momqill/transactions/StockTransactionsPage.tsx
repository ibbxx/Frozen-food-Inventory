import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Keyboard, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/shared/ui/badge";

import { PageErrorState } from "../shared/PageErrorState";
import { PageHero } from "../shared/PageHero";
import { invalidateAfterStockTransactionMutation } from "../shared/query-keys";
import { ToastMessage } from "../shared/ToastMessage";

import { RecentStockLogsCard } from "./components/RecentStockLogsCard";
import { StockTransactionFormCard } from "./components/StockTransactionFormCard";
import { createStockTransaction } from "./transactions-service";
import { useStockTransactionsPageData } from "./use-stock-transactions";

const transactionSchema = z.object({
  date: z.string().min(1, "Tanggal transaksi wajib diisi."),
  notes: z.string().trim().min(3, "Catatan minimal 3 karakter."),
  product_id: z.string().uuid("Pilih produk terlebih dahulu."),
  quantity: z.coerce.number().int().min(1, "Jumlah minimal 1."),
  type: z.enum(["incoming", "outgoing"]),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;
type ToastState = { message: string; tone: "success" | "error" } | null;

function todayDateInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function StockTransactionsPage() {
  const queryClient = useQueryClient();
  const { logsQuery, productsQuery } = useStockTransactionsPageData();
  const [toastState, setToastState] = useState<ToastState>(null);
  const [productSearch, setProductSearch] = useState("");
  const productSearchRef = useRef<HTMLInputElement>(null);

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: todayDateInputValue(),
      notes: "",
      product_id: "",
      quantity: 1,
      type: "incoming",
    },
  });

  const recentLogs = logsQuery.data ?? [];
  const selectedProductId = watch("product_id");
  const selectedType = watch("type");
  const quantity = watch("quantity");

  const filteredProducts = useMemo(() => {
    const products = productsQuery.data ?? [];

    if (!productSearch.trim()) {
      return products.slice(0, 12);
    }

    const normalizedQuery = productSearch.toLowerCase();
    return products
      .filter((product) => product.product_name.toLowerCase().includes(normalizedQuery))
      .slice(0, 12);
  }, [productSearch, productsQuery.data]);

  const selectedProduct = useMemo(
    () => (productsQuery.data ?? []).find((product) => product.id === selectedProductId),
    [productsQuery.data, selectedProductId],
  );

  const stockExceeded = Boolean(
    selectedType === "outgoing" &&
      selectedProduct &&
      Number.isFinite(quantity) &&
      quantity > selectedProduct.current_stock,
  );

  useEffect(() => {
    productSearchRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "/" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        productSearchRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const transactionMutation = useMutation({
    mutationFn: createStockTransaction,
    onSuccess: async (_, values) => {
      setToastState({
        message:
          values.type === "incoming"
            ? "Stok barang masuk berhasil diperbarui."
            : "Stok barang keluar berhasil diperbarui.",
        tone: "success",
      });
      await invalidateAfterStockTransactionMutation(queryClient);
      reset({
        date: todayDateInputValue(),
        notes: "",
        product_id: "",
        quantity: 1,
        type: values.type,
      });
      setProductSearch("");
      productSearchRef.current?.focus();
    },
    onError: (error) => {
      setToastState({
        message:
          error instanceof Error
            ? error.message
            : "Gagal memproses transaksi stok.",
        tone: "error",
      });
    },
  });

  const onSubmit = (values: TransactionFormValues) => {
    transactionMutation.mutate(values);
  };

  const pickProduct = (product: { id: string; product_name: string }) => {
    setValue("product_id", product.id, { shouldValidate: true });
    setProductSearch(product.product_name);
  };

  if (productsQuery.isError) {
    return (
      <PageErrorState
        description="Master produk belum bisa dimuat. Pastikan koneksi toko stabil lalu muat ulang."
        title="Transaksi stok belum siap"
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

      <PageHero
        badge={
          <Badge className="w-fit gap-2" variant="info">
            <Zap className="h-3.5 w-3.5" />
            Pencatatan Cepat
          </Badge>
        }
        description="Formulir cepat untuk mencatat perubahan barang masuk dan barang keluar secara langsung. Perubahan jumlah stok akan langsung diperbarui dengan aman."
        title="Transaksi Stok Cepat"
        aside={
          <div className="rounded-2xl border border-cyan-100 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
            <div className="flex items-center gap-2 font-medium text-slate-900">
              <Keyboard className="h-4 w-4 text-cyan-600" />
              Pintasan Keyboard
            </div>
            <div className="mt-1">Tekan <strong>/</strong> untuk kembali fokus ke pencarian produk.</div>
          </div>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <StockTransactionFormCard
          errors={errors}
          isSubmitting={transactionMutation.isPending}
          onProductSearchChange={setProductSearch}
          onSubmit={handleSubmit(onSubmit)}
          pickProduct={pickProduct}
          productSearch={productSearch}
          productSearchRef={productSearchRef}
          products={filteredProducts}
          register={register}
          selectedProduct={selectedProduct}
          selectedType={selectedType}
          stockExceeded={stockExceeded}
        />
        <RecentStockLogsCard history={recentLogs} isLoading={logsQuery.isLoading} />
      </section>
    </div>
  );
}
