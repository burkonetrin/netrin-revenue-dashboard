import type { PaginationInfo } from "@/shared/types/pagination.types";

/** Produto de origem das permissões RBAC. */
export type PermissionType = 'SafePartner' | 'Nucleus';

/** Variante do modal de exclusão conforme vínculos da permissão. */
export type DeleteModalType = 'simple' | 'withChildren' | 'hasLinks';

/** Permissão RBAC exibida na árvore de papéis. */
export interface Permission {
  id: string ;
  name: string;
  internalName: string;
  description: string;
  type: PermissionType;
  isActive: boolean;
  productId?: string;
  isArchived?: boolean;
  createdAt?: string;
  hasChildren: boolean;
  hasLinkedUsers: boolean;
}

/** Permissão com filhos aninhados na hierarquia RBAC. */
export interface PermissionWithChildren extends Permission {
  children?: PermissionWithChildren[];
}

/** Usuário vinculado a uma permissão ou cliente. */
export interface LinkedUser {
  id: string;
  fullName: string;
  email: string;
}

/** Cliente com usuários vinculados a uma permissão. */
export interface LinkedClient {
  id: string;
  name: string;
  users: LinkedUser[];
}

/** Usuário retornado na listagem de clientes vinculados ao papel. */
export interface RoleLinkedUser {
  id: string;
  fullName: string;
  email: string;
}

/** Cliente retornado na listagem de vínculos do papel RBAC. */
export interface RoleLinkedClient {
  id: string;
  name: string;
  users: RoleLinkedUser[];
}

/** Parâmetros de paginação da listagem de clientes vinculados ao papel. */
export interface ListRoleLinkedClientsParams {
  page?: number;
  pageSize?: number;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
}

/** Resposta paginada de clientes vinculados a um papel RBAC. */
export interface PaginatedRoleLinkedClientsResponse {
  data: RoleLinkedClient[];
  pagination: PaginationInfo;
}

/** Contexto exibido no drawer de clientes vinculados ao papel. */
export interface RoleLinkedClientsContext {
  roleId: string;
  segment: string;
  title: string;
}

/** Payload para criação de papel/permissão RBAC. */
export interface CreatePermissionData {
  name: string;
  internalName: string;
  description: string;
  parentId: string | number | null;
  type: PermissionType;
}

/** Payload para atualização dos dados básicos de uma permissão. */
export interface UpdatePermissionData {
  name: string;
  internalName: string;
  description: string;
}

// --- RBAC Role Types ---

/** Grupo de permissões dentro da estrutura hierárquica do papel. */
export interface RBACPermissionGroup {
  name: string;
  is_active: boolean;
  description: string;
  items_active?: RBACPermissions[];
}

/** Mapa de grupos de permissões indexado por chave interna. */
export interface RBACPermissions {
  [key: string]: RBACPermissionGroup;
}

/** Papel RBAC retornado pela API com permissões aninhadas. */
export interface RBACRole {
  id: string;
  productId: string;
  name: string;
  internalName: string;
  description: string;
  permissions: RBACPermissions;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt?: string;
  users: any[];
}

/** Resposta paginada da listagem de papéis RBAC. */
export interface RBACRolesResponse {
  data: RBACRole[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/** Payload para criação de papel RBAC. */
export interface CreateRBACRoleData {
  productId: string;
  name: string;
  internalName: string;
  description: string;
  permissions: RBACPermissions;
  isActive: boolean;
}

/** Payload para atualização dos metadados de um papel RBAC. */
export interface UpdateRBACRoleData {
  name: string;
  description: string;
  isActive?: boolean;
}

/** Payload para atualização da árvore de permissões de um papel. */
export interface UpdateRBACRolePermissionsData {
  permissions: RBACPermissions;
}

/** Payload para ativar ou desativar uma permissão dentro do papel. */
export interface UpdatePermissionStatusData {
  isActive: boolean;
}
