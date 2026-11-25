"use client";

import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import { addToast, Button, Input } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  blockedDocumentDigits,
  formatBlockedDocumentDisplay,
  isValidBlockedDocumentInput,
} from "../utils/blockedDocuments.utils";

interface BlockedDocumentRow {
  id: string;
  document: string;
}

interface BlockedDocumentsSectionProps {
  savedDocuments: string[];
  onSave: (documents: string[]) => void;
}

function toRows(documents: string[]): BlockedDocumentRow[] {
  return documents.map((document, index) => ({
    id: `${blockedDocumentDigits(document)}-${index}`,
    document,
  }));
}

/** Seção inline de gestão de documentos bloqueados (dados bancários). */
export function BlockedDocumentsSection({
  savedDocuments,
  onSave,
}: BlockedDocumentsSectionProps) {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [documentToRemove, setDocumentToRemove] = useState<string | null>(null);

  const searchDigits = useMemo(() => blockedDocumentDigits(inputValue), [inputValue]);

  const filteredDocuments = useMemo(() => {
    if (!searchDigits) {
      return savedDocuments;
    }
    return savedDocuments.filter((document) =>
      blockedDocumentDigits(document).includes(searchDigits),
    );
  }, [savedDocuments, searchDigits]);

  const rows = useMemo(() => toRows(filteredDocuments), [filteredDocuments]);

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
            onClick={() => setDocumentToRemove(row.document)}
          >
            <Trash2 size={18} />
          </button>
        ),
      },
    ],
    [],
  );

  const handleConfirmRemove = () => {
    if (!documentToRemove) {
      return;
    }
    const next = savedDocuments.filter((document) => document !== documentToRemove);
    onSave(next);
    setDocumentToRemove(null);
  };

  const handleBlockDocument = () => {
    const trimmed = inputValue.trim();
    if (!isValidBlockedDocumentInput(trimmed)) {
      setInputError("Informe um CPF ou CNPJ válido (com ou sem formatação).");
      return;
    }

    const digits = blockedDocumentDigits(trimmed);
    const alreadyListed = savedDocuments.some(
      (document) => blockedDocumentDigits(document) === digits,
    );
    if (alreadyListed) {
      setInputError("Este documento já está na lista.");
      return;
    }

    const next = [formatBlockedDocumentDisplay(trimmed), ...savedDocuments];
    onSave(next);
    setInputValue("");
    setInputError(null);
    addToast({
      title: "Documentos bloqueados",
      description: "A lista foi salva com sucesso.",
      color: "success",
    });
  };

  return (
    <section className="space-y-6" aria-labelledby="blocked-documents-heading">
      <h2
        id="blocked-documents-heading"
        className="text-xl font-medium text-default-700"
      >
        Documentos bloqueados ({savedDocuments.length})
      </h2>

      <div className="flex flex-col gap-6">
        <div className="max-w-[504px]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
            <Input
              label="Bloqueie um documento ou pesquise"
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
                  if (isValidBlockedDocumentInput(inputValue)) {
                    handleBlockDocument();
                  }
                }
              }}
            />
            <Button
              variant="bordered"
              radius="sm"
              className="h-10 shrink-0 px-6"
              onPress={handleBlockDocument}
            >
              Bloquear documento
            </Button>
          </div>
          {inputError ? (
            <p className="mt-1 text-tiny text-danger" role="alert">
              {inputError}
            </p>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            {savedDocuments.length === 0 ? (
              <p className="text-sm text-default-500">Não há nenhum documento bloqueado</p>
            ) : filteredDocuments.length === 0 ? (
              <p className="text-sm text-default-500">Nenhum documento encontrado para a busca.</p>
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
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(documentToRemove)}
        onClose={() => setDocumentToRemove(null)}
        title="Remover bloqueio"
        description={
          documentToRemove
            ? `Deseja remover o bloqueio do documento ${formatBlockedDocumentDisplay(documentToRemove)}?`
            : null
        }
        confirmLabel="Confirmar"
        confirmColor="danger"
        onConfirm={handleConfirmRemove}
      />
    </section>
  );
}