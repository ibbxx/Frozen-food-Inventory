import { Package2, TriangleAlert } from "lucide-react";

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
    <section className="grid gap-4 md:grid-cols-3">
      <MetricCard
        description="Jumlah produk aktif yang dikelola saat ini."
        icon={<Package2 className="h-5 w-5 text-cyan-600" />}
        title="Total Produk"
        toneClassName="bg-cyan-50"
        value={summary.total}
      />
      <MetricCard
        description="Produk yang sudah menyentuh batas stok minimum."
        icon={<TriangleAlert className="h-5 w-5 text-amber-600" />}
        title="Perlu Restok"
        toneClassName="bg-amber-50"
        value={summary.low}
      />
      <MetricCard
        description="Produk dengan stok nol dan perlu tindakan cepat."
        icon={<TriangleAlert className="h-5 w-5 text-red-600" />}
        title="Stok Habis"
        toneClassName="bg-red-50"
        value={summary.out}
      />
    </section>
  );
}
