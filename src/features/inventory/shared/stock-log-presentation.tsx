import { Badge } from "@/shared/ui/badge";

import type { StockLogType } from "../types/database";

export function formatStockChange(value: number): string {
  return `${value > 0 ? "+" : ""}${value}`;
}

export function stockLogLabel(type: StockLogType): string {
  if (type === "incoming") {
    return "Masuk";
  }

  if (type === "outgoing") {
    return "Keluar";
  }

  return "Penyesuaian";
}

export function StockTransactionBadge({ type }: { type: StockLogType }) {
  const variant =
    type === "incoming" ? "success" : type === "outgoing" ? "warning" : "info";

  return <Badge variant={variant}>{stockLogLabel(type)}</Badge>;
}
