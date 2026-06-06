import { FileSpreadsheet, FileText } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

import { MetricCard } from "../../shared/MetricCard";

import type { InventoryReportPayload } from "../../types/database";
import type { ChangeEventHandler } from "react";

interface ReportFilterCardProps {
  endDate: string;
  isInvalidRange: boolean;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onEndDateChange: ChangeEventHandler<HTMLInputElement>;
  onStartDateChange: ChangeEventHandler<HTMLInputElement>;
  report?: InventoryReportPayload;
  startDate: string;
}

function SummaryMetric({
  colorClassName,
  title,
  value,
}: {
  colorClassName: string;
  title: string;
  value: number;
}) {
  return (
    <MetricCard
      description=""
      icon={<span className={`h-5 w-5 rounded-full ${colorClassName}`} />}
      title={title}
      toneClassName="bg-white"
      value={value}
    />
  );
}

export function ReportFilterCard({
  endDate,
  isInvalidRange,
  onEndDateChange,
  onExportExcel,
  onExportPdf,
  onStartDateChange,
  report,
  startDate,
}: ReportFilterCardProps) {
  return (
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
            <Input onChange={onStartDateChange} type="date" value={startDate} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Tanggal Akhir</label>
            <Input onChange={onEndDateChange} type="date" value={endDate} />
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
          <SummaryMetric
            colorClassName="bg-cyan-200"
            title="Total Produk"
            value={report?.summary.totalProducts ?? 0}
          />
          <SummaryMetric
            colorClassName="bg-emerald-200"
            title="Total Masuk"
            value={report?.summary.totalIncoming ?? 0}
          />
          <SummaryMetric
            colorClassName="bg-sky-200"
            title="Total Keluar"
            value={report?.summary.totalOutgoing ?? 0}
          />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:justify-end">
          <Button
            disabled={!report || isInvalidRange}
            onClick={onExportPdf}
            type="button"
            variant="outline"
          >
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button
            disabled={!report || isInvalidRange}
            onClick={onExportExcel}
            type="button"
            variant="outline"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
