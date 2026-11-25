"use client";

import { useState } from "react";
import {
  getBlockedDocuments,
  setBlockedDocuments,
} from "../mock/blockedDocumentsMock.store";
import { BankValidationVolumeTable } from "./BankValidationVolumeTable";
import { BlockedDocumentsSection } from "./BlockedDocumentsSection";
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
  const [savedBlockedDocuments, setSavedBlockedDocuments] = useState(() =>
    getBlockedDocuments(),
  );

  return (
    <div className="space-y-8">
      <MonthCompetencePicker
        value={referenceMonth}
        onChange={onReferenceMonthChange}
      />

      <BankValidationVolumeTable
        referenceMonth={referenceMonth}
        withNestedQualityDetails
      />

      <BlockedDocumentsSection
        savedDocuments={savedBlockedDocuments}
        onSave={(documents) => {
          setBlockedDocuments(documents);
          setSavedBlockedDocuments([...documents]);
        }}
      />
    </div>
  );
}