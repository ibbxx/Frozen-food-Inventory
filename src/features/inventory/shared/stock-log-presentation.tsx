import { Badge } from "@/shared/ui/badge";

import type { StockTransactionType } from "../types/database";

export function formatStockChange(value: number): string {
  return `${value > 0 ? "+" : ""}${value}`;
}

export function stockTransactionLabel(type: StockTransactionType): string {
  return type === "incoming" ? "Masuk" : "Keluar";
}

export function StockTransactionBadge({
  type,
}: {
  type: StockTransactionType;
}) {
  return (
    <Badge variant={type === "incoming" ? "success" : "warning"}>
      {stockTransactionLabel(type)}
    </Badge>
  );
}
