import type { BillingRecordSource } from "../mock/billingMockStore";
import type {
  BillingInvoiceStatusKey,
  BillingInvoiceStatusMeta,
  BillingInvoiceStatusState,
} from "../types/billing-invoice-status.types";
import type { BillingInvoiceRecord } from "../types/billing.types";

export function buildBillingRecordKey(
  record: Pick<BillingInvoiceRecord, "id" | "source">,
): string {
  const source = record.source ?? "invoice";
  return `${source}:${record.id}`;
}

export function parseBillingRecordKey(key: string): { source: BillingRecordSource; id: string } {
  const [source, ...rest] = key.split(":");
  return {
    source: (source === "entry" ? "entry" : "invoice") as BillingRecordSource,
    id: rest.join(":"),
  };
}

export function canAdjustBillingInvoice(status: BillingInvoiceStatusKey): boolean {
  return status === "fatura_aberta";
}

export function isBillingCloseEligible(status: BillingInvoiceStatusKey): boolean {
  return status === "fatura_aberta";
}

export function isBillingBillClientEligible(status: BillingInvoiceStatusKey): boolean {
  return status === "fatura_aberta" || status === "fatura_fechada";
}

export function defaultBillingInvoiceStatusState(): BillingInvoiceStatusState {
  return { status: "fatura_aberta" };
}

export function mergeStatusIntoRecord<T extends BillingInvoiceRecord>(
  record: T,
  state: BillingInvoiceStatusState | undefined,
): T & { billingStatus: BillingInvoiceStatusKey; statusMeta?: BillingInvoiceStatusMeta } {
  const resolved = state ?? defaultBillingInvoiceStatusState();
  return {
    ...record,
    billingStatus: resolved.status,
    statusMeta: resolved.meta,
  };
}
