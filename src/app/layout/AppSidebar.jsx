import clsx from "clsx";
import {
  Archive,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import { APP_NAME } from "@/app/routes/route-config";
import { useAuth } from "@/features/auth";

const navigationGroups = [
  {
    title: "OPERASIONAL",
    items: [
      {
        path: "/dashboard",
        label: "Dasbor",
        icon: LayoutDashboard,
      },
      {
        path: "/inventory",
        label: "Monitoring Stok",
        icon: Archive,
      },
      {
        path: "/transactions",
        label: "Transaksi Stok",
        icon: ArrowLeftRight,
      },
      {
        path: "/audit-logs",
        label: "Audit Stok",
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "ALUR BARANG",
    items: [
      {
        path: "/incoming",
        label: "Barang Masuk",
        icon: ArrowDownLeft,
      },
      {
        path: "/outgoing",
        label: "Barang Keluar",
        icon: ArrowUpRight,
      },
    ],
  },
  {
    title: "MANAJEMEN",
    items: [
      {
        path: "/products",
        label: "Master Produk",
        icon: Package,
      },
      {
        path: "/reports",
        label: "Laporan",
        icon: FileText,
      },
      {
        path: "/settings/team",
        label: "Tim Pengelola",
        icon: Users,
        requiredRole: "admin",
      },
    ],
  },
];

export function AppSidebar({ isOpen, onClose }) {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const renderContent = () => (
    <div className="flex h-full flex-col bg-white border-r border-border text-foreground">
      {/* Brand & Warehouse Telemetry Masthead */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4 lg:px-5">
        <div className="flex items-center gap-3 min-w-0">
          <img
            alt="Karunrung Frozen Food"
            className="h-9 w-9 shrink-0 object-contain drop-shadow-2xs"
            src="/logo-icon.png"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-semibold tracking-tight text-foreground truncate">
                {APP_NAME}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
              <span className="text-[11px] text-muted-foreground">
                Sistem Inventori
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onClose ? (
          <button
            aria-label="Tutup Menu"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 touch-scroll space-y-6">
        {navigationGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.requiredRole || (item.requiredRole === "admin" && isAdmin),
          );

          if (!visibleItems.length) return null;

          return (
            <div key={group.title}>
              <div className="px-2 pb-2 font-mono text-[10px] font-medium tracking-wider text-muted-foreground/80 uppercase">
                {group.title}
              </div>
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <NavLink
                        className={({ isActive }) =>
                          clsx(
                            "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150 relative",
                            isActive
                              ? "bg-muted font-semibold text-primary"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                          )
                        }
                        onClick={onClose}
                        to={item.path}
                      >
                        {({ isActive }) => (
                          <>
                            {isActive ? (
                              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-primary" />
                            ) : null}
                            <Icon
                              className={clsx(
                                "h-4 w-4 shrink-0 transition-colors",
                                isActive
                                  ? "text-primary"
                                  : "text-muted-foreground group-hover:text-foreground",
                              )}
                            />
                            <span className="truncate">{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        {/* Public Catalog Link */}
        <div className="pt-2 border-t border-border">
          <Link
            className="flex items-center justify-between rounded-md border border-dashed border-border bg-slate-50/70 px-3 py-2.5 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
            onClick={onClose}
            target="_blank"
            to="/catalog"
          >
            <span className="font-medium">Katalog Publik Pembeli</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </Link>
        </div>
      </nav>

      {/* User profile info at bottom */}
      <div className="border-t border-border p-3.5 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 font-mono">
            {profile?.full_name?.charAt(0) || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">
              {profile?.full_name || "Petugas Gudang"}
            </p>
            <p className="font-mono text-[10px] uppercase text-muted-foreground">
              {profile?.role || "Staff"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 md:flex md:flex-col">
        {renderContent()}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onClose}
          />
          {/* Drawer Menu */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            {renderContent()}
          </div>
        </div>
      ) : null}
    </>
  );
}
