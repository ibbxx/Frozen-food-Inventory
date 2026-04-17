import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ArrowUpRight, PackageSearch } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToastMessage } from "../shared/ToastMessage";
import { createOutgoingItem } from "./outgoing-service";
import { useOutgoingPageData } from "./use-outgoing-page-data";

const outgoingFormSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi."),
  product_id: z.string().uuid("Pilih produk yang valid."),
  quantity: z.coerce.number().int().min(1, "Jumlah keluar minimal 1."),
  description: z.string().max(180, "Keterangan maksimal 180 karakter.").optional(),
});

type OutgoingFormValues = z.infer<typeof outgoingFormSchema>;

type ToastState =
  | {
      message: string;
      tone: "success" | "error";
    }
  | null;

function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MomqillOutgoingPage() {
  const queryClient = useQueryClient();
  const { historyQuery, productsQuery } = useOutgoingPageData();
  const [toastState, setToastState] = useState<ToastState>(null);

  const products = productsQuery.data ?? [];
  const history = historyQuery.data ?? [];

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<OutgoingFormValues>({
    resolver: zodResolver(outgoingFormSchema),
    defaultValues: {
      date: todayDateInputValue(),
      product_id: "",
      quantity: 1,
      description: "",
    },
  });

  const selectedProductId = watch("product_id");
  const quantity = watch("quantity");

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId),
    [products, selectedProductId],
  );

  const stockExceeded = Boolean(
    selectedProduct && Number.isFinite(quantity) && quantity > selectedProduct.current_stock,
  );

  useEffect(() => {
    if (!toastState) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToastState(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toastState]);

  const outgoingMutation = useMutation({
    mutationFn: createOutgoingItem,
    onSuccess: () => {
      setToastState({
        message: "Barang keluar berhasil disimpan.",
        tone: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["momqill", "outgoing"] });
      queryClient.invalidateQueries({ queryKey: ["momqill", "products"] });
      queryClient.invalidateQueries({ queryKey: ["momqill", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["momqill", "incoming", "products"] });
      queryClient.invalidateQueries({ queryKey: ["momqill", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["momqill", "reports"] });
      reset({
        date: todayDateInputValue(),
        product_id: "",
        quantity: 1,
        description: "",
      });
    },
    onError: (error) => {
      setToastState({
        message: error instanceof Error ? error.message : "Gagal menyimpan barang keluar.",
        tone: "error",
      });
    },
  });

  const onSubmit = (values: OutgoingFormValues) => {
    if (stockExceeded) {
      setToastState({
        message: "Jumlah keluar melebihi stok saat ini.",
        tone: "error",
      });
      return;
    }

    outgoingMutation.mutate({
      date: values.date,
      description: values.description ?? "",
      product_id: values.product_id,
      quantity: values.quantity,
    });
  };

  return (
    <div className="grid gap-6">
      {toastState ? (
        <ToastMessage
          message={toastState.message}
          onClose={() => setToastState(null)}
          tone={toastState.tone}
        />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Card className="border-cyan-100 shadow-sm">
          <CardHeader>
            <CardTitle>Barang Keluar</CardTitle>
            <CardDescription>
              Catat stok keluar secara real-time dan cegah salah input sebelum tersimpan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Tanggal</label>
                <Input type="date" {...register("date")} />
                {errors.date ? (
                  <span className="text-xs text-destructive">{errors.date.message}</span>
                ) : null}
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Produk</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register("product_id")}
                >
                  <option value="">Pilih produk</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.product_name}
                    </option>
                  ))}
                </select>
                {errors.product_id ? (
                  <span className="text-xs text-destructive">{errors.product_id.message}</span>
                ) : null}
              </div>

              <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-700">Jumlah Keluar</label>
                  <Input min="1" type="number" {...register("quantity")} />
                  {errors.quantity ? (
                    <span className="text-xs text-destructive">{errors.quantity.message}</span>
                  ) : null}
                </div>
                <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-slate-700">
                  Stok saat ini:{" "}
                  <span className="font-semibold text-slate-900">
                    {selectedProduct?.current_stock ?? 0}
                  </span>
                </div>
              </div>

              {stockExceeded ? (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  Jumlah keluar tidak boleh melebihi stok tersedia.
                </div>
              ) : null}

              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Keterangan</label>
                <textarea
                  className="min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Contoh: Penjualan retail, reseller, barang rusak, atau promo."
                  {...register("description")}
                />
                {errors.description ? (
                  <span className="text-xs text-destructive">{errors.description.message}</span>
                ) : null}
              </div>

              <Button disabled={outgoingMutation.isPending || stockExceeded} type="submit">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                {outgoingMutation.isPending ? "Menyimpan..." : "Simpan Barang Keluar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-cyan-100 shadow-sm">
          <CardHeader>
            <CardTitle>Riwayat Barang Keluar</CardTitle>
            <CardDescription>
              Transaksi terakhir yang telah mengurangi stok produk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyQuery.isLoading ? (
              <div className="py-10 text-center text-sm text-slate-500">
                Memuat riwayat barang keluar...
              </div>
            ) : (
              <div className="space-y-3">
                {history.length ? (
                  history.map((item) => (
                    <article
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      key={item.id}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{item.date}</Badge>
                            <h3 className="font-medium text-slate-900">{item.product_name}</h3>
                          </div>
                          <p className="text-sm text-slate-600">
                            {item.description || "Tanpa keterangan tambahan."}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Jumlah keluar</p>
                          <p className="text-2xl font-semibold text-slate-900">{item.quantity}</p>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
                    <PackageSearch className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                    Belum ada data barang keluar.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
