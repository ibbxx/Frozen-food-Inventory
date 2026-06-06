import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { invalidateAfterIncomingMutation } from "../shared/query-keys";
import { ToastMessage } from "../shared/ToastMessage";

import { IncomingFormCard } from "./components/IncomingFormCard";
import { IncomingHistoryCard } from "./components/IncomingHistoryCard";
import {
  incomingFormSchema,
  todayDateInputValue,
  type IncomingFormValues,
} from "./incoming-form";
import { createIncomingItem } from "./incoming-service";
import { useIncomingPageData } from "./use-incoming-page-data";

type ToastState =
  | {
      message: string;
      tone: "success" | "error";
    }
  | null;

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

  const incomingMutation = useMutation({
    mutationFn: createIncomingItem,
    onSuccess: async () => {
      setToastState({
        message: "Barang masuk berhasil disimpan.",
        tone: "success",
      });
      await invalidateAfterIncomingMutation(queryClient);
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
        <IncomingFormCard
          errors={errors}
          isSubmitting={incomingMutation.isPending}
          onSubmit={handleSubmit(onSubmit)}
          products={products}
          register={register}
        />
        <IncomingHistoryCard history={history} isLoading={historyQuery.isLoading} />
      </section>
    </div>
  );
}
