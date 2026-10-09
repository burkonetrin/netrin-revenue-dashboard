"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRBACRole } from "../services/rbacPermissions.service";
import type { CreateRBACRoleData } from "../types/permission.types";
import { invalidateRbacRolesList } from "../utils/permissionsRbacQueryInvalidation";

/**
 * Mutation para criar um novo papel/permissão RBAC.
 * Invalida a query `rbac-roles` após sucesso.
 */
export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRBACRoleData) => createRBACRole(data),
    onSuccess: () => {
      invalidateRbacRolesList(queryClient);
    },
  });
}
