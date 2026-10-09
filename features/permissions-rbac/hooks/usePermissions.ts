"use client";

import { useQuery } from "@tanstack/react-query";
import { getRBACRoles } from "../services/rbacPermissions.service";
import type { PermissionType } from "../types/permission.types";
import { mapRBACRolesToPermissions } from "../utils/rbacMapper";

/**
 * Lista permissões RBAC mapeadas para a árvore da UI, filtradas por produto.
 *
 * @param type - Tipo de produto (`SafePartner` ou `Nucleus`)
 * @param page - Página atual
 * @param pageSize - Itens por página (máx. OpenAPI: 100)
 */
export function usePermissions(type: PermissionType, page = 1, pageSize = 100) {
  return useQuery({
    queryKey: ["rbac-roles", type, page, pageSize],
    queryFn: async () => {
      const response = await getRBACRoles(page, pageSize, type);
      return mapRBACRolesToPermissions(response.data, type);
    },
    staleTime: 60 * 1000, // 1 minuto
  });
}
