"use client";

import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { getErrorMessage } from "@/shared/utils/errorParser";
import {
  providerDrawerFooterClass,
  providerDrawerPrimaryButtonClass,
  providerDrawerSecondaryButtonClass,
} from "@/features/providers/utils/providersTableColumns.shared";
import { Button, addToast } from "@heroui/react";
import { useRef, useState } from "react";
import {
  type PrepaidCompetenceSubmissionInput,
  usePrepaidCompetenceSubmission,
} from "../hooks/usePrepaidCompetenceSubmission";
import { createProviderInvoiceCompetence } from "../services/providerInvoices.service";
import type {
  CreateProviderInvoiceCompetenceRequest,
  ProviderInvoiceResponse,
} from "../types/providerInvoices.types";
import {
  type ProviderInvoiceVariantInput,
  resolveProviderInvoiceVariant,
} from "../utils/providerInvoiceVariant.utils";
import {
  DirectPrepaidCompetenceForm,
  type DirectPrepaidCompetenceFormHandle,
} from "./DirectPrepaidCompetenceForm";
import {
  IndirectPrepaidCompetenceForm,
  type IndirectPrepaidCompetenceFormHandle,
} from "./IndirectPrepaidCompetenceForm";

export interface ProviderPrepaidCompetenceDrawerProps {
  providerId: string;
  provider?: ProviderInvoiceVariantInput;
  editingCompetence?: ProviderInvoiceResponse;
  isReadOnly?: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess?: () => void;
}

