import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { 
  LayoutDashboard, 
  Package, 
  Archive, 
  ArrowDownLeft,
  ArrowUpRight,
  FileText, 
  Users,
  Snowflake
} from "lucide-react";

const navigation = [
  { label: "Dasbor", path: "/dashboard", icon: LayoutDashboard },
  { label: "Produk", path: "/products", icon: Package },
  { label: "Monitoring Stok", path: "/inventory", icon: Archive },
  { label: "Barang Masuk", path: "/incoming", icon: ArrowDownLeft },
  { label: "Barang Keluar", path: "/outgoing", icon: ArrowUpRight },
  { label: "Laporan", path: "/reports", icon: FileText },
  { label: "Tim", path: "/settings/team", icon: Users },
];

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
      <div className="flex h-14 items-center gap-3 border-b px-4 lg:h-[60px] lg:px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Snowflake className="h-5 w-5" />
        </div>
        <div>
          <strong className="text-sm font-semibold tracking-tight leading-none">Momqill Frozen Food</strong>
        </div>
      </div>

      <nav className="flex-1 overflow-auto py-4">
        <ul className="grid gap-1 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                      isActive ? "bg-muted text-primary" : "text-muted-foreground"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>


    </aside>
  );
}
