"use client";

/**
 * Página principal de gestão de permissões RBAC.
 */

import { useState, useRef } from "react";
import { addToast } from "@heroui/react";
import { Settings } from "lucide-react";
import { PageTitle } from "@/shared/components/PageTitle";
import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { DrawerFormFooter } from "@/shared/components/DynamicDrawer/DrawerFormFooter";
import { getErrorMessage } from "@/shared/utils/errorParser";
import { usePermission } from "@/shared/hooks/usePermission";
import { usePermissionsStore } from "../store/permissions.store";
import { PermissionsByProductList } from "./PermissionsByProductList";
import { useCreatePermission } from "../hooks/useCreatePermission";
import { useUpdatePermission } from "../hooks/useUpdatePermission";
import { useUpdateRBACRolePermissions } from "../hooks/useUpdateRBACRolePermissions";
import { useDeletePermission } from "../hooks/useDeletePermission";
import { useUpdateRBACRoleStatus } from "../hooks/useUpdateRBACRoleStatus";
import { useUpdatePermissionStatus } from "../hooks/useUpdatePermissionStatus";
import { useRemovePermissionFromRole } from "../hooks/useRemovePermissionFromRole";
import { PermissionForm, type PermissionFormRef } from "./PermissionForm";
import { DeletePermissionModal } from "./DeletePermissionModal";
import { LinkedClientsSidebar } from "./LinkedClientsSidebar";
import { getRBACRoleById } from "../services/rbacPermissions.service";
import type { PermissionWithChildren, DeleteModalType, RBACPermissions, RBACPermissionGroup } from "../types/permission.types";
import { getPermissionPath } from "@/shared/utils/rbacUtils";
import { createPermissionDeleteCallbacks } from "../utils/permissionDeleteCallbacks.utils";
import { updatePermissionAtPath } from "../utils/permissionTreeMutations.utils";
import {
  onPermissionFormError,
  onPermissionFormSuccess,
  onPermissionStatusError,
  onPermissionStatusSuccess,
} from "../utils/permissionsRbacMutationCallbacks.utils";
import { RBAC_ROLES_PERMISSIONS } from "../constants/rbacRolesPermissions.constants";

/**
 * Página principal de gestão de permissões RBAC por produto.
 */
