import type { BillingRecordSource } from "../mock/billingMockStore";
import type {
  BillingInvoiceStatusKey,
  BillingInvoiceStatusMeta,
  BillingInvoiceStatusState,
} from "../types/billing-invoice-status.types";
import type { BillingInvoiceRecord, BillingInvoiceNote } from "../types/billing.types";

/** Status que disparam detalhes inline na tooltip multi-nota. */
export const BILLING_STATUS_WITH_INFO_CONTENT: BillingInvoiceStatusKey[] = [
  "pago_parcial",
  "pago_total",
  "pago_excedente",
  "nota_vencida",
  "nota_cancelada",
];

export function billingStatusHasInfoContent(status: BillingInvoiceStatusKey): boolean {
  return BILLING_STATUS_WITH_INFO_CONTENT.includes(status);
}

export function resolveNoteBillingStatus(
  note: Pick<BillingInvoiceNote, "billingStatus">,
  recordStatus?: BillingInvoiceStatusKey,
): BillingInvoiceStatusKey {
  return note.billingStatus ?? recordStatus ?? "fatura_aberta";
}

export function shouldShowMultiNoteInlineStatusDetails(notes: BillingInvoiceNote[]): boolean {
  if (notes.length <= 1) return false;
  return notes.some(
    (note) => note.billingStatus != null && billingStatusHasInfoContent(note.billingStatus),
  );
}

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
