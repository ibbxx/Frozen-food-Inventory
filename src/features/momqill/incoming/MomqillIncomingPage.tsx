import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownLeft, Boxes, Truck } from "lucide-react";
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
import { createIncomingItem } from "./incoming-service";
import { useIncomingPageData } from "./use-incoming-page-data";

const incomingFormSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi."),
  product_id: z.string().uuid("Pilih produk yang valid."),
  quantity: z.coerce.number().int().min(1, "Jumlah masuk minimal 1."),
  supplier_name: z.string().min(2, "Nama supplier minimal 2 karakter."),
});

type IncomingFormValues = z.infer<typeof incomingFormSchema>;

type ToastState =
  | {
      message: string;
      tone: "success" | "error";
    }
  | null;

function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MomqillIncomingPage() {
  const queryClient = useQueryClient();
  const { historyQuery, productsQuery } = useIncomingPageData();
  const [toastState, setToastState] = useState<ToastState>(null);

  const products = productsQuery.data ?? [];
  const history = historyQuery.data ?? [];

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<IncomingFormValues>({
    resolver: zodResolver(incomingFormSchema),
    defaultValues: {
      date: todayDateInputValue(),
      product_id: "",
      quantity: 1,
      supplier_name: "",
    },
  });

  useEffect(() => {
    if (!toastState) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToastState(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [toastState]);

  const incomingMutation = useMutation({
    mutationFn: createIncomingItem,
    onSuccess: () => {
      setToastState({
        message: "Barang masuk berhasil disimpan.",
        tone: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["momqill", "incoming"] });
      queryClient.invalidateQueries({ queryKey: ["momqill", "products"] });
      queryClient.invalidateQueries({ queryKey: ["momqill", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["momqill", "outgoing", "products"] });
      queryClient.invalidateQueries({ queryKey: ["momqill", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["momqill", "reports"] });
      reset({
        date: todayDateInputValue(),
        product_id: "",
        quantity: 1,
        supplier_name: "",
      });
    },
    onError: (error) => {
      setToastState({
        message: error instanceof Error ? error.message : "Gagal menyimpan barang masuk.",
        tone: "error",
      });
    },
  });

  const onSubmit = (values: IncomingFormValues) => {
    incomingMutation.mutate({
      date: values.date,
      product_id: values.product_id,
      quantity: values.quantity,
      supplier_name: values.supplier_name,
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
            <CardTitle>Barang Masuk</CardTitle>
            <CardDescription>
              Catat penerimaan stok dari supplier dan tambahkan stok produk secara atomik.
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

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-700">Jumlah</label>
                  <Input min="1" type="number" {...register("quantity")} />
                  {errors.quantity ? (
                    <span className="text-xs text-destructive">{errors.quantity.message}</span>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-slate-700">Nama Supplier</label>
                  <Input placeholder="Masukkan nama supplier" {...register("supplier_name")} />
                  {errors.supplier_name ? (
                    <span className="text-xs text-destructive">{errors.supplier_name.message}</span>
                  ) : null}
                </div>
              </div>

              <Button disabled={incomingMutation.isPending} type="submit">
                <ArrowDownLeft className="mr-2 h-4 w-4" />
                {incomingMutation.isPending ? "Menyimpan..." : "Simpan Barang Masuk"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-cyan-100 shadow-sm">
          <CardHeader>
            <CardTitle>Riwayat Barang Masuk</CardTitle>
            <CardDescription>
              Penerimaan stok terbaru dari supplier untuk operasional harian toko.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyQuery.isLoading ? (
              <div className="py-10 text-center text-sm text-slate-500">
                Memuat riwayat barang masuk...
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
                          <p className="flex items-center gap-2 text-sm text-slate-600">
                            <Truck className="h-4 w-4 text-slate-400" />
                            {item.supplier_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Jumlah masuk</p>
                          <p className="text-2xl font-semibold text-slate-900">{item.quantity}</p>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
                    <Boxes className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                    Belum ada data barang masuk.
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
