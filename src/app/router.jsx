import { Suspense, lazy } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { useAuth } from "../features/auth/AuthProvider";

const LoginPage = lazy(() =>
  import("../features/auth/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);

const DashboardPage = lazy(() =>
  import("../features/momqill/dashboard/MomqillDashboardPage.tsx").then((module) => ({
    default: module.MomqillDashboardPage,
  })),
);

const OutgoingPage = lazy(() =>
  import("../features/momqill/outgoing/MomqillOutgoingPage.tsx").then((module) => ({
    default: module.MomqillOutgoingPage,
  })),
);

const IncomingPage = lazy(() =>
  import("../features/momqill/incoming/MomqillIncomingPage.tsx").then((module) => ({
    default: module.MomqillIncomingPage,
  })),
);

const ProductsPage = lazy(() =>
  import("../features/momqill/products/MomqillProductsPage.tsx").then((module) => ({
    default: module.MomqillProductsPage,
  })),
);

const InventoryPage = lazy(() =>
  import("../features/momqill/inventory/MomqillInventoryPage.tsx").then((module) => ({
    default: module.MomqillInventoryPage,
  })),
);

const ReportsPage = lazy(() =>
  import("../features/momqill/reports/MomqillReportsPage.tsx").then((module) => ({
    default: module.MomqillReportsPage,
  })),
);

const TeamPage = lazy(() =>
  import("../features/settings/TeamPage").then((module) => ({
    default: module.TeamPage,
  })),
);

function RouteLoader({ children }) {
  return <Suspense fallback={<div className="page-loader">Memuat modul...</div>}>{children}</Suspense>;
}

function RootRedirect() {
  const { loading, session } = useAuth();

  if (loading) {
    return <div className="page-loader">Mempersiapkan Momqill Frozen Food...</div>;
  }

  return <Navigate to={session ? "/dashboard" : "/login"} replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/login",
    element: (
      <RouteLoader>
        <LoginPage />
      </RouteLoader>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: (
          <RouteLoader>
            <DashboardPage />
          </RouteLoader>
        ),
      },
      {
        path: "products",
        element: (
          <RouteLoader>
            <ProductsPage />
          </RouteLoader>
        ),
      },
      {
        path: "inventory",
        element: (
          <RouteLoader>
            <InventoryPage />
          </RouteLoader>
        ),
      },
      {
        path: "incoming",
        element: (
          <RouteLoader>
            <IncomingPage />
          </RouteLoader>
        ),
      },
      {
        path: "outgoing",
        element: (
          <RouteLoader>
            <OutgoingPage />
          </RouteLoader>
        ),
      },
      {
        path: "reports",
        element: (
          <RouteLoader>
            <ReportsPage />
          </RouteLoader>
        ),
      },
      {
        path: "settings/team",
        element: (
          <ProtectedRoute requiredRoles={["admin"]}>
            <RouteLoader>
              <TeamPage />
            </RouteLoader>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
