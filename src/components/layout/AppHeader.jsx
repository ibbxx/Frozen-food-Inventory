import { useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthProvider";
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";

const titles = {
  "/dashboard": "Dasbor",
  "/products": "Master Produk",
  "/inventory": "Monitoring Stok",
  "/incoming": "Barang Masuk",
  "/outgoing": "Barang Keluar",
  "/reports": "Laporan",
  "/settings/team": "Tim",
};

export function AppHeader() {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
      <div className="flex-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {titles[location.pathname] || "Momqill Frozen Food"}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-3 rounded-full border bg-background px-4 py-1.5 shadow-sm sm:flex">
          <div className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
          <div className="flex flex-col items-start leading-none">
            <span className="text-sm font-medium">{profile?.full_name || "Belum Masuk"}</span>
            <span className="text-xs text-muted-foreground">{profile?.role || "Tanpa Akses"}</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </div>
    </header>
  );
}
