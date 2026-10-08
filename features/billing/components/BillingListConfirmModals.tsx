"use client";

import { ConfirmModal } from "@/shared/components/ConfirmModal";
import type { ReactNode } from "react";

interface BillingBulkCloseConfirmModalProps {
  isOpen: boolean;
  selectedCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function BillingBulkCloseConfirmModal({
  isOpen,
  selectedCount,
  onClose,
  onConfirm,
}: BillingBulkCloseConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Fechar faturas selecionadas"
      description={`${selectedCount} faturas serão fechadas. Deseja prosseguir?`}
      cancelLabel="Cancelar"
      confirmLabel="Fechar faturas"
      onConfirm={onConfirm}
    />
  );
}

interface BillingBillClientsConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  description: ReactNode;
}

export function BillingBillClientsConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  description,
}: BillingBillClientsConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Faturar clientes"
      description={description}
      cancelLabel="Cancelar"
      confirmLabel="Faturar clientes"
      onConfirm={onConfirm}
    />
  );
}

export const BILLING_BILL_SINGLE_CLIENT_DESCRIPTION =
  "Este cliente será faturado e será solicitada a emissão de sua nota fiscal";

interface BillingBillSingleClientConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function BillingBillSingleClientConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: BillingBillSingleClientConfirmModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Faturar cliente"
      description={BILLING_BILL_SINGLE_CLIENT_DESCRIPTION}
      cancelLabel="Cancelar"
      confirmLabel="Faturar cliente"
      onConfirm={onConfirm}
    />
  );
}
