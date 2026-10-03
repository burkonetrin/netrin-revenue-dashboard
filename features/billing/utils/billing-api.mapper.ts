// @ts-nocheck

import type {
  ApiBillingAllListItem,
  ApiBillingAllResponse,
  ApiBillingEntryItemResponse,
  ApiBillingEntryResponse,
  ApiInvoiceResponse,
  ApiInvoiceTotalizer,
  ApiMonthValue,
  ApiNfeMetadataItem,
  ListBillingAllParams,
} from "../types/billing-api.types";
import type {
  BillingFilters,
  BillingInvoiceNote,
  BillingInvoiceRecord,
  BillingInvoiceScope,
  BillingListResponse,
} from "../types/billing.types";
import { mapBillingDestinations } from "./billing-destination.mapper";
import type { BillingPaymentContext } from "./billing-payment-context.mapper";

/** Converte valor decimal da API para number, retornando 0 se inválido. */
export function parseApiDecimal(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Normaliza referência de mês da API para competência `YYYY-MM`. */
export function mapMonthRefToCompetence(monthValue: ApiMonthValue): string {
  if (!monthValue) return "";

  if (typeof monthValue === "string") {
    return monthValue.length >= 7 ? monthValue.slice(0, 7) : monthValue;
  }

  const month = String(monthValue.month).padStart(2, "0");
  return `${monthValue.year}-${month}`;
}

/** Mapeia o nível de unificação de NFe da API para o escopo de domínio. */
export function mapNfeUnificationLevel(level: string): BillingInvoiceScope {
  const normalized = level.toLowerCase();
  if (normalized === "contract") return "contract";
  if (normalized === "deductible" || normalized === "franchise") return "deductible";
  return "client";
}

function getInvoiceOwnerName(invoice: ApiInvoiceResponse, scope: BillingInvoiceScope): string {
  if (scope === "contract") return invoice.contract?.label ?? invoice.client.label ?? "";
  if (scope === "deductible") return invoice.deductible?.label ?? invoice.client.label ?? "";
  return invoice.client.label ?? "";
}

function mapNfeMetadataToNotes(
  entityId: string,
  metadata: ApiNfeMetadataItem[],
  fallbackIsManual?: boolean,
  context?: BillingPaymentContext | null,
  dueDateOverride?: string,
): BillingInvoiceNote[] {
  return metadata.map((item, index) => {
    const dueDate = dueDateOverride || item.dueDate || item.due_date || "";
    const destinationItem = dueDateOverride
      ? { ...item, dueDate: dueDateOverride, due_date: dueDateOverride }
      : item;

    return {
      id: item.id ?? `${entityId}-note-${index}`,
      ownerName: item.ownerName ?? item.owner_name ?? item.label ?? "",
      dueDate,
      productName: item.productName,
      description: item.description,
      isManual: item.isManual ?? fallbackIsManual,
      contractId: item.contractId,
      deductibleId: item.deductibleId ?? item.franchiseId,
      isSeparateNfe: item.isSeparateNfe,
      destinations: mapBillingDestinations({
        nfeMetadata: [destinationItem as unknown as Record<string, unknown>],
        source: "nfe_metadata",
      }, context),
    };
  });
}

function buildClientAutomaticNote(
  entityId: string,
  clientId: string,
  clientName: string,
  dueDate?: string | null,
  productName?: string,
): BillingInvoiceNote {
  return {
    id: `${entityId}-note-0`,
    ownerName: clientName,
    dueDate: dueDate ?? "",
    productName,
    isManual: false,
    destinations: mapBillingDestinations({
      clientId,
      clientName,
      dueDate,
      source: "billing_snapshot",
    }),
  };
}

function mapClientSeparateManualMetadata(
  entityId: string,
  metadata: ApiNfeMetadataItem[],
): BillingInvoiceNote[] {
  return metadata
    .filter((item) => isSeparateManualMetadata(item))
    .map((item, index) => ({
      id: item.id ?? `${entityId}-manual-${index}`,
      ownerName: item.productName ?? item.ownerName ?? item.owner_name ?? item.label ?? "",
      dueDate: item.dueDate ?? item.due_date ?? "",
      productName: item.productName ?? item.label,
      description: item.description,
      isManual: true,
      contractId: item.contractId,
      deductibleId: item.deductibleId ?? item.franchiseId,
      isSeparateNfe: true,
    }));
}

function isSeparateManualMetadata(item: ApiNfeMetadataItem): boolean {
  return item.isSeparateNfe === true || item.type?.toLowerCase() === "separate_nfe";
}

function mapClientMetadataNotes(
  entityId: string,
  clientId: string,
  clientName: string,
  dueDate: string | null | undefined,
  metadata: ApiNfeMetadataItem[],
  context?: BillingPaymentContext | null,
): BillingInvoiceNote[] {
  const hasExplicitDestinations = metadata.some((item) =>
    Boolean(
      item.contractId ||
        item.franchiseId ||
        item.deductibleId ||
        item.deductible_id ||
        item.deductible?.value ||
        item.contract_id ||
        item.franchise_id ||
        item.type?.toLowerCase() === "group" ||
        item.type?.toLowerCase() === "contract" ||
        item.type?.toLowerCase() === "franchise" ||
        item.type?.toLowerCase() === "deductible",
    ),
  );

  if (hasExplicitDestinations) {
    return mapNfeMetadataToNotes(entityId, metadata, undefined, context, dueDate ?? undefined);
  }

  const hasAutomaticMetadata = metadata.some((item) => !isSeparateManualMetadata(item));
  const notes = hasAutomaticMetadata
    ? [buildClientAutomaticNote(entityId, clientId, clientName, dueDate)]
    : [];

  return [...notes, ...mapClientSeparateManualMetadata(entityId, metadata)];
}

/** Extrai notas/vencimentos de uma fatura a partir de metadata ou dueDate. */
export function mapInvoiceNotes(
  invoice: ApiInvoiceResponse,
  context?: BillingPaymentContext | null,
): BillingInvoiceNote[] {
  const scope = mapNfeUnificationLevel(invoice.nfeUnificationLevel);
  const metadata = invoice.nfeMetadata ?? [];
  const hasExplicitDestinationMetadata = metadata.some((item) =>
    Boolean(
      item.contractId ||
        item.franchiseId ||
        item.deductibleId ||
        item.deductible_id ||
        item.deductible?.value ||
        item.type?.toLowerCase() === "group" ||
        item.type?.toLowerCase() === "contract" ||
        item.type?.toLowerCase() === "franchise" ||
        item.type?.toLowerCase() === "deductible",
    ),
  );

  if (scope === "client" && metadata.length > 0) {
    return mapClientMetadataNotes(
      invoice.id,
      invoice.client.value,
      invoice.client.label ?? "",
      invoice.dueDate,
      metadata,
      context,
    );
  }

  if (
    metadata.length >= 2 ||
    (metadata.length >= 1 && (!invoice.dueDate || hasExplicitDestinationMetadata))
  ) {
    return mapNfeMetadataToNotes(
      invoice.id,
      metadata,
      invoice.isManual,
      context,
      scope === "client" ? (invoice.dueDate ?? undefined) : undefined,
    );
  }

  if (invoice.dueDate) {
    if (scope === "client") {
      return [
        buildClientAutomaticNote(
          invoice.id,
          invoice.client.value,
          invoice.client.label ?? "",
          invoice.dueDate,
          invoice.product?.label,
        ),
      ];
    }

    return [
      {
        id: `${invoice.id}-note-0`,
        ownerName: getInvoiceOwnerName(invoice, scope),
        dueDate: invoice.dueDate,
        productName: invoice.product?.label,
        isManual: invoice.isManual,
        destinations: mapBillingDestinations({
          clientId: invoice.client.value,
          clientName: invoice.client.label,
          dueDate: invoice.dueDate,
          source: "billing_snapshot",
        }, context),
      },
    ];
  }

  if (metadata.length === 1) {
    return mapNfeMetadataToNotes(invoice.id, metadata, invoice.isManual, context);
  }

  return [];
}

/** Mapeia fatura da API para o registro de listagem de billing. */
export function mapInvoiceToRecord(
  invoice: ApiInvoiceResponse,
  context?: BillingPaymentContext | null,
): BillingInvoiceRecord {
  const scope = mapNfeUnificationLevel(invoice.nfeUnificationLevel);
  const competence =
    mapMonthRefToCompetence(invoice.competenceMonth) ||
    mapMonthRefToCompetence(invoice.referenceMonth);
  const referenceMonth = mapMonthRefToCompetence(invoice.referenceMonth);

  return {
    id: invoice.id,
    clientId: invoice.client.value,
    clientName: invoice.client.label ?? "",
    profitCenter: invoice.profitCenter?.label ?? "",
    profitCenterId: invoice.profitCenter?.value,
    competence,
    referenceMonth,
    invoicePeriodMonths: invoice.invoicePeriodMonths ?? 1,
    totalAmount: parseApiDecimal(invoice.totalValue),
    source: "invoice",
    invoiceDetails: {
      scope,
      notes: mapInvoiceNotes(invoice, context),
    },
  };
}

function mapTotalizer(totalizer?: ApiInvoiceTotalizer | null) {
  if (!totalizer) return null;

  return {
    label: totalizer.label ?? "",
    totalValue: parseApiDecimal(totalizer.totalValue),
  };
}

function getEntryOwnerName(entry: ApiBillingEntryResponse, scope: BillingInvoiceScope): string {
  if (scope === "contract") return entry.contract?.label ?? entry.client.label ?? "";
  if (scope === "deductible") return entry.deductible?.label ?? entry.client.label ?? "";
  return entry.client.label ?? "";
}

function firstNonEmptyDueDate(items: ApiBillingEntryItemResponse[]): string | undefined {
  return items.map((item) => item.dueDate).find((dueDate) => Boolean(dueDate)) ?? undefined;
}

/**
 * Constrói as notas automáticas a partir dos items não-manuais da entry,
 * agrupando por contrato/franquia conforme o nível de unificação da NF-e.
 */
function buildEntryAutomaticNotes(
  entry: ApiBillingEntryResponse,
  _scope: BillingInvoiceScope,
  context?: BillingPaymentContext | null,
): BillingInvoiceNote[] {
  const automaticItems = (entry.items ?? []).filter((item) => !item.isManual);
  const groups = new Map<string, ApiBillingEntryItemResponse[]>();

  for (const item of automaticItems) {
    const mode = item.contractNfeMode?.toLowerCase();
    const key =
      mode === "unify" && item.contractGroupId
        ? `group:${item.contractGroupId}`
        : mode === "deductible" && item.deductible?.value
          ? `deductible:${item.deductible.value}`
          : mode === "contract" && item.contract?.value
            ? `contract:${item.contract.value}`
            : null;
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return [...groups.entries()].map(([key, items]) => {
    const first = items[0];
    const mode = first.contractNfeMode?.toLowerCase();
    return {
      id: `${entry.id}-${key}`,
      ownerName: first.deductible?.label ?? first.contract?.label ?? "",
      dueDate: firstNonEmptyDueDate(items) ?? entry.dueDate ?? "",
      isManual: false,
      contractId: first.contract?.value,
      deductibleId: first.deductible?.value,
      destinations: mapBillingDestinations({
        items: items.map((item) => ({
          ...item,
          contractNfeMode: mode,
        })) as unknown as Array<Record<string, unknown>>,
        dueDate: entry.dueDate,
        source: "billing_item",
      }, context),
    };
  });
}

/**
 * Notas manuais para listagem/tooltip.
 * Em client/contract, manuais com isSeparateNfe=false não viram nota nova (MINV-07);
 * deductible permanece inalterado.
 */
function buildEntryManualNotes(
  entry: ApiBillingEntryResponse,
  scope: BillingInvoiceScope,
): BillingInvoiceNote[] {
  return (entry.items ?? [])
    .filter((item) => item.isManual)
    .filter((item) => {
      if (scope === "deductible") return true;
      return item.isSeparateNfe === true;
    })
    .map((item, index) => ({
      id: item.id ?? `${entry.id}-manual-${index}`,
      ownerName: item.product?.label ?? item.description ?? "",
      dueDate: item.dueDate ?? entry.dueDate ?? "",
      productName: item.product?.label,
      isManual: true,
      contractId: item.contract?.value,
      isSeparateNfe: item.isSeparateNfe ?? false,
    }));
}

/** Extrai notas/vencimentos de uma entrada de billing. */
export function mapBillingEntryNotes(
  entry: ApiBillingEntryResponse,
  context?: BillingPaymentContext | null,
): BillingInvoiceNote[] {
  const scope = mapNfeUnificationLevel(entry.nfeUnificationLevel);
  const metadata = entry.nfeMetadata ?? [];

  const notes = [
    ...buildEntryAutomaticNotes(entry, scope, context),
    ...buildEntryManualNotes(entry, scope),
  ];

  if (notes.length > 0) {
    return notes;
  }

  if (metadata.length > 0) {
    return mapNfeMetadataToNotes(entry.id, metadata, undefined, context);
  }

  return [];
}

/** Mapeia entrada de billing da API para o registro de listagem. */
export function mapBillingEntryToRecord(
  entry: ApiBillingEntryResponse,
  context?: BillingPaymentContext | null,
): BillingInvoiceRecord {
  const scope = mapNfeUnificationLevel(entry.nfeUnificationLevel);
  const competence =
    mapMonthRefToCompetence(entry.competenceMonth) || mapMonthRefToCompetence(entry.referenceMonth);
  const referenceMonth = mapMonthRefToCompetence(entry.referenceMonth);

  return {
    id: entry.id,
    clientId: entry.client.value,
    clientName: entry.client.label ?? "",
    profitCenter: entry.profitCenter?.label ?? "",
    profitCenterId: entry.profitCenter?.value,
    competence,
    referenceMonth,
    invoicePeriodMonths: entry.invoicePeriodMonths ?? 1,
    totalAmount: parseApiDecimal(entry.totalValue),
    source: "entry",
    invoiceDetails: {
      scope,
      notes: mapBillingEntryNotes(entry, context),
    },
  };
}

/**
 * Aplica paginação client-side quando a API retorna mais registros do que pageSize
 * (workaround para backend que calcula pagination mas não limita entries/invoices).
 */
function sliceBillingAllData(
  allData: BillingInvoiceRecord[],
  pagination: ApiBillingAllResponse["pagination"],
): BillingInvoiceRecord[] {
  const { pageSize, totalPages, page } = pagination;

  if (pageSize <= 0 || totalPages <= 1) {
    return allData;
  }

  if (allData.length <= pageSize) {
    return allData;
  }

  const start = (page - 1) * pageSize;
  return allData.slice(start, start + pageSize);
}

function isBillingAllInvoiceItem(item: ApiBillingAllListItem): boolean {
  const itemType = item.itemType?.toLowerCase();
  return itemType === "invoice" || itemType === "billing_invoice";
}

function mapBillingAllListItem(item: ApiBillingAllListItem): BillingInvoiceRecord {
  if (isBillingAllInvoiceItem(item)) {
    return mapInvoiceToRecord(item as ApiInvoiceResponse);
  }

  return mapBillingEntryToRecord(item);
}

function resolveBillingAllRecords(response: ApiBillingAllResponse): BillingInvoiceRecord[] {
  if (Array.isArray(response.data)) {
    return response.data.map(mapBillingAllListItem);
  }

  return [
    ...(response.entries ?? []).map((entry) => mapBillingEntryToRecord(entry)),
    ...(response.invoices ?? []).map((invoice) => mapInvoiceToRecord(invoice)),
  ];
}

/** Converte a resposta de GET /billing/all em listagem paginada do domínio. */
export function mapBillingAllResponse(response: ApiBillingAllResponse): BillingListResponse {
  const allData = resolveBillingAllRecords(response);

  return {
    data: sliceBillingAllData(allData, response.pagination),
    pagination: response.pagination,
    totalizer: mapTotalizer(response.totalizer),
  };
}

/**
 * Monta params de GET /v1/billing/all.
 * Sem período: omite date-from/date-to (BE usa mês atual de competência).
 * Com período: envia date-from/date-to filtrando competence_month.
 */
export function buildBillingAllQueryParams(
  filters: BillingFilters,
  page: number,
  limit: number,
): ListBillingAllParams {
  const { startMonth, endMonth, clientId, profitCenterId } = filters;

  const params: ListBillingAllParams = {
    clientId,
    profitCenterId,
    page,
    limit,
  };

  if (!startMonth || !endMonth) {
    return params;
  }

  params.dateFrom = startMonth;
  params.dateTo = endMonth;
  return params;
}

/** Converte params de domínio para query string kebab-case da API. */
export function toBillingAllApiParams(params: ListBillingAllParams) {
  return Object.fromEntries(
    Object.entries({
      "client-id": params.clientId,
      "profit-center-id": params.profitCenterId,
      "date-from": params.dateFrom,
      "date-to": params.dateTo,
      page: params.page,
      limit: params.limit,
    }).filter(([, value]) => value !== undefined && value !== ""),
  );
}

/** Alias de `mapMonthRefToCompetence` para compatibilidade. */
export const parseApiReferenceMonth = mapMonthRefToCompetence;
/** Alias de `mapInvoiceToRecord` para compatibilidade. */
export const mapApiInvoiceToBillingRecord = mapInvoiceToRecord;

/** Mapeia o totalizador da API para o formato usado na listagem. */
export function mapApiTotalizer(totalizer?: ApiInvoiceTotalizer | null) {
  return mapTotalizer(totalizer) ?? undefined;
}
