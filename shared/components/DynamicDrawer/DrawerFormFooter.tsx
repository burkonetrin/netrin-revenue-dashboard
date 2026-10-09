"use client";

import { Button } from "@heroui/react";

interface DrawerFormFooterProps {
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isSaveDisabled?: boolean;
  isCancelDisabled?: boolean;
  formId?: string;
  onSave?: () => void;
  variant?: "default" | "providers";
}

/** Rodapé padrão de drawers com botões Cancelar e Salvar. */
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
    <div
      className={
        isProviders
          ? "flex w-full justify-end gap-2.5 font-sans"
          : "flex gap-2.5 w-full"
      }
    >
      <Button
        variant="light"
        onPress={onCancel}
        isDisabled={isCancelDisabled || isLoading}
        className={
          isProviders
            ? "h-10 border border-gray-300 px-6"
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
            ? "h-10 px-6 font-semibold text-white shadow-md"
            : "flex-1 h-10"
        }
      >
        {isLoading ? "" : saveLabel}
      </Button>
    </div>
  );
}
