import type { BillingInvoiceRecord } from "../types/billing.types";
import type {
  BillingInvoiceStatusFilterKey,
  BillingInvoiceStatusKey,
} from "../types/billing-invoice-status.types";

export function billingRecordMatchesStatusFilter(
  row: BillingInvoiceRecord,
  filterKey: BillingInvoiceStatusFilterKey,
): boolean {
  const status = row.billingStatus;
  if (!status) return false;

  if (filterKey === "fatura_aberta_espelho") {
    return status === "fatura_aberta" && row.source === "entry";
  }

  if (filterKey === "fatura_aberta") {
    return status === "fatura_aberta" && row.source !== "entry";
  }

  return status === (filterKey as BillingInvoiceStatusKey);
}
