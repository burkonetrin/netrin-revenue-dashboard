import type { Client, ClientNfeUnificationLevel } from "@/features/clients/types/clients.types";
import { hasExactlyFourDecimalPlaces, unmaskCurrency4 } from "@/shared/utils/currency";
import type { BillingInvoiceDetail, BillingManualInvoice } from "../types/billing-detail.types";
import type {
  BillingManualInvoiceFieldErrors,
  BillingManualInvoiceFormState,
  BillingManualInvoicePayload,
  BillingManualInvoiceVisibleFields,
  ManualInvoicePayloadContext,
} from "../types/billing-manual-invoice.types";
import type { BillingInvoiceRecord, BillingInvoiceScope } from "../types/billing.types";
import { getCurrentMonth } from "./billing-list.utils";

export const MANUAL_INVOICE_PRODUCT_PRIORITY = ["Projeto", "Workflow"];

export type ManualInvoiceSubmissionValidation =
  | { kind: "missing-client-level" }
  | { kind: "field-errors"; errors: BillingManualInvoiceFieldErrors }
  | { kind: "missing-product" }
  | { kind: "unified-due-date-unavailable"; isLoading: boolean }
  | { kind: "valid" };

/**
 * Centraliza as pré-condições de envio da fatura manual sem executar efeitos de interface.
 */
export function validateManualInvoiceSubmission({
  form,
  level,
  hasPresetClient,
  hasSelectedProduct,
  requiresUnifiedDueDate,
  isLoadingUnifiedDueDate,
  unifiedDueDate,
}: {
  form: BillingManualInvoiceFormState;
  level: ClientNfeUnificationLevel | null;
  hasPresetClient: boolean;
  hasSelectedProduct: boolean;
  requiresUnifiedDueDate: boolean;
  isLoadingUnifiedDueDate: boolean;
  unifiedDueDate: string | undefined;
}): ManualInvoiceSubmissionValidation {
  if (!level) return { kind: "missing-client-level" };

  const errors = validateManualInvoiceForm(form, level, hasPresetClient);
  if (Object.keys(errors).length > 0) return { kind: "field-errors", errors };

  if (!hasSelectedProduct) return { kind: "missing-product" };

  if (requiresUnifiedDueDate && (isLoadingUnifiedDueDate || !unifiedDueDate)) {
    return { kind: "unified-due-date-unavailable", isLoading: isLoadingUnifiedDueDate };
  }

  return { kind: "valid" };
}

/**
 * Estado inicial vazio do formulário de fatura manual.
 */
export const EMPTY_MANUAL_INVOICE_FORM: BillingManualInvoiceFormState = {
  clientId: "",
  competence: "",
  amount: "",
  profitCenter: "",
  excessProfitCenter: "",
  productId: "",
  description: "",
  separateNote: false,
  dueDateFull: "",
  contractId: "",
};

/**
 * Estado inicial do formulário com competência no mês atual (default do select).
 */
export function createInitialManualInvoiceForm(
  overrides: Partial<BillingManualInvoiceFormState> = {},
): BillingManualInvoiceFormState {
  return {
    ...EMPTY_MANUAL_INVOICE_FORM,
    competence: getCurrentMonth(),
    ...overrides,
  };
}

export function nfeLevelToBillingScope(level: ClientNfeUnificationLevel): BillingInvoiceScope {
  return level;
}

export function parseClientNfeLevel(client?: Client | null): ClientNfeUnificationLevel | null {
  const value = client?.nfeUnificationLevel?.value;
  if (value === "client" || value === "contract" || value === "deductible") {
    return value;
  }
  return null;
}

