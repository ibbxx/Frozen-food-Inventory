import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { MetricCard } from "../../shared/MetricCard";

import type { InventoryMonitoringPayload } from "../../types/database";

interface InventorySummarySectionProps {
  inventory?: InventoryMonitoringPayload;
}

export function InventorySummarySection({
  inventory,
}: InventorySummarySectionProps) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      <MetricCard
        icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        title="Status Aman"
        value={inventory?.summary.safe ?? 0}
      />
      <MetricCard
        icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
        title="Perlu Restok"
        value={inventory?.summary.low ?? 0}
      />
      <MetricCard
        icon={<XCircle className="h-4 w-4 text-destructive" />}
        title="Stok Kosong"
        value={inventory?.summary.out ?? 0}
      />
    </section>
  );
}
