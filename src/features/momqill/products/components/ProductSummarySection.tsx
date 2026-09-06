import { AlertTriangle, Package2, XCircle } from "lucide-react";

import { MetricCard } from "../../shared/MetricCard";

interface ProductSummary {
  low: number;
  out: number;
  total: number;
}

interface ProductSummarySectionProps {
  summary: ProductSummary;
}

export function ProductSummarySection({ summary }: ProductSummarySectionProps) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      <MetricCard
        icon={<Package2 className="h-4 w-4 text-primary" />}
        title="Total Varian"
        value={summary.total}
      />
      <MetricCard
        icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
        title="Perlu Restok"
        value={summary.low}
      />
      <MetricCard
        icon={<XCircle className="h-4 w-4 text-destructive" />}
        title="Stok Kosong"
        value={summary.out}
      />
    </section>
  );
}
