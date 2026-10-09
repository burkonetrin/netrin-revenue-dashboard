"use client";

import { defaultInputClassNames, defaultSelectClassNames } from "@/shared/styles/inputClassNames";
import { formatCurrency, maskCurrency } from "@/shared/utils/currency";
import { type ErrorResponse, getErrorMessage } from "@/shared/utils/errorParser";
import { Checkbox, Input, Select, SelectItem } from "@heroui/react";
import type { AxiosError } from "axios";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { getCurrentMonth } from "../../billing/utils/billing-list.utils";
import { buildBillingMonthOptions } from "../../billing/utils/billing-month.utils";
import { useProviderInvoiceBillableSources } from "../hooks/useProviderInvoiceBillableSources";
import { useProviderInvoices } from "../hooks/useProviderInvoices";
import type {
  CreateProviderInvoiceCompetenceRequest,
  ProviderInvoiceResponse,
} from "../types/providerInvoices.types";
import type { ProviderInvoiceSourceAllocation } from "../utils/providerInvoiceAllocation.utils";
import {
  type PrepaidCompetenceDraft,
  type PrepaidCompetenceValidation,
  type PrepaidCreditDepositDraft,
  allocatePrepaidCost,
  applyMinimumFranchise,
  calculatePrepaidConsumption,
  validatePrepaidCompetenceDraft,
} from "../utils/providerPrepaidCompetence.utils";
import { PrepaidCreditDepositsEditor } from "./PrepaidCreditDepositsEditor";
import { ProviderInvoiceBillableSourcesTable } from "./ProviderInvoiceBillableSourcesTable";
import { ProviderInvoiceFieldLabel } from "./ProviderInvoiceFieldLabel";

export interface IndirectPrepaidCompetenceFormHandle {
  getSubmissionInput: () => IndirectPrepaidCompetenceSubmissionIntent | null;
  getSubmissionBlockReason: () => null;
  getValidation: () => PrepaidCompetenceValidation;
}

export interface IndirectPrepaidCompetenceSubmissionIntent
  extends Omit<CreateProviderInvoiceCompetenceRequest, "creditDeposits"> {
  creditDeposits: PrepaidCreditDepositDraft[];
}

export interface IndirectPrepaidCompetenceFormProps {
  providerId: string;
  editingCompetence?: ProviderInvoiceResponse;
  isDisabled?: boolean;
}

const EMPTY_DRAFT: PrepaidCompetenceDraft = {
  competenceMonth: (() => {
    const [year, month] = getCurrentMonth().split("-");
    return `${month}/${year}`;
  })(),
  startingBalance: "",
  creditDeposits: [],
  isMonthClosed: false,
  endingBalance: "",
  minimumFranchiseValue: "",
};

const prepaidFieldClassNames = {
  ...defaultInputClassNames,
  base: "w-full",
};

const prepaidSelectClassNames = {
  ...defaultSelectClassNames,
  base: "w-full",
};

function toApiMonth(value: string): string | null {
  const match = /^(0[1-9]|1[0-2])\/(\d{4})$/.exec(value.trim());
  return match ? `${match[2]}-${match[1]}-01` : null;
}

function monthlyPeriod(competenceMonth: string) {
  const apiMonth = toApiMonth(competenceMonth);
  if (!apiMonth) return null;
  const [year, month] = apiMonth.split("-").map(Number);
  return {
    assessmentStartDate: apiMonth,
    assessmentEndDate: new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10),
  };
}

function maskOptionalCurrency(value: string): string {
  return value ? maskCurrency(value) : "";
}

function snapshotDraft(invoice?: ProviderInvoiceResponse): PrepaidCompetenceDraft {
  if (!invoice) return EMPTY_DRAFT;

  return {
    competenceMonth: `${invoice.competenceMonth.slice(5, 7)}/${invoice.competenceMonth.slice(0, 4)}`,
    startingBalance: maskOptionalCurrency(invoice.startingBalance ?? ""),
    creditDeposits: (invoice.creditDeposits ?? []).map((deposit) => ({
      id: deposit.id,
      balanceBeforeCredit: maskOptionalCurrency(deposit.balanceBeforeCredit),
      creditAmount: maskOptionalCurrency(deposit.creditAmount),
    })),
    isMonthClosed: invoice.isMonthClosed ?? false,
    endingBalance: maskOptionalCurrency(invoice.endingBalance ?? ""),
    minimumFranchiseValue: maskOptionalCurrency(invoice.minimumFranchiseValue ?? ""),
  };
}

export const IndirectPrepaidCompetenceForm = forwardRef<
  IndirectPrepaidCompetenceFormHandle,
  IndirectPrepaidCompetenceFormProps
