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
    <Card className="border-border bg-white shadow-xs">
      <CardHeader className="p-4 sm:p-6 pb-2">
        <CardTitle className="font-display text-base sm:text-lg font-bold">Periode & Ringkasan Laporan</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Pilih rentang tanggal untuk melihat rekapitulasi data dan mengunduh laporan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6 pt-2">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-700">Tanggal Mulai</span>
            <input
              className="flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={onStartDateChange}
              type="date"
              value={startDate}
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-700">Tanggal Selesai</span>
            <input
              className="flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={onEndDateChange}
              type="date"
              value={endDate}
            />
          </label>
        </div>

        {isInvalidRange ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-mono">
            Tanggal mulai tidak boleh lebih besar dari tanggal selesai.
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
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
            Unduh PDF
          </Button>
          <Button
            disabled={!report || isInvalidRange}
            onClick={onExportExcel}
            type="button"
            variant="outline"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Unduh Excel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
