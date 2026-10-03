"use client";

/** Protótipo: todas as permissões liberadas. */
export function usePermission() {
  return {
    rbacPermissions: [] as string[],
    can: (_permission: string, _productKey?: string) => true,
    canAccessRoute: (_pathname: string, _productKey?: string) => true,
  };
}
