"use client";

import { defaultInputClassNames, defaultSelectClassNames } from "@/shared/styles/inputClassNames";
import { maskCurrency } from "@/shared/utils/currency";
import { Checkbox, DatePicker, Input, Select, SelectItem } from "@heroui/react";
import { type DateValue, parseDate } from "@internationalized/date";
import type { ComponentProps, ReactNode } from "react";
import { buildBillingMonthOptions } from "../../billing/utils/billing-month.utils";
import type { PrepaidCreditDepositDraft } from "../utils/providerPrepaidCompetence.utils";
import { DirectPrepaidCreditDepositsEditor } from "./DirectPrepaidCreditDepositsEditor";
import { ProviderInvoiceFieldLabel } from "./ProviderInvoiceFieldLabel";

export interface DirectPrepaidCompetenceFieldsValue {
  competenceMonth: string;
  assessmentStartDate: string;
  assessmentEndDate: string;
  startingBalance: string;
  creditDeposits: PrepaidCreditDepositDraft[];
  isMonthClosed: boolean;
  endingBalance: string;
  minimumFranchiseValue: string;
}

export type DirectPrepaidCompetenceFieldsErrors = Partial<Record<string, string>>;

export interface DirectPrepaidCompetenceFieldsProps {
  value: DirectPrepaidCompetenceFieldsValue;
  onChange: (patch: Partial<DirectPrepaidCompetenceFieldsValue>) => void;
  errors?: DirectPrepaidCompetenceFieldsErrors;
  unavailableCompetenceMonths?: ReadonlySet<string>;
  isDisabled?: boolean;
  children?: ReactNode;
}

type DatePickerValue = ComponentProps<typeof DatePicker>["value"];

function safeParseDate(value: string): DatePickerValue {
  if (!value) return null;
  try {
    return parseDate(value) as unknown as DatePickerValue;
  } catch {
    return null;
  }
}

function maskOptionalCurrency(value: string): string {
  return value ? maskCurrency(value) : "";
}

function toFormCompetenceValue(value: string): string {
  const [year, month] = value.split("-");
  return `${month}/${year}`;
}

const directPrepaidFieldClassNames = {
  ...defaultInputClassNames,
  base: "w-full",
};

const directPrepaidSelectClassNames = {
  ...defaultSelectClassNames,
  base: "w-full",
};

