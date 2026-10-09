"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRBACRole } from "../services/rbacPermissions.service";
import type { UpdateRBACRoleData } from "../types/permission.types";
import { invalidateRbacRolesList } from "../utils/permissionsRbacQueryInvalidation";

interface UpdatePermissionParams {
  id: string;
  data: UpdateRBACRoleData;
}

/**
 * Mutation para atualizar metadados de um papel/permissão RBAC.
 * Invalida a query `rbac-roles` após sucesso.
 */
export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdatePermissionParams) =>
      updateRBACRole(id, data),
    onSuccess: () => {
      invalidateRbacRolesList(queryClient);
    },
  });
}
