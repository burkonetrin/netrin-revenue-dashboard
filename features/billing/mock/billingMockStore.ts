import type { BillingInvoiceDetail } from "../types/billing-detail.types";
import type { BillingFilters, BillingInvoiceRecord } from "../types/billing.types";
import { alignTotalizerWithData } from "../utils/billing.utils";
import type { BillingListResponse } from "../types/billing.types";
import { getBillingStatusForRecord } from "../store/billing-invoice-status.store";
import { mergeStatusIntoRecord } from "../utils/billing-invoice-status.utils";
import { clientScopeDueDateInvoice } from "./billingMockFixtures";
import { getCurrentMonth } from "../utils/billing-list.utils";
import {
  BILLING_INVOICE_STATUS_LIST_SORT_ORDER,
  BILLING_LIST_STATUS_SHOWCASE_ORDER,
  buildDualNoteCancelOpenShowcaseInvoice,
  buildStatusShowcaseInvoice,
} from "./billingMockStatusShowcase";
import type { BillingInvoiceStatusKey } from "../types/billing-invoice-status.types";
import { billingRecordMatchesStatusFilter } from "../utils/billing-invoice-status-filter.utils";

export type BillingRecordSource = "entry" | "invoice";

interface StoredBillingRecord {
  source: BillingRecordSource;
  detail: BillingInvoiceDetail;
  profitCenterId: string;
}

const MOCK_PROFIT_CENTER_PRIMARY = "f0a8a218-08c8-44a3-a2b7-4e3b690651bd";
const MOCK_PROFIT_CENTER_SECONDARY = "d4e5f6a7-08c8-44a3-a2b7-4e3b690651bd";

const PROFIT_CENTER_BY_LABEL: Record<string, { id: string; code: string; name: string }> = {
  "Centro 01": { id: MOCK_PROFIT_CENTER_PRIMARY, code: "NL10801001", name: "Projetos: Junior Duraes - NL10801001" },
  "Centro 02": { id: MOCK_PROFIT_CENTER_SECONDARY, code: "NL10801002", name: "Consumo: Junior Duraes - NL10801002" },
};

function cloneDetail(detail: BillingInvoiceDetail): BillingInvoiceDetail {
  return structuredClone(detail);
}

function withCompetence(detail: BillingInvoiceDetail, competence: string): BillingInvoiceDetail {
  return { ...detail, competence, referenceMonth: competence };
}

function buildFixedStatusListInvoice(
  status: Extract<BillingInvoiceStatusKey, "nota_cancelada" | "nota_vencida">,
  competence: string,
): BillingInvoiceDetail {
  const id =
    status === "nota_cancelada" ? "bill-nota-cancelada" : "bill-nota-vencida";
  const built = buildStatusShowcaseInvoice(status, status === "nota_cancelada" ? 97 : 98, competence);
  return { ...built, id };
}

function seedRecords(): StoredBillingRecord[] {
  const competence = getCurrentMonth();

  const base: StoredBillingRecord[] = [
    {
      source: "invoice",
      detail: withCompetence(cloneDetail(clientScopeDueDateInvoice), competence),
      profitCenterId: MOCK_PROFIT_CENTER_PRIMARY,
    },
    {
      source: "invoice",
      detail: withCompetence(
        cloneDetail(buildFixedStatusListInvoice("nota_vencida", competence)),
        competence,
      ),
      profitCenterId: MOCK_PROFIT_CENTER_SECONDARY,
    },
    {
      source: "invoice",
      detail: withCompetence(
        cloneDetail(buildFixedStatusListInvoice("nota_cancelada", competence)),
        competence,
      ),
      profitCenterId: MOCK_PROFIT_CENTER_PRIMARY,
    },
  ];

  const showcase: StoredBillingRecord[] = BILLING_LIST_STATUS_SHOWCASE_ORDER.map(
    (status, index) => ({
      source: "invoice" as const,
      detail: cloneDetail(buildStatusShowcaseInvoice(status, index, competence)),
      profitCenterId: index % 2 === 0 ? MOCK_PROFIT_CENTER_PRIMARY : MOCK_PROFIT_CENTER_SECONDARY,
    }),
  );

  const dualNotesShowcase: StoredBillingRecord = {
    source: "invoice",
    detail: cloneDetail(buildDualNoteCancelOpenShowcaseInvoice(competence)),
    profitCenterId: MOCK_PROFIT_CENTER_PRIMARY,
  };

  return [...base, ...showcase, dualNotesShowcase];
}

let records: StoredBillingRecord[] = seedRecords();

export function resetBillingMockStore() {
  records = seedRecords();
}

function detailKey(source: BillingRecordSource, id: string) {
  return `${source}:${id}`;
}

