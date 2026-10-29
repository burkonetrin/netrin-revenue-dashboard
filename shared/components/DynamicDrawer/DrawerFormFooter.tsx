"use client";

import { Button } from "@heroui/react";

interface DrawerFormFooterProps {
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isSaveDisabled?: boolean;
  isCancelDisabled?: boolean;
  /** Submete formulário externo via atributo form. */
  formId?: string;
  /** Ação direta no botão salvar (sem form submit). */
  onSave?: () => void;
  variant?: "default" | "providers";
}

/**
 * Rodapé padrão de drawers com botões Cancelar e Salvar.
 */
export function DrawerFormFooter({
  onCancel,
  saveLabel = "Salvar",
  cancelLabel = "Cancelar",
  isLoading = false,
  isSaveDisabled = false,
  isCancelDisabled = false,
  formId,
  onSave,
  variant = "default",
}: DrawerFormFooterProps) {
  const isProviders = variant === "providers";

  return (
    <div className={`flex gap-2.5 w-full${isProviders ? " font-sans" : ""}`}>
      <Button
        variant="light"
        onPress={onCancel}
        isDisabled={isCancelDisabled || isLoading}
        className={
          isProviders
            ? "border border-default-200 flex-1 h-11 font-medium"
            : "border border-gray-400 flex-1 h-10"
        }
      >
        {cancelLabel}
      </Button>
      <Button
        color="primary"
        type={formId ? "submit" : "button"}
        form={formId}
        onPress={onSave}
        isLoading={isLoading}
        isDisabled={isSaveDisabled || isLoading}
        className={
          isProviders
            ? "flex-1 h-11 font-semibold text-white shadow-lg shadow-primary/20"
            : "flex-1 h-10"
        }
      >
        {isLoading ? "" : saveLabel}
      </Button>
    </div>
  );
}
