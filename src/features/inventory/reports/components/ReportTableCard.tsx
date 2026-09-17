import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import { EmptyTableRow } from "../../shared/EmptyTableRow";

import type { InventoryReportPayload } from "../../types/database";

interface ReportTableCardProps {
  isError: boolean;
  isLoading: boolean;
  report?: InventoryReportPayload;
}

export function ReportTableCard({
  isError,
  isLoading,
  report,
}: ReportTableCardProps) {
  return (
    <Card className="border-cyan-100 shadow-sm">
      <CardHeader>
        <CardTitle>Tabel Laporan</CardTitle>
        <CardDescription>
          Kompilasi stok awal, total masuk, total keluar, dan stok akhir per produk.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Memuat laporan inventori...
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Gagal memuat laporan inventori.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">No</th>
                  <th className="pb-3 pr-4 font-medium">Nama Produk</th>
                  <th className="pb-3 pr-4 font-medium">Stok Awal</th>
                  <th className="pb-3 pr-4 font-medium">Total Masuk</th>
                  <th className="pb-3 pr-4 font-medium">Total Keluar</th>
                  <th className="pb-3 font-medium">Stok Akhir</th>
                </tr>
              </thead>
              <tbody>
                {(report?.rows ?? []).length ? (
                  report?.rows.map((row, index) => (
                    <tr className="border-b last:border-b-0" key={row.id}>
                      <td className="py-4 pr-4">{index + 1}</td>
                      <td className="py-4 pr-4 font-medium text-slate-900">{row.product_name}</td>
                      <td className="py-4 pr-4">{row.opening_stock}</td>
                      <td className="py-4 pr-4 text-emerald-700">{row.total_incoming}</td>
                      <td className="py-4 pr-4 text-sky-700">{row.total_outgoing}</td>
                      <td className="py-4 font-semibold text-slate-900">{row.closing_stock}</td>
                    </tr>
                  ))
                ) : (
                  <EmptyTableRow
                    colSpan={6}
                    message="Tidak ada data pada rentang tanggal ini."
                  />
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