export function getBillingMockDetail(
  id: string,
  source: BillingRecordSource,
): BillingInvoiceDetail | undefined {
  const found = records.find((row) => row.source === source && row.detail.id === id);
  return found ? cloneDetail(found.detail) : undefined;
}

export function updateBillingMockDetail(
  id: string,
  source: BillingRecordSource,
  updater: (current: BillingInvoiceDetail) => BillingInvoiceDetail,
) {
  records = records.map((row) => {
    if (row.source !== source || row.detail.id !== id) {
      return row;
    }
    return { ...row, detail: updater(cloneDetail(row.detail)) };
  });
}

function toListRecord(row: StoredBillingRecord): BillingInvoiceRecord {
  const { detail, source, profitCenterId } = row;
  const base: BillingInvoiceRecord = {
    id: detail.id,
    clientId: detail.clientId,
    clientName: detail.clientName,
    profitCenter: detail.profitCenter,
    profitCenterId,
    competence: detail.competence,
    referenceMonth: detail.referenceMonth,
    invoicePeriodMonths: detail.invoicePeriodMonths,
    totalAmount: detail.totalAmount,
    source,
    invoiceDetails: detail.invoiceDetails,
  };
  return mergeStatusIntoRecord(base, getBillingStatusForRecord(base));
}

function statusListSortIndex(status?: BillingInvoiceStatusKey): number {
  if (!status) return 999;
  const index = BILLING_INVOICE_STATUS_LIST_SORT_ORDER.indexOf(status);
  return index === -1 ? 999 : index;
}

function applyListFilters(filters: BillingFilters, rows: BillingInvoiceRecord[]) {
  let filtered = rows;

  if (filters.clientId) {
    filtered = filtered.filter((row) => row.clientId === filters.clientId);
  }

  const profitCenterIds =
    filters.profitCenterIds ??
    (filters.profitCenterId ? [filters.profitCenterId] : undefined);

  if (profitCenterIds && profitCenterIds.length > 0) {
    filtered = filtered.filter(
      (row) => row.profitCenterId && profitCenterIds.includes(row.profitCenterId),
    );
  }

  const startMonth = filters.startMonth;
  const endMonth = filters.endMonth;

  if (startMonth || endMonth) {
    filtered = filtered.filter((row) => monthInRange(row.competence, startMonth, endMonth));
  }

  const invoiceStatuses =
    filters.invoiceStatuses ??
    (filters.invoiceStatus ? [filters.invoiceStatus] : undefined);

  if (invoiceStatuses && invoiceStatuses.length > 0) {
    filtered = filtered.filter((row) =>
      invoiceStatuses.some((filterKey) => billingRecordMatchesStatusFilter(row, filterKey)),
    );
  }

  return [...filtered].sort((a, b) => {
    const aOpen = a.billingStatus === "fatura_aberta" ? 0 : 1;
    const bOpen = b.billingStatus === "fatura_aberta" ? 0 : 1;
    if (aOpen !== bOpen) return aOpen - bOpen;
    const byCompetence = b.competence.localeCompare(a.competence);
    if (byCompetence !== 0) return byCompetence;
    return statusListSortIndex(a.billingStatus) - statusListSortIndex(b.billingStatus);
  });
}

/** Todas as linhas da listagem respeitando filtros (sem paginação). */
export function listAllBillingMockListRecords(filters: BillingFilters): BillingInvoiceRecord[] {
  return applyListFilters(filters, records.map(toListRecord));
}

function monthInRange(month: string, start?: string, end?: string) {
  if (start && month < start) return false;
  if (end && month > end) return false;
  return true;
}

export function filterBillingMockList(
  filters: BillingFilters,
  page: number,
  limit: number,
): BillingListResponse {
  const filtered = applyListFilters(filters, records.map(toListRecord));

  const totalValue = filtered.reduce((sum, row) => sum + row.totalAmount, 0);
  const totalRecords = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;
  const pageRows = filtered.slice(start, start + limit);

  const fallbackLabel =
    filters.startMonth || filters.endMonth ? "Total no período" : "Total na competência";

  return alignTotalizerWithData(
    {
      data: pageRows,
      pagination: {
        hasNext: safePage < totalPages,
        hasPrevious: safePage > 1,
        page: safePage,
        pageSize: limit,
        totalPages,
        totalRecords,
      },
      totalizer: {
        label: fallbackLabel,
        totalValue,
      },
    },
    fallbackLabel,
  );
}

export function listBillingMockProfitCenters() {
  return Object.values(PROFIT_CENTER_BY_LABEL).map((pc) => ({
    ...pc,
    isActive: true,
  }));
}

export { detailKey };
