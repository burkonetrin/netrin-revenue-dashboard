"use client";

import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { getErrorMessage } from "@/shared/utils/errorParser";
import {
  providerDrawerFooterClass,
  providerDrawerPrimaryButtonClass,
  providerDrawerSecondaryButtonClass,
} from "@/features/providers/utils/providersTableColumns.shared";
import { Button, addToast } from "@heroui/react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useProviderInvoiceSubmission } from "../hooks/useProviderInvoiceSubmission";
import { useProviderInvoiceUpdateSubmission } from "../hooks/useProviderInvoiceUpdateSubmission";
import type { ProviderInvoiceResponse } from "../types/providerInvoices.types";
import { resolveProviderInvoiceVariant } from "../utils/providerInvoiceVariant.utils";
import {
  DirectPostpaidInvoiceForm,
  type DirectPostpaidInvoiceFormHandle,
} from "./DirectPostpaidInvoiceForm";
import {
  IndirectPostpaidInvoiceForm,
  type IndirectPostpaidInvoiceFormHandle,
} from "./IndirectPostpaidInvoiceForm";

export interface ProviderInvoiceDrawerProvider {
  id?: string;
  providerType?: { value?: string | null } | null;
  isPrepaid?: boolean | null;
}

export interface ProviderInvoiceDrawerProps {
  provider: ProviderInvoiceDrawerProvider | null | undefined;
  editingInvoice?: ProviderInvoiceResponse;
  isReadOnly?: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess?: () => void;
}

interface ProviderInvoiceDrawerContentHandle {
  submit: () => Promise<void>;
}

type ProviderInvoiceFormHandle = {
  getSubmissionInput: IndirectPostpaidInvoiceFormHandle["getSubmissionInput"];
  getSubmissionBlockReason: () => "no-billable-queries" | "incomplete-billable-sources" | null;
};

interface ProviderInvoiceDrawerContentProps {
  providerId: string;
  variant: "indirect-postpaid" | "direct-postpaid";
  editingInvoice?: ProviderInvoiceResponse;
  isReadOnly: boolean;
  onSuccess: () => void;
  onStateChange: (state: { isSubmitting: boolean }) => void;
}

const ProviderInvoiceDrawerContent = forwardRef<
  ProviderInvoiceDrawerContentHandle,
  ProviderInvoiceDrawerContentProps
>(function ProviderInvoiceDrawerContent(
  { providerId, variant, editingInvoice, isReadOnly, onSuccess, onStateChange },
  ref,
) {
  const formRef = useRef<ProviderInvoiceFormHandle>(null);
  const assignIndirectFormRef = (instance: IndirectPostpaidInvoiceFormHandle | null) => {
    formRef.current = instance;
  };
  const assignDirectFormRef = (instance: DirectPostpaidInvoiceFormHandle | null) => {
    formRef.current = instance;
  };
  const createSubmission = useProviderInvoiceSubmission(providerId);
  const updateSubmission = useProviderInvoiceUpdateSubmission(providerId);
  const isEditing = Boolean(editingInvoice);
  const submission = isEditing ? updateSubmission : createSubmission;
  const errorMessage =
    submission.status === "error"
      ? getErrorMessage(
          submission.error as never,
          "Ocorreu um erro ao salvar a fatura. Tente novamente.",
        )
      : null;

  useEffect(() => {
    onStateChange({ isSubmitting: submission.isSubmitting });
  }, [onStateChange, submission.isSubmitting]);

  useEffect(() => {
    if (!errorMessage || !submission.error) return;

    addToast({
      title: "Não foi possível salvar a fatura",
      description: errorMessage,
      color: "danger",
    });
  }, [errorMessage, submission.error]);

  useImperativeHandle(
    ref,
    () => ({
      submit: async () => {
        const input = formRef.current?.getSubmissionInput();
        if (!input) {
          const blockReason = formRef.current?.getSubmissionBlockReason();
          if (blockReason === "no-billable-queries") {
            addToast({
              title: "Não foi possível cadastrar a fatura",
              description: "Não há consultas bilhetadas no período informado.",
              color: "warning",
            });
          } else if (blockReason === "incomplete-billable-sources") {
            addToast({
              title: "Não foi possível cadastrar a fatura",
              description:
                "Informe valores unitário e total válidos para as fontes com consultas bilhetadas.",
              color: "warning",
            });
          }
          return;
        }

        if (editingInvoice) {
          const result =
            submission.status === "error"
              ? await updateSubmission.retry()
              : await updateSubmission.submit({
                  invoiceId: editingInvoice.id,
                  payload: input.payload,
                  invoiceFile: input.invoiceFile,
                });
          if (result.status === "success") onSuccess();
          return;
        }

        const result =
          submission.status === "error"
            ? await createSubmission.retry()
            : await createSubmission.submit(input);
        if (result.status === "success") onSuccess();
      },
    }),
    [createSubmission, editingInvoice, onSuccess, submission.status, updateSubmission],
  );

  return (
    <div className="space-y-5">
      {variant === "direct-postpaid" ? (
        <DirectPostpaidInvoiceForm
          ref={assignDirectFormRef}
          providerId={providerId}
          editingInvoice={editingInvoice}
          isDisabled={isReadOnly || submission.isSubmitting}
        />
      ) : (
        <IndirectPostpaidInvoiceForm
          ref={assignIndirectFormRef}
          providerId={providerId}
          editingInvoice={editingInvoice}
          isDisabled={isReadOnly || submission.isSubmitting}
        />
      )}
    </div>
  );
});

