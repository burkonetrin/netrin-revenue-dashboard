"use client";

import { formatCurrency } from "@/shared/utils/currency";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { getCurrentMonth } from "../../billing/utils/billing-list.utils";
import { useProviderInvoiceBillableSources } from "../hooks/useProviderInvoiceBillableSources";
import type { ProviderInvoiceSubmissionInput } from "../hooks/useProviderInvoiceSubmission";
import { useProviderInvoices } from "../hooks/useProviderInvoices";
import type { ProviderInvoiceResponse } from "../types/providerInvoices.types";
import {
  type DirectPostpaidInvoiceFormValidation,
  type ProviderInvoiceDirectSource,
  getDirectInvoiceTotals,
  validateDirectPostpaidInvoiceForm,
} from "../utils/providerInvoiceDirect.utils";
import {
  getProviderInvoiceCommonFields,
  mapProviderInvoiceSnapshotToEditDraft,
} from "../utils/providerInvoiceEdit.utils";
import { DirectProviderInvoiceTotals } from "./DirectProviderInvoiceTotals";
import {
  ProviderInvoiceCommonFields,
  type ProviderInvoiceCommonFieldsValue,
} from "./ProviderInvoiceCommonFields";
import { ProviderInvoiceDirectSourcesTable } from "./ProviderInvoiceDirectSourcesTable";

export interface DirectPostpaidInvoiceFormHandle {
  getSubmissionInput: () => ProviderInvoiceSubmissionInput | null;
  getSubmissionBlockReason: () => "incomplete-billable-sources" | null;
  getValidation: () => DirectPostpaidInvoiceFormValidation;
}

export interface DirectPostpaidInvoiceFormProps {
  providerId: string;
  editingInvoice?: ProviderInvoiceResponse;
  isDisabled?: boolean;
}

function getFieldsFromInvoice(invoice?: ProviderInvoiceResponse): ProviderInvoiceCommonFieldsValue {
  return getProviderInvoiceCommonFields(invoice, getCurrentMonth());
}

function getSourcesFromInvoice(invoice?: ProviderInvoiceResponse): ProviderInvoiceDirectSource[] {
  if (!invoice) return [];
  return mapProviderInvoiceSnapshotToEditDraft(invoice).sources.map((source) => ({ ...source }));
}

function isValidDateRange(start: string, end: string): boolean {
  return Boolean(start && end && start <= end);
}

export const DirectPostpaidInvoiceForm = forwardRef<
  DirectPostpaidInvoiceFormHandle,
  DirectPostpaidInvoiceFormProps
