"use client";

import { type ErrorResponse, getErrorMessage } from "@/shared/utils/errorParser";
import type { AxiosError } from "axios";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { getCurrentMonth } from "../../billing/utils/billing-list.utils";
import { useProviderInvoiceBillableSources } from "../hooks/useProviderInvoiceBillableSources";
import type { ProviderInvoiceSubmissionInput } from "../hooks/useProviderInvoiceSubmission";
import { useProviderInvoices } from "../hooks/useProviderInvoices";
import type { ProviderInvoiceResponse } from "../types/providerInvoices.types";
import {
  type ProviderInvoiceAllocationResult,
  calculateProviderInvoiceAllocation,
} from "../utils/providerInvoiceAllocation.utils";
import {
  getProviderInvoiceCommonFields,
  mapProviderInvoiceSnapshotToEditDraft,
} from "../utils/providerInvoiceEdit.utils";
import {
  type ProviderInvoiceFormValidation,
  validateAndNormalizeProviderInvoiceForm,
} from "../utils/providerInvoiceForm.utils";
import { ProviderInvoiceBillableSourcesTable } from "./ProviderInvoiceBillableSourcesTable";
import {
  ProviderInvoiceCommonFields,
  type ProviderInvoiceCommonFieldsValue,
} from "./ProviderInvoiceCommonFields";

export interface IndirectPostpaidInvoiceFormHandle {
  getSubmissionInput: () => ProviderInvoiceSubmissionInput | null;
  getSubmissionBlockReason: () => null;
  getValidation: () => ProviderInvoiceFormValidation;
}

export interface IndirectPostpaidInvoiceFormProps {
  providerId: string;
  editingInvoice?: ProviderInvoiceResponse;
  isDisabled?: boolean;
}

function getFieldsFromInvoice(invoice?: ProviderInvoiceResponse): ProviderInvoiceCommonFieldsValue {
  return getProviderInvoiceCommonFields(invoice, getCurrentMonth());
}

function competenceToApiDate(value: string): string | null {
  const match = /^(0[1-9]|1[0-2])\/(\d{4})$/.exec(value.trim());
  return match ? `${match[2]}-${match[1]}-01` : null;
}

function isValidDateRange(start: string, end: string): boolean {
  return Boolean(start && end && start <= end);
}

export const IndirectPostpaidInvoiceForm = forwardRef<
  IndirectPostpaidInvoiceFormHandle,
  IndirectPostpaidInvoiceFormProps
