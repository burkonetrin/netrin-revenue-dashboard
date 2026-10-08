"use client";

import { formatCurrency } from "@/shared/utils/currency";
import type { BillingBankTransactionRow } from "../types/billing-bank-transaction.types";
import { BillingRequestCodeCell } from "./BillingRequestCodeCell";
import { SupportToolsLabelInfoTooltip } from "./support-tools/SupportToolsLabelInfoTooltip";
import {
  formatBankAccountLine,
  formatBankTransactionDateTime,
  formatPixKeyTypeLabel,
} from "../utils/billing-bank-transaction.utils";

const MICRO_DEPOSIT_VALIDATED_TOOLTIP = "Microdepósito validado com sucesso.";

const SUBLINE_CLASS = "text-xs text-gray-500";

export function BillingBankTransactionValueCell({ row }: { row: BillingBankTransactionRow }) {
  const valueLabel =
    row.transactionValue != null && !Number.isNaN(row.transactionValue)
      ? formatCurrency(row.transactionValue)
      : "—";
  const costLabel =
    row.transactionCost != null && !Number.isNaN(row.transactionCost)
      ? formatCurrency(row.transactionCost)
      : "—";

  return (
    <div className="flex w-max flex-col gap-0.5">
      <span className="whitespace-nowrap text-gray-900">{valueLabel}</span>
      <span className={`whitespace-nowrap ${SUBLINE_CLASS}`}>Custo: {costLabel}</span>
    </div>
  );
}

export function BillingBankPixKeyCell({ row }: { row: BillingBankTransactionRow }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-gray-900">{row.pixKey ?? "—"}</span>
      <span className={SUBLINE_CLASS}>{formatPixKeyTypeLabel(row.pixKeyType)}</span>
    </div>
  );
}

export function BillingBankCell({ row }: { row: BillingBankTransactionRow }) {
  return (
    <div className="flex w-max flex-col gap-0.5">
      <span className="whitespace-nowrap text-gray-900">{row.bankCode ?? "—"}</span>
      <span className={`whitespace-nowrap ${SUBLINE_CLASS}`}>
        {formatBankAccountLine(row.bankBranch, row.bankAccount, row.bankAccountDigit)}
      </span>
    </div>
  );
}

export function BillingBankMicroDepositCell({ row }: { row: BillingBankTransactionRow }) {
  const status = row.microDepositStatus ?? "Validado";

  if (status === "Invalidado") {
    return <span className="whitespace-nowrap text-gray-900">{status}</span>;
  }

  return (
    <SupportToolsLabelInfoTooltip
      label={status}
      tooltipContent={MICRO_DEPOSIT_VALIDATED_TOOLTIP}
      ariaLabel={`Detalhes do microdepósito: ${status}`}
    />
  );
}

export function BillingBankTransactionDateCell({ row }: { row: BillingBankTransactionRow }) {
  const tempo =
    row.requestTimeMs != null && !Number.isNaN(row.requestTimeMs)
      ? `${Math.round(row.requestTimeMs)}ms`
      : "—";

  return (
    <div className="flex w-max max-w-full flex-col gap-0.5">
      <span className="whitespace-nowrap text-gray-900">
        {formatBankTransactionDateTime(row.executedAt)}
      </span>
      <span className={`whitespace-nowrap ${SUBLINE_CLASS}`}>Tempo: {tempo}</span>
    </div>
  );
}

export function BillingBankSourceCell({ row }: { row: BillingBankTransactionRow }) {
  const provider = row.provider?.trim() || "—";

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-gray-900">{row.sourceName ?? "—"}</span>
      <span className={`inline-flex max-w-full flex-wrap items-center gap-2 ${SUBLINE_CLASS}`}>
        <span>ID {row.dataSourceId}</span>
        <span className="h-3 w-px shrink-0 bg-gray-300" aria-hidden />
        <span>Fornecedor: {provider}</span>
      </span>
    </div>
  );
}

export function BillingBankDocumentCell({ row }: { row: BillingBankTransactionRow }) {
  const document = row.document?.trim() || "—";
  const holder = row.documentHolderName?.trim();

  return (
    <div className="flex w-max flex-col gap-0.5">
      <span className="whitespace-nowrap text-gray-900">{document}</span>
      {holder ? <span className={`whitespace-nowrap ${SUBLINE_CLASS}`}>{holder}</span> : null}
    </div>
  );
}

export function BillingBankStatusCell({ row }: { row: BillingBankTransactionRow }) {
  return (
    <BillingRequestCodeCell statusCode={row.statusCode} tooltipContent={row.message} />
  );
}
