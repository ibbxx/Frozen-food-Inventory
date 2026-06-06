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

interface RecentStockLogsCardProps {
  history: StockLogHistoryItem[];
  isLoading: boolean;
}

export function RecentStockLogsCard({
  history,
  isLoading,
}: RecentStockLogsCardProps) {
  return (
    <Card className="border-cyan-100 shadow-sm">
      <CardHeader>
        <CardTitle>Riwayat Transaksi Terbaru</CardTitle>
        <CardDescription>
          Log perubahan stok terakhir dari seluruh staf operasional.
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
                <th className="pb-3 pr-4 font-medium">Perubahan</th>
                <th className="pb-3 pr-4 font-medium">Stok Baru</th>
                <th className="pb-3 pr-4 font-medium">Staf</th>
                <th className="pb-3 font-medium">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {history.length ? (
                history.map((item) => (
                  <tr className="border-b last:border-b-0" key={item.id}>
                    <td className="py-4 pr-4 text-slate-600">{formatDateTime(item.created_at)}</td>
                    <td className="py-4 pr-4 font-medium text-slate-900">{item.product_name}</td>
                    <td className="py-4 pr-4">
                      <StockTransactionBadge type={item.type} />
                    </td>
                    <td className="py-4 pr-4 font-semibold text-slate-900">
                      {formatStockChange(item.change_amount)}
                    </td>
                    <td className="py-4 pr-4">{item.new_stock}</td>
                    <td className="py-4 pr-4">{item.staff_name}</td>
                    <td className="py-4 text-slate-600">{item.notes || "-"}</td>
                  </tr>
                ))
              ) : (
                <EmptyTableRow
                  colSpan={7}
                  message={
                    isLoading
                      ? "Memuat log transaksi stok..."
                      : "Belum ada log transaksi stok."
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
