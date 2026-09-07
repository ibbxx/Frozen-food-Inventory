import { LogOut, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";

import { pageTitleByPath } from "@/app/routes/route-config";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/ui/button";

export function AppHeader({ onOpenMobileMenu }) {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const currentTitle = pageTitleByPath[location.pathname] || "Inventori";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-white/95 px-3.5 backdrop-blur-md sm:h-16 sm:px-6">
      {/* Left: Mobile Hamburger & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          aria-label="Buka Menu Navigasi"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-white text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-95 md:hidden"
          onClick={onOpenMobileMenu}
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <img
            alt="Karunrung Frozen Food"
            className="h-7 w-7 shrink-0 object-contain md:hidden"
            src="/logo-icon.png"
          />
          <h1 className="font-display text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Right: Operational Telemetry & Signout */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Warehouse Status Pill (Hidden on narrowest screens) */}
        <div className="hidden xs:flex items-center gap-2 rounded-full border border-border bg-slate-50/80 px-2.5 py-1 text-xs sm:px-3">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px] font-medium text-slate-700">
            {profile?.role === "admin" ? "ADMIN" : "STAFF"}
          </span>
        </div>

        {/* User Full Name (Tablet/Desktop) */}
        <div className="hidden sm:flex flex-col text-right leading-tight">
          <span className="text-xs font-semibold text-foreground truncate max-w-[140px]">
            {profile?.full_name || (profile?.role === "admin" ? "Admin Gudang" : "Petugas")}
          </span>
          <span className="text-[11px] text-muted-foreground">Gudang Utama</span>
        </div>

        {/* Logout Button */}
        <Button
          className="h-9 px-2.5 sm:px-3 text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/30"
          onClick={signOut}
          size="sm"
          type="button"
          variant="outline"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </div>
    </header>
  );
}
