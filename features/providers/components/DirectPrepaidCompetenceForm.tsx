"use client";

import { getCurrentMonth } from "@/features/billing/utils/billing-list.utils";
import { maskCurrency } from "@/shared/utils/currency";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useProviderInvoiceBillableSources } from "../hooks/useProviderInvoiceBillableSources";
import { useProviderInvoices } from "../hooks/useProviderInvoices";
import type { ProviderInvoiceResponse } from "../types/providerInvoices.types";
import {
  type DirectPrepaidCompetenceCalculation,
  calculateDirectPrepaidCompetence,
} from "../utils/providerDirectPrepaidCompetence.utils";
import {
  type DirectPrepaidSource,
  allocateDirectPrepaidSources,
  getDirectPrepaidSourceTotals,
  validateDirectPrepaidSources,
} from "../utils/providerDirectPrepaidSources.utils";
import { validatePrepaidCompetenceDraft } from "../utils/providerPrepaidCompetence.utils";
import {
  DirectPrepaidCompetenceFields,
  type DirectPrepaidCompetenceFieldsErrors,
  type DirectPrepaidCompetenceFieldsValue,
} from "./DirectPrepaidCompetenceFields";
import { DirectPrepaidCompetenceSourcesTable } from "./DirectPrepaidCompetenceSourcesTable";
import { DirectPrepaidCompetenceTotals } from "./DirectPrepaidCompetenceTotals";

export interface DirectPrepaidCompetenceSubmissionIntent {
  competenceMonth: string;
  assessmentStartDate: string;
  assessmentEndDate: string;
  startingBalance: string;
  creditDeposits: DirectPrepaidCompetenceFieldsValue["creditDeposits"];
  isMonthClosed: boolean;
  endingBalance?: string;
  minimumFranchiseValue: string | null;
  sources: DirectPrepaidSource[];
}

export interface DirectPrepaidCompetenceFormHandle {
  getSubmissionIntent: () => DirectPrepaidCompetenceSubmissionIntent | null;
}

export interface DirectPrepaidCompetenceFormProps {
  providerId: string;
  editingCompetence?: ProviderInvoiceResponse;
  isDisabled?: boolean;
}

function formatDraftMoney(value?: string | null): string {
  return value ? maskCurrency(value) : "";
}

function initialDraft(invoice?: ProviderInvoiceResponse): DirectPrepaidCompetenceFieldsValue {
  if (invoice) {
    return {
      competenceMonth: `${invoice.competenceMonth.slice(5, 7)}/${invoice.competenceMonth.slice(0, 4)}`,
      assessmentStartDate: invoice.assessmentStartDate,
      assessmentEndDate: invoice.assessmentEndDate,
      startingBalance: formatDraftMoney(invoice.startingBalance),
      creditDeposits: (invoice.creditDeposits ?? []).map((deposit) => ({
        id: deposit.id,
        balanceBeforeCredit: formatDraftMoney(deposit.balanceBeforeCredit),
        creditAmount: formatDraftMoney(deposit.creditAmount),
      })),
      isMonthClosed: invoice.isMonthClosed ?? false,
      endingBalance: formatDraftMoney(invoice.endingBalance),
      minimumFranchiseValue: formatDraftMoney(invoice.minimumFranchiseValue),
    };
  }

  const [year, month] = getCurrentMonth().split("-").map(Number);

  return {
    competenceMonth: `${String(month).padStart(2, "0")}/${year}`,
    assessmentStartDate: "",
    assessmentEndDate: "",
    startingBalance: "",
    creditDeposits: [],
    isMonthClosed: false,
    endingBalance: "",
    minimumFranchiseValue: "",
  };
}

function sourcesFromInvoice(invoice?: ProviderInvoiceResponse): DirectPrepaidSource[] {
  return (invoice?.sources ?? []).map((source) => ({
    directProviderId: source.directProviderId,
    directProviderName: source.directProviderName,
    dataSourceProviderId: source.dataSourceProviderId,
    dataSourceName: source.dataSourceName,
    dataSourceInternalName: source.dataSourceInternalName,
    clientBillableQuantity: source.clientBillableQuantity,
    providerChargedQuantity: source.providerChargedQuantity,
    unitCost: source.unitCost,
    totalCost: source.totalCost,
  }));
}

function isValidDateRange(start: string, end: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(start) && /^\d{4}-\d{2}-\d{2}$/.test(end) && start <= end;
}

function sourceErrorMessage(sources: DirectPrepaidSource[]): string | undefined {
  const result = validateDirectPrepaidSources(sources);
  return result.valid ? undefined : result.errors.sources;
}

/** Composes the direct prepaid competence UI and exposes a local, contract-independent submission intent. */
export const DirectPrepaidCompetenceForm = forwardRef<
  DirectPrepaidCompetenceFormHandle,
  DirectPrepaidCompetenceFormProps
