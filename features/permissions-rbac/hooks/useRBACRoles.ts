"use client";

import { useQuery } from "@tanstack/react-query";
import { getRBACRoles } from "../services/rbacPermissions.service";

/**
 * Lista papéis RBAC com paginação.
 *
 * @param page - Página atual
 * @param pageSize - Itens por página (máx. OpenAPI: 100)
 */
export function useRBACRoles(page = 1, pageSize = 100, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["rbac-roles", page, pageSize],
    queryFn: () => getRBACRoles(page, pageSize),
    enabled: options?.enabled ?? true,
    staleTime: 60 * 1000, // 1 minuto
  });
}
