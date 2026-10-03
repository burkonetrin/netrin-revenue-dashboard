import { hasExactlyFourDecimalPlaces, unmaskCurrency4 } from "@/shared/utils/currency";
import type {
  BillingContractDetail,
  BillingInvoiceAdjustment,
  BillingInvoiceDetail,
} from "../types/billing-detail.types";
import type {
  BillingAdjustmentFieldErrors,
  BillingAdjustmentFormState,
  BillingAdjustmentPayload,
  BillingAdjustmentType,
  BillingAdjustmentTypeOption,
  BillingAdjustmentVisibleFields,
  BillingCompetenceOption,
} from "../types/billing-adjustment.types";
import type { BillingInvoiceScope } from "../types/billing.types";
import { getCurrentMonth } from "./billing-list.utils";

/**
 * Estado inicial vazio do formulário de ajuste de fatura.
 */
export const EMPTY_ADJUSTMENT_FORM: BillingAdjustmentFormState = {
  adjustmentType: "",
  monetaryTarget: "",
  contractId: "",
  franchiseId: "",
  amount: "",
  dueDate: "",
  competence: "",
  invoiceDescription: "",
  adjustmentDescription: "",
};

/**
 * Monta o formulário ao selecionar um tipo de ajuste.
 * Competência inicia no mês corrente para evitar seleção acidental de competência futura.
 */
export function buildAdjustmentFormForType(
  type: BillingAdjustmentType,
): BillingAdjustmentFormState {
  return {
    ...EMPTY_ADJUSTMENT_FORM,
    adjustmentType: type,
    competence: type === "competence" ? getCurrentMonth() : "",
  };
}

/**
 * Opções de tipo de ajuste disponíveis no formulário.
 */
export const ADJUSTMENT_TYPE_OPTIONS: BillingAdjustmentTypeOption[] = [
  { value: "discount", label: "Desconto" },
  { value: "surcharge", label: "Acréscimo" },
  { value: "due_date", label: "Vencimento" },
  { value: "competence", label: "Competência" },
  { value: "invoice_description", label: "Descrição da fatura" },
];

