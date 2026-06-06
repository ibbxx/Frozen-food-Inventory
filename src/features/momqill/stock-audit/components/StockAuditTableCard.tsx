import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import { EmptyTableRow } from "../../shared/EmptyTableRow";
import {
  formatStockChange,
  StockTransactionBadge,
} from "../../shared/stock-log-presentation";

import type { StockLogHistoryItem } from "../../types/database";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface StockAuditTableCardProps {
  isLoading: boolean;
  rows: StockLogHistoryItem[];
}

export function StockAuditTableCard({
  isLoading,
  rows,
}: StockAuditTableCardProps) {
  return (
    <Card className="border-cyan-100 shadow-sm">
      <CardHeader>
        <CardTitle>Audit Histori Stok</CardTitle>
        <CardDescription>
          Staf dapat melihat riwayat 30 hari terakhir. Pengelola (Admin) dapat melihat seluruh riwayat dan mengunduh data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-3 pr-4 font-medium">Waktu</th>
                <th className="pb-3 pr-4 font-medium">Produk</th>
                <th className="pb-3 pr-4 font-medium">Tipe</th>
                <th className="pb-3 pr-4 font-medium">Stok Lama</th>
                <th className="pb-3 pr-4 font-medium">Perubahan</th>
                <th className="pb-3 pr-4 font-medium">Stok Baru</th>
                <th className="pb-3 pr-4 font-medium">Staf</th>
                <th className="pb-3 font-medium">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr className="border-b last:border-b-0" key={row.id}>
                    <td className="py-4 pr-4 text-slate-600">{formatDateTime(row.created_at)}</td>
                    <td className="py-4 pr-4 font-medium text-slate-900">{row.product_name}</td>
                    <td className="py-4 pr-4">
                      <StockTransactionBadge type={row.type} />
                    </td>
                    <td className="py-4 pr-4">{row.old_stock}</td>
                    <td className="py-4 pr-4 font-semibold text-slate-900">
                      {formatStockChange(row.change_amount)}
                    </td>
                    <td className="py-4 pr-4">{row.new_stock}</td>
                    <td className="py-4 pr-4">{row.staff_name}</td>
                    <td className="py-4 text-slate-600">{row.notes || "-"}</td>
                  </tr>
                ))
              ) : (
                <EmptyTableRow
                  colSpan={8}
                  message={
                    isLoading
                      ? "Memuat histori audit stok..."
                      : "Belum ada histori audit stok."
                  }
                />
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
