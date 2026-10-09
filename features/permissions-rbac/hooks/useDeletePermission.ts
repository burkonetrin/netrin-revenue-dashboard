"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRBACRole } from "../services/rbacPermissions.service";
import { invalidateRbacRolesList } from "../utils/permissionsRbacQueryInvalidation";

interface DeletePermissionParams {
  id: string;
}

/**
 * Mutation para excluir um papel/permissão RBAC.
 * Invalida a query `rbac-roles` após sucesso.
 */
export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeletePermissionParams) => deleteRBACRole(id),
    onSuccess: () => {
      invalidateRbacRolesList(queryClient);
    },
  });
}