function formatCompetenceLabel(competence: string) {
  const [year, month] = competence.split("-").map(Number);
  if (!year || !month) return competence;

  const date = new Date(year, month - 1, 1);
  const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);
  const formattedMonth = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)}`;

  return `${formattedMonth} / ${year}`;
}

function toCompetenceValue(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

const COMPETENCE_PAST_MONTHS = 24;
const COMPETENCE_FUTURE_MONTHS = 12;

/**
 * Monta competence month options para uso na interface.
 * Janela: mês atual − 24 … mês atual + 12 (ajuste e Add Invoice).
 * @param selectedCompetence - selected competence
 */
export function buildCompetenceMonthOptions(selectedCompetence: string): BillingCompetenceOption[] {
  const anchorDate = new Date();
  const optionCount = COMPETENCE_PAST_MONTHS + 1 + COMPETENCE_FUTURE_MONTHS;
  const options = Array.from({ length: optionCount }, (_, index) => {
    const offset = index - COMPETENCE_PAST_MONTHS;
    const date = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + offset, 1);
    const value = toCompetenceValue(date);

    return {
      value,
      label: formatCompetenceLabel(value),
    };
  });

  if (selectedCompetence && !options.some((option) => option.value === selectedCompetence)) {
    options.push({
      value: selectedCompetence,
      label: formatCompetenceLabel(selectedCompetence),
    });
  }

  return options.sort((current, next) => next.value.localeCompare(current.value));
}

function isMonetaryAdjustment(type: BillingAdjustmentType) {
  return type === "discount" || type === "surcharge";
}

/**
 * Busca visible fields na API.
 */
export function getVisibleFields(
  adjustmentType: BillingAdjustmentType | "",
  scope: BillingInvoiceScope,
  monetaryTarget: BillingAdjustmentFormState["monetaryTarget"] = "",
  hasMixedModes = false,
): BillingAdjustmentVisibleFields {
  if (!adjustmentType) {
    return {
      adjustmentType: true,
      monetaryTarget: false,
      contract: false,
      franchise: false,
      amount: false,
      dueDate: false,
      competence: false,
      invoiceDescription: false,
      adjustmentDescription: false,
    };
  }

  const monetary = isMonetaryAdjustment(adjustmentType);
  const hasClientMixedModes = scope === "client" && hasMixedModes;
  const showMonetaryTarget =
    (scope === "client" && monetary) ||
    (hasClientMixedModes && (monetary || adjustmentType === "due_date"));
  const showContract = monetary
    ? hasClientMixedModes
      ? monetaryTarget === "contract"
      : scope === "contract" || (scope === "client" && monetaryTarget === "contract")
    : adjustmentType === "due_date"
      ? hasClientMixedModes
        ? monetaryTarget === "contract"
        : scope === "contract"
      : false;
  const showFranchise = monetary
    ? hasClientMixedModes
      ? monetaryTarget === "franchise"
      : scope === "deductible" || (scope === "client" && monetaryTarget === "franchise")
    : adjustmentType === "due_date"
      ? hasClientMixedModes
        ? monetaryTarget === "franchise"
        : scope === "deductible"
      : false;

  return {
    adjustmentType: true,
    monetaryTarget: showMonetaryTarget,
    contract: showContract,
    franchise: showFranchise,
    amount: monetary,
    dueDate: adjustmentType === "due_date",
    competence: adjustmentType === "competence",
    invoiceDescription: adjustmentType === "invoice_description",
    adjustmentDescription:
      monetary || adjustmentType === "due_date" || adjustmentType === "competence",
  };
}

/**
 * Valida adjustment form do formulário.
 */
export function validateAdjustmentForm(
  state: BillingAdjustmentFormState,
  scope: BillingInvoiceScope,
  hasMixedModes = false,
): BillingAdjustmentFieldErrors {
  const errors: BillingAdjustmentFieldErrors = {};
  const visible = getVisibleFields(state.adjustmentType, scope, state.monetaryTarget, hasMixedModes);

  if (!state.adjustmentType) {
    errors.adjustmentType = "Selecione um tipo de ajuste";
    return errors;
  }

  if (visible.monetaryTarget && !state.monetaryTarget) {
    errors.monetaryTarget = "Selecione onde o ajuste será aplicado";
  }

  if (visible.contract && !state.contractId) {
    errors.contractId = "Selecione um contrato";
  }

  if (visible.franchise && !state.franchiseId) {
    errors.franchiseId = "Selecione uma franquia";
  }

  if (
    isMonetaryAdjustment(state.adjustmentType as BillingAdjustmentType) &&
    state.contractId &&
    state.franchiseId
  ) {
    errors.contractId = "Informe apenas contrato ou franquia, não ambos";
    errors.franchiseId = "Informe apenas contrato ou franquia, não ambos";
  }

  if (visible.amount) {
    const amount = unmaskCurrency4(state.amount);
    if (!state.amount.trim() || amount <= 0) {
      errors.amount = "Informe um valor maior que zero";
    } else if (!hasExactlyFourDecimalPlaces(state.amount)) {
      errors.amount = "Informe o valor com exatamente 4 casas decimais";
    }
  }

  if (visible.dueDate && !state.dueDate) {
    errors.dueDate = "Informe a nova data de vencimento";
  }

  if (visible.competence && !state.competence) {
    errors.competence = "Informe a data de competência";
  }

  if (visible.invoiceDescription && !state.invoiceDescription.trim()) {
    errors.invoiceDescription = "Informe a descrição da fatura";
  }

  if (visible.adjustmentDescription && !state.adjustmentDescription.trim()) {
    errors.adjustmentDescription = "Informe a descrição do ajuste";
  }

  return errors;
}

/**
 * Monta adjustment payload para uso na interface.
 */
export function buildAdjustmentPayload(
  state: BillingAdjustmentFormState,
): BillingAdjustmentPayload | null {
  const {
    adjustmentType,
    monetaryTarget,
    franchiseId: formFranchiseId,
    contractId: formContractId,
    amount,
    dueDate,
    competence,
    invoiceDescription,
    adjustmentDescription,
  } = state;

  if (!adjustmentType) return null;

  let contractId: string | undefined;
  let franchiseId: string | undefined;

  if (isMonetaryAdjustment(adjustmentType)) {
    if (monetaryTarget === "franchise") {
      franchiseId = formFranchiseId || undefined;
    } else if (monetaryTarget === "contract") {
      contractId = formContractId || undefined;
    } else if (formFranchiseId) {
      franchiseId = formFranchiseId;
    } else {
      contractId = formContractId || undefined;
    }
  } else if (adjustmentType === "due_date") {
    if (formFranchiseId) {
      franchiseId = formFranchiseId;
    } else {
      contractId = formContractId || undefined;
    }
  }

  return {
    type: adjustmentType,
    contractId,
    franchiseId,
    amount: amount ? unmaskCurrency4(amount) : undefined,
    dueDate: dueDate || undefined,
    competence: competence || undefined,
    invoiceDescription: invoiceDescription.trim() || undefined,
    adjustmentDescription: adjustmentDescription.trim() || undefined,
  };
}

const FRANCHISE_DESCRIPTION_PREFIX_RE = /^Franquia:\s*.+\s-\s/;

/**
 * Monta descrição do ajuste com o vínculo da franquia.
 * Usado no submit (descrição persistida) e no detalhe (exibição).
 * Evita duplicar o prefixo quando o texto já começa com o padrão.
 */
export function formatFranchiseAdjustmentDescription(
  franchiseName: string,
  text: string,
): string {
  const trimmedName = franchiseName.trim();
  const trimmedText = text.trim();

  if (!trimmedName) {
    return trimmedText;
  }

  if (!trimmedText) {
    return `Franquia: ${trimmedName}`;
  }

  if (FRANCHISE_DESCRIPTION_PREFIX_RE.test(trimmedText)) {
    return trimmedText;
  }

  return `Franquia: ${trimmedName} - ${trimmedText}`;
}

/**
 * Prefixa a descrição persistida do ajuste monetary quando há franchiseId.
 * Genérico por franchiseId (client + deductible); sem franchiseId não altera.
 */
export function withFranchisePrefixedDescription(
  payload: BillingAdjustmentPayload,
  invoice: BillingInvoiceDetail,
): BillingAdjustmentPayload {
  if (
    !isMonetaryAdjustment(payload.type) ||
    !payload.franchiseId ||
    !payload.adjustmentDescription
  ) {
    return payload;
  }

  const franchiseName = getFranchiseOptions(invoice).find(
    (option) => option.value === payload.franchiseId,
  )?.label;

  if (!franchiseName) {
    return payload;
  }

  return {
    ...payload,
    adjustmentDescription: formatFranchiseAdjustmentDescription(
      franchiseName,
      payload.adjustmentDescription,
    ),
  };
}

function recalculateContractTotal(contract: BillingContractDetail): BillingContractDetail {
  const adjustments = contract.adjustments ?? [];
  const discountTotal = adjustments
    .filter((adjustment) => adjustment.type === "discount")
    .reduce((sum, adjustment) => sum + adjustment.amount, 0);
  const surchargeTotal = adjustments
    .filter((adjustment) => adjustment.type === "surcharge")
    .reduce((sum, adjustment) => sum + adjustment.amount, 0);

  let total = contract.subtotalWithoutAdjustments - discountTotal + surchargeTotal;

  if (contract.minimumValue !== undefined && total < contract.minimumValue) {
    total = contract.minimumValue;
  }

  return {
    ...contract,
    total,
  };
}

function findContractByFranchiseId(invoice: BillingInvoiceDetail, franchiseId: string) {
  return invoice.contracts.find((contract) =>
    contract.franchises.some((franchise) => franchise.id === franchiseId),
  );
}

function resolveTargetContractId(
  invoice: BillingInvoiceDetail,
  payload: BillingAdjustmentPayload,
  scope: BillingInvoiceScope,
) {
  if (payload.contractId) return payload.contractId;

  if (scope === "deductible" && payload.franchiseId) {
    return findContractByFranchiseId(invoice, payload.franchiseId)?.id;
  }

  if (scope === "client" && isMonetaryAdjustment(payload.type)) {
    return invoice.contracts[0]?.id;
  }

  return undefined;
}

function applyMonetaryAdjustment(
  invoice: BillingInvoiceDetail,
  payload: BillingAdjustmentPayload,
  scope: BillingInvoiceScope,
): BillingInvoiceDetail {
  const contractId = resolveTargetContractId(invoice, payload, scope);
  if (!contractId || payload.amount === undefined || !payload.adjustmentDescription) {
    return invoice;
  }

  const franchiseName = payload.franchiseId
    ? getFranchiseOptions(invoice).find((option) => option.value === payload.franchiseId)?.label
    : undefined;

  const adjustment: BillingInvoiceAdjustment = {
    id: `adj-${Date.now()}`,
    type: payload.type as "discount" | "surcharge",
    description: payload.adjustmentDescription,
    amount: payload.amount,
    franchiseName,
  };

  const contracts = invoice.contracts.map((contract) => {
    if (contract.id !== contractId) return contract;

    const adjustments = [...(contract.adjustments ?? []), adjustment];
    return recalculateContractTotal({
      ...contract,
      adjustments,
    });
  });

  return {
    ...invoice,
    contracts,
    invoiceTotal: contracts.reduce((sum, contract) => sum + contract.total, 0),
  };
}

function applyDueDateAdjustment(
  invoice: BillingInvoiceDetail,
  payload: BillingAdjustmentPayload,
  scope: BillingInvoiceScope,
): BillingInvoiceDetail {
  if (!payload.dueDate) return invoice;

  if (scope === "client") {
    const notes = invoice.invoiceDetails.notes.map((note, index) => {
      if (index === 0) return { ...note, dueDate: payload.dueDate! };
      return note;
    });

    return {
      ...invoice,
      invoiceDetails: {
        ...invoice.invoiceDetails,
        notes,
      },
    };
  }

  if (scope === "contract" && payload.contractId) {
    const selectedContract = invoice.contracts.find((contract) => contract.id === payload.contractId);
    const groupId = selectedContract?.groupId;
    const contracts = invoice.contracts.map((contract) =>
      (contract.id === payload.contractId || (groupId && contract.groupId === groupId)
        ? { ...contract, dueDate: payload.dueDate }
        : contract),
    );

    return { ...invoice, contracts };
  }

  if (scope === "deductible" && payload.franchiseId) {
    const contracts = invoice.contracts.map((contract) => ({
      ...contract,
      franchises: contract.franchises.map((franchise) =>
        (franchise.id === payload.franchiseId
          ? { ...franchise, dueDate: payload.dueDate }
          : franchise),
      ),
    }));

    return { ...invoice, contracts };
  }

  return invoice;
}

function applyCompetenceAdjustment(
  invoice: BillingInvoiceDetail,
  payload: BillingAdjustmentPayload,
): BillingInvoiceDetail {
  if (!payload.competence) return invoice;

  const contracts = invoice.contracts.map((contract) => ({
    ...contract,
    competence: payload.competence,
  }));

  return {
    ...invoice,
    competence: payload.competence,
    contracts,
  };
}

function applyInvoiceDescriptionAdjustment(
  invoice: BillingInvoiceDetail,
  payload: BillingAdjustmentPayload,
): BillingInvoiceDetail {
  if (!payload.invoiceDescription) return invoice;

  return {
    ...invoice,
    description: payload.invoiceDescription,
  };
}

/**
 * Aplica adjustment to invoice ao estado ou registro alvo.
 */
export function applyAdjustmentToInvoice(
  invoice: BillingInvoiceDetail,
  payload: BillingAdjustmentPayload,
): BillingInvoiceDetail {
  const { scope } = invoice.invoiceDetails;

  switch (payload.type) {
    case "discount":
    case "surcharge":
      return applyMonetaryAdjustment(invoice, payload, scope);
    case "due_date":
      return applyDueDateAdjustment(invoice, payload, scope);
    case "competence":
      return applyCompetenceAdjustment(invoice, payload);
    case "invoice_description":
      return applyInvoiceDescriptionAdjustment(invoice, payload);
    default:
      return invoice;
  }
}

/**
 * Busca contract options na API.
 * @param invoice - invoice
 */
export function getContractOptions(invoice: BillingInvoiceDetail) {
  const seen = new Set<string>();
  return invoice.contracts.flatMap((contract) => {
    if (seen.has(contract.id)) return [];
    seen.add(contract.id);
    return [{ value: contract.id, label: contract.name }];
  });
}

/**
 * Busca franchise options na API.
 * @param invoice - invoice
 */
export function getFranchiseOptions(invoice: BillingInvoiceDetail) {
  const seen = new Set<string>();
  return invoice.contracts.flatMap((contract) =>
    contract.franchises.flatMap((franchise) => {
      if (seen.has(franchise.id)) return [];
      seen.add(franchise.id);
      return [{ value: franchise.id, label: franchise.name }];
    }),
  );
}

export function getMixedAdjustmentTargetOptions(invoice: BillingInvoiceDetail) {
  const contractOptions = getContractOptions(invoice).filter(
    (option) => option.value.trim() && option.label.trim(),
  );
  const franchiseOptions = getFranchiseOptions(invoice).filter(
    (option) => option.value.trim() && option.label.trim(),
  );

  return {
    contractOptions,
    franchiseOptions,
    hasMixedModes: contractOptions.length > 0 && franchiseOptions.length > 0,
  };
}

const CONTRACT_DESCRIPTION_PREFIX_RE = /^Contrato:\s*.+\s-\s/;

/** Prefixa ajustes monetários de contrato com o owner efetivamente selecionado. */
export function formatContractAdjustmentDescription(contractName: string, text: string): string {
  const trimmedName = contractName.trim();
  const trimmedText = text.trim();
  if (!trimmedName) return trimmedText;
  if (!trimmedText) return `Contrato: ${trimmedName}`;
  if (CONTRACT_DESCRIPTION_PREFIX_RE.test(trimmedText)) return trimmedText;
  return `Contrato: ${trimmedName} - ${trimmedText}`;
}

export function withContractPrefixedDescription(
  payload: BillingAdjustmentPayload,
  invoice: BillingInvoiceDetail,
): BillingAdjustmentPayload {
  if (!isMonetaryAdjustment(payload.type) || !payload.contractId || !payload.adjustmentDescription) {
    return payload;
  }
  const contract = invoice.contracts.find((item) => item.id === payload.contractId);
  if (!contract) return payload;
  return {
    ...payload,
    adjustmentDescription: formatContractAdjustmentDescription(
      contract.name,
      payload.adjustmentDescription,
    ),
  };
}
