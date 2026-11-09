"use client";

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
  MODAL_BODY_CLASS,
  MODAL_FOOTER_BUTTON_CLASS,
  MODAL_TITLE_CLASS,
} from "@/shared/constants/modal.constants";

interface FranchiseDeactivateConfirmModalProps {
  isOpen: boolean;
  competenceLabel: string;
  isLoading?: boolean;
  onClose: () => void;
  onKeepInBilling: () => void;
  onRemoveFromBilling: () => void;
}

/** Confirma inativação da franquia e escolha sobre a competência em aberto. */
export function FranchiseDeactivateConfirmModal({
  isOpen,
  competenceLabel,
  isLoading = false,
  onClose,
  onKeepInBilling,
  onRemoveFromBilling,
}: FranchiseDeactivateConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      classNames={HEROUI_MODAL_CLASS_NAMES}
    >
      <ModalContent>
        <ModalHeader className={`flex flex-col gap-1 ${MODAL_TITLE_CLASS}`}>
          Inativar franquia
        </ModalHeader>
        <ModalBody>
          <p className={`${MODAL_BODY_CLASS} m-0`}>
            Ao inativar esta franquia, deseja removê-la do faturamento da competência{" "}
            {competenceLabel}?
          </p>
        </ModalBody>
        <ModalFooter className="flex w-full flex-row flex-nowrap items-center justify-end gap-2">
          <Button
            variant="light"
            className={MODAL_FOOTER_BUTTON_CLASS}
            onPress={onKeepInBilling}
            isLoading={isLoading}
          >
            Manter no faturamento
          </Button>
          <Button
            color="primary"
            className={MODAL_FOOTER_BUTTON_CLASS}
            onPress={onRemoveFromBilling}
            isLoading={isLoading}
          >
            Remover do faturamento
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
