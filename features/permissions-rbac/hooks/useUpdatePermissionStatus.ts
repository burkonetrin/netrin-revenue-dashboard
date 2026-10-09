"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePermissionStatus } from "../services/rbacPermissions.service";
import { invalidateRbacRolesList } from "../utils/permissionsRbacQueryInvalidation";

interface UpdatePermissionStatusParams {
  roleId: string;
  permissionPath: string;
  isActive: boolean;
}

/**
 * Mutation para ativar ou desativar uma permissão dentro de um papel RBAC.
 * Invalida a query `rbac-roles` após sucesso.
 */
export function useUpdatePermissionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionPath, isActive }: UpdatePermissionStatusParams) =>
      updatePermissionStatus(roleId, permissionPath, isActive),
    onSuccess: () => {
      invalidateRbacRolesList(queryClient);
    },
  });
}
