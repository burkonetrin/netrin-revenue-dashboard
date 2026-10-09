"use client";

import { DeleteConfirmModal } from "@/shared/components/DeleteConfirmModal";
import type { BackgroundCheckTemplatePreviewRow } from "../types/backgroundCheckTemplatePreview.types";

export type BackgroundCheckTemplateDeletePreviewModalProps = {
  isOpen: boolean;
  row: BackgroundCheckTemplatePreviewRow | null;
  onClose: () => void;
  onConfirm?: (row: BackgroundCheckTemplatePreviewRow) => void | Promise<void>;
};

/**
 * Confirma a exclusão na prévia sem apresentar uma falsa confirmação de persistência.
 * A mutação real será conectada quando o contrato BE 14607 estiver disponível.
 */
export function BackgroundCheckTemplateDeletePreviewModal({
  isOpen,
  row,
  onClose,
  onConfirm,
}: BackgroundCheckTemplateDeletePreviewModalProps) {
  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      record={row}
      getRecordLabel={(record) => record.name}
      entityLabel="modelo"
      description={
        <p className="text-sm">
          Ao excluir este modelo, ele será removido de todos os clientes vinculados a ele
        </p>
      }
      confirmLabel="Excluir modelo"
      showSuccessToast={false}
      onConfirm={async (record) => {
        await onConfirm?.(record);
      }}
    />
  );
}
