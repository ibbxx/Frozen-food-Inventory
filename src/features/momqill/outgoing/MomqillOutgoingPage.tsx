import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { invalidateAfterOutgoingMutation } from "../shared/query-keys";
import { ToastMessage } from "../shared/ToastMessage";

import { OutgoingFormCard } from "./components/OutgoingFormCard";
import { OutgoingHistoryCard } from "./components/OutgoingHistoryCard";
import {
  outgoingFormSchema,
  todayDateInputValue,
  type OutgoingFormValues,
} from "./outgoing-form";
import { createOutgoingItem } from "./outgoing-service";
import { useOutgoingPageData } from "./use-outgoing-page-data";

type ToastState =
  | {
      message: string;
      tone: "success" | "error";
    }
  | null;

export function MomqillOutgoingPage() {
  const queryClient = useQueryClient();
  const { historyQuery, productsQuery } = useOutgoingPageData();
  const [toastState, setToastState] = useState<ToastState>(null);

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
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

  const outgoingMutation = useMutation({
    mutationFn: createOutgoingItem,
    onSuccess: async () => {
      setToastState({
        message: "Barang keluar berhasil disimpan.",
        tone: "success",
      });
      await invalidateAfterOutgoingMutation(queryClient);
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
        <OutgoingFormCard
          errors={errors}
          isSubmitting={outgoingMutation.isPending}
          onSubmit={handleSubmit(onSubmit)}
          products={products}
          register={register}
          selectedProductStock={selectedProduct?.current_stock ?? 0}
          stockExceeded={stockExceeded}
        />
        <OutgoingHistoryCard history={history} isLoading={historyQuery.isLoading} />
      </section>
    </div>
  );
}
