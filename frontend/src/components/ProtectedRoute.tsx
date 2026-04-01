import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";
import type { UserRole } from "../types";

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactElement;
  roles?: UserRole[];
}) {
  const { user, isAuthenticated, accessToken } = useAuthStore();

  if (!accessToken || !isAuthenticated) return <Navigate to="/login" replace />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
