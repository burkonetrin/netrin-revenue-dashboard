"use client";

import type { ReactNode } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: ReactNode;
  cancelLabel?: string;
  confirmLabel: string;
  onConfirm: () => void;
  isConfirmLoading?: boolean;
}

/** Modal de confirmação genérico (padrão Nucleus). */
export function ConfirmModal({
  isOpen,
  onClose,
  title,
  description,
  cancelLabel = "Cancelar",
  confirmLabel,
  onConfirm,
  isConfirmLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
        <ModalBody>{description}</ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={isConfirmLoading}>
            {cancelLabel}
          </Button>
          <Button
            color="primary"
            onPress={onConfirm}
            isLoading={isConfirmLoading}
          >
            {isConfirmLoading ? "" : confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