export function sortManualInvoiceProducts<T extends { name: string }>(products: T[]): T[] {
  return [...products].sort((a, b) => {
    const aIdx = MANUAL_INVOICE_PRODUCT_PRIORITY.indexOf(a.name);
    const bIdx = MANUAL_INVOICE_PRODUCT_PRIORITY.indexOf(b.name);
    const aRank = aIdx === -1 ? MANUAL_INVOICE_PRODUCT_PRIORITY.length : aIdx;
    const bRank = bIdx === -1 ? MANUAL_INVOICE_PRODUCT_PRIORITY.length : bIdx;

    if (aRank !== bRank) return aRank - bRank;
    return a.name.localeCompare(b.name, "pt-BR");
  });
}

/**
 * Campos visíveis do drawer de fatura manual conforme unificação e nota separada.
 */
export function getManualInvoiceVisibleFields(
  level: ClientNfeUnificationLevel | null,
  separateNote: boolean,
  hasPresetClient: boolean,
): BillingManualInvoiceVisibleFields {
  const scope = level ? nfeLevelToBillingScope(level) : null;

  return {
    client: !hasPresetClient,
    separateNoteCheckbox: scope === "client" || scope === "contract",
    // Com nota separada o select some; a manual vai para "Projetos e setups".
    // Unificação client: BE rejeita vínculo de contrato na nota unificada.
    contract: scope === "contract" && !separateNote,
    dueDateFull: scope === "deductible" || separateNote,
  };
}

/**
 * Patch de formulário ao alternar "nota separada".
 */
export function getFormPatchOnSeparateNoteChange(
  separateNote: boolean,
  form: BillingManualInvoiceFormState,
): Partial<BillingManualInvoiceFormState> {
  return {
    separateNote,
    contractId: separateNote ? "" : form.contractId,
    dueDateFull: separateNote ? form.dueDateFull : "",
  };
}

/**
 * Dono do informativo de vencimento na fatura manual (mesma nota).
 * Unificação por cliente → cliente; por contrato → contrato selecionado.
 */
export function resolveManualInvoicePaymentInfoOwner(
  level: ClientNfeUnificationLevel | null,
): "client" | "contract" | null {
  if (level === "client") return "client";
  if (level === "contract") return "contract";
  return null;
}

/**
 * Valida manual invoice form do formulário.
 */
export function validateManualInvoiceForm(
  form: BillingManualInvoiceFormState,
  level: ClientNfeUnificationLevel | null,
  hasPresetClient: boolean,
): BillingManualInvoiceFieldErrors {
  const errors: BillingManualInvoiceFieldErrors = {};
  const visible = getManualInvoiceVisibleFields(level, form.separateNote, hasPresetClient);

  if (visible.client && !form.clientId) {
    errors.clientId = "Selecione um cliente";
  }

  if (!form.competence) {
    errors.competence = "Selecione o mês de competência";
  }

  if (!form.amount || unmaskCurrency4(form.amount) <= 0) {
    errors.amount = "Informe o valor da fatura";
  } else if (!hasExactlyFourDecimalPlaces(form.amount)) {
    errors.amount = "Informe o valor com exatamente 4 casas decimais";
  }

  if (!form.profitCenter) {
    errors.profitCenter = "Selecione o centro de lucro";
  }

  if (!form.productId) {
    errors.productId = "Selecione um produto";
  }

  if (!form.description.trim()) {
    errors.description = "Informe a descrição da fatura";
  }

  if (visible.dueDateFull && !form.dueDateFull) {
    errors.dueDateFull = "Selecione o vencimento";
  }

  if (visible.contract && !form.contractId) {
    errors.contractId = "Selecione um contrato";
  }

  return errors;
}

/**
 * Monta manual invoice payload para uso na interface.
 */
