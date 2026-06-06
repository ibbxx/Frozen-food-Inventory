import { Download, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { useAuth } from "@/features/auth";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

import { PageErrorState } from "../shared/PageErrorState";
import { PageHero } from "../shared/PageHero";
import { ToastMessage } from "../shared/ToastMessage";

import { StockAuditTableCard } from "./components/StockAuditTableCard";
import { exportStockAuditToExcel } from "./stock-audit-service";
import { useStockAudit } from "./use-stock-audit";

type ToastState = { message: string; tone: "success" | "error" } | null;

export function StockAuditPage() {
  const { profile } = useAuth();
  const auditQuery = useStockAudit();
  const [keyword, setKeyword] = useState("");
  const [toastState, setToastState] = useState<ToastState>(null);
  const [isExporting, setIsExporting] = useState(false);

  const filteredRows = useMemo(() => {
    const rows = auditQuery.data ?? [];
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return rows;
    }

    return rows.filter((row) =>
      [row.product_name, row.staff_name, row.notes || ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedKeyword),
    );
  }, [auditQuery.data, keyword]);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      await exportStockAuditToExcel(filteredRows);
      setToastState({
        message: "Audit stok berhasil diekspor.",
        tone: "success",
      });
    } catch (error) {
      setToastState({
        message:
          error instanceof Error ? error.message : "Gagal mengekspor audit stok.",
        tone: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (auditQuery.isError) {
    return (
      <PageErrorState
        description="Audit stok belum bisa dimuat. Cek koneksi lalu coba kembali."
        title="Audit stok gagal dimuat"
      />
    );
  }

  return (
    <div className="grid gap-6">
      {toastState ? (
        <ToastMessage
          message={toastState.message}
          onClose={() => setToastState(null)}
          tone={toastState.tone}
        />
      ) : null}

      <PageHero
        badge={
          <Badge className="w-fit gap-2" variant="warning">
            <ShieldCheck className="h-3.5 w-3.5" />
            Riwayat Perubahan
          </Badge>
        }
        description="Pantau siapa yang mengubah stok, kapan perubahan terjadi, dan berapa selisihnya. Staf hanya dapat melihat riwayat perubahan dalam 30 hari terakhir demi kelancaran operasional."
        title="Audit Stok"
        actions={
          profile?.role === "admin" ? (
            <Button disabled={isExporting || !filteredRows.length} onClick={handleExport} type="button" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Mengekspor..." : "Ekspor Excel"}
            </Button>
          ) : null
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-slate-700">Cari produk, staf, atau catatan</span>
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Contoh: nugget, admin, marketplace"
            value={keyword}
          />
        </label>
      </section>

      <StockAuditTableCard isLoading={auditQuery.isLoading} rows={filteredRows} />
    </div>
  );
}
