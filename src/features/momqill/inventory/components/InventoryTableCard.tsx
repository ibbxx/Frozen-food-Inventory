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

interface InventoryTableCardProps {
  inventory?: InventoryMonitoringPayload;
}

export function InventoryTableCard({ inventory }: InventoryTableCardProps) {
  return (
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
