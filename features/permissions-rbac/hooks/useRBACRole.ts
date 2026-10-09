"use client";

import { useQuery } from "@tanstack/react-query";
import { getRBACRoleById } from "../services/rbacPermissions.service";

/**
 * Busca um papel RBAC pelo ID.
 *
 * @param roleId - ID do papel ou `null` para desabilitar a query
 */
export function useRBACRole(roleId: string | null) {
  return useQuery({
    queryKey: ["rbac-role", roleId],
    queryFn: () => getRBACRoleById(roleId!),
    enabled: Boolean(roleId),
    staleTime: 60 * 1000, // 1 minuto
  });
}
