"use client";

/**
 * Modal de confirmação de exclusão de permissão RBAC.
 */

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import type { Permission, DeleteModalType } from "../types/permission.types";

interface DeletePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null;
  type: DeleteModalType;
  onConfirm: () => void;
}

const DELETE_MODAL_COPY: Record<
  Exclude<DeleteModalType, "hasLinks">,
  { title: string; body: string }
> = {
  simple: {
    title: "Excluir Permissão",
    body: "Deseja realmente excluir esta permissão?",
  },
  withChildren: {
    title: "Excluir Permissão",
    body: "Ao excluir esta permissão, todas as suas permissões filhas serão excluídas também.",
  },
};

/**
 * Modal de confirmação de exclusão de permissão com variantes por vínculos.
 */
export function DeletePermissionModal({
  isOpen,
  onClose,
  permission,
  type,
  onConfirm,
}: DeletePermissionModalProps) {
  if (!permission) return null;

  const isBlocked = type === "hasLinks";
  const copy = !isBlocked ? DELETE_MODAL_COPY[type] : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {isBlocked ? "Não é possível excluir" : copy?.title}
        </ModalHeader>
        <ModalBody>
          <p>
            {isBlocked
              ? "Existe ao menos um usuário vinculado a esta permissão. Remova todos os vínculos para poder excluí-la."
              : copy?.body}
          </p>
        </ModalBody>
        <ModalFooter>
          {isBlocked ? (
            <Button color="primary" onPress={onClose}>
              Entendi
            </Button>
          ) : (
            <>
              <Button variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button color="danger" onPress={onConfirm}>
                Excluir permissão
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
