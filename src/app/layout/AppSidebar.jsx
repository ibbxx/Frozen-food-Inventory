import clsx from "clsx";
import { Snowflake } from "lucide-react";
import { NavLink } from "react-router-dom";

import { APP_NAME, sidebarRoutes } from "@/app/routes/route-config";

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
      <div className="flex h-14 items-center gap-3 border-b px-4 lg:h-[60px] lg:px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Snowflake className="h-5 w-5" />
        </div>
        <div>
          <strong className="text-sm font-semibold tracking-tight leading-none">{APP_NAME}</strong>
        </div>
      </div>

      <nav className="flex-1 overflow-auto py-4">
        <ul className="grid gap-1 px-3">
          {sidebarRoutes.map((route) => {
            const Icon = route.icon;
            return (
              <li key={route.absolutePath}>
                <NavLink
                  to={route.absolutePath}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                      isActive ? "bg-muted text-primary" : "text-muted-foreground"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {route.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
