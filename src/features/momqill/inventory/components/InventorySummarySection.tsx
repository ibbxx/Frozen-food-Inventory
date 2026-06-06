import { AlertTriangle, PackageCheck, PackageX } from "lucide-react";

import { MetricCard } from "../../shared/MetricCard";

import type { InventoryMonitoringPayload } from "../../types/database";

interface InventorySummarySectionProps {
  inventory?: InventoryMonitoringPayload;
}

export function InventorySummarySection({
  inventory,
}: InventorySummarySectionProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <MetricCard
        description="Produk berada di atas batas stok minimum."
        icon={<PackageCheck className="h-5 w-5 text-emerald-600" />}
        title="Stok Aman"
        toneClassName="bg-emerald-50"
        value={inventory?.summary.safe ?? 0}
      />
      <MetricCard
        description="Produk perlu segera diprioritaskan untuk restok."
        icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
        title="Stok Rendah"
        toneClassName="bg-amber-50"
        value={inventory?.summary.low ?? 0}
      />
      <MetricCard
        description="Produk habis dan berisiko menghambat penjualan."
        icon={<PackageX className="h-5 w-5 text-red-600" />}
        title="Stok Habis"
        toneClassName="bg-red-50"
        value={inventory?.summary.out ?? 0}
      />
    </section>
  );
}
