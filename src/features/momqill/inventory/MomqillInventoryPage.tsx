import { AlertTriangle, PackageCheck, PackageX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useInventoryMonitoring } from "./use-inventory-monitoring";
import type { InventoryMonitoringRow } from "../types/database";

function SummaryCard({
  title,
  value,
  description,
  icon,
  toneClassName,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  toneClassName: string;
}) {
  return (
    <Card className={`border-white/70 shadow-sm ${toneClassName}`}>
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <CardDescription className="text-slate-600">{title}</CardDescription>
          <CardTitle className="mt-2 text-3xl font-semibold text-slate-900">{value}</CardTitle>
        </div>
        <div className="rounded-2xl bg-white/80 p-3 shadow-sm">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}

function getStatusBadge(row: InventoryMonitoringRow) {
  if (row.status === "out") {
    return <Badge variant="danger">Stok Habis</Badge>;
  }

  if (row.status === "low") {
    return <Badge variant="warning">Stok Rendah</Badge>;
  }

  return <Badge variant="success">Stok Aman</Badge>;
}

function getProgressBarColor(row: InventoryMonitoringRow): string {
  if (row.status === "out") {
    return "bg-red-500";
  }

  if (row.status === "low") {
    return "bg-amber-500";
  }

  return "bg-emerald-500";
}

export function MomqillInventoryPage() {
  const inventoryQuery = useInventoryMonitoring();
  const inventory = inventoryQuery.data;

  if (inventoryQuery.isLoading && !inventory) {
    return <div className="page-loader">Memuat monitoring stok...</div>;
  }

  if (inventoryQuery.isError) {
    return (
      <div className="grid gap-6">
        <Card className="border-red-100 bg-red-50">
          <CardHeader>
            <CardTitle>Monitoring stok gagal dimuat</CardTitle>
            <CardDescription>
              Data produk belum bisa diambil. Periksa koneksi lalu muat ulang halaman.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[28px] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-teal-50 p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Monitoring Stok Barang
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Pantau ketersediaan produk secara real-time untuk mencegah stock mismatch dan mempercepat keputusan restok.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          description="Produk berada di atas batas stok minimum."
          icon={<PackageCheck className="h-5 w-5 text-emerald-600" />}
          title="Stok Aman"
          toneClassName="bg-emerald-50"
          value={inventory?.summary.safe ?? 0}
        />
        <SummaryCard
          description="Produk perlu segera diprioritaskan untuk restok."
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
          title="Stok Rendah"
          toneClassName="bg-amber-50"
          value={inventory?.summary.low ?? 0}
        />
        <SummaryCard
          description="Produk habis dan berisiko menghambat penjualan."
          icon={<PackageX className="h-5 w-5 text-red-600" />}
          title="Stok Habis"
          toneClassName="bg-red-50"
          value={inventory?.summary.out ?? 0}
        />
      </section>

      <Card className="border-cyan-100 shadow-sm">
        <CardHeader>
          <CardTitle>Daftar Monitoring Produk</CardTitle>
          <CardDescription>
            Rasio progress diukur dari stok saat ini terhadap stok minimum tiap produk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">No</th>
                  <th className="pb-3 pr-4 font-medium">Nama Produk</th>
                  <th className="pb-3 pr-4 font-medium">Stok Saat Ini</th>
                  <th className="pb-3 pr-4 font-medium">Stok Minimum</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {(inventory?.rows ?? []).length ? (
                  inventory?.rows.map((row, index) => (
                    <tr className="border-b last:border-b-0" key={row.id}>
                      <td className="py-4 pr-4">{index + 1}</td>
                      <td className="py-4 pr-4 font-medium text-slate-900">{row.product_name}</td>
                      <td className="py-4 pr-4">{row.current_stock}</td>
                      <td className="py-4 pr-4">{row.min_stock}</td>
                      <td className="py-4 pr-4">{getStatusBadge(row)}</td>
                      <td className="py-4">
                        <div className="min-w-[220px] space-y-2">
                          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full transition-all ${getProgressBarColor(row)}`}
                              style={{ width: `${row.progress_percent}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>
                              {row.current_stock} / {row.min_stock}
                            </span>
                            <span>{row.progress_percent}%</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-10 text-center text-slate-500" colSpan={6}>
                      Belum ada data produk untuk dimonitor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
