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
}

/** Rodapé padrão de drawers com Cancelar e Salvar (Nucleus). */
export function DrawerFormFooter({
  onCancel,
  saveLabel = "Salvar",
  cancelLabel = "Cancelar",
  isLoading = false,
  isSaveDisabled = false,
  isCancelDisabled = false,
  formId,
  onSave,
}: DrawerFormFooterProps) {
  return (
    <div className="flex gap-2.5 w-full">
      <Button
        variant="light"
        onPress={onCancel}
        isDisabled={isCancelDisabled || isLoading}
        className="border border-gray-400 flex-1 h-10"
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
        className="flex-1 h-10"
      >
        {isLoading ? "" : saveLabel}
      </Button>
    </div>
  );
}