export function PermissionsRBACPage() {
  const [isStatusToggleLoading, setIsStatusToggleLoading] = useState<string | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const formRef = useRef<PermissionFormRef>(null);
  const { can } = usePermission();

  const {
    isFormDrawerOpen,
    isLinkedClientsDrawerOpen,
    editingPermission,
    parentPermission,
    deleteModalState,
    openFormDrawer,
    closeFormDrawer,
    openLinkedClientsDrawer,
    closeLinkedClientsDrawer,
    openDeleteModal,
    closeDeleteModal,
    contextProductId,
    contextProductName,
    linkedClientsContext,
  } = usePermissionsStore();

  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const updateRolePermissions = useUpdateRBACRolePermissions();
  const deletePermission = useDeletePermission();
  const patchStatus = useUpdateRBACRoleStatus();
  const updatePermissionStatus = useUpdatePermissionStatus();
  const removePermissionFromRole = useRemovePermissionFromRole();

  const handleCreatePermissionForProduct = (productId: string, productName: string) => {
    if (!can(RBAC_ROLES_PERMISSIONS.createRole)) return;
    openFormDrawer(undefined, undefined, productId, productName);
  };

  const handleCreateChildPermission = (permission: PermissionWithChildren) => {
    if (!can(RBAC_ROLES_PERMISSIONS.createChildRole)) return;
    openFormDrawer(undefined, permission);
  };

  const handleEditPermission = (permission: PermissionWithChildren) => {
    if (!can(RBAC_ROLES_PERMISSIONS.updateRole)) return;
    openFormDrawer(permission);
  };

  const handleDeletePermission = (permission: PermissionWithChildren) => {
    if (!can(RBAC_ROLES_PERMISSIONS.deleteRole)) return;

    let modalType: DeleteModalType = "simple";

    if (permission.hasLinkedUsers) {
      modalType = "hasLinks";
    } else if (permission.hasChildren) {
      modalType = "withChildren";
    }

    openDeleteModal(permission, modalType);
  };

  const handleViewLinkedClients = (permission: PermissionWithChildren) => {
    if (!can(RBAC_ROLES_PERMISSIONS.access)) return;
    openLinkedClientsDrawer(permission);
  };

  /** Eye no nível produto é N/A (sempre desabilitado); no-op se chamado. */
  const handleViewLinkedClientsForProduct = (_productId: string) => {};

  const handleFormSubmit = async (data: {
    name: string;
    internalName: string;
    description: string;
  }) => {
    const requiredPermission = editingPermission
      ? RBAC_ROLES_PERMISSIONS.updateRole
      : parentPermission
        ? RBAC_ROLES_PERMISSIONS.createChildRole
        : RBAC_ROLES_PERMISSIONS.createRole;

    if (!can(requiredPermission)) return;

    setIsFormSubmitting(true);
    try {
      if (editingPermission) {
        const idParts = String(editingPermission.id).split(":");
        const [roleId] = idParts;
        const role = await getRBACRoleById(roleId);

        if (idParts.length === 1) {
          // Root Role: Direct update of Role properties
          updatePermission.mutate(
            {
              id: roleId,
              data: {
                name: data.name,
                description: data.description,
              },
            },
            {
              onSuccess: onPermissionFormSuccess(
                closeFormDrawer,
                "Permissão atualizada com sucesso!",
              ),
              onError: onPermissionFormError(
                "Erro ao atualizar permissão",
                "Não foi possível atualizar. Tente novamente.",
              ),
            }
          );
        } else {
          // Child Permission: Update within the permissions tree
          const updatedPermissions = { ...role.permissions };
          updatePermissionAtPath(updatedPermissions, idParts, data, true);

          updateRolePermissions.mutate(
            {
              id: roleId,
              data: {
                permissions: updatedPermissions,
              },
            },
            {
              onSuccess: onPermissionFormSuccess(
                closeFormDrawer,
                "Permissão atualizada com sucesso!",
              ),
              onError: onPermissionFormError(
                "Erro ao atualizar permissão",
                "Não foi possível atualizar. Tente novamente.",
              ),
            }
          );
        }
      } else if (parentPermission) {
        const idParts = String(parentPermission.id).split(":");
        const [roleId] = idParts;
        const role = await getRBACRoleById(roleId);
        const updatedPermissions = { ...role.permissions };

        updatePermissionAtPath(updatedPermissions, idParts, data, false);

        updateRolePermissions.mutate(
          {
            id: roleId,
            data: {
              permissions: updatedPermissions,
            },
          },
          {
            onSuccess: onPermissionFormSuccess(
              closeFormDrawer,
              "Permissão criada com sucesso!",
            ),
            onError: onPermissionFormError(
              "Erro ao criar permissão",
              "Não foi possível criar a permissão filha. Tente novamente.",
            ),
          }
        );
      } else if (contextProductId) {
        createPermission.mutate(
          {
            productId: contextProductId,
            name: data.name,
            internalName: data.internalName,
            description: data.description,
            permissions: {},
            isActive: true,
          },
          {
            onSuccess: onPermissionFormSuccess(
              closeFormDrawer,
              "Permissão criada com sucesso!",
            ),
            onError: onPermissionFormError(
              "Erro ao criar permissão",
              "Não foi possível criar a permissão. Tente novamente.",
            ),
          }
        );
      } else {
        addToast({
          title: "Produto não selecionado",
          description: "Cadastre a permissão a partir da linha de um produto.",
          color: "warning",
        });
      }
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const setStatusRecursive = (group: RBACPermissionGroup, isActive: boolean) => {
    group.is_active = isActive;
    // Cascade to children only when disabling
    if (!isActive && group.items_active && Array.isArray(group.items_active)) {
      group.items_active.forEach((itemMap: RBACPermissions) => {
        Object.values(itemMap).forEach((subGroup) => {
          setStatusRecursive(subGroup, false);
        });
      });
    }
  };

  const handleToggleStatus = async (permission: PermissionWithChildren, isActive: boolean) => {
    if (!can(RBAC_ROLES_PERMISSIONS.toggleRole)) return;

    const idParts = String(permission.id).split(":");
    const [roleId] = idParts;
    
    setIsStatusToggleLoading(permission.id);
    try {
      await getRBACRoleById(roleId);

      if (idParts.length === 1) {
        // Root Role: Use the PATCH endpoint with isActive in the body
        patchStatus.mutate(
          { roleId, isActive },
          {
            onSuccess: onPermissionStatusSuccess(() => setIsStatusToggleLoading(null)),
            onError: onPermissionStatusError(
              () => setIsStatusToggleLoading(null),
              "Não foi possível atualizar o status. Tente novamente.",
            ),
          }
        );
      } else {
        // Child Permission: Use the granular PATCH endpoint
        updatePermissionStatus.mutate(
          {
            roleId,
            permissionPath: getPermissionPath(permission.id),
            isActive,
          },
          {
            onSuccess: onPermissionStatusSuccess(() => setIsStatusToggleLoading(null)),
            onError: onPermissionStatusError(
              () => setIsStatusToggleLoading(null),
              "Não foi possível atualizar o status. Tente novamente.",
            ),
          }
        );
      }
    } catch (err) {
      setIsStatusToggleLoading(null);
      addToast({
        title: "Erro ao carregar papel",
        description: getErrorMessage(err as any, "Não foi possível obter os dados do papel."),
        color: "danger",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!can(RBAC_ROLES_PERMISSIONS.deleteRole)) return;

    if (deleteModalState.permission) {
      const idParts = String(deleteModalState.permission.id).split(":");
      const [roleId] = idParts;

      if (idParts.length === 1) {
        deletePermission.mutate(
          { id: roleId },
          createPermissionDeleteCallbacks(closeDeleteModal),
        );
      } else {
        removePermissionFromRole.mutate(
          {
            roleId,
            permissionPath: getPermissionPath(deleteModalState.permission.id),
          },
          createPermissionDeleteCallbacks(
            closeDeleteModal,
            "Não foi possível excluir a permissão filha. Tente novamente.",
          ),
        );
      }
    }
  };

  return (
    <div className="size-full p-6 space-y-6">
      <PageTitle icon={<Settings />} label="Permissões RBAC" />

      <PermissionsByProductList
        onCreatePermissionForProduct={handleCreatePermissionForProduct}
        onViewLinkedClientsForProduct={handleViewLinkedClientsForProduct}
        onCreateChild={handleCreateChildPermission}
        onEdit={handleEditPermission}
        onDelete={handleDeletePermission}
        onViewLinkedClients={handleViewLinkedClients}
        onToggleStatus={handleToggleStatus}
        isStatusToggleLoading={isStatusToggleLoading}
      />

      {/* Form Drawer */}
      <DynamicDrawer
        size="md"
        title={
          editingPermission
            ? "Editar permissão"
            : parentPermission
              ? "Nova permissão filha"
              : "Nova permissão"
        }
        isOpen={isFormDrawerOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeFormDrawer();
          }
        }}
        component={
          <PermissionForm
            ref={formRef}
            permission={editingPermission || undefined}
            parentPermission={parentPermission || undefined}
            contextProductName={contextProductName}
            isRootRole={
              Boolean((contextProductId) && !parentPermission && !editingPermission) ||
              Boolean((editingPermission) && !String(editingPermission.id).includes(":"))
            }
            onSubmit={handleFormSubmit}
            onCancel={closeFormDrawer}
            isDisabled={isFormSubmitting || createPermission.isPending || updatePermission.isPending || updateRolePermissions.isPending}
          />
        }
        footer={
          <DrawerFormFooter
            onCancel={closeFormDrawer}
            onSave={() => formRef.current?.submit()}
            isLoading={
              isFormSubmitting ||
              createPermission.isPending ||
              updatePermission.isPending ||
              updateRolePermissions.isPending
            }
          />
        }
      />

      {/* Linked Clients Drawer */}
      <DynamicDrawer
        size="lg"
        title={linkedClientsContext?.title ?? "Clientes vinculados"}
        isOpen={isLinkedClientsDrawerOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeLinkedClientsDrawer();
          }
        }}
        component={
          <LinkedClientsSidebar
            key={
              linkedClientsContext
                ? `${linkedClientsContext.roleId}:${linkedClientsContext.segment}`
                : "closed"
            }
            context={linkedClientsContext}
          />
        }
      />

      {/* Delete Modal */}
      <DeletePermissionModal
        isOpen={deleteModalState.isOpen}
        onClose={closeDeleteModal}
        permission={deleteModalState.permission}
        type={deleteModalState.type}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
