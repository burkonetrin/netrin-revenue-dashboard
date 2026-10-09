"use client";

import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ErrorResponse } from "@/shared/utils/errorParser";
import { getRoleLinkedClients } from "../services/rbacPermissions.service";
import type {
  ListRoleLinkedClientsParams,
  PaginatedRoleLinkedClientsResponse,
} from "../types/permission.types";

/**
 * Busca clientes vinculados a um papel RBAC e segmento de permissão.
 *
 * @param roleId - ID do papel RBAC
 * @param segment - Segmento interno da permissão
 * @param params - Parâmetros de paginação e ordenação
 * @returns Query com clientes e usuários vinculados
 */
export function useRoleLinkedClients(
  roleId: string | null,
  segment: string | null,
  params?: ListRoleLinkedClientsParams,
) {
  return useQuery<PaginatedRoleLinkedClientsResponse, AxiosError<ErrorResponse>>({
    queryKey: ["rbac-role-linked-clients", roleId, segment, params],
    queryFn: () => getRoleLinkedClients(roleId!, segment!, params),
    enabled: Boolean(roleId) && Boolean(segment),
    staleTime: 60 * 1000,
  });
}
