"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRBACRoleStatus } from "../services/rbacPermissions.service";
import { invalidateRbacRolesList } from "../utils/permissionsRbacQueryInvalidation";

/**
 * Mutation para ativar ou desativar um papel RBAC inteiro.
 * Invalida a query `rbac-roles` após sucesso.
 */
export function useUpdateRBACRoleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, isActive }: { roleId: string; isActive: boolean }) =>
      updateRBACRoleStatus(roleId, isActive),
    onSuccess: () => {
      invalidateRbacRolesList(queryClient);
    },
  });
}
