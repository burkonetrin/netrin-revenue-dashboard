import type { QueryClient } from "@tanstack/react-query";

export const RBAC_ROLES_LIST_KEY = ["rbac-roles"] as const;

export function invalidateRbacRolesList(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: RBAC_ROLES_LIST_KEY });
}
