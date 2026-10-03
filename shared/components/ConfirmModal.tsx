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
import {
  HEROUI_MODAL_CLASS_NAMES,
  MODAL_FOOTER_BUTTON_CLASS,
  MODAL_TITLE_CLASS,
} from "@/shared/constants/modal.constants";

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
    <Modal isOpen={isOpen} onClose={onClose} size="md" classNames={HEROUI_MODAL_CLASS_NAMES}>
      <ModalContent>
        <ModalHeader className={`flex flex-col gap-1 ${MODAL_TITLE_CLASS}`}>{title}</ModalHeader>
        <ModalBody>{description}</ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            className={MODAL_FOOTER_BUTTON_CLASS}
            onPress={onClose}
            isDisabled={isConfirmLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            color="primary"
            className={MODAL_FOOTER_BUTTON_CLASS}
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
