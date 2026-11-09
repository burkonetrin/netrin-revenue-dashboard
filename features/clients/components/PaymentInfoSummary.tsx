"use client";

/**
 * Componentes de resumo das informações de pagamento configuradas.
 */

import type React from "react";
import type { PaymentInfoResponse } from "../types/contractsFranchises.types";

interface SummaryField {
  label: string;
  value: React.ReactNode;
  className?: string;
}

/**
 * Formata valor para exibição no resumo de pagamento.
 */
export function formatSummaryValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function formatCodeLabel(option: PaymentInfoResponse["currency"] | null | undefined) {
  if (!option) return "-";
  if (!option.label) return option.value;
  if (option.label.includes(option.value)) return option.label;
  return `${option.value} - ${option.label}`;
}

const dueTypeLabelMap: Record<string, string> = {
  standard: "Padrão",
  STANDARD: "Padrão",
  weekday: "Dia da semana",
  WEEKDAY: "Dia da semana",
  specific_day: "Dia específico",
  SPECIFIC_DAY: "Dia específico",
  date_range: "Intervalo de datas",
  DATE_RANGE: "Intervalo de datas",
};

const weekdayLabelMap: Record<number, string> = {
  0: "Segunda-feira",
  1: "Terça-feira",
  2: "Quarta-feira",
  3: "Quinta-feira",
  4: "Sexta-feira",
  5: "Sábado",
  6: "Domingo",
};

function getDueTypeValue(paymentInfo: PaymentInfoResponse) {
  const value = paymentInfo.dueType?.value;
  return (value && dueTypeLabelMap[value]) || paymentInfo.dueType?.label || "-";
}

function getDueSpecificFields(paymentInfo: PaymentInfoResponse): SummaryField[] {
  const value = paymentInfo.dueType?.value;

  if (value === "weekday" || value === "WEEKDAY") {
    const weekday =
      paymentInfo.dueWeekday !== null && paymentInfo.dueWeekday !== undefined
        ? weekdayLabelMap[paymentInfo.dueWeekday]
        : undefined;
    return [{ label: "Dia da semana", value: formatSummaryValue(weekday) }];
  }

  if (value === "specific_day" || value === "SPECIFIC_DAY") {
    return [{ label: "Dia específico", value: formatSummaryValue(paymentInfo.dueSpecificDay) }];
  }

  if (value === "date_range" || value === "DATE_RANGE") {
    return [
      { label: "Início do intervalo", value: formatSummaryValue(paymentInfo.dueDateRangeStart) },
      { label: "Fim do intervalo", value: formatSummaryValue(paymentInfo.dueDateRangeEnd) },
    ];
  }

  return [];
}

/**
 * Card de campo no resumo de pagamento.
 */
export function SummaryCard({ label, value, className = "" }: SummaryField) {
  return (
    <div className={`min-h-16 rounded-md bg-default-50 px-4 py-3 ${className}`}>
      <p className="text-sm text-zinc-400">{label}</p>
      <div className="mt-2 text-sm leading-5 text-gray-900">{value}</div>
    </div>
  );
}

interface PaymentInfoSummaryProps {
  paymentInfo: PaymentInfoResponse;
  clientSapCode?: string | null;
  showSapCode?: boolean;
  showProfitCenterFields?: boolean;
}

/**
 * Resumo somente leitura das informações de pagamento.
 */
export function PaymentInfoSummary({
  paymentInfo,
  clientSapCode,
  showSapCode = true,
  showProfitCenterFields = true,
}: PaymentInfoSummaryProps) {
  const enabledNfeOptions = [
    paymentInfo.nfeAddConsumptionInfo ? "Informação de consumo do cliente na nota fiscal" : null,
    paymentInfo.nfeAddBankInfo
      ? "Informações de pagamento dos dados bancários na nota fiscal"
      : null,
  ].filter(Boolean);

  const fields: SummaryField[] = [
    showSapCode ? { label: "Código SAP", value: formatSummaryValue(clientSapCode) } : null,
    { label: "Código filial", value: formatSummaryValue(paymentInfo.nfeBranchCode) },
    { label: "Filial NF-e", value: formatSummaryValue(paymentInfo.nfeBranch) },
    {
      label: "Método de pagamento",
      value: formatSummaryValue(paymentInfo.paymentMethod?.label),
    },
    { label: "Moeda", value: formatCodeLabel(paymentInfo.currency) },
    showProfitCenterFields
      ? {
          label: "Centro de lucro",
          value: formatSummaryValue(paymentInfo.profitCenter?.label),
        }
      : null,
    showProfitCenterFields
      ? {
          label: "Centro de lucro (excedente)",
          value: formatSummaryValue(paymentInfo.overageProfitCenter?.label),
        }
      : null,
    {
      label: "Dias adicionais",
      value: formatSummaryValue(paymentInfo.dueAdditionalDays),
    },
    {
      label: "Tipo de vencimento",
      value: getDueTypeValue(paymentInfo),
    },
    {
      label: "Periodicidade de faturamento",
      value: formatSummaryValue(paymentInfo.billingPeriodicity),
    },
    ...getDueSpecificFields(paymentInfo),
  ].filter((field): field is SummaryField => field !== null);

  return (
    <div className="space-y-4">
      {enabledNfeOptions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {enabledNfeOptions.map((option) => (
            <span
              key={option}
              className="rounded-full bg-default-100 px-3 py-2 text-sm leading-none text-gray-600"
            >
              {option}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {fields.map((field) => (
          <SummaryCard key={field.label} {...field} />
        ))}
      </div>

      {paymentInfo.nfeAddOrderObservation && (
        <SummaryCard
          label="Observações"
          value={formatSummaryValue(paymentInfo.nfeOrderObservationText)}
          className="min-h-20"
        />
      )}
    </div>
  );
}
