"use client";

import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { Button } from "@heroui/react";
import type { ReactNode } from "react";

export interface PaymentInfoSidebarShellProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  /** Header de contexto (Contrato / franquia / grupo). */
  contextHeader?: ReactNode;
  /** Painéis de unificar/grupo (irmãos do form). */
  panels?: ReactNode;
  /** Conteúdo principal (tipicamente PaymentInfoForm). */
  children?: ReactNode;
  formId?: string;
  isSaving?: boolean;
  isSaveDisabled?: boolean;
  saveLabel?: string;
  onSave?: () => void;
  hideFooter?: boolean;
}

/**
 * Shell da sidebar de payment — DynamicDrawer + contexto + footer com largura relativa ao conteúdo.
 * Layout: Figma 5841:86277 / 6003:83716.
 */
export function PaymentInfoSidebarShell({
  isOpen,
  onClose,
  title = "Informações de pagamento",
  contextHeader,
  panels,
  children,
  formId = "payment-info-tab-form",
  isSaving = false,
  isSaveDisabled = false,
  saveLabel = "Salvar",
  onSave,
  hideFooter = false,
}: PaymentInfoSidebarShellProps) {
  return (
    <DynamicDrawer
      size="lg"
      title={title}
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      dataTestId="payment-info-sidebar-shell"
      classNames={{
        base: "h-full",
        header:
          "px-6 py-4 text-[30px]! font-medium! leading-9! text-foreground",
        body: "flex-1! mb-0 overflow-y-auto px-6 pt-4 pb-16",
        footer: "mt-auto !w-full !flex-row !justify-end px-6 pb-4 pt-0",
      }}
      component={
        <div className="flex flex-col gap-8" data-testid="payment-info-sidebar-body">
          {contextHeader}
          {panels}
          {children}
        </div>
      }
      footer={
        hideFooter ? undefined : (
          <div
            className="flex w-full items-center justify-end gap-4"
            data-testid="payment-info-sidebar-footer"
          >
            <Button
              variant="bordered"
              color="default"
              radius="sm"
              size="md"
              isDisabled={isSaving}
              onPress={onClose}
              className="h-10 shrink-0 border-2 border-default-300 bg-white px-4 text-sm font-normal text-foreground"
              data-testid="payment-info-sidebar-cancel"
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              radius="sm"
              size="md"
              type={onSave ? "button" : "submit"}
              form={onSave ? undefined : formId}
              onPress={onSave}
              isLoading={isSaving}
              isDisabled={isSaveDisabled || isSaving}
              className="h-10 shrink-0 px-4 text-sm font-normal whitespace-nowrap"
              data-testid="payment-info-sidebar-save"
            >
              {isSaving ? "" : saveLabel}
            </Button>
          </div>
        )
      }
    />
  );
}