export function ProviderInvoiceDrawer({
  provider,
  editingInvoice,
  isReadOnly = false,
  isOpen,
  onOpenChange,
  onSuccess,
}: ProviderInvoiceDrawerProps) {
  const resolution = resolveProviderInvoiceVariant(provider);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentRef = useRef<ProviderInvoiceDrawerContentHandle>(null);
  const isCurrentVariant =
    resolution.status === "valid" &&
    (resolution.variant === "indirect-postpaid" || resolution.variant === "direct-postpaid");
  const providerId = provider?.id;
  const isEditing = Boolean(editingInvoice) && !isReadOnly;

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmissionStateChange = useCallback(
    (state: { isSubmitting: boolean }) => {
      setIsSubmitting(state.isSubmitting);
    },
    [],
  );

  if (resolution.status === "valid" && !isCurrentVariant) {
    return null;
  }

  if (!isOpen) return null;

  if (!isCurrentVariant || !providerId) {
    return (
      <DynamicDrawer
        title="Nova fatura"
        isOpen
        onOpenChange={onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled
        component={
          <p role="alert" className="text-sm text-danger-600">
            Não foi possível identificar a modalidade do fornecedor para cadastrar a fatura.
          </p>
        }
        footer={
          <div className={providerDrawerFooterClass}>
            <Button
              variant="light"
              onPress={() => onOpenChange(false)}
              className={providerDrawerSecondaryButtonClass}
            >
              Cancelar
            </Button>
          </div>
        }
      />
    );
  }

  const handleSuccess = () => {
    addToast({
      title: isEditing ? "Fatura atualizada com sucesso" : "Fatura criada com sucesso",
      color: "success",
    });
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <DynamicDrawer
      title={isReadOnly ? "Visualizar fatura" : isEditing ? "Editar fatura" : "Nova fatura"}
      isOpen
      onOpenChange={onOpenChange}
      isDismissable={false}
      isKeyboardDismissDisabled
      size="5xl"
      classNames={{
        base: "w-[min(846px,100vw)] max-w-[846px]",
        body: "flex-1! mb-0 overflow-y-auto",
      }}
      dataTestId="provider-invoice-drawer"
      component={
        <ProviderInvoiceDrawerContent
          ref={contentRef}
          providerId={providerId}
          variant={resolution.variant as "indirect-postpaid" | "direct-postpaid"}
          editingInvoice={editingInvoice}
          isReadOnly={isReadOnly}
          onSuccess={handleSuccess}
          onStateChange={handleSubmissionStateChange}
        />
      }
      footer={
        <div className={providerDrawerFooterClass}>
          <Button
            variant="light"
            onPress={() => onOpenChange(false)}
            isDisabled={isSubmitting}
            className={providerDrawerSecondaryButtonClass}
          >
            {isReadOnly ? "Fechar" : "Cancelar"}
          </Button>
          {!isReadOnly && (
            <Button
              color="primary"
              onPress={() => contentRef.current?.submit()}
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
              className={providerDrawerPrimaryButtonClass}
            >
              {isEditing ? "Salvar alterações" : "Criar fatura"}
            </Button>
          )}
        </div>
      }
    />
  );
}
