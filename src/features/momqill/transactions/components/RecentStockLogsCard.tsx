import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Clock,
  FileText,
  History,
  Package,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import type { StockLogHistoryItem } from "../../types/database";

function formatDateTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(value: string) {
  const now = new Date();
  const date = new Date(value);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "Baru saja";
  if (diffInMinutes < 60) return `${diffInMinutes} mnt lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam lalu`;
  return formatDateTime(value);
}

interface RecentStockLogsCardProps {
  history: StockLogHistoryItem[];
  isLoading: boolean;
}

type FilterType = "all" | "incoming" | "outgoing";

export function RecentStockLogsCard({
  history,
  isLoading,
}: RecentStockLogsCardProps) {
  const [filterType, setFilterType] = useState<FilterType>("all");

  const incomingCount = useMemo(
    () => history.filter((item) => item.type === "incoming").length,
    [history],
  );
  const outgoingCount = useMemo(
    () => history.filter((item) => item.type === "outgoing").length,
    [history],
  );

  const filteredHistory = useMemo(() => {
    if (filterType === "all") return history;
    return history.filter((item) => item.type === filterType);
  }, [filterType, history]);

  return (
    <Card className="border-border bg-white shadow-xs flex flex-col h-full">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border bg-slate-50/50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <History className="h-4 w-4" />
              </div>
              <CardTitle className="font-display text-base sm:text-lg font-bold">
                Riwayat Transaksi Terbaru
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Log aktivitas mutasi stok real-time oleh staf operasional.
            </CardDescription>
          </div>

          <Link
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline self-start sm:self-auto shrink-0"
            to="/app/stock-audit"
          >
            <span>Audit Lengkap</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 pt-2 font-mono text-xs">
          <button
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
              filterType === "all"
                ? "bg-foreground text-background shadow-2xs"
                : "bg-white text-muted-foreground border border-border hover:bg-slate-100"
            }`}
            onClick={() => setFilterType("all")}
            type="button"
          >
            Semua ({history.length})
          </button>
          <button
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
              filterType === "incoming"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-white text-muted-foreground border border-border hover:bg-slate-100 hover:text-emerald-700"
            }`}
            onClick={() => setFilterType("incoming")}
            type="button"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Masuk ({incomingCount})
          </button>
          <button
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
              filterType === "outgoing"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-white text-muted-foreground border border-border hover:bg-slate-100 hover:text-primary"
            }`}
            onClick={() => setFilterType("outgoing")}
            type="button"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Keluar ({outgoingCount})
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                className="animate-pulse rounded-xl border border-border/50 bg-slate-50/60 p-4"
                key={i}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="h-5 w-20 bg-slate-200 rounded" />
                  <div className="h-5 w-16 bg-slate-200 rounded" />
                </div>
                <div className="h-4 w-40 bg-slate-200 rounded mb-3" />
                <div className="h-3 w-64 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <Package className="h-6 w-6" />
            </div>
            <div className="font-display font-semibold text-sm text-foreground">
              {filterType === "all"
                ? "Belum ada transaksi stok hari ini"
                : filterType === "incoming"
                  ? "Belum ada catatan barang masuk"
                  : "Belum ada catatan barang keluar"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
              Transaksi yang Anda simpan melalui form di samping akan otomatis tercatat di sini secara real-time.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredHistory.map((item) => {
              const isIncoming = item.type === "incoming";
              const changeAmount = Math.abs(item.change_amount);

              return (
                <div
                  className={`group relative rounded-xl border p-3.5 transition-all hover:shadow-xs ${
                    isIncoming
                      ? "border-emerald-100 bg-emerald-50/20 hover:border-emerald-300 hover:bg-emerald-50/40"
                      : "border-border bg-white hover:border-primary/40 hover:bg-slate-50/60"
                  }`}
                  key={item.id}
                >
                  {/* Top Bar: Badge Type & Delta Amount */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        className="font-sans font-semibold text-xs"
                        variant={isIncoming ? "success" : "default"}
                      >
                        {isIncoming ? (
                          <>
                            <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Masuk</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                            <span>Keluar</span>
                          </>
                        )}
                      </Badge>
                      <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-mono text-sm font-bold ${
                          isIncoming ? "text-emerald-700" : "text-primary"
                        }`}
                      >
                        {isIncoming ? `+${changeAmount}` : `-${changeAmount}`}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          pcs
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Middle: Product Name */}
                  <div className="mt-2">
                    <div className="font-display font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {item.product_name}
                    </div>
                  </div>

                  {/* Notes (if any) */}
                  {item.notes ? (
                    <div className="mt-2 flex items-start gap-1.5 rounded-md border border-border/60 bg-slate-50/80 px-2.5 py-1.5 text-xs text-slate-700">
                      <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="italic leading-relaxed">{item.notes}</span>
                    </div>
                  ) : null}

                  {/* Bottom Strip: Staff & Stock Progression */}
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2 text-[11px] text-muted-foreground font-mono">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 text-slate-400" />
                      <span className="text-slate-600 font-medium">
                        {item.staff_name || "Staf Gudang"}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1 bg-slate-100/90 rounded px-2 py-0.5 text-[11px]">
                      <span>Stok:</span>
                      <span className="text-slate-500">{item.old_stock}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-bold text-foreground">
                        {item.new_stock}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
