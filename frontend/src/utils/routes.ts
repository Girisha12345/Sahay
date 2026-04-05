import type { UserRole } from "../types";

export function getDashboardPathForRole(role?: UserRole | null) {
  switch (role) {
    case "PROVIDER":
      return "/provider/dashboard";
    case "SUPPORT_AGENT":
      return "/support/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "CUSTOMER":
    default:
      return "/customer/dashboard";
  }
}