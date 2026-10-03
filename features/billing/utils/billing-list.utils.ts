import { BILLING_BASE_PATH } from "@/constants";
import type { PaginationInfo } from "@/shared/types/pagination.types";
import type { BillingInvoiceRecord } from "../types/billing.types";

export function getCurrentMonth(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Estado derivado da listagem de faturas (loading, registros e paginação). */
export interface BillingListTableState<TRecord = BillingInvoiceRecord> {
  isTableLoading: boolean;
  records: TRecord[];
  totalPages: number;
  totalRecords: number;
  showPagination: boolean;
}

/**
 * Deriva estado de tabela/paginação a partir da resposta da listagem de billing.
 */
export function deriveBillingListTableState<TRecord>(options: {
  isLoading: boolean;
  isFetching: boolean;
  data?: TRecord[];
  pagination?: PaginationInfo | null;
}): BillingListTableState<TRecord> {
  const { isLoading, isFetching, data, pagination } = options;
  const isTableLoading = isLoading || isFetching;
  const records = isTableLoading ? [] : (data ?? []);
  const totalPages = isTableLoading ? 1 : (pagination?.totalPages ?? 1);
  const totalRecords = isTableLoading
    ? 0
    : (pagination?.totalRecords ?? records.length);
  const showPagination = !isTableLoading && totalPages > 1;

  return {
    isTableLoading,
    records,
    totalPages,
    totalRecords,
    showPagination,
  };
}

/** Monta a URL de detalhe da fatura na listagem. */
export function getBillingInvoiceDetailHref(record: Pick<BillingInvoiceRecord, "id" | "source">): string {
  const source = record.source ?? "invoice";
  return `${BILLING_BASE_PATH}/${record.id}?source=${source}`;
}


export function compareMonths(a: string, b: string): number {
  return a.localeCompare(b);
}

export function monthRangeIncludesCurrent(
  startMonth: string,
  endMonth: string,
  currentMonth: string,
): boolean {
  return compareMonths(startMonth, currentMonth) <= 0 && compareMonths(endMonth, currentMonth) >= 0;
}