export function buildManualInvoicePayload(
  form: BillingManualInvoiceFormState,
  context: ManualInvoicePayloadContext,
): BillingManualInvoicePayload | null {
  const scope = nfeLevelToBillingScope(context.nfeUnificationLevel);
  const visible = getManualInvoiceVisibleFields(
    context.nfeUnificationLevel,
    form.separateNote,
    context.hasPresetClient,
  );

  const contract =
    visible.contract && form.contractId
      ? context.contracts.find((item) => item.id === form.contractId)
      : undefined;

  // Mesma nota: envia o vencimento da nota unificada já exibido no drawer (persistência no BE).
  const dueDate = visible.dueDateFull ? form.dueDateFull : (context.unifiedDueDate ?? "");

  const isDeductibleScope = scope === "deductible";

  return {
    clientId: context.clientId,
    clientName: context.clientName,
    competence: form.competence,
    amount: unmaskCurrency4(form.amount),
    profitCenter: form.profitCenter,
    excessProfitCenter: form.excessProfitCenter || undefined,
    productId: form.productId,
    productName: context.productName,
    description: form.description.trim(),
    separateNote: isDeductibleScope ? true : form.separateNote,
    dueDate,
    contractId: contract?.id,
    contractName: contract?.name,
    scope,
  };
}

/**
 * Cria manual invoice entity via API.
 */
export function createManualInvoiceEntity(
  payload: BillingManualInvoicePayload,
  id?: string,
): BillingManualInvoice {
  return {
    id: id ?? `manual-${Date.now()}`,
    competence: payload.competence,
    description: payload.description,
    value: payload.amount,
    dueDate: payload.dueDate,
    separateNote: payload.separateNote,
    contractId: payload.contractId,
    contractName: payload.contractName,
    productId: payload.productId,
    productName: payload.productName,
    profitCenter: payload.profitCenter,
    excessProfitCenter: payload.excessProfitCenter,
  };
}

function findContractListNoteIndex(
  notes: BillingInvoiceRecord["invoiceDetails"]["notes"],
  contractId: string | undefined,
): number {
  if (contractId) {
    const byContract = notes.findIndex((note) => !note.isManual && note.contractId === contractId);
    if (byContract >= 0) return byContract;
  }

  // Escopo client: nota automática única costuma não ter contractId
  return notes.findIndex((note) => !note.isManual);
}

/**
 * Aplica manual invoice to list record ao estado ou registro alvo.
 * Sem nota separada: agrega na nota do contrato (não cria nota isManual isolada).
 */
export function applyManualInvoiceToListRecord(
  record: BillingInvoiceRecord,
  manualInvoice: BillingManualInvoice,
  payload: BillingManualInvoicePayload,
): BillingInvoiceRecord {
  const totalAmount = record.totalAmount + manualInvoice.value;

  if (!payload.separateNote) {
    const { notes } = record.invoiceDetails;
    const contractNoteIndex = findContractListNoteIndex(notes, payload.contractId);

    if (contractNoteIndex >= 0) {
      return {
        ...record,
        totalAmount,
      };
    }

    return {
      ...record,
      totalAmount,
      invoiceDetails: {
        ...record.invoiceDetails,
        notes: [
          ...notes,
          {
            id: `note-${manualInvoice.id}`,
            ownerName: payload.contractName ?? payload.clientName,
            dueDate: manualInvoice.dueDate,
            contractId: payload.contractId,
            isManual: false,
          },
        ],
      },
    };
  }

  const newNote = {
    id: `note-${manualInvoice.id}`,
    ownerName: payload.productName,
    dueDate: manualInvoice.dueDate,
    productName: payload.productName,
    description: payload.description,
    isManual: true as const,
    contractId: payload.contractId,
    isSeparateNfe: true as const,
  };

  return {
    ...record,
    totalAmount,
    invoiceDetails: {
      ...record.invoiceDetails,
      notes: [...record.invoiceDetails.notes, newNote],
    },
  };
}

/**
 * Cria billing record from manual invoice via API.
 * Sem nota separada: nota do contrato (não isManual isolada).
 */
