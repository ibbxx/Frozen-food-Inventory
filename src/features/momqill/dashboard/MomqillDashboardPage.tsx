import { useMemo } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Package2,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/features/auth/AuthProvider";
import { useDashboardData } from "./use-dashboard-data";

interface AuthProfile {
  full_name?: string;
  role?: string;
}

interface AuthShape {
  profile?: AuthProfile | null;
}

function SummaryCard({
  title,
  value,
  caption,
  icon,
  toneClassName,
}: {
  title: string;
  value: number;
  caption: string;
  icon: ReactNode;
  toneClassName: string;
}) {
  return (
    <Card className={`border-white/70 shadow-sm ${toneClassName}`}>
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <CardDescription className="text-slate-600">{title}</CardDescription>
          <CardTitle className="mt-2 text-3xl font-semibold text-slate-900">{value}</CardTitle>
        </div>
        <div className="rounded-2xl bg-white/80 p-3 shadow-sm">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">{caption}</p>
      </CardContent>
    </Card>
  );
}

export function MomqillDashboardPage() {
  const { profile } = useAuth() as AuthShape;
  const dashboardQuery = useDashboardData();

  const dashboard = dashboardQuery.data;
  const summary = dashboard?.summary;
  const greetingName = useMemo(() => {
    if (!profile?.full_name) {
      return "Tim Momqill";
    }

    return profile.full_name;
  }, [profile?.full_name]);

  if (dashboardQuery.isLoading && !dashboard) {
    return <div className="page-loader">Memuat ringkasan inventori...</div>;
  }

  if (dashboardQuery.isError) {
    return (
      <div className="grid gap-6">
        <Card className="border-red-100 bg-red-50">
          <CardHeader>
            <CardTitle>Dashboard gagal dimuat</CardTitle>
            <CardDescription>
              Data Supabase belum bisa diambil. Periksa koneksi lalu muat ulang halaman.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[28px] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-teal-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Badge className="rounded-full bg-teal-100 px-3 py-1 text-teal-700 hover:bg-teal-100" variant="outline">
              Dashboard Eksekutif
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Selamat datang, {greetingName}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Pantau stok harian, arus barang masuk dan keluar, serta produk yang perlu segera diisi ulang.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
            Role aktif: <span className="font-semibold text-slate-900">{profile?.role || "staff"}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          caption="Jumlah SKU aktif yang sedang dipantau."
          icon={<Package2 className="h-5 w-5 text-cyan-600" />}
          title="Total Produk"
          toneClassName="bg-white"
          value={summary?.totalProducts ?? 0}
        />
        <SummaryCard
          caption="Akumulasi barang masuk pada tanggal berjalan."
          icon={<ArrowDownCircle className="h-5 w-5 text-teal-600" />}
          title="Stok Masuk Hari Ini"
          toneClassName="bg-cyan-50/80"
          value={summary?.incomingToday ?? 0}
        />
        <SummaryCard
          caption="Barang keluar yang berhasil tercatat hari ini."
          icon={<ArrowUpCircle className="h-5 w-5 text-sky-600" />}
          title="Stok Keluar Hari Ini"
          toneClassName="bg-white"
          value={summary?.outgoingToday ?? 0}
        />
        <SummaryCard
          caption="Produk yang menyentuh atau melewati batas minimum."
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
          title="Alert Stok Menipis"
          toneClassName="bg-amber-50"
          value={summary?.lowStockCount ?? 0}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Card className="border-cyan-100">
          <CardHeader>
            <CardTitle>Pergerakan Stok 7 Hari Terakhir</CardTitle>
            <CardDescription>
              Line chart untuk memantau ritme barang masuk dan keluar per hari.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={dashboard?.dailyTrend ?? []}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: "#475569", fontSize: 12 }} />
                <Tooltip />
                <Line
                  dataKey="incoming"
                  dot={{ fill: "#0F766E", r: 4 }}
                  stroke="#0F766E"
                  strokeWidth={3}
                  type="monotone"
                />
                <Line
                  dataKey="outgoing"
                  dot={{ fill: "#0284C7", r: 4 }}
                  stroke="#0284C7"
                  strokeWidth={3}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-cyan-100">
          <CardHeader>
            <CardTitle>Perbandingan Bulanan</CardTitle>
            <CardDescription>
              Bar chart untuk melihat volume masuk dan keluar per bulan.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={dashboard?.monthlyComparison ?? []}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: "#475569", fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="incoming" fill="#14B8A6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="outgoing" fill="#38BDF8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <Card className="border-cyan-100">
        <CardHeader>
          <CardTitle>Notifikasi Cepat Produk Menipis</CardTitle>
          <CardDescription>
            Daftar prioritas restok untuk mencegah kehabisan barang di toko.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Produk</th>
                  <th className="pb-3 pr-4 font-medium">Stok Saat Ini</th>
                  <th className="pb-3 pr-4 font-medium">Stok Minimum</th>
                  <th className="pb-3 font-medium">Selisih</th>
                </tr>
              </thead>
              <tbody>
                {(dashboard?.lowStockProducts ?? []).length ? (
                  dashboard?.lowStockProducts.map((product) => (
                    <tr className="border-b last:border-b-0" key={product.id}>
                      <td className="py-4 pr-4 font-medium text-slate-900">{product.product_name}</td>
                      <td className="py-4 pr-4">{product.current_stock}</td>
                      <td className="py-4 pr-4">{product.min_stock}</td>
                      <td className="py-4">
                        <Badge variant={product.current_stock === 0 ? "danger" : "warning"}>
                          Kurang {product.gap}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-center text-slate-500" colSpan={4}>
                      Semua stok masih berada di atas batas minimum.
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
