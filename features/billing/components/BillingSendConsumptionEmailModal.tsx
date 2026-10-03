"use client";

/**
 * Modal para envio do detalhamento de consumo por e-mail.
 */

import { getErrorMessage } from "@/shared/utils/errorParser";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  addToast,
} from "@heroui/react";
import { isAxiosError } from "axios";
import { useState } from "react";
import {
  type BillingConsumptionEmailSource,
  sendConsumptionEmail,
} from "../services/billing-consumption-email.service";
import {
  HEROUI_MODAL_CLASS_NAMES,
  MODAL_BODY_MUTED_CLASS,
  MODAL_FOOTER_BUTTON_CLASS,
  MODAL_TITLE_CLASS,
} from "@/shared/constants/modal.constants";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface BillingSendConsumptionEmailModalProps {
  isOpen: boolean;
  franchiseName: string | null;
  source: BillingConsumptionEmailSource;
  billingId: string;
  billingItemId: string | null;
  onClose: () => void;
}

/**
 * Modal para envio de e-mail de consumo de faturamento.
 */
export function BillingSendConsumptionEmailModal({
  isOpen,
  franchiseName,
  source,
  billingId,
  billingItemId,
  onClose,
}: BillingSendConsumptionEmailModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const resetAndClose = () => {
    setEmail("");
    setError(null);
    onClose();
  };

  const handleClose = () => {
    if (isSending) return;
    resetAndClose();
  };

  const handleSend = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("E-mail é obrigatório");
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Informe um e-mail válido");
      return;
    }

    if (!billingItemId) {
      addToast({
        title: "Item da franquia indisponível para envio.",
        color: "danger",
        timeout: 4000,
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    setIsSending(true);
    try {
      await sendConsumptionEmail({
        source,
        billingId,
        itemId: billingItemId,
        email: trimmedEmail,
      });
      addToast({
        title: "E-mail enviado",
        color: "success",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
      resetAndClose();
    } catch (err) {
      const fallback = "Não foi possível enviar o e-mail.";
      addToast({
        title: getErrorMessage(isAxiosError(err) ? err : null, fallback) || fallback,
        color: "danger",
        timeout: 4000,
        shouldShowTimeoutProgress: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      isDismissable={!isSending}
      hideCloseButton={isSending}
      classNames={HEROUI_MODAL_CLASS_NAMES}
    >
      <ModalContent>
        <ModalHeader className={`flex flex-col gap-1 ${MODAL_TITLE_CLASS}`}>
          Enviar consumo
        </ModalHeader>
        <ModalBody>
          <p className={`${MODAL_BODY_MUTED_CLASS} m-0`}>
            Envie o detalhamento de consumo da franquia <strong>{franchiseName ?? ""}</strong> para
            o e-mail informado.
          </p>
          <Input
            type="email"
            label="E-mail"
            placeholder="exemplo@empresa.com.br"
            value={email}
            isRequired
            isInvalid={Boolean(error)}
            errorMessage={error ?? undefined}
            onValueChange={(value) => {
              setEmail(value);
              if (error) setError(null);
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            className={MODAL_FOOTER_BUTTON_CLASS}
            onPress={handleClose}
            isDisabled={isSending}
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            className={MODAL_FOOTER_BUTTON_CLASS}
            onPress={handleSend}
            isLoading={isSending}
          >
            Enviar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
