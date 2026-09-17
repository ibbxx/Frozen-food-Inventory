import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import { EmptyTableRow } from "../../shared/EmptyTableRow";

import type { InventoryMonitoringPayload, InventoryMonitoringRow } from "../../types/database";

function getStatusBadge(row: InventoryMonitoringRow) {
  if (row.status === "out") {
    return <Badge variant="destructive">HABIS</Badge>;
  }

  if (row.status === "low") {
    return <Badge variant="warning">RENDAH</Badge>;
  }

  return <Badge variant="success">AMAN</Badge>;
}

function getProgressBarColor(row: InventoryMonitoringRow): string {
  if (row.status === "out") {
    return "bg-destructive";
  }

  if (row.status === "low") {
    return "bg-amber-500";
  }

  return "bg-emerald-600";
}

interface InventoryTableCardProps {
  inventory?: InventoryMonitoringPayload;
}

export function InventoryTableCard({ inventory }: InventoryTableCardProps) {
  const rows = inventory?.rows ?? [];

  return (
    <Card className="border-border bg-white shadow-xs overflow-hidden">
      <CardHeader className="p-4 sm:p-6 border-b border-border bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="font-display text-base sm:text-lg font-bold text-foreground">
              Daftar Monitoring Ketersediaan
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Rasio progress dihitung dari persentase stok aktual terhadap batas minimum.
            </CardDescription>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {rows.length} Item Terpantau
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* MOBILE VIEW (< md): Card view optimized for phones */}
        <div className="block md:hidden divide-y divide-border">
          {rows.length ? (
            rows.map((row) => (
              <div className="p-4 space-y-2.5 transition-colors hover:bg-slate-50/70" key={row.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display font-bold text-sm text-foreground">
                      {row.product_name}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      SKU: {row.id.slice(0, 8)}
                    </div>
                  </div>
                  <div>{getStatusBadge(row)}</div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground">
                      Kapasitas: <strong className="text-foreground">{row.current_stock}</strong> / {row.min_stock} unit
                    </span>
                    <span className="font-semibold text-foreground">{row.progress_percent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${getProgressBarColor(row)}`}
                      style={{ width: `${Math.min(row.progress_percent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs font-mono text-muted-foreground">
              Belum ada data produk untuk dimonitor.
            </div>
          )}
        </div>

        {/* DESKTOP VIEW (>= md): Precision Data Table */}
        <div className="hidden md:block overflow-x-auto touch-scroll">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-border font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 px-4 font-semibold text-center w-12">No</th>
                <th className="py-3 px-4 font-semibold">Nama Produk</th>
                <th className="py-3 px-4 font-semibold text-right">Stok Aktual</th>
                <th className="py-3 px-4 font-semibold text-right">Ambang Min</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-6 font-semibold">Rasio Kecukupan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {rows.length ? (
                rows.map((row, index) => (
                  <tr className="hover:bg-slate-50/70 transition-colors" key={row.id}>
                    <td className="py-3 px-4 text-center font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">
                      <div>{row.product_name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">ID: {row.id.slice(0, 8)}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-foreground">
                      {row.current_stock}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground tabular-nums">
                      {row.min_stock}
                    </td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(row)}</td>
                    <td className="py-3 px-6">
                      <div className="min-w-[180px] space-y-1.5">
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all ${getProgressBarColor(row)}`}
                            style={{ width: `${Math.min(row.progress_percent, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                          <span>
                            {row.current_stock} / {row.min_stock}
                          </span>
                          <span className="font-semibold text-foreground">{row.progress_percent}%</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyTableRow
                  colSpan={6}
                  message="Belum ada data produk untuk dimonitor."
                />
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