/** Renders the period, balance, deposits, closing, and franchise fields for a direct prepaid competence. */
export function DirectPrepaidCompetenceFields({
  value,
  onChange,
  errors,
  unavailableCompetenceMonths = new Set<string>(),
  isDisabled = false,
  children,
}: DirectPrepaidCompetenceFieldsProps) {
  const selectedBillingMonth = value.competenceMonth
    ? `${value.competenceMonth.slice(3)}-${value.competenceMonth.slice(0, 2)}`
    : null;
  const competenceOptions = buildBillingMonthOptions(
    selectedBillingMonth ? [selectedBillingMonth] : [],
  ).filter(
    (option) =>
      !unavailableCompetenceMonths.has(`${option.value}-01`) ||
      option.value === selectedBillingMonth,
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h3 className="text-base font-medium text-default-600">Período</h3>
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-3">
            <ProviderInvoiceFieldLabel isRequired>Competência</ProviderInvoiceFieldLabel>
            <Select
              aria-label="Competência"
              placeholder="Selecione um mês"
              selectedKeys={value.competenceMonth ? [value.competenceMonth] : []}
              onSelectionChange={(keys) => {
                const competenceMonth = Array.from(keys)[0] as string | undefined;
                onChange({ competenceMonth: competenceMonth ?? "" });
              }}
              isRequired
              isDisabled={isDisabled}
              isInvalid={Boolean(errors?.competenceMonth)}
              errorMessage={errors?.competenceMonth}
              radius="sm"
              classNames={directPrepaidSelectClassNames}
            >
              {competenceOptions.map((option) => (
                <SelectItem key={toFormCompetenceValue(option.value)} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <ProviderInvoiceFieldLabel isRequired>Período inicial</ProviderInvoiceFieldLabel>
            <DatePicker
              aria-label="Período inicial"
              value={safeParseDate(value.assessmentStartDate)}
              onChange={(date: DateValue | null) =>
                onChange({ assessmentStartDate: date?.toString() ?? "" })
              }
              isRequired
              isDisabled={isDisabled}
              isInvalid={Boolean(errors?.assessmentStartDate)}
              errorMessage={errors?.assessmentStartDate}
              classNames={directPrepaidFieldClassNames}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <ProviderInvoiceFieldLabel isRequired>Período final</ProviderInvoiceFieldLabel>
            <DatePicker
              aria-label="Período final"
              value={safeParseDate(value.assessmentEndDate)}
              onChange={(date: DateValue | null) =>
                onChange({ assessmentEndDate: date?.toString() ?? "" })
              }
              isRequired
              isDisabled={isDisabled}
              isInvalid={Boolean(errors?.assessmentEndDate)}
              errorMessage={errors?.assessmentEndDate}
              classNames={directPrepaidFieldClassNames}
            />
          </div>
        </div>
      </section>

      <div className="border-t border-default-200" />

      <section className="flex flex-col gap-5">
        <h3 className="text-base font-medium text-default-600">Depósitos de crédito</h3>
        <div className="flex min-w-0 flex-col gap-3">
          <ProviderInvoiceFieldLabel isRequired>Saldo no início do mês</ProviderInvoiceFieldLabel>
          <Input
            aria-label="Saldo no início do mês"
            placeholder="R$ 0,00"
            value={value.startingBalance}
            onValueChange={(startingBalance) =>
              onChange({ startingBalance: maskOptionalCurrency(startingBalance) })
            }
            isRequired
            isDisabled={isDisabled}
            isInvalid={Boolean(errors?.startingBalance)}
            errorMessage={errors?.startingBalance}
            radius="sm"
            classNames={directPrepaidFieldClassNames}
          />
        </div>

        <DirectPrepaidCreditDepositsEditor
          value={value.creditDeposits}
          onChange={(creditDeposits) => onChange({ creditDeposits })}
          errors={errors}
          isDisabled={isDisabled}
        />

        <Checkbox
          isSelected={value.isMonthClosed}
          isDisabled={isDisabled}
          classNames={{ label: "text-sm text-[#52525B]!" }}
          onValueChange={(isMonthClosed) =>
            onChange(isMonthClosed ? { isMonthClosed } : { isMonthClosed, endingBalance: "" })
          }
        >
          Fechar mês de competência
        </Checkbox>

        {value.isMonthClosed && (
          <div className="flex min-w-0 flex-col gap-3">
            <ProviderInvoiceFieldLabel isRequired>Saldo no fim do mês</ProviderInvoiceFieldLabel>
            <Input
              aria-label="Saldo no fim do mês"
              placeholder="R$ 0,00"
              value={value.endingBalance}
              onValueChange={(endingBalance) =>
                onChange({ endingBalance: maskOptionalCurrency(endingBalance) })
              }
              isRequired
              isDisabled={isDisabled}
              isInvalid={Boolean(errors?.endingBalance)}
              errorMessage={errors?.endingBalance}
              radius="sm"
              classNames={directPrepaidFieldClassNames}
            />
          </div>
        )}
      </section>

      <div className="border-t border-default-200" />

      <section className="flex flex-col gap-4">
        <h3 className="text-base font-medium text-default-600">Valores</h3>
        <div className="flex min-w-0 flex-col gap-3">
          <ProviderInvoiceFieldLabel>
            Valor mínimo de franquia (R$) - Opcional
          </ProviderInvoiceFieldLabel>
          <Input
            aria-label="Valor mínimo de franquia (R$) - Opcional"
            placeholder="R$ 0,00"
            value={value.minimumFranchiseValue}
            onValueChange={(minimumFranchiseValue) =>
              onChange({ minimumFranchiseValue: maskOptionalCurrency(minimumFranchiseValue) })
            }
            isDisabled={isDisabled}
            isInvalid={Boolean(errors?.minimumFranchiseValue)}
            errorMessage={errors?.minimumFranchiseValue}
            radius="sm"
            classNames={directPrepaidFieldClassNames}
          />
        </div>
        {children}
      </section>
    </div>
  );
}
