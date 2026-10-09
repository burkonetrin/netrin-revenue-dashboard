"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRBACRolePermissions } from "../services/rbacPermissions.service";
import type { UpdateRBACRolePermissionsData } from "../types/permission.types";
import { invalidateRbacRolesList } from "../utils/permissionsRbacQueryInvalidation";

interface UpdatePermissionsParams {
  id: string;
  data: UpdateRBACRolePermissionsData;
}

/**
 * Mutation para atualizar a árvore de permissões de um papel RBAC.
 * Invalida a query `rbac-roles` após sucesso.
 */
export function useUpdateRBACRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdatePermissionsParams) =>
      updateRBACRolePermissions(id, data),
    onSuccess: () => {
      invalidateRbacRolesList(queryClient);
    },
  });
}
