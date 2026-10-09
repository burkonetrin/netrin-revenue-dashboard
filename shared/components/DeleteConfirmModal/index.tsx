"use client";

/**
 * Modal reutilizável de confirmação de exclusão com feedback via toast.
 */

import { useState, type ReactNode } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  addToast,
} from "@heroui/react";

/**
 * Propriedades do modal de confirmação de exclusão.
 */
export interface DeleteConfirmModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  record: T | null;
  getRecordLabel: (record: T) => string;
  entityLabel: string;
  onConfirm: (record: T) => Promise<void>;
  /** Substitui o texto padrão do corpo do modal */
  description?: ReactNode;
  /** Rótulo do botão de confirmação (padrão: "Excluir") */
  confirmLabel?: string;
  /** Exibe toast de sucesso após confirmar (padrão: true) */
  showSuccessToast?: boolean;
}

/**
 * Modal reutilizável para confirmar exclusão de um registro com feedback de sucesso ou erro.
 */
export function DeleteConfirmModal<T>({
  isOpen,
  onClose,
  record,
  getRecordLabel,
  entityLabel,
  onConfirm,
  description,
  confirmLabel = "Excluir",
  showSuccessToast = true,
}: DeleteConfirmModalProps<T>) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!record) return;
    setIsDeleting(true);
    try {
      await onConfirm(record);
      if (showSuccessToast) {
        addToast({
          title: "Excluído com sucesso!",
          color: "success",
        });
      }
      onClose();
    } catch {
      addToast({
        title: "Erro ao excluir. Tente novamente.",
        color: "danger",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!record) return null;

  const recordLabel = getRecordLabel(record);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Excluir {entityLabel}
        </ModalHeader>
        <ModalBody>
          {description ?? (
            <p>
              Tem certeza que deseja excluir <strong>{recordLabel}</strong>? Esta
              ação não pode ser desfeita.
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            color="danger"
            onPress={handleConfirm}
            isLoading={isDeleting}
          >
            {isDeleting ? "" : confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
