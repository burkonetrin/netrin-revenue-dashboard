"use client";

import type { ReactNode } from "react";
import { usePermission } from "@/shared/hooks/usePermission";

interface PermissionGuardProps {
  permission: string;
  productKey?: string;
  children: ReactNode;
  fallback?: ReactNode;
  disableInstead?: boolean;
}

/** Guarda de permissão (protótipo: `can()` do hook). */
export function PermissionGuard({
  permission,
  productKey,
  children,
  fallback = null,
  disableInstead = false,
}: PermissionGuardProps) {
  const { can } = usePermission();
  const allowed = can(permission, productKey);

  if (disableInstead && !allowed) {
    return <>{children}</>;
  }

  return allowed ? <>{children}</> : <>{fallback}</>;
}
