import {
  Archive,
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  LayoutDashboard,
  Package,
  Users,
} from "lucide-react";
import { lazy } from "react";

export const APP_NAME = "Karunrung Frozen Food";

function lazyPage(importer, exportName) {
  return lazy(() =>
    importer().then((module) => ({
      default: module[exportName],
    })),
  );
}

export const appRoutes = [
  {
    path: "dashboard",
    absolutePath: "/dashboard",
    label: "Dasbor",
    title: "Dasbor",
    icon: LayoutDashboard,
    component: lazyPage(() => import("@/features/inventory/dashboard"), "DashboardPage"),
  },
  {
    path: "products",
    absolutePath: "/products",
    label: "Produk",
    title: "Master Produk",
    icon: Package,
    component: lazyPage(() => import("@/features/inventory/products"), "ProductsPage"),
  },
  {
    path: "inventory",
    absolutePath: "/inventory",
    label: "Monitoring Stok",
    title: "Monitoring Stok",
    icon: Archive,
    component: lazyPage(() => import("@/features/inventory/inventory"), "InventoryPage"),
  },
  {
    path: "transactions",
    absolutePath: "/transactions",
    label: "Transaksi",
    title: "Transaksi Stok",
    icon: ArrowLeftRight,
    component: lazyPage(
      () => import("@/features/inventory/transactions"),
      "StockTransactionsPage",
    ),
  },
  {
    path: "audit-logs",
    absolutePath: "/audit-logs",
    label: "Audit Stok",
    title: "Audit Stok",
    icon: ShieldCheck,
    component: lazyPage(
      () => import("@/features/inventory/stock-audit"),
      "StockAuditPage",
    ),
  },
  {
    path: "incoming",
    absolutePath: "/incoming",
    label: "Barang Masuk",
    title: "Barang Masuk",
    icon: ArrowDownLeft,
    component: lazyPage(() => import("@/features/inventory/incoming"), "IncomingPage"),
  },
  {
    path: "outgoing",
    absolutePath: "/outgoing",
    label: "Barang Keluar",
    title: "Barang Keluar",
    icon: ArrowUpRight,
    component: lazyPage(() => import("@/features/inventory/outgoing"), "OutgoingPage"),
  },
  {
    path: "reports",
    absolutePath: "/reports",
    label: "Laporan",
    title: "Laporan",
    icon: FileText,
    component: lazyPage(() => import("@/features/inventory/reports"), "ReportsPage"),
  },
  {
    path: "settings/team",
    absolutePath: "/settings/team",
    label: "Tim",
    title: "Tim",
    icon: Users,
    requiredRoles: ["admin"],
    component: lazyPage(() => import("@/features/settings/TeamPage"), "TeamPage"),
  },
];

export const sidebarRoutes = appRoutes.filter((route) => route.icon);

export const pageTitleByPath = Object.fromEntries(
  appRoutes.map((route) => [route.absolutePath, route.title]),
);
