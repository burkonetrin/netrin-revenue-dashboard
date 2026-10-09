"use client";

import { useMemo } from "react";
import { LinkedClientsSidebarPanel } from "@/shared/components/rbac/LinkedClientsSidebarPanel";
import { sortLinkedClientsUsers } from "@/shared/utils/sortLinkedClientsUsers";
import { useRoleLinkedClients } from "../hooks/useLinkedClients";
import type { RoleLinkedClientsContext } from "../types/permission.types";

interface LinkedClientsSidebarProps {
  context: RoleLinkedClientsContext | null;
}

/**
 * Painel lateral com clientes e usuários vinculados a um papel RBAC.
 */
export function LinkedClientsSidebar({ context }: LinkedClientsSidebarProps) {
  const { data, isLoading } = useRoleLinkedClients(
    context?.roleId ?? null,
    context?.segment ?? null,
    {
      page: 1,
      pageSize: 100,
      sortBy: "name",
      sortDirection: "asc",
    },
  );

  const clients = useMemo(
    () => sortLinkedClientsUsers(data?.data ?? []),
    [data?.data],
  );

  return (
    <LinkedClientsSidebarPanel
      clients={clients}
      emptyMessage="Nenhum cliente vinculado a esta permissão"
      isLoading={isLoading}
      showUserEmail
    />
  );
}
