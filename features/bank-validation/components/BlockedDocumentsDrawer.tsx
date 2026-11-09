"use client";

import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { DrawerFormFooter } from "@/shared/components/DynamicDrawer/DrawerFormFooter";
import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import { addToast, Button, Input } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  blockedDocumentDigits,
  formatBlockedDocumentDisplay,
  isValidBlockedDocumentInput,
} from "../utils/blockedDocuments.utils";

interface BlockedDocumentRow {
  id: string;
  document: string;
}

interface BlockedDocumentsDrawerProps {
  isOpen: boolean;
  savedDocuments: string[];
  onOpenChange: (open: boolean) => void;
  onSave: (documents: string[]) => void;
}

function toRows(documents: string[]): BlockedDocumentRow[] {
  return documents.map((document, index) => ({
    id: `${blockedDocumentDigits(document)}-${index}`,
    document,
  }));
}

/** Sidebar de gestão de documentos bloqueados (dados bancários). */
export function BlockedDocumentsDrawer({
  isOpen,
  savedDocuments,
  onOpenChange,
  onSave,
}: BlockedDocumentsDrawerProps) {
  const [draftDocuments, setDraftDocuments] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDraftDocuments([...savedDocuments]);
      setInputValue("");
      setInputError(null);
    }
  }, [isOpen, savedDocuments]);

  const rows = useMemo(() => toRows(draftDocuments), [draftDocuments]);

  const columns: ColumnConfig<BlockedDocumentRow>[] = useMemo(
    () => [
      {
        id: "document",
        label: "Documento bloqueado",
        render: (value) => formatBlockedDocumentDisplay(String(value)),
      },
      {
        id: "action",
        label: "Remover bloqueio",
        width: 140,
        align: "center",
        render: (_, row) => (
          <button
            type="button"
            aria-label={`Remover bloqueio de ${row.document}`}
            className="inline-flex cursor-pointer items-center justify-center text-danger transition-colors hover:text-danger-600"
            onClick={() => {
              setDraftDocuments((current) =>
                current.filter((document) => document !== row.document),
              );
            }}
          >
            <Trash2 size={18} />
          </button>
        ),
      },
    ],
    [],
  );

  const handleInsert = () => {
    const trimmed = inputValue.trim();
    if (!isValidBlockedDocumentInput(trimmed)) {
      setInputError("Informe um CPF ou CNPJ válido (com ou sem formatação).");
      return;
    }

    const digits = blockedDocumentDigits(trimmed);
    const alreadyListed = draftDocuments.some(
      (document) => blockedDocumentDigits(document) === digits,
    );
    if (alreadyListed) {
      setInputError("Este documento já está na lista.");
      return;
    }

    setDraftDocuments((current) => [
      formatBlockedDocumentDisplay(trimmed),
      ...current,
    ]);
    setInputValue("");
    setInputError(null);
  };

  const handleSave = () => {
    onSave(draftDocuments);
    addToast({
      title: "Documentos bloqueados",
      description: "A lista foi salva com sucesso.",
      color: "success",
    });
    onOpenChange(false);
  };

  return (
    <DynamicDrawer
      size="lg"
      title="Documentos bloqueados"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        base: "max-w-[504px]",
        content: "flex flex-col",
        header: "font-bold text-gray-950",
        body: "flex-1! min-h-0 mb-0 overflow-y-auto",
        footer: "mt-auto w-full border-t-0 pt-4",
      }}
      component={
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
              <Input
                label="Insira o documento a ser bloqueado"
                labelPlacement="outside"
                placeholder="CPF ou CNPJ"
                value={inputValue}
                onValueChange={(value) => {
                  setInputValue(value);
                  if (inputError) {
                    setInputError(null);
                  }
                }}
                isInvalid={Boolean(inputError)}
                classNames={defaultInputClassNames}
                className="min-w-0 flex-1"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleInsert();
                  }
                }}
              />
              <Button
                variant="bordered"
                radius="sm"
                className="h-10 shrink-0 px-6"
                onPress={handleInsert}
              >
                Inserir
              </Button>
            </div>
            {inputError ? (
              <p className="mt-1 text-tiny text-danger" role="alert">
                {inputError}
              </p>
            ) : null}
          </div>

          {rows.length === 0 ? (
            <p className="text-sm text-default-500">Não há nenhum documento bloqueado</p>
          ) : (
            <DynamicTable
              columns={columns}
              data={rows}
              keyExtractor={(row) => row.id}
              classNames={{
                th: "bg-gray-50 text-gray-700 font-semibold text-xs",
                td: "text-gray-900 border-b border-gray-200 h-12 text-xs",
              }}
            />
          )}
        </div>
      }
      footer={
        <DrawerFormFooter
          onCancel={() => onOpenChange(false)}
          onSave={handleSave}
        />
      }
    />
  );
}
