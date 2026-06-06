import { Suspense, lazy } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";

import { AppShell } from "@/app/layout";
import { APP_NAME, appRoutes } from "@/app/routes/route-config";
import { ProtectedRoute, useAuth } from "@/features/auth";

const LoginPage = lazy(() =>
  import("@/features/auth/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);
const PublicCatalogPage = lazy(() =>
  import("@/features/public-catalog").then((module) => ({
    default: module.PublicCatalogPage,
  })),
);

function RouteLoader({ children }) {
  return <Suspense fallback={<div className="page-loader">Memuat modul...</div>}>{children}</Suspense>;
}

function renderProtectedPage(route) {
  const Page = route.component;
  const content = (
    <RouteLoader>
      <Page />
    </RouteLoader>
  );

  if (route.requiredRoles?.length) {
    return <ProtectedRoute requiredRoles={route.requiredRoles}>{content}</ProtectedRoute>;
  }

  return content;
}

function RootRedirect() {
  const { loading, session } = useAuth();

  if (loading) {
    return <div className="page-loader">Mempersiapkan {APP_NAME}...</div>;
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
    path: "/catalog",
    element: (
      <RouteLoader>
        <PublicCatalogPage />
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
    children: appRoutes.map((route) => ({
      path: route.path,
      element: renderProtectedPage(route),
    })),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