>(function IndirectPostpaidInvoiceForm({ providerId, editingInvoice, isDisabled = false }, ref) {
  const editDraft = useMemo(
    () => (editingInvoice ? mapProviderInvoiceSnapshotToEditDraft(editingInvoice) : null),
    [editingInvoice],
  );
  const [fields, setFields] = useState(() => getFieldsFromInvoice(editingInvoice));
  const [showValidation, setShowValidation] = useState(false);
  const invoicesQuery = useProviderInvoices(providerId, { page: 1, pageSize: 100 });
  const periodIsValid = isValidDateRange(fields.assessmentStartDate, fields.assessmentEndDate);
  const sourcesQuery = useProviderInvoiceBillableSources(
    providerId,
    {
      assessmentStartDate: fields.assessmentStartDate,
      assessmentEndDate: fields.assessmentEndDate,
    },
    { enabled: periodIsValid },
  );

  const validation = useMemo(() => validateAndNormalizeProviderInvoiceForm(fields), [fields]);
  const competenceApiDate = competenceToApiDate(fields.competenceMonth);
  const usedCompetences = useMemo(
    () =>
      new Set(
        (invoicesQuery.data?.data ?? [])
          .filter((invoice) => !editingInvoice || invoice.id !== editingInvoice.id)
          .map((invoice) => invoice.competenceMonth.slice(0, 7)),
      ),
    [editingInvoice, invoicesQuery.data],
  );
  const competenceAlreadyUsed =
    competenceApiDate !== null && usedCompetences.has(competenceApiDate.slice(0, 7));
  const allocation = useMemo<ProviderInvoiceAllocationResult | null>(() => {
    if (editDraft) return null;
    if (!validation.valid || !sourcesQuery.isSuccess) return null;
    return calculateProviderInvoiceAllocation(
      validation.value.invoiceTotalValue,
      validation.value.minimumFranchiseValue,
      sourcesQuery.data,
    );
  }, [editDraft, sourcesQuery.data, sourcesQuery.isSuccess, validation]);

  useEffect(() => {
    setFields(getFieldsFromInvoice(editingInvoice));
    setShowValidation(false);
  }, [editingInvoice]);

  const submissionSources = editDraft?.sources ?? allocation?.sources ?? [];
  const billableSourcePreview =
    periodIsValid && sourcesQuery.isSuccess
      ? sourcesQuery.data.map((source) => ({
          ...source,
          providerChargedQuantity: source.clientBillableQuantity,
          unitCost: "0.00",
          totalCost: "0.00",
        }))
      : [];
  const tableSources = editDraft
    ? editDraft.sources.map((source) => ({
        ...source,
        providerChargedQuantity: source.providerChargedQuantity ?? 0,
      }))
    : (allocation?.sources ?? billableSourcePreview);

  const canSubmit =
    validation.valid &&
    !competenceAlreadyUsed &&
    !invoicesQuery.isLoading &&
    !invoicesQuery.error &&
    (editDraft !== null ||
      (sourcesQuery.isSuccess &&
        (allocation?.status === "valid" || (sourcesQuery.data?.length ?? 0) > 0)));

  useImperativeHandle(
    ref,
    () => ({
      getValidation: () => validation,
      getSubmissionBlockReason: () => null,
      getSubmissionInput: () => {
        setShowValidation(true);
        if (
          !canSubmit ||
          !validation.valid ||
          (!editDraft && !allocation)
        ) {
          return null;
        }

        return {
          invoiceFile: validation.value.invoiceFile,
          payload: {
            competenceMonth: validation.value.competenceMonth,
            assessmentStartDate: validation.value.assessmentStartDate,
            assessmentEndDate: validation.value.assessmentEndDate,
            invoiceTotalValue: validation.value.invoiceTotalValue,
            minimumFranchiseValue: validation.value.minimumFranchiseValue,
            ...(editDraft?.invoiceFileUrl && !validation.value.invoiceFile
              ? { invoiceFileUrl: editDraft.invoiceFileUrl }
              : {}),
            sources: submissionSources.map((source) => ({
              dataSourceProviderId: source.dataSourceProviderId,
              providerChargedQuantity: source.providerChargedQuantity,
              unitCost: source.unitCost,
              totalCost: source.totalCost,
            })),
          },
        };
      },
    }),
    [allocation, canSubmit, editDraft, submissionSources, validation],
  );

  const fieldErrors = showValidation && !validation.valid ? validation.errors : undefined;
  const invoiceErrorMessage = getErrorMessage(
    (invoicesQuery.error as AxiosError<ErrorResponse> | null) ?? null,
  );
  return (
    <div className="space-y-8">
      <ProviderInvoiceCommonFields
        value={fields}
        onChange={(patch) => setFields((current) => ({ ...current, ...patch }))}
        errors={fieldErrors}
        unavailableCompetenceMonths={usedCompetences}
        isDisabled={isDisabled}
      />

      {competenceAlreadyUsed && (
        <p role="alert" className="text-sm text-danger-500">
          A competência selecionada já foi utilizada para este fornecedor.
        </p>
      )}
      {invoiceErrorMessage && (
        <p role="alert" className="text-sm text-danger-500">
          Não foi possível consultar as competências usadas: {invoiceErrorMessage}
        </p>
      )}

      <section className="space-y-3" aria-labelledby="provider-invoice-allocation-title">
        <h2 id="provider-invoice-allocation-title" className="text-sm font-medium text-default-800">
          Custo distribuído entre fornecedores diretos vinculados
        </h2>
        <ProviderInvoiceBillableSourcesTable
          sources={tableSources}
          isLoading={editDraft ? false : sourcesQuery.isLoading}
          error={editDraft ? null : sourcesQuery.error}
        />
      </section>
    </div>
  );
});