>(function DirectPostpaidInvoiceForm({ providerId, editingInvoice, isDisabled = false }, ref) {
  const editDraft = useMemo(
    () => (editingInvoice ? mapProviderInvoiceSnapshotToEditDraft(editingInvoice) : null),
    [editingInvoice],
  );
  const [fields, setFields] = useState(() => getFieldsFromInvoice(editingInvoice));
  const [sources, setSources] = useState<ProviderInvoiceDirectSource[]>(() =>
    getSourcesFromInvoice(editingInvoice),
  );
  const [showValidation, setShowValidation] = useState(false);
  const [isSnapshotPristine, setIsSnapshotPristine] = useState(Boolean(editingInvoice));
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

  useEffect(() => {
    if (editingInvoice || !sourcesQuery.isSuccess) return;
    setSources(
      sourcesQuery.data.map((source) => ({
        ...source,
        providerChargedQuantity: null,
        unitCost: source.clientBillableQuantity > 0 ? "" : "0.00",
        totalCost: source.clientBillableQuantity > 0 ? "" : "0.00",
      })),
    );
  }, [editingInvoice, sourcesQuery.data, sourcesQuery.isSuccess]);

  useEffect(() => {
    if (!editingInvoice) return;
    setFields(getFieldsFromInvoice(editingInvoice));
    setSources(getSourcesFromInvoice(editingInvoice));
    setShowValidation(false);
    setIsSnapshotPristine(true);
  }, [editingInvoice]);

  const usedCompetenceMonths = useMemo(
    () =>
      (invoicesQuery.data?.data ?? [])
        .filter((invoice) => !editingInvoice || invoice.id !== editingInvoice.id)
        .map((invoice) => invoice.competenceMonth),
    [editingInvoice, invoicesQuery.data],
  );
  const validation = useMemo(
    () =>
      validateDirectPostpaidInvoiceForm({
        ...fields,
        sources,
        usedCompetenceMonths,
      }),
    [fields, sources, usedCompetenceMonths],
  );
  const totals = useMemo(() => {
    if (editDraft && isSnapshotPristine) {
      return {
        totalBillableQuantity: editDraft.sources.reduce(
          (total, source) => total + Math.max(source.clientBillableQuantity, 0),
          0,
        ),
        invoiceTotalValue: editDraft.invoiceTotalValue,
      };
    }

    return getDirectInvoiceTotals(sources, fields.minimumFranchiseValue);
  }, [editDraft, fields.minimumFranchiseValue, isSnapshotPristine, sources]);
  const canSubmit =
    validation.valid &&
    !invoicesQuery.isLoading &&
    !invoicesQuery.error &&
    (editDraft !== null || sourcesQuery.isSuccess);

  useImperativeHandle(
    ref,
    () => ({
      getValidation: () => validation,
      getSubmissionBlockReason: () => {
        if (validation.errors.sources && sources.some((source) => source.clientBillableQuantity > 0)) {
          return "incomplete-billable-sources";
        }

        return null;
      },
      getSubmissionInput: () => {
        setShowValidation(true);
        if (!canSubmit || !validation.valid) return null;

        if (!editDraft || !isSnapshotPristine) return validation.value;

        return {
          ...validation.value,
          payload: {
            ...validation.value.payload,
            invoiceTotalValue: editDraft.invoiceTotalValue,
            ...(editDraft.invoiceFileUrl && !validation.value.invoiceFile
              ? { invoiceFileUrl: editDraft.invoiceFileUrl }
              : {}),
          },
        };
      },
    }),
    [canSubmit, editDraft, isSnapshotPristine, sources, validation],
  );

  return (
    <div className="space-y-8">
      <ProviderInvoiceCommonFields
        value={fields}
        onChange={(patch) => {
          setFields((current) => ({ ...current, ...patch }));
          setIsSnapshotPristine(false);
        }}
        errors={showValidation && !validation.valid ? validation.errors : undefined}
        unavailableCompetenceMonths={
          new Set(usedCompetenceMonths.map((value) => value.slice(0, 7)))
        }
        isDisabled={isDisabled}
        variant="direct-postpaid"
      />

      {invoicesQuery.error ? (
        <p role="alert">Não foi possível consultar as competências usadas.</p>
      ) : null}
      <section className="space-y-3">
        <ProviderInvoiceDirectSourcesTable
          sources={sources}
          onChange={(nextSources) => {
            setSources(nextSources);
            setIsSnapshotPristine(false);
          }}
          isLoading={editDraft ? false : sourcesQuery.isLoading}
          error={editDraft ? null : sourcesQuery.error}
        />
        {showValidation && !validation.valid && validation.errors.sources ? (
          <p role="alert" className="text-sm text-danger-500">
            {validation.errors.sources}
          </p>
        ) : null}
      </section>

      <DirectProviderInvoiceTotals
        items={[
          {
            label: "Total de consultas bilhetadas",
            value: totals.totalBillableQuantity,
            testId: "direct-postpaid-billable-total",
          },
          {
            label: "Valor total",
            value: formatCurrency(totals.invoiceTotalValue),
            testId: "direct-postpaid-invoice-total",
          },
        ]}
      />
    </div>
  );
});
