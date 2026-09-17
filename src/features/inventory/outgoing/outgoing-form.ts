import { z } from "zod";

export const outgoingFormSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi."),
  product_id: z.string().uuid("Pilih produk yang valid."),
  quantity: z.coerce.number().int().min(1, "Jumlah keluar minimal 1."),
  description: z.string().max(180, "Keterangan maksimal 180 karakter.").optional(),
});

export type OutgoingFormValues = z.infer<typeof outgoingFormSchema>;

export function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}
