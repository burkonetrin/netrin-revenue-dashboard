import { formatCurrency } from "@/shared/utils/currency";
import type {
  ProviderCreditDeposit,
  ProviderInvoiceResponse,
} from "../types/providerInvoices.types";

const MONTH_NAMES_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

function parseApiDate(value: string): Date | null {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Formata competência no padrão Figma `Agosto/2025` (DET-06/07).
 */
export function formatCompetenceMonth(competenceMonth: string): string {
  const date = parseApiDate(competenceMonth.slice(0, 10));
  if (!date) return competenceMonth;
  const month = MONTH_NAMES_PT[date.getMonth()];
  return `${month}/${date.getFullYear()}`;
}

/** Coluna Valor (pós-pago). */
export function formatInvoiceValue(invoiceTotalValue: string): string {
  return formatCurrency(invoiceTotalValue);
}

function depositSortKey(deposit: ProviderCreditDeposit): number {
  const raw = deposit.creditedAt ?? deposit.paidAt;
  if (!raw) return 0;
  const date = parseApiDate(raw.slice(0, 10));
  return date ? date.getTime() : 0;
}

/** Formata data ISO da API como `DD/MM/AAAA`, preservando valor inválido para diagnóstico. */
export function formatDayMonthYear(isoDate: string): string {
  const date = parseApiDate(isoDate.slice(0, 10));
  if (!date) return isoDate;
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Último depósito: deposit mais recente → `R$… em DD/MM/AAAA`; sem deposits → `—`.
 */
export function formatLastCreditDeposit(
  creditDeposits: ProviderCreditDeposit[] | undefined,
): string {
  if (!creditDeposits || creditDeposits.length === 0) {
    return "—";
  }

  const [latest] = [...creditDeposits].sort((a, b) => depositSortKey(b) - depositSortKey(a));
  const amount = formatCurrency(latest.creditAmount);
  const dateRaw = latest.creditedAt ?? latest.paidAt;
  if (!dateRaw) {
    return amount;
  }
  return `${amount} em ${formatDayMonthYear(dateRaw)}`;
}

/** Valor acumulado (pré-pago) = endingBalance. */
export function formatAccumulatedValue(
  invoice: Pick<ProviderInvoiceResponse, "endingBalance">,
): string {
  if (
    invoice.endingBalance === undefined ||
    invoice.endingBalance === null ||
    invoice.endingBalance === ""
  ) {
    return "—";
  }
  return formatCurrency(invoice.endingBalance);
}
