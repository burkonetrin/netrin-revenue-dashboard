"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRBACRoles } from "../services/rbacPermissions.service";
import { mapRBACRolesToPermissions } from "../utils/rbacMapper";
import { getPermissionTypeForProductId } from "../constants/rbacProducts.constants";
import type { PermissionWithChildren } from "../types/permission.types";

/**
 * Agrupa permissões RBAC por produto a partir da listagem de papéis.
 *
 * @param page - Página atual
 * @param pageSize - Itens por página (máx. OpenAPI: 100)
 * @returns Mapa de permissões por `productId` e estado de carregamento
 */
export function useRBACPermissionsByProduct(page = 1, pageSize = 100) {
  const query = useQuery({
    queryKey: ["rbac-roles", "by-product", page, pageSize],
    queryFn: () => getRBACRoles(page, pageSize),
    staleTime: 60 * 1000,
  });

  const permissionsByProductId = useMemo(() => {
    const map = new Map<string, PermissionWithChildren[]>();
    const roles = query.data?.data ?? [];

    for (const role of roles) {
      const type = getPermissionTypeForProductId(role.productId);
      const permissions = mapRBACRolesToPermissions([role], type);
      const existing = map.get(role.productId) ?? [];
      map.set(role.productId, [...existing, ...permissions]);
    }

    return map;
  }, [query.data?.data]);

  return {
    permissionsByProductId,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
