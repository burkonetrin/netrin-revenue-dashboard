"use client";

import { addToast } from "@heroui/react";
import { create } from "zustand";
import type {
  Permission,
  DeleteModalType,
  RoleLinkedClientsContext,
} from "../types/permission.types";
import {
  canViewRoleLinkedClients,
  getRoleLinkedClientsParams,
} from "../utils/roleLinkedClients.utils";

interface PermissionsStore {
  isFormDrawerOpen: boolean;
  isLinkedClientsDrawerOpen: boolean;
  editingPermission: Permission | null;
  parentPermission: Permission | null;
  contextProductId: string | null;
  contextProductName: string | null;
  linkedClientsContext: RoleLinkedClientsContext | null;
  deleteModalState: {
    isOpen: boolean;
    permission: Permission | null;
    type: DeleteModalType;
  };
  openFormDrawer: (
    permission?: Permission,
    parent?: Permission,
    productId?: string,
    productName?: string,
  ) => void;
  closeFormDrawer: () => void;
  openLinkedClientsDrawer: (permission: Permission) => void;
  openLinkedClientsDrawerForProduct: (productId: string) => void;
  closeLinkedClientsDrawer: () => void;
  openDeleteModal: (permission: Permission, type: DeleteModalType) => void;
  closeDeleteModal: () => void;
}

/**
 * Store Zustand da tela de permissões RBAC (drawers, modais e contexto de edição).
 */
export const usePermissionsStore = create<PermissionsStore>((set) => ({
  isFormDrawerOpen: false,
  isLinkedClientsDrawerOpen: false,
  editingPermission: null,
  parentPermission: null,
  contextProductId: null,
  contextProductName: null,
  linkedClientsContext: null,
  deleteModalState: {
    isOpen: false,
    permission: null,
    type: "simple",
  },
  openFormDrawer: (permission, parent, productId, productName) =>
    set({
      isFormDrawerOpen: true,
      editingPermission: permission || null,
      parentPermission: parent || null,
      contextProductId: productId ?? null,
      contextProductName: productName ?? null,
    }),
  closeFormDrawer: () =>
    set({
      isFormDrawerOpen: false,
      editingPermission: null,
      parentPermission: null,
      contextProductId: null,
      contextProductName: null,
    }),
  openLinkedClientsDrawer: (permission) => {
    if (!canViewRoleLinkedClients(permission)) return;

    const { roleId, segment } = getRoleLinkedClientsParams(permission);
    set({
      isLinkedClientsDrawerOpen: true,
      linkedClientsContext: {
        roleId,
        segment,
        title: permission.name,
      },
    });
  },
  openLinkedClientsDrawerForProduct: () => {
    addToast({
      title: "Indisponível",
      description:
        "A visualização de clientes vinculados não está disponível no nível do produto.",
      color: "warning",
    });
  },
  closeLinkedClientsDrawer: () =>
    set({
      isLinkedClientsDrawerOpen: false,
      linkedClientsContext: null,
    }),
  openDeleteModal: (permission, type) =>
    set({
      deleteModalState: {
        isOpen: true,
        permission,
        type,
      },
    }),
  closeDeleteModal: () =>
    set({
      deleteModalState: {
        isOpen: false,
        permission: null,
        type: "simple",
      },
    }),
}));
