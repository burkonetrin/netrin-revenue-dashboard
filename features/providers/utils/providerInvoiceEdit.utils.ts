import type {
  ProviderInvoiceResponse,
  ProviderInvoiceSourceResponse,
} from "../types/providerInvoices.types";

export interface ProviderInvoiceEditDraft {
  competenceMonth: string;
  assessmentStartDate: string;
  assessmentEndDate: string;
  invoiceTotalValue: string;
  minimumFranchiseValue?: string | null;
  invoiceFileUrl?: string | null;
  sources: ProviderInvoiceSourceResponse[];
}

export interface ProviderInvoiceCommonFieldsDraft {
  competenceMonth: string;
  assessmentStartDate: string;
  assessmentEndDate: string;
  invoiceTotalValue: string;
  minimumFranchiseValue: string;
  invoiceFile: null;
}

function toCompetenceInput(competenceMonth: string): string {
  const match = /^(\d{4})-(0[1-9]|1[0-2])(?:-\d{2})?$/.exec(competenceMonth);
  return match ? `${match[2]}/${match[1]}` : competenceMonth;
}

/** Maps the persisted postpaid snapshot to an editable draft without recalculating its sources. */
export function mapProviderInvoiceSnapshotToEditDraft(
  invoice: ProviderInvoiceResponse,
): ProviderInvoiceEditDraft {
  return {
    competenceMonth: toCompetenceInput(invoice.competenceMonth),
    assessmentStartDate: invoice.assessmentStartDate,
    assessmentEndDate: invoice.assessmentEndDate,
    invoiceTotalValue: invoice.invoiceTotalValue,
    ...(invoice.minimumFranchiseValue !== undefined
      ? { minimumFranchiseValue: invoice.minimumFranchiseValue }
      : {}),
    ...(invoice.invoiceFileUrl !== undefined ? { invoiceFileUrl: invoice.invoiceFileUrl } : {}),
    sources: invoice.sources.map((source) => ({ ...source })),
  };
}

/** Builds the shared editable fields used by both direct and indirect postpaid invoices. */
export function getProviderInvoiceCommonFields(
  invoice: ProviderInvoiceResponse | undefined,
  currentMonth: string,
): ProviderInvoiceCommonFieldsDraft {
  if (!invoice) {
    const [year, month] = currentMonth.split("-");
    return {
      competenceMonth: `${month}/${year}`,
      assessmentStartDate: "",
      assessmentEndDate: "",
      invoiceTotalValue: "",
      minimumFranchiseValue: "",
      invoiceFile: null,
    };
  }

  const draft = mapProviderInvoiceSnapshotToEditDraft(invoice);
  return {
    competenceMonth: draft.competenceMonth,
    assessmentStartDate: draft.assessmentStartDate,
    assessmentEndDate: draft.assessmentEndDate,
    invoiceTotalValue: draft.invoiceTotalValue,
    minimumFranchiseValue: draft.minimumFranchiseValue ?? "",
    invoiceFile: null,
  };
}
