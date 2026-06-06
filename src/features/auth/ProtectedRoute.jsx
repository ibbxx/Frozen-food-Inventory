import { Navigate, useLocation } from "react-router-dom";

import { hasRequiredRole } from "@/shared/lib/permissions";

import { useAuth } from "./AuthProvider";

export function ProtectedRoute({ children, requiredRoles = [] }) {
  const { loading, profile, session } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page-loader">Checking access...</div>;
  }

  if (!session) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (requiredRoles.length && !profile) {
    return <Navigate replace to="/dashboard" />;
  }

  if (requiredRoles.length && !hasRequiredRole(profile.role, requiredRoles)) {
    return <Navigate replace to="/dashboard" />;
  }

  return children;
}