>(function DirectPrepaidCompetenceForm({ providerId, editingCompetence, isDisabled = false }, ref) {
  const [draft, setDraft] = useState(() => initialDraft(editingCompetence));
  const [sources, setSources] = useState<DirectPrepaidSource[]>(() =>
    sourcesFromInvoice(editingCompetence),
  );
  const [showValidation, setShowValidation] = useState(false);
  const invoicesQuery = useProviderInvoices(providerId, { page: 1, pageSize: 100 });
  const editingCompetenceId = editingCompetence?.id;
  const usedCompetences = useMemo(
    () =>
      (invoicesQuery.data?.data ?? [])
        .filter((invoice) => editingCompetenceId === undefined || invoice.id !== editingCompetenceId)
        .map((invoice) => invoice.competenceMonth),
    [editingCompetenceId, invoicesQuery.data],
  );
  const prepaidValidation = useMemo(
    () => validatePrepaidCompetenceDraft(draft, usedCompetences),
    [draft, usedCompetences],
  );
  const periodIsValid = isValidDateRange(draft.assessmentStartDate, draft.assessmentEndDate);
  const sourcesQuery = useProviderInvoiceBillableSources(
    providerId,
    {
      assessmentStartDate: draft.assessmentStartDate,
      assessmentEndDate: draft.assessmentEndDate,
    },
    { enabled: periodIsValid && !editingCompetence },
  );
  const calculation = useMemo<DirectPrepaidCompetenceCalculation | null>(
    () => {
      if (!prepaidValidation.valid) return null;

      return calculateDirectPrepaidCompetence({
        ...prepaidValidation.value,
        endingBalance: prepaidValidation.value.endingBalance ?? "",
        sources: sourcesQuery.data ?? [],
      });
    },
    [prepaidValidation, sourcesQuery.data],
  );

  useEffect(() => {
    if (editingCompetence || !sourcesQuery.isSuccess) return;
    const initialCost = calculation?.status === "valid" ? calculation.finalCost : "0.00";
    setSources(allocateDirectPrepaidSources(initialCost, sourcesQuery.data).sources);
  }, [calculation, editingCompetence, sourcesQuery.data, sourcesQuery.isSuccess]);

  useEffect(() => {
    if (!editingCompetence) return;
    setDraft(initialDraft(editingCompetence));
    setSources(sourcesFromInvoice(editingCompetence));
    setShowValidation(false);
  }, [editingCompetence]);

  const sourceValidationMessage = sourceErrorMessage(sources);
  const sourceTotals = getDirectPrepaidSourceTotals(sources);
  const fieldErrors = useMemo<DirectPrepaidCompetenceFieldsErrors>(() => {
    const errors: DirectPrepaidCompetenceFieldsErrors = prepaidValidation.valid
      ? {}
      : { ...prepaidValidation.errors };
    if (!draft.assessmentStartDate) errors.assessmentStartDate = "Campo obrigatório";
    if (!draft.assessmentEndDate) errors.assessmentEndDate = "Campo obrigatório";
    if (draft.assessmentStartDate && draft.assessmentEndDate && !periodIsValid) {
      errors.assessmentStartDate = "O período inicial deve ser anterior ou igual ao período final";
      errors.assessmentEndDate = "O período inicial deve ser anterior ou igual ao período final";
    }
    return errors;
  }, [draft.assessmentEndDate, draft.assessmentStartDate, periodIsValid, prepaidValidation]);
  const canSubmit =
    prepaidValidation.valid &&
    periodIsValid &&
    (editingCompetence ? sources.length > 0 : calculation?.status === "valid") &&
    (editingCompetence ? true : sourcesQuery.isSuccess) &&
    !sourceValidationMessage &&
    !invoicesQuery.isLoading &&
    !invoicesQuery.error;

  useImperativeHandle(
    ref,
    () => ({
      getSubmissionIntent: () => {
        setShowValidation(true);
        if (!canSubmit || !prepaidValidation.valid) return null;

        return {
          competenceMonth: prepaidValidation.value.competenceMonth,
          assessmentStartDate: draft.assessmentStartDate,
          assessmentEndDate: draft.assessmentEndDate,
          startingBalance: prepaidValidation.value.startingBalance,
          creditDeposits: prepaidValidation.value.creditDeposits,
          isMonthClosed: prepaidValidation.value.isMonthClosed,
          ...(prepaidValidation.value.isMonthClosed
            ? { endingBalance: prepaidValidation.value.endingBalance as string }
            : {}),
          minimumFranchiseValue: prepaidValidation.value.minimumFranchiseValue,
          sources,
        };
      },
    }),
    [canSubmit, draft.assessmentEndDate, draft.assessmentStartDate, prepaidValidation, sources],
  );

  const unavailableCompetenceMonths = new Set(usedCompetences);
  const visibleErrors = showValidation ? fieldErrors : undefined;

  return (
    <div className="flex flex-col gap-8">
      <DirectPrepaidCompetenceFields
        value={draft}
        onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
        errors={visibleErrors}
        unavailableCompetenceMonths={unavailableCompetenceMonths}
        isDisabled={isDisabled}
      >
        <DirectPrepaidCompetenceSourcesTable
          sources={sources}
          onChange={setSources}
          isLoading={sourcesQuery.isLoading}
          error={sourcesQuery.error}
          errorMessage={showValidation ? sourceValidationMessage : undefined}
          isDisabled={isDisabled}
        />
      </DirectPrepaidCompetenceFields>

      <DirectPrepaidCompetenceTotals
        totalBillableQuantity={
          editingCompetence
            ? editingCompetence.sources.reduce(
                (total, source) => total + Math.max(source.clientBillableQuantity, 0),
                0,
              )
            : calculation?.status === "valid"
              ? calculation.totalBillableQuantity
              : (sourcesQuery.data ?? []).reduce(
                  (total, source) => total + Math.max(source.clientBillableQuantity, 0),
                  0,
                )
        }
        calculatedCost={
          editingCompetence?.sourcesTotalValue ??
          (calculation?.status === "valid" ? calculation.finalCost : "0.00")
        }
        informedSourcesCost={sourceTotals.informedSourcesCost}
      />

      {invoicesQuery.error && (
        <p role="alert" className="text-sm text-danger-500">
          Não foi possível consultar as competências usadas.
        </p>
      )}
    </div>
  );
});
