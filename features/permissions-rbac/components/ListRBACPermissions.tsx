"use client";

/**
 * Listagem hierárquica de permissões RBAC com ações de CRUD e status.
 */

import { useState } from "react";
import { Switch, Chip, Button, Tooltip } from "@heroui/react";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import type { PermissionWithChildren } from "../types/permission.types";
import { canViewRoleLinkedClients } from "../utils/roleLinkedClients.utils";
import { getLastPartOfInternalName } from "../utils/permissionInternalName.utils";
import { PermissionGuard } from "@/shared/components/guards/PermissionGuard";
import { RBACTreeNodeHeader } from "@/shared/components/rbac/RBACTreeNodeHeader";
import { RBAC_ROLES_PERMISSIONS } from "../constants/rbacRolesPermissions.constants";

interface ListRBACPermissionsProps {
  permissions: PermissionWithChildren[];
  onCreateChild: (permission: PermissionWithChildren) => void;
  onEdit: (permission: PermissionWithChildren) => void;
  onDelete: (permission: PermissionWithChildren) => void;
  onViewLinkedClients: (permission: PermissionWithChildren) => void;
  onToggleStatus: (permission: PermissionWithChildren, isActive: boolean) => void;
  isStatusToggleLoading?: string | null;
}

interface PermissionItemProps {
  permission: PermissionWithChildren;
  level?: number;
  onCreateChild: (permission: PermissionWithChildren) => void;
  onEdit: (permission: PermissionWithChildren) => void;
  onDelete: (permission: PermissionWithChildren) => void;
  onViewLinkedClients: (permission: PermissionWithChildren) => void;
  onToggleStatus: (permission: PermissionWithChildren, isActive: boolean) => void;
  isStatusToggleLoading?: string | null;
}

/**
 * Item recursivo da árvore de permissões RBAC.
 */
function PermissionItem({
  permission,
  level = 0,
  onCreateChild,
  onEdit,
  onDelete,
  onViewLinkedClients,
  onToggleStatus,
  isStatusToggleLoading,
}: PermissionItemProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const hasChildren = permission.children && permission.children.length > 0;
  const { isActive } = permission;

  const lastPartOfInternalName = getLastPartOfInternalName(permission.internalName);
  const canViewClients = canViewRoleLinkedClients(permission);

  return (
    <div className="w-full">
      <RBACTreeNodeHeader
        level={level}
        hasChildren={Boolean(hasChildren)}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        isActive={isActive}
        name={permission.name}
        codeLabel={lastPartOfInternalName}
        actions={
          <>
          <PermissionGuard permission={RBAC_ROLES_PERMISSIONS.createChildRole}>
            <Button
              size="sm"
              variant="light"
              startContent={<Plus size={14} />}
              onPress={() => onCreateChild(permission)}
              className="text-xs"
              isDisabled={Boolean(isStatusToggleLoading)}
            >
              Cadastrar permissão filha
            </Button>
          </PermissionGuard>

          <Tooltip
            content={
              canViewClients
                ? "Ver clientes vinculados"
                : "Indisponível para a role raiz"
            }
          >
            <span>
              <PermissionGuard permission={RBAC_ROLES_PERMISSIONS.access}>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  aria-label="Ver clientes vinculados"
                  onPress={() => onViewLinkedClients(permission)}
                  isDisabled={Boolean(isStatusToggleLoading) || !canViewClients}
                >
                  <Eye size={16} className="text-gray-600" />
                </Button>
              </PermissionGuard>
            </span>
          </Tooltip>
          <Tooltip content="Editar">
            <PermissionGuard permission={RBAC_ROLES_PERMISSIONS.updateRole}>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                aria-label="Editar"
                onPress={() => onEdit(permission)}
                isDisabled={Boolean(isStatusToggleLoading)}
              >
                <Edit size={16} className="text-gray-600" />
              </Button>
            </PermissionGuard>
          </Tooltip>
          <Tooltip content="Excluir">
            <PermissionGuard permission={RBAC_ROLES_PERMISSIONS.deleteRole}>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                aria-label="Excluir"
                onPress={() => onDelete(permission)}
                className="text-danger"
                isDisabled={Boolean(isStatusToggleLoading)}
              >
                <Trash2 size={16} className="text-danger" />
              </Button>
            </PermissionGuard>
          </Tooltip>

          {/* Status Chip */}
          <Chip
            size="sm"
            variant="flat"
            color={isActive ? "success" : "default"}
            className={
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }
          >
            {isActive ? "Ativo" : "Inativo"}
          </Chip>

          <PermissionGuard permission={RBAC_ROLES_PERMISSIONS.toggleRole}>
            <Switch
              size="sm"
              isSelected={isActive}
              isDisabled={isStatusToggleLoading === permission.id}
              onValueChange={(value) => {
                onToggleStatus(permission, value);
              }}
            />
          </PermissionGuard>
          </>
        }
      />

      {/* Children Permissions */}
      {isExpanded && hasChildren && (
        <div className="mt-2 space-y-2">
          {permission.children?.map((child) => (
            <PermissionItem
              key={child.id}
              permission={child}
              level={level + 1}
              onCreateChild={onCreateChild}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewLinkedClients={onViewLinkedClients}
              onToggleStatus={onToggleStatus}
              isStatusToggleLoading={isStatusToggleLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Lista recursiva de permissões RBAC com toggle de status e ações inline.
 */
export function ListRBACPermissions({
  permissions,
  onCreateChild,
  onEdit,
  onDelete,
  onViewLinkedClients,
  onToggleStatus,
  isStatusToggleLoading,
}: ListRBACPermissionsProps) {
  if (permissions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Nenhuma permissão cadastrada
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {permissions.map((permission) => (
        <PermissionItem
          key={permission.id}
          permission={permission}
          onCreateChild={onCreateChild}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewLinkedClients={onViewLinkedClients}
          onToggleStatus={onToggleStatus}
          isStatusToggleLoading={isStatusToggleLoading}
        />
      ))}
    </div>
  );
}
