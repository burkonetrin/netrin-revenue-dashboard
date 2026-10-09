"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removePermissionFromRole } from "../services/rbacPermissions.service";
import { invalidateRbacRolesList } from "../utils/permissionsRbacQueryInvalidation";

interface RemovePermissionParams {
  roleId: string;
  permissionPath: string;
}

/**
 * Mutation para remover uma permissão filha de um papel RBAC.
 * Invalida a query `rbac-roles` após sucesso.
 */
export function useRemovePermissionFromRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionPath }: RemovePermissionParams) =>
      removePermissionFromRole(roleId, permissionPath),
    onSuccess: () => {
      invalidateRbacRolesList(queryClient);
    },
  });
}
