import { listAllBillingMockListRecords } from "../mock/billingMockStore";
import { getBillingStatusForRecord } from "../store/billing-invoice-status.store";
import type { BillingInvoiceRecord } from "../types/billing.types";
import { mergeStatusIntoRecord } from "./billing-invoice-status.utils";

export interface BillClientsBatchPreview {
  /** Clientes distintos com fatura fechada na competência (elegíveis ao lote). */
  closedClientCount: number;
  /** Clientes distintos com fatura aberta na competência. */
  openClientCount: number;
  /** Linhas com fatura aberta na competência (não entram no lote). */
  openInvoiceCount: number;
}

function withBillingStatus(rows: BillingInvoiceRecord[]): BillingInvoiceRecord[] {
  return rows.map((row) => mergeStatusIntoRecord(row, getBillingStatusForRecord(row)));
}

/** Prévia do modal Faturar clientes (competência YYYY-MM). */
export function getBillClientsBatchPreview(competence: string): BillClientsBatchPreview {
  const rows = withBillingStatus(
    listAllBillingMockListRecords({
      startMonth: competence,
      endMonth: competence,
    }),
  );

  const closedClientIds = new Set<string>();
  const openClientIds = new Set<string>();
  let openInvoiceCount = 0;

  for (const row of rows) {
    if (row.billingStatus === "fatura_aberta") {
      openInvoiceCount += 1;
      openClientIds.add(row.clientId);
      continue;
    }
    if (row.billingStatus === "fatura_fechada") {
      closedClientIds.add(row.clientId);
    }
  }

  return {
    closedClientCount: closedClientIds.size,
    openClientCount: openClientIds.size,
    openInvoiceCount,
  };
}