>(function IndirectPrepaidCompetenceForm(
  { providerId, editingCompetence, isDisabled = false },
  ref,
) {
  const [draft, setDraft] = useState(() => snapshotDraft(editingCompetence));
  const [showValidation, setShowValidation] = useState(false);
  const invoicesQuery = useProviderInvoices(providerId, { page: 1, pageSize: 100 });
  const editingCompetenceId = editingCompetence?.id;
  const period = monthlyPeriod(draft.competenceMonth);
  const usedCompetences = useMemo(
    () =>
      (invoicesQuery.data?.data ?? [])
        .filter((invoice) => editingCompetenceId === undefined || invoice.id !== editingCompetenceId)
        .map((invoice) => invoice.competenceMonth),
    [editingCompetenceId, invoicesQuery.data],
  );
  const validation = useMemo(
    () => validatePrepaidCompetenceDraft(draft, usedCompetences),
    [draft, usedCompetences],
  );
  const sourcesQuery = useProviderInvoiceBillableSources(providerId, period ?? {}, {
    enabled: Boolean(period) && !editingCompetence,
  });
  const consumption = useMemo(
    () => {
      if (!validation.valid) return null;

      return calculatePrepaidConsumption({
            ...validation.value,
            endingBalance: validation.value.endingBalance ?? "",
      });
    },
    [validation],
  );
  const effectiveCost = editingCompetence
    ? editingCompetence.sourcesTotalValue
    : consumption?.status === "valid" && validation.valid
      ? applyMinimumFranchise(consumption.consumedValue, validation.value.minimumFranchiseValue)
      : null;
  const allocation = useMemo(
    () => {
      if (!editingCompetence && effectiveCost && sourcesQuery.isSuccess) {
        return allocatePrepaidCost(effectiveCost, sourcesQuery.data);
      }

      return null;
    },
    [editingCompetence, effectiveCost, sourcesQuery.data, sourcesQuery.isSuccess],
  );
  const tableSources = useMemo<ProviderInvoiceSourceAllocation[]>(
    () =>
      (editingCompetence?.sources ?? allocation?.sources ?? sourcesQuery.data ?? []).map(
        (source) => {
          const totalCost = "totalCost" in source ? String(source.totalCost) : "0.00";
          return {
            ...source,
            providerChargedQuantity: Math.max(source.clientBillableQuantity, 0),
            unitCost:
              source.clientBillableQuantity > 0
                ? (Number(totalCost) / source.clientBillableQuantity).toFixed(2)
                : "0.00",
            totalCost,
          };
        },
      ),
    [allocation, editingCompetence?.sources, sourcesQuery.data],
  );
  const canSubmit =
    validation.valid &&
    consumption?.status === "valid" &&
    !invoicesQuery.isLoading &&
    !invoicesQuery.error &&
    (editingCompetence ? tableSources.length > 0 : sourcesQuery.isSuccess);

  useEffect(() => {
    setDraft(snapshotDraft(editingCompetence));
    setShowValidation(false);
  }, [editingCompetence]);

  useImperativeHandle(
    ref,
    () => ({
      getValidation: () => validation,
      getSubmissionBlockReason: () => null,
      getSubmissionInput: () => {
        setShowValidation(true);
        if (!canSubmit || !validation.valid) return null;

        return {
          competenceMonth: validation.value.competenceMonth,
          assessmentStartDate: validation.value.assessmentStartDate,
          assessmentEndDate: validation.value.assessmentEndDate,
          startingBalance: validation.value.startingBalance,
          creditDeposits: validation.value.creditDeposits,
          ...(validation.value.isMonthClosed
            ? { endingBalance: validation.value.endingBalance }
            : {}),
          isMonthClosed: validation.value.isMonthClosed,
          minimumFranchiseValue: validation.value.minimumFranchiseValue,
          sources: tableSources.map((source) => ({
            dataSourceProviderId: source.dataSourceProviderId,
            providerChargedQuantity: source.providerChargedQuantity,
            unitCost: source.unitCost,
            totalCost: source.totalCost,
          })),
        };
      },
    }),
    [canSubmit, tableSources, validation],
  );

  const errors = showValidation && !validation.valid ? validation.errors : undefined;
  const invoiceError = getErrorMessage(
    (invoicesQuery.error as AxiosError<ErrorResponse> | null) ?? null,
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex min-w-0 flex-col gap-3">
        <ProviderInvoiceFieldLabel isRequired>Competência</ProviderInvoiceFieldLabel>
        <Select
          aria-label="Competência"
          selectedKeys={draft.competenceMonth ? [draft.competenceMonth] : []}
          onSelectionChange={(keys) =>
            setDraft((current) => ({
              ...current,
              competenceMonth: (Array.from(keys)[0] as string) ?? "",
            }))
          }
          isRequired
          isDisabled={isDisabled}
          isInvalid={Boolean(errors?.competenceMonth)}
          errorMessage={errors?.competenceMonth}
          radius="sm"
          classNames={prepaidSelectClassNames}
        >
          {buildBillingMonthOptions().map((option) => {
            const [year, month] = option.value.split("-");
            const formValue = `${month}/${year}`;
            return <SelectItem key={formValue}>{option.label}</SelectItem>;
          })}
        </Select>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <ProviderInvoiceFieldLabel>
          Valor mínimo de franquia (R$) - Opcional
        </ProviderInvoiceFieldLabel>
        <Input
          aria-label="Valor mínimo de franquia (R$) - Opcional"
          placeholder="R$ 0,00"
          value={draft.minimumFranchiseValue}
          onValueChange={(minimumFranchiseValue) =>
            setDraft((current) => ({
              ...current,
              minimumFranchiseValue: maskOptionalCurrency(minimumFranchiseValue),
            }))
          }
          isDisabled={isDisabled}
          isInvalid={Boolean(errors?.minimumFranchiseValue)}
          errorMessage={errors?.minimumFranchiseValue}
          radius="sm"
          classNames={prepaidFieldClassNames}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <ProviderInvoiceFieldLabel isRequired>Saldo no início do mês</ProviderInvoiceFieldLabel>
        <Input
          aria-label="Saldo no início do mês"
          placeholder="R$ 0,00"
          value={draft.startingBalance}
          onValueChange={(startingBalance) =>
            setDraft((current) => ({
              ...current,
              startingBalance: maskOptionalCurrency(startingBalance),
            }))
          }
          isRequired
          isDisabled={isDisabled}
          isInvalid={Boolean(errors?.startingBalance)}
          errorMessage={errors?.startingBalance}
          radius="sm"
          classNames={prepaidFieldClassNames}
        />
      </div>
      <PrepaidCreditDepositsEditor
        value={draft.creditDeposits}
        onChange={(creditDeposits) => setDraft((current) => ({ ...current, creditDeposits }))}
        errors={errors}
        isDisabled={isDisabled}
      />
      <Checkbox
        isSelected={draft.isMonthClosed}
        isDisabled={isDisabled}
        classNames={{ label: "text-sm text-[#52525B]!" }}
        onValueChange={(isMonthClosed) => setDraft((current) => ({ ...current, isMonthClosed }))}
      >
        Fechar mês de competência
      </Checkbox>
      {draft.isMonthClosed && (
        <div className="flex min-w-0 flex-col gap-3">
          <ProviderInvoiceFieldLabel isRequired>Saldo no fim do mês</ProviderInvoiceFieldLabel>
          <Input
            aria-label="Saldo no fim do mês"
            placeholder="R$ 0,00"
            value={draft.endingBalance}
            onValueChange={(endingBalance) =>
              setDraft((current) => ({
                ...current,
                endingBalance: maskOptionalCurrency(endingBalance),
              }))
            }
            isRequired
            isDisabled={isDisabled}
            isInvalid={Boolean(errors?.endingBalance)}
            errorMessage={errors?.endingBalance}
            radius="sm"
            classNames={prepaidFieldClassNames}
          />
        </div>
      )}
      <section className="flex flex-col gap-4" aria-labelledby="prepaid-total-title">
        <h3 id="prepaid-total-title" className="text-base font-medium text-default-600">
          Total
        </h3>
        <div className="rounded-lg bg-[#FAFAFA] p-4" data-testid="indirect-prepaid-calculated-cost">
          <span className="text-sm leading-6 text-default-500">Custo calculado</span>
          <p className="mt-2 text-xl font-medium leading-4 text-default-700">
            {effectiveCost ? formatCurrency(effectiveCost) : "-"}
          </p>
        </div>
      </section>
      {invoiceError && (
        <p role="alert" className="text-sm text-danger-500">
          Não foi possível consultar as competências usadas: {invoiceError}
        </p>
      )}
      {consumption?.status === "invalid" && (
        <p role="alert" className="text-sm text-danger-500">
          O consumo calculado não pode ser negativo.
        </p>
      )}
      <section className="space-y-3" aria-labelledby="prepaid-allocation-title">
        <h3 id="prepaid-allocation-title" className="text-sm font-medium text-default-800">
          Custo distribuído entre fornecedores diretos vinculados
        </h3>
        <ProviderInvoiceBillableSourcesTable
          sources={tableSources}
          isLoading={!editingCompetence && sourcesQuery.isLoading}
          error={editingCompetence ? null : sourcesQuery.error}
        />
      </section>
    </div>
  );
});
