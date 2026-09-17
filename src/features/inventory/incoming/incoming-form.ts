import { z } from "zod";

export const incomingFormSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi."),
  product_id: z.string().uuid("Pilih produk yang valid."),
  quantity: z.coerce.number().int().min(1, "Jumlah masuk minimal 1."),
  supplier_name: z.string().min(2, "Nama supplier minimal 2 karakter."),
});

export type IncomingFormValues = z.infer<typeof incomingFormSchema>;

export function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}
