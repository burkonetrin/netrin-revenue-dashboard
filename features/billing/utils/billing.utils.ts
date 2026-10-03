import type {
  BillingFilters,
  BillingInvoiceDestination,
  BillingInvoiceNote,
  BillingInvoiceRecord,
  BillingInvoiceScope,
  BillingListResponse,
} from "../types/billing.types";

/** Rótulos de escopo de unificação de NFe na listagem de billing. */
export const billingScopeLabels: Record<BillingInvoiceScope, string> = {
  client: "Cliente",
  contract: "Contrato",
  deductible: "Franquia",
};

/**
 * Ordena as notas para a tooltip da listagem conforme o nível de unificação:
 * - client: automáticas primeiro, depois manuais em nota separada (MINV-07);
 * - deductible: automáticas primeiro, depois manuais (inalterado);
 * - contract: automáticas; manuais em nota separada (ou sem vínculo) no final.
 * Manuais com isSeparateNfe=false em client/contract não aparecem como nota nova.
 */
export function getBillingListingTooltipNotes(
  scope: BillingInvoiceScope,
  notes: BillingInvoiceNote[],
): BillingInvoiceNote[] {
  const withOrderedDestinations = (note: BillingInvoiceNote): BillingInvoiceNote => ({
    ...note,
    destinations: note.destinations ? orderBillingDestinations(note.destinations) : note.destinations,
  });
  const automatics = notes.filter((note) => !note.isManual).map(withOrderedDestinations);
  const manuals = notes.filter((note) => {
    if (!note.isManual) return false;
    if (scope === "deductible") return true;
    return note.isSeparateNfe === true;
  }).map(withOrderedDestinations);

  if (scope !== "contract") {
    return [...automatics, ...manuals];
  }

  const ordered: BillingInvoiceNote[] = [...automatics];
  const groupedIds = new Set(ordered.map((note) => note.id));
  ordered.push(...manuals.filter((manual) => !groupedIds.has(manual.id)));

  return ordered;
}

/** Título exibido para uma nota na tooltip de vencimentos. */
export function getBillingNoteTooltipTitle(
  note: BillingInvoiceNote,
  scope: BillingInvoiceScope,
): string {
  const destination = note.destinations?.[0];
  if (destination) {
    if (destination.kind === "contract_group") return "Contratos:";
    if (destination.kind === "contract")
      return `Contrato: ${destination.names[0] ?? note.ownerName}`;
    if (destination.kind === "franchise")
      return `Franquia: ${destination.names[0] ?? note.ownerName}`;
  }
  if (note.isManual) {
    return `Produto: ${note.productName ?? note.ownerName}`;
  }

  return `${billingScopeLabels[scope]}: ${note.ownerName}`;
}

/** Ordena destinos na ordem visual grupo, contrato e franquia. */
export function orderBillingDestinations(
  destinations: BillingInvoiceDestination[],
): BillingInvoiceDestination[] {
  const order = { contract_group: 0, contract: 1, franchise: 2, client: 3 };
  return [...destinations].sort((a, b) => order[a.kind] - order[b.kind]);
}

/** Formata data `YYYY-MM-DD` para `DD/MM/YYYY`. */
export function formatBillingDate(date: string) {
  if (!date || !/^\d{4}-\d{2}-\d{2}/.test(date)) {
    return "—";
  }

  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

/** Texto de vencimento para listagem (data formatada, "Em aberto" ou "—"). */
export function getBillingDueDateDisplay(
  dueDate: string | undefined,
  options?: { source?: BillingInvoiceRecord["source"]; emptyLabel?: string },
): string {
  if (!dueDate || !/^\d{4}-\d{2}-\d{2}/.test(dueDate)) {
    if (options?.emptyLabel) {
      return options.emptyLabel;
    }
    if (options?.source === "entry") {
      return "Em aberto";
    }
    return "—";
  }

  return formatBillingDate(dueDate);
}

/** Forma de renderização da coluna de vencimento na listagem. */
export type BillingListingDueDateView =
  | { kind: "placeholder" }
  | { kind: "single"; dueDate: string | undefined }
  | { kind: "multi"; notes: BillingInvoiceNote[] };

/**
 * Decide como a coluna Vencimento da listagem deve renderizar
 * (placeholder, data única ou tooltip multi-nota).
 * Multi-nota NÃO depende de notes[0].dueDate estar preenchido.
 */
export function getBillingListingDueDateView(
  notes: BillingInvoiceNote[],
): BillingListingDueDateView {
  if (notes.length === 0) {
    return { kind: "placeholder" };
  }

  if (notes.length === 1) {
    return { kind: "single", dueDate: notes[0]?.dueDate };
  }

  return { kind: "multi", notes };
}

/** Formata competência `YYYY-MM` para `MM/YYYY`. */
export function formatBillingCompetence(competence: string) {
  const [year, month] = competence.split("-");
  return `${month}/${year}`;
}

/**
 * Formata o período de referência da fatura.
 * period <= 1 → MM/YYYY; period > 1 → MM/YYYY-MM/YYYY (fim = base + invoicePeriodMonths - 1).
 */
export function formatBillingReferencePeriod(
  referenceMonth: string,
  invoicePeriodMonths = 1,
): string {
  if (!referenceMonth) return "—";

  const start = formatBillingCompetence(referenceMonth);
  if (invoicePeriodMonths <= 1) {
    return start;
  }

  const [year, month] = referenceMonth.split("-").map(Number);
  if (!year || !month) return start;

  const endDate = new Date(Date.UTC(year, month - 1 + (invoicePeriodMonths - 1), 1));
  const endMonth = `${endDate.getUTCFullYear()}-${String(endDate.getUTCMonth() + 1).padStart(2, "0")}`;

  return `${start}-${formatBillingCompetence(endMonth)}`;
}

/** Zera o totalizador quando a listagem não tem registros. */
export function alignTotalizerWithData(
  response: BillingListResponse,
  fallbackLabel = "Total no período",
): BillingListResponse {
  if (response.data.length > 0) return response;

  return {
    ...response,
    totalizer: {
      label: response.totalizer?.label ?? fallbackLabel,
      totalValue: 0,
    },
  };
}

/** Indica se há filtros de período ou centro de lucro ativos. */
export function hasBillingFilters(filters: BillingFilters) {
  return Boolean(
    filters.startMonth || filters.endMonth || filters.profitCenterId || filters.invoiceStatus,
  );
}
