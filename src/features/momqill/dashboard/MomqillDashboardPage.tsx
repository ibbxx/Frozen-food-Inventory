import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Package2,
  RefreshCw,
} from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAuth } from "@/features/auth";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import { MetricCard } from "../shared/MetricCard";
import { PageErrorState } from "../shared/PageErrorState";
import { PageHero } from "../shared/PageHero";

import { useDashboardData } from "./use-dashboard-data";

interface AuthProfile {
  full_name?: string;
  role?: string;
}

interface AuthShape {
  profile?: AuthProfile | null;
}

export function MomqillDashboardPage() {
  const { profile } = useAuth() as AuthShape;
  const dashboardQuery = useDashboardData();

  const dashboard = dashboardQuery.data;
  const summary = dashboard?.summary;
  const greetingName = useMemo(() => {
    if (!profile?.full_name || /ibnu(f|g)ajar/i.test(profile.full_name)) {
      return profile?.role === "admin" ? "Admin" : "Tim Gudang";
    }
    return profile.full_name;
  }, [profile?.full_name, profile?.role]);

  if (dashboardQuery.isLoading && !dashboard) {
    return (
      <div className="page-loader">
        <RefreshCw className="h-5 w-5 animate-spin text-primary" />
        <span>Memuat data inventori...</span>
      </div>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <PageErrorState
        description="Gagal menghubungkan ke server data. Silakan periksa koneksi internet Anda lalu muat ulang halaman."
        title="Dashboard gagal dimuat"
      />
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHero
        aside={
          <div className="flex items-center gap-2 rounded-lg border border-border bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground">Shift:</span>
            <span className="font-semibold text-foreground">
              {profile?.role === "admin" ? "Admin" : "Staff"}
            </span>
          </div>
        }
        description="Ringkasan arus barang masuk, keluar, dan status stok inventori gudang."
        title={`Halo, ${greetingName}`}
      />

      {/* Metric Cards Strip */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <MetricCard
          icon={<Package2 className="h-4 w-4" />}
          title="Master Produk"
          value={summary?.totalProducts ?? 0}
        />
        <MetricCard
          icon={<ArrowDownCircle className="h-4 w-4 text-emerald-600" />}
          title="Barang Masuk (Hari Ini)"
          value={summary?.incomingToday ?? 0}
        />
        <MetricCard
          icon={<ArrowUpCircle className="h-4 w-4 text-primary" />}
          title="Barang Keluar (Hari Ini)"
          value={summary?.outgoingToday ?? 0}
        />
        <MetricCard
          icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
          title="Peringatan Restok"
          value={summary?.lowStockCount ?? 0}
        />
      </section>

      {/* Analytics Charts — Mobile First: 1 col on mobile/tablet, 2 col on xl */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border-border bg-white shadow-xs">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-base sm:text-lg font-bold">
                  Arus Stok 7 Hari Terakhir
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Grafik komparasi harian barang masuk vs keluar
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="inline-flex items-center gap-1.5 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" /> Masuk
                </span>
                <span className="inline-flex items-center gap-1.5 text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Keluar
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-2 h-[260px] sm:h-[300px]">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={dashboard?.dailyTrend ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="2 2" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  tick={{ fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#94a3b8"
                  tick={{ fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "6px",
                    fontFamily: "JetBrains Mono",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                />
                <Line
                  dataKey="incoming"
                  dot={{ fill: "#059669", r: 3 }}
                  stroke="#059669"
                  strokeWidth={2.5}
                  type="monotone"
                />
                <Line
                  dataKey="outgoing"
                  dot={{ fill: "#2563eb", r: 3 }}
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-xs">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <CardTitle className="font-display text-base sm:text-lg font-bold">
              Volume Bulanan
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Akumulasi total barang masuk vs keluar
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-2 h-[260px] sm:h-[300px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={dashboard?.monthlyComparison ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="2 2" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  tick={{ fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#94a3b8"
                  tick={{ fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "6px",
                    fontFamily: "JetBrains Mono",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="incoming" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outgoing" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* Critical Stock Alerts Table — Mobile First: Touch scroll container + monospaced data */}
      <Card className="border-border bg-white shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-3 border-b border-border bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="font-display text-base sm:text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Antrian Prioritas Restok
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Daftar produk yang perlu segera dipesan atau diproduksi ulang
              </CardDescription>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {(dashboard?.lowStockProducts ?? []).length} Item Perhatian
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-border font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 font-semibold">Nama Produk</th>
                  <th className="py-3 px-4 font-semibold text-right">Stok Fisik</th>
                  <th className="py-3 px-4 font-semibold text-right">Ambang Min</th>
                  <th className="py-3 px-4 font-semibold text-center">Status Defisit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(dashboard?.lowStockProducts ?? []).length ? (
                  dashboard?.lowStockProducts.map((product) => (
                    <tr
                      className="transition-colors hover:bg-slate-50/80"
                      key={product.id}
                    >
                      <td className="py-3 px-4 font-medium text-foreground">
                        <div className="font-medium">{product.product_name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">SKU: {product.id.slice(0, 8)}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right tabular-nums text-foreground">
                        {product.current_stock}
                      </td>
                      <td className="py-3 px-4 font-mono text-right tabular-nums text-muted-foreground">
                        {product.min_stock}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={product.current_stock === 0 ? "destructive" : "warning"}
                        >
                          {product.current_stock === 0 ? "KOSONG" : `DEFISIT -${product.gap}`}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-8 text-center text-xs font-mono text-muted-foreground" colSpan={4}>
                      Semua stok produk saat ini aman di atas ambang batas minimum.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
