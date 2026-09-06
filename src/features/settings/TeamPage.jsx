import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Info, Mail, Pencil, Search, Shield, User } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHero } from "@/features/momqill/shared/PageHero";
import { ToastMessage } from "@/features/momqill/shared/ToastMessage";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import { fetchTeamMembers, updateTeamMember } from "./team-service";

const GRADIENT_COLORS = [
  "from-teal-400 to-emerald-500",
  "from-cyan-400 to-blue-500",
  "from-indigo-400 to-purple-500",
  "from-orange-400 to-amber-500",
  "from-pink-400 to-rose-500",
];

function getGradient(id) {
  if (!id) return GRADIENT_COLORS[0];
  const charCodeSum = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const index = charCodeSum % GRADIENT_COLORS.length;
  return GRADIENT_COLORS[index];
}

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
}

function formatIndonesianDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function TeamPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [toastState, setToastState] = useState(null);
  const [editingMember, setEditingMember] = useState(null);

  // Form states
  const [editFullName, setEditFullName] = useState("");
  const [editRole, setEditRole] = useState("staff");

  // Fetch team members
  const { data: teamMembers = [], isLoading, isError } = useQuery({
    queryKey: ["settings", "team"],
    queryFn: fetchTeamMembers,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ userId, full_name, role }) => updateTeamMember(userId, { full_name, role }),
    onSuccess: () => {
      setToastState({
        message: "Data anggota tim berhasil diperbarui.",
        tone: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["settings", "team"] });
      setEditingMember(null);
    },
    onError: (error) => {
      setToastState({
        message: error.message || "Gagal memperbarui data anggota.",
        tone: "error",
      });
    },
  });

  // Metrics
  const metrics = useMemo(() => {
    const total = teamMembers.length;
    const admins = teamMembers.filter((m) => m.role === "admin").length;
    const staff = total - admins;
    return { total, admins, staff };
  }, [teamMembers]);

  // Filtered list
  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return teamMembers;
    return teamMembers.filter(
      (m) =>
        (m.full_name || "").toLowerCase().includes(query) ||
        (m.email || "").toLowerCase().includes(query)
    );
  }, [teamMembers, searchQuery]);

  const handleEditClick = (member) => {
    setEditingMember(member);
    setEditFullName(member.full_name || "");
    setEditRole(member.role || "staff");
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editFullName.trim()) {
      setToastState({
        message: "Nama lengkap tidak boleh kosong.",
        tone: "error",
      });
      return;
    }
    updateMutation.mutate({
      userId: editingMember.id,
      full_name: editFullName.trim(),
      role: editRole,
    });
  };

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <h3 className="text-lg font-semibold mb-2">Gagal Memuat Anggota Tim</h3>
        <p className="text-sm">Terjadi kesalahan saat menghubungi server. Silakan muat ulang halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {toastState && (
        <ToastMessage
          message={toastState.message}
          tone={toastState.tone}
          onClose={() => setToastState(null)}
        />
      )}

      <PageHero
        title="Pengaturan Tim"
        description="Kelola nama lengkap staf dan atur tingkat akses mereka pada sistem inventori Karunrung Frozen Food."
      />

      {/* Metrics Banner (Mobile First: 1 col on mobile, 3 col on sm) */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Card className="border-border bg-white shadow-xs">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <CardDescription className="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Anggota
            </CardDescription>
            <CardTitle className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-foreground mt-1">
              {isLoading ? "..." : `${metrics.total}`} <span className="text-xs font-sans font-normal text-muted-foreground">Petugas</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border bg-white shadow-xs">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <CardDescription className="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Pengelola (Admin)
            </CardDescription>
            <CardTitle className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-primary mt-1">
              {isLoading ? "..." : `${metrics.admins}`} <span className="text-xs font-sans font-normal text-muted-foreground">Admin</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border bg-white shadow-xs">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <CardDescription className="font-mono text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Petugas Toko (Staf)
            </CardDescription>
            <CardTitle className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-foreground mt-1">
              {isLoading ? "..." : `${metrics.staff}`} <span className="text-xs font-sans font-normal text-muted-foreground">Staf</span>
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      {/* Search and List */}
      <Card className="border-border bg-white shadow-xs">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Daftar Anggota Tim</CardTitle>
            <CardDescription>
              Seluruh pengguna yang memiliki akses masuk ke dalam sistem inventori toko.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Cari nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Memuat data anggota tim...
            </div>
          ) : filteredMembers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="pb-3 pr-4 font-medium">No</th>
                    <th className="pb-3 pr-4 font-medium">Nama Lengkap</th>
                    <th className="pb-3 pr-4 font-medium">Alamat Email</th>
                    <th className="pb-3 pr-4 font-medium text-center">Hak Akses</th>
                    <th className="pb-3 pr-4 font-medium">Tanggal Bergabung</th>
                    <th className="pb-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member, index) => (
                    <tr className="border-b last:border-b-0 hover:bg-slate-50/40" key={member.id}>
                      <td className="py-4 pr-4 text-slate-500">{index + 1}</td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${getGradient(
                              member.id
                            )} text-sm font-semibold text-white shadow-sm`}
                          >
                            {getInitials(member.full_name)}
                          </div>
                          <span className="font-semibold text-slate-900">
                            {member.full_name || "Belum Mengisi Nama"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {member.email}
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-center">
                        {member.role === "admin" ? (
                          <Badge variant="success" className="px-2.5 py-0.5 rounded-full">
                            Pengelola (Admin)
                          </Badge>
                        ) : (
                          <Badge variant="info" className="px-2.5 py-0.5 rounded-full">
                            Petugas (Staf)
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatIndonesianDate(member.created_at)}
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <Button
                          onClick={() => handleEditClick(member)}
                          size="sm"
                          type="button"
                          variant="outline"
                          className="h-8 border-slate-200"
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                          Ubah
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              Tidak ada anggota tim yang cocok dengan pencarian Anda.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invitation Info Box */}
      <Card className="border-cyan-100 bg-cyan-50/20 shadow-none">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="mt-0.5 rounded-full bg-cyan-100 p-2 text-cyan-600">
              <Info className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">Bagaimana Cara Menambah Anggota Baru?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mintalah staf atau pengelola baru untuk mendaftar akun di aplikasi Karunrung Frozen Food terlebih dahulu. 
                Setelah mereka berhasil mendaftar, nama mereka akan otomatis muncul dalam daftar di atas sebagai <strong>Petugas (Staf)</strong>. 
                Anda kemudian dapat mengubah peran dan nama lengkap mereka secara langsung melalui tombol <strong>Ubah</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        title="Ubah Anggota Tim"
      >
        {editingMember && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <User className="h-4 w-4 text-slate-400" />
                Nama Lengkap
              </label>
              <Input
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-slate-400" />
                Tingkat Akses (Peran)
              </label>
              <div className="grid gap-3 sm:grid-cols-2 mt-1">
                {/* Staff role selection option */}
                <div
                  onClick={() => setEditRole("staff")}
                  className={`flex flex-col gap-1 rounded-xl border p-4 cursor-pointer transition-all ${
                    editRole === "staff"
                      ? "border-blue-500 bg-blue-50/40 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50/50"
                  }`}
                >
                  <span className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    Petugas (Staf)
                  </span>
                  <span className="text-xs text-slate-500 leading-relaxed">
                    Akses operasional mencatat barang masuk, barang keluar, dan melihat stok, tanpa hak akses pengaturan tim.
                  </span>
                </div>

                {/* Admin role selection option */}
                <div
                  onClick={() => setEditRole("admin")}
                  className={`flex flex-col gap-1 rounded-xl border p-4 cursor-pointer transition-all ${
                    editRole === "admin"
                      ? "border-emerald-500 bg-emerald-50/40 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50/50"
                  }`}
                >
                  <span className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    Pengelola (Admin)
                  </span>
                  <span className="text-xs text-slate-500 leading-relaxed">
                    Akses penuh untuk mengelola data produk, transaksi stok, mengunduh laporan, serta mengatur anggota tim.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingMember(null)}
                disabled={updateMutation.isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
