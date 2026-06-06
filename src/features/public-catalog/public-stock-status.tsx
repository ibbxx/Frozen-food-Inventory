import type { PublicCatalogStockStatus } from "@/features/momqill/types/database";
import { Badge } from "@/shared/ui/badge";

export function publicStockLabel(status: PublicCatalogStockStatus): string {
  if (status === "available") {
    return "Stok Tersedia";
  }

  if (status === "limited") {
    return "Stok Terbatas";
  }

  return "Habis / Pre-Order";
}

export function PublicStockBadge({
  status,
}: {
  status: PublicCatalogStockStatus;
}) {
  const variant =
    status === "available" ? "success" : status === "limited" ? "warning" : "danger";

  return <Badge variant={variant}>{publicStockLabel(status)}</Badge>;
}
