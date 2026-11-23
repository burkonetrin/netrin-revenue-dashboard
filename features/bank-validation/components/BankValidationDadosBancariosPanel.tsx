"use client";

import { Button } from "@heroui/react";
import { AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import {
  getBlockedDocuments,
  setBlockedDocuments,
} from "../mock/blockedDocumentsMock.store";
import { BankValidationTransactionQuality } from "./BankValidationTransactionQuality";
import { BankValidationVolumeTable } from "./BankValidationVolumeTable";
import { BlockedDocumentsDrawer } from "./BlockedDocumentsDrawer";
import { MonthCompetencePicker } from "./MonthCompetencePicker";

interface BankValidationDadosBancariosPanelProps {
  referenceMonth: string;
  onReferenceMonthChange: (value: string) => void;
}

/** Conteúdo da aba Dados bancários com competência, bloqueios e métricas. */
export function BankValidationDadosBancariosPanel({
  referenceMonth,
  onReferenceMonthChange,
}: BankValidationDadosBancariosPanelProps) {
  const [blockedDrawerOpen, setBlockedDrawerOpen] = useState(false);
  const [savedBlockedDocuments, setSavedBlockedDocuments] = useState(() =>
    getBlockedDocuments(),
  );

  const blockedCountLabel = useMemo(
    () => savedBlockedDocuments.length,
    [savedBlockedDocuments],
  );
  const hasBlockedDocuments = blockedCountLabel > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end gap-4">
        <MonthCompetencePicker
          value={referenceMonth}
          onChange={onReferenceMonthChange}
        />
        <Button
          variant={hasBlockedDocuments ? "flat" : "bordered"}
          color={hasBlockedDocuments ? "warning" : "default"}
          radius="sm"
          className={
            hasBlockedDocuments
              ? "h-[42px] border border-warning-500 bg-warning-50 text-warning-600 data-[hover=true]:bg-warning-100"
              : "h-[42px]"
          }
          startContent={
            hasBlockedDocuments ? (
              <AlertTriangle size={18} aria-hidden className="shrink-0" />
            ) : undefined
          }
          onPress={() => setBlockedDrawerOpen(true)}
        >
          Documentos bloqueados ({blockedCountLabel})
        </Button>
      </div>

      <BankValidationVolumeTable referenceMonth={referenceMonth} />
      <BankValidationTransactionQuality
        referenceMonth={referenceMonth}
        showSummaryCards={false}
      />

      <BlockedDocumentsDrawer
        isOpen={blockedDrawerOpen}
        savedDocuments={savedBlockedDocuments}
        onOpenChange={setBlockedDrawerOpen}
        onSave={(documents) => {
          setBlockedDocuments(documents);
          setSavedBlockedDocuments([...documents]);
        }}
      />
    </div>
  );
}
