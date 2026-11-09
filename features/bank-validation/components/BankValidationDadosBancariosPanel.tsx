"use client";

import { Button } from "@heroui/react";
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

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <MonthCompetencePicker
          value={referenceMonth}
          onChange={onReferenceMonthChange}
        />
        <Button
          variant="bordered"
          radius="sm"
          className="h-[42px]"
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