/** Shared prepaid competence drawer with explicit provider variant resolution. */
export function ProviderPrepaidCompetenceDrawer({
  providerId,
  provider,
  editingCompetence,
  isReadOnly = false,
  isOpen,
  onOpenChange,
  onSuccess,
}: ProviderPrepaidCompetenceDrawerProps) {
  const formRef = useRef<IndirectPrepaidCompetenceFormHandle>(null);
  const directFormRef = useRef<DirectPrepaidCompetenceFormHandle>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editSubmission = usePrepaidCompetenceSubmission(providerId);
  if (!isOpen) return null;
  const resolution = resolveProviderInvoiceVariant(provider);
  const isIndirect = resolution.status === "valid" && resolution.variant === "indirect-prepaid";
  const isDirect = resolution.status === "valid" && resolution.variant === "direct-prepaid";
  const isPersistedCompetence = Boolean(editingCompetence);
  const isEditableCompetence = editingCompetence?.isOpen === true;
  const drawerIsReadOnly = isReadOnly || (isPersistedCompetence && !isEditableCompetence);
  const isBusy = isSubmitting || editSubmission.isSubmitting;
  const errorMessage = error ?? (editSubmission.error ? getErrorMessage(editSubmission.error as never) : null);

  const getEditInput = (): PrepaidCompetenceSubmissionInput | null => {
    if (!editingCompetence) return null;

    if (isIndirect) {
      const intent = formRef.current?.getSubmissionInput();
      if (!intent) return null;
      return {
        invoiceId: editingCompetence.id,
        payload: {
          competenceMonth: intent.competenceMonth,
          assessmentStartDate: intent.assessmentStartDate,
          assessmentEndDate: intent.assessmentEndDate,
          startingBalance: intent.startingBalance,
          minimumFranchiseValue: intent.minimumFranchiseValue,
          sources: intent.sources,
        },
        draft: {
          creditDeposits: intent.creditDeposits,
          isMonthClosed: intent.isMonthClosed ?? false,
          endingBalance:
            intent.isMonthClosed && intent.endingBalance !== null && intent.endingBalance !== undefined
              ? String(intent.endingBalance)
              : null,
        },
        persistedDepositIds: (editingCompetence.creditDeposits ?? []).map((deposit) => deposit.id),
      };
    }

    if (isDirect) {
      const intent = directFormRef.current?.getSubmissionIntent();
      if (!intent) return null;
      return {
        invoiceId: editingCompetence.id,
        payload: {
          competenceMonth: intent.competenceMonth,
          assessmentStartDate: intent.assessmentStartDate,
          assessmentEndDate: intent.assessmentEndDate,
          startingBalance: intent.startingBalance,
          minimumFranchiseValue: intent.minimumFranchiseValue,
          sources: intent.sources.map((source) => ({
            dataSourceProviderId: source.dataSourceProviderId,
            providerChargedQuantity: source.providerChargedQuantity,
            unitCost: source.unitCost,
            totalCost: source.totalCost,
          })),
        },
        draft: {
          creditDeposits: intent.creditDeposits,
          isMonthClosed: intent.isMonthClosed,
          endingBalance: intent.isMonthClosed ? (intent.endingBalance ?? null) : null,
        },
        persistedDepositIds: (editingCompetence.creditDeposits ?? []).map((deposit) => deposit.id),
      };
    }

    return null;
  };

  const completeSuccess = (title: string) => {
    addToast({ title, color: "success" });
    onSuccess?.();
    onOpenChange(false);
  };

  const reportSubmissionError = (message: string) => {
    setError(message);
    addToast({
      title: "Não foi possível salvar a competência",
      description: message,
      color: "danger",
    });
  };

  const retryEdit = async () => {
    setError(null);
    const outcome = await editSubmission.retry();
    if (outcome.status === "success") {
      completeSuccess("Competência atualizada com sucesso");
    } else if (outcome.status !== "duplicate") {
      reportSubmissionError(getErrorMessage(outcome.error as never));
    }
  };

  const submit = async () => {
    if (isBusy || drawerIsReadOnly) return;

    if (isPersistedCompetence) {
      if (editSubmission.status === "error") {
        await retryEdit();
        return;
      }

      const input = getEditInput();
      if (!input) return;
      setError(null);
      const outcome = await editSubmission.submit(input);
      if (outcome.status === "success") {
        completeSuccess("Competência atualizada com sucesso");
      } else if (outcome.status !== "duplicate") {
        reportSubmissionError(getErrorMessage(outcome.error as never));
      }
      return;
    }

    let payload: CreateProviderInvoiceCompetenceRequest | null = null;

    if (isIndirect) {
      payload = formRef.current?.getSubmissionInput() ?? null;
    }

    if (isDirect) {
      const intent = directFormRef.current?.getSubmissionIntent();
      if (intent) {
        payload = {
          competenceMonth: intent.competenceMonth,
          assessmentStartDate: intent.assessmentStartDate,
          assessmentEndDate: intent.assessmentEndDate,
          startingBalance: intent.startingBalance,
          creditDeposits: intent.creditDeposits,
          isMonthClosed: intent.isMonthClosed,
          ...(intent.endingBalance ? { endingBalance: intent.endingBalance } : {}),
          minimumFranchiseValue: intent.minimumFranchiseValue,
          sources: intent.sources.map((source) => ({
            dataSourceProviderId: source.dataSourceProviderId,
            providerChargedQuantity: source.providerChargedQuantity,
            unitCost: source.unitCost,
            totalCost: source.totalCost,
          })),
        };
      }
    }

    if (!payload) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createProviderInvoiceCompetence(providerId, payload);
      completeSuccess("Competência criada com sucesso");
    } catch (cause) {
      reportSubmissionError(getErrorMessage(cause as never));
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <DynamicDrawer
      title={
        isReadOnly
          ? "Visualizar competência"
          : isPersistedCompetence && !drawerIsReadOnly
            ? "Editar competência"
            : isPersistedCompetence
              ? "Visualizar competência"
              : "Apuração de consumo"
      }
      isOpen
      onOpenChange={onOpenChange}
      isDismissable={false}
      isKeyboardDismissDisabled
      size="5xl"
      classNames={{
        base: "w-[min(846px,100vw)] max-w-[846px]",
        body: "flex-1! mb-0 overflow-y-auto",
      }}
      component={
        <div className="space-y-4">
          {errorMessage && (
            <p role="alert" className="text-sm text-danger-500">
              {errorMessage}
            </p>
          )}
          {isIndirect && (
            <IndirectPrepaidCompetenceForm
              ref={formRef}
              providerId={providerId}
              editingCompetence={editingCompetence}
              isDisabled={drawerIsReadOnly || isBusy}
            />
          )}
          {isDirect && (
            <DirectPrepaidCompetenceForm
              ref={directFormRef}
              providerId={providerId}
              editingCompetence={editingCompetence}
              isDisabled={drawerIsReadOnly || isBusy}
            />
          )}
          {!isIndirect && !isDirect && (
            <p role="alert" className="text-sm text-danger-500">
              Não foi possível identificar o tipo de fornecedor.
            </p>
          )}
        </div>
      }
      footer={
        <div className={providerDrawerFooterClass}>
          <Button
            variant="light"
            onPress={() => onOpenChange(false)}
            isDisabled={isBusy}
            className={providerDrawerSecondaryButtonClass}
          >
            {drawerIsReadOnly ? "Fechar" : "Cancelar"}
          </Button>
          {isPersistedCompetence && editSubmission.status === "error" && (
            <Button
              variant="light"
              onPress={retryEdit}
              isDisabled={isBusy}
              className={providerDrawerSecondaryButtonClass}
            >
              Reenviar
            </Button>
          )}
          {!drawerIsReadOnly && (
            <Button
              color="primary"
              onPress={submit}
              isLoading={isBusy}
              isDisabled={isBusy || (!isIndirect && !isDirect)}
              className={providerDrawerPrimaryButtonClass}
            >
              {isPersistedCompetence ? "Salvar alterações" : "Salvar"}
            </Button>
          )}
        </div>
      }
    />
  );
}
