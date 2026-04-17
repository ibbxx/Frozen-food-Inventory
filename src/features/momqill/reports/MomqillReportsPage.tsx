import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  exportInventoryReportToExcel,
  exportInventoryReportToPdf,
} from "./report-export";
import { useInventoryReport } from "./use-inventory-report";
import type { InventoryReportFilters } from "../types/database";

function defaultStartDate(): string {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
}

function defaultEndDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MomqillReportsPage() {
  const [filters, setFilters] = useState<InventoryReportFilters>({
    startDate: defaultStartDate(),
    endDate: defaultEndDate(),
  });

  const reportQuery = useInventoryReport(filters);
  const report = reportQuery.data;

  const isInvalidRange = useMemo(
    () => filters.startDate > filters.endDate,
    [filters.endDate, filters.startDate],
  );

  const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      startDate: event.target.value,
    }));
  };

  const handleEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      endDate: event.target.value,
    }));
  };

  return (
    <div className="grid gap-6">
      <Card className="border-cyan-100 shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>Laporan Inventori</CardTitle>
            <CardDescription>
              Filter pergerakan stok berdasarkan rentang tanggal lalu ekspor ke PDF atau Excel.
            </CardDescription>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Tanggal Awal</label>
              <Input
                onChange={handleStartDateChange}
                type="date"
                value={filters.startDate}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Tanggal Akhir</label>
              <Input
                onChange={handleEndDateChange}
                type="date"
                value={filters.endDate}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4">
          {isInvalidRange ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Tanggal akhir harus sama dengan atau setelah tanggal awal.
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
              <p className="text-sm text-slate-500">Total Produk</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {report?.summary.totalProducts ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-sm text-slate-500">Total Masuk</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {report?.summary.totalIncoming ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
              <p className="text-sm text-slate-500">Total Keluar</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {report?.summary.totalOutgoing ?? 0}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:justify-end">
            <Button
              disabled={!report || isInvalidRange}
              onClick={() => report && exportInventoryReportToPdf(report)}
              type="button"
              variant="outline"
            >
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button
              disabled={!report || isInvalidRange}
              onClick={() => report && exportInventoryReportToExcel(report)}
              type="button"
              variant="outline"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-cyan-100 shadow-sm">
        <CardHeader>
          <CardTitle>Tabel Laporan</CardTitle>
          <CardDescription>
            Kompilasi stok awal, total masuk, total keluar, dan stok akhir per produk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportQuery.isLoading ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Memuat laporan inventori...
            </div>
          ) : reportQuery.isError ? (
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
                    <tr>
                      <td className="py-10 text-center text-slate-500" colSpan={6}>
                        Tidak ada data pada rentang tanggal ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