export function createBillingRecordFromManualInvoice(
  payload: BillingManualInvoicePayload,
  manualInvoice: BillingManualInvoice,
): BillingInvoiceRecord {
  const note = payload.separateNote
    ? {
        id: `note-${manualInvoice.id}`,
        ownerName: payload.productName,
        dueDate: manualInvoice.dueDate,
        productName: payload.productName,
        description: payload.description,
        isManual: true as const,
        contractId: payload.contractId,
        isSeparateNfe: true as const,
      }
    : {
        id: `note-${manualInvoice.id}`,
        ownerName: payload.contractName ?? payload.clientName,
        dueDate: manualInvoice.dueDate,
        contractId: payload.contractId,
        isManual: false as const,
      };

  return {
    id: `bill-manual-${manualInvoice.id}`,
    clientId: payload.clientId,
    clientName: payload.clientName,
    profitCenter: payload.profitCenter,
    competence: payload.competence,
    referenceMonth: payload.competence,
    invoicePeriodMonths: 1,
    totalAmount: manualInvoice.value,
    invoiceDetails: {
      scope: payload.scope,
      notes: [note],
    },
  };
}

/**
 * Aplica manual invoice to detail ao estado ou registro alvo.
 */
export function applyManualInvoiceToDetail(
  detail: BillingInvoiceDetail,
  manualInvoice: BillingManualInvoice,
): BillingInvoiceDetail {
  const manualInvoices = [...(detail.manualInvoices ?? []), manualInvoice];
  const contracts = detail.contracts.map((contract) => {
    if (!manualInvoice.contractId || contract.id !== manualInvoice.contractId) {
      return contract;
    }

    return {
      ...contract,
      total: contract.total + manualInvoice.value,
    };
  });

  return {
    ...detail,
    manualInvoices,
    contracts,
    invoiceTotal: detail.invoiceTotal + manualInvoice.value,
  };
}

/**
 * Cria billing detail from manual invoice via API.
 */
export function createBillingDetailFromManualInvoice(
  record: BillingInvoiceRecord,
  manualInvoice: BillingManualInvoice,
): BillingInvoiceDetail {
  return {
    ...record,
    contracts: [],
    invoiceTotal: manualInvoice.value,
    manualInvoices: [manualInvoice],
  };
}

/**
 * Localiza matching billing record correspondente.
 */
export function findMatchingBillingRecord(
  records: BillingInvoiceRecord[],
  payload: BillingManualInvoicePayload,
): BillingInvoiceRecord | undefined {
  return records.find(
    (record) =>
      record.clientId === payload.clientId &&
      record.competence === payload.competence &&
      record.invoiceDetails.scope === payload.scope,
  );
}

/**
 * Localiza a entry de faturamento do cliente na competência (mesma nota).
 */
export function findBillingRecordForCompetence(
  records: BillingInvoiceRecord[],
  clientId: string,
  competence: string,
): BillingInvoiceRecord | undefined {
  const competenceKey = competence.slice(0, 7);
  return records.find(
    (record) => record.clientId === clientId && record.competence.slice(0, 7) === competenceKey,
  );
}

/**
 * Due date da nota unificada já calculada no faturamento (entry/invoice).
 * - client: nota automática (ou primeira nota não separada)
 * - contract: nota do contrato selecionado
 */
export function resolveUnifiedBillingDueDate(
  record: BillingInvoiceRecord | undefined,
  options: { scope: BillingInvoiceScope; contractId?: string },
): string | undefined {
  if (!record) return undefined;

  const { notes } = record.invoiceDetails;
  if (notes.length === 0) return undefined;

  const nonSeparate = notes.filter((note) => !note.isSeparateNfe);
  const candidates = nonSeparate.length > 0 ? nonSeparate : notes;

  if (options.scope === "contract" && options.contractId) {
    const contractNote =
      candidates.find((note) => note.contractId === options.contractId && !note.isManual) ??
      candidates.find((note) => note.contractId === options.contractId);
    return contractNote?.dueDate || undefined;
  }

  const automatic = candidates.find((note) => !note.isManual) ?? candidates[0];
  return automatic?.dueDate || undefined;
}
