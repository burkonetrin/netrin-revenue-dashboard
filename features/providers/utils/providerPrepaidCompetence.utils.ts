import type {
  EditProviderCreditDepositRequest,
  ProviderInvoiceBillableSourceResponse,
  UpdateProviderCreditDepositRequest,
} from "../types/providerInvoices.types";
import { REQUIRED_FIELD_MESSAGE } from "./providerForm.utils";

const INVALID_MONEY_MESSAGE = "Informe um valor válido e não negativo";
const INVALID_COMPETENCE_MESSAGE = "Informe uma competência válida (MM/AAAA)";

export interface PrepaidCreditDepositDraft {
  id?: string;
  balanceBeforeCredit: string;
  creditAmount: string;
}

export interface PrepaidCompetenceDraft {
  competenceMonth: string;
  startingBalance: string;
  creditDeposits: PrepaidCreditDepositDraft[];
  isMonthClosed: boolean;
  endingBalance: string;
  minimumFranchiseValue: string;
}

export type PrepaidCompetenceField =
  | "competenceMonth"
  | "startingBalance"
  | "endingBalance"
  | "minimumFranchiseValue"
  | `creditDeposits.${number}.balanceBeforeCredit`
  | `creditDeposits.${number}.creditAmount`;

export type PrepaidCompetenceErrors = Partial<Record<PrepaidCompetenceField, string>>;

export interface NormalizedPrepaidCompetenceDraft {
  competenceMonth: string;
  assessmentStartDate: string;
  assessmentEndDate: string;
  startingBalance: string;
  creditDeposits: PrepaidCreditDepositDraft[];
  isMonthClosed: boolean;
  endingBalance: string | null;
  minimumFranchiseValue: string | null;
}

export type PrepaidCompetenceValidation =
  | { valid: true; value: NormalizedPrepaidCompetenceDraft; errors: Record<string, never> }
  | { valid: false; value: null; errors: PrepaidCompetenceErrors };

export type PrepaidDepositPersistencePlan =
  | {
      status: "valid";
      persistedDeposits: EditProviderCreditDepositRequest[];
      newDepositCommands: UpdateProviderCreditDepositRequest[];
      deletedDepositId: string | undefined;
      closingCommand: UpdateProviderCreditDepositRequest | undefined;
    }
  | {
      status: "invalid";
      reason:
        | "unknown-persisted-deposit"
        | "invalid-persisted-deposit-removal"
        | "missing-ending-balance";
    };

export type PrepaidConsumptionResult =
  | { status: "valid"; consumedValue: string; referenceBalance: string }
  | {
      status: "invalid";
      reason: "negative-deposit-consumption" | "negative-closing-consumption";
    };

export interface PrepaidCostAllocation extends ProviderInvoiceBillableSourceResponse {
  totalCost: string;
}

export type PrepaidCostAllocationResult =
  | {
      status: "valid";
      effectiveCost: string;
      totalEligibleQuantity: number;
      sources: PrepaidCostAllocation[];
    }
  | {
      status: "invalid";
      reason: "no-billable-queries";
      effectiveCost: string;
      totalEligibleQuantity: 0;
      sources: PrepaidCostAllocation[];
    };

function normalizeMoney(value: string): string | null {
  const trimmed = value.trim().replace(/^R\$\s?/, "");
  if (!trimmed || trimmed.startsWith("-")) return null;

  const normalized = trimmed.includes(",") ? trimmed.replace(/\./g, "").replace(",", ".") : trimmed;
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0
    ? (Math.round(parsed * 100) / 100).toFixed(2)
    : null;
}

function toCents(value: string): number {
  return Math.round(Number(value) * 100);
}

function fromCents(value: number): string {
  return (value / 100).toFixed(2);
}

function normalizeCompetence(value: string): string | null {
  const match = /^(0[1-9]|1[0-2])\/(\d{4})$/.exec(value.trim());
  return match ? `${match[2]}-${match[1]}-01` : null;
}

function monthEnd(competenceMonth: string): string {
  const [year, month] = competenceMonth.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

function setMoneyError(
  errors: PrepaidCompetenceErrors,
  field: PrepaidCompetenceField,
  value: string,
  required: boolean,
): string | null {
  if (!value.trim()) {
    if (required) errors[field] = REQUIRED_FIELD_MESSAGE;
    return null;
  }

  const normalized = normalizeMoney(value);
  if (normalized === null) errors[field] = INVALID_MONEY_MESSAGE;
  return normalized;
}

/** Validates UI data and derives the monthly ISO period required by the API. */
export function validatePrepaidCompetenceDraft(
  draft: PrepaidCompetenceDraft,
  existingCompetenceMonths: string[] = [],
): PrepaidCompetenceValidation {
  const errors: PrepaidCompetenceErrors = {};
  const competenceMonth = normalizeCompetence(draft.competenceMonth);

  if (!draft.competenceMonth.trim()) errors.competenceMonth = REQUIRED_FIELD_MESSAGE;
  else if (!competenceMonth) errors.competenceMonth = INVALID_COMPETENCE_MESSAGE;
  else if (existingCompetenceMonths.includes(competenceMonth)) {
    errors.competenceMonth = "Competência já cadastrada";
  }

  const startingBalance = setMoneyError(errors, "startingBalance", draft.startingBalance, true);
  const minimumFranchiseValue = setMoneyError(
    errors,
    "minimumFranchiseValue",
    draft.minimumFranchiseValue,
    false,
  );
  const endingBalance = setMoneyError(
    errors,
    "endingBalance",
    draft.endingBalance,
    draft.isMonthClosed,
  );
  const creditDeposits = draft.creditDeposits.map((deposit, index) => {
    const balanceBeforeCredit = setMoneyError(
      errors,
      `creditDeposits.${index}.balanceBeforeCredit`,
      deposit.balanceBeforeCredit,
      true,
    );
    const creditAmount = setMoneyError(
      errors,
      `creditDeposits.${index}.creditAmount`,
      deposit.creditAmount,
      true,
    );

    return {
      ...(deposit.id ? { id: deposit.id } : {}),
      balanceBeforeCredit,
      creditAmount,
    };
  });

  if (Object.keys(errors).length > 0 || !competenceMonth || !startingBalance) {
    return { valid: false, value: null, errors };
  }

  return {
    valid: true,
    errors: {},
    value: {
      competenceMonth,
      assessmentStartDate: competenceMonth,
      assessmentEndDate: monthEnd(competenceMonth),
      startingBalance,
      creditDeposits: creditDeposits.map((deposit) => ({
        ...(deposit.id ? { id: deposit.id } : {}),
        balanceBeforeCredit: deposit.balanceBeforeCredit as string,
        creditAmount: deposit.creditAmount as string,
      })),
      isMonthClosed: draft.isMonthClosed,
      endingBalance: draft.isMonthClosed ? (endingBalance as string) : null,
      minimumFranchiseValue: minimumFranchiseValue ?? null,
    },
  };
}

/** Separates persisted deposits, new deposit commands, the allowed final deletion and closing. */
export function buildPrepaidDepositPersistencePlan(
  draft: Pick<NormalizedPrepaidCompetenceDraft, "creditDeposits" | "isMonthClosed" | "endingBalance">,
  persistedDepositIds: string[],
): PrepaidDepositPersistencePlan {
  const persistedDepositIdSet = new Set(persistedDepositIds);
  const persistedDeposits: EditProviderCreditDepositRequest[] = [];
  const newDepositCommands: UpdateProviderCreditDepositRequest[] = [];

  for (const deposit of draft.creditDeposits) {
    if (deposit.id) {
      if (!persistedDepositIdSet.has(deposit.id)) {
        return { status: "invalid", reason: "unknown-persisted-deposit" };
      }
      persistedDeposits.push({
        id: deposit.id,
        balanceBeforeCredit: deposit.balanceBeforeCredit,
        creditAmount: deposit.creditAmount,
      });
    } else {
      newDepositCommands.push({
        balanceBeforeCredit: deposit.balanceBeforeCredit,
        creditAmount: deposit.creditAmount,
      });
    }
  }

  const persistedDraftIds = persistedDeposits.map((deposit) => deposit.id);
  const missingPersistedIds = persistedDepositIds.filter((id) => !persistedDraftIds.includes(id));
  const deletedDepositId = missingPersistedIds[0];
  const canDeleteOnlyLast =
    missingPersistedIds.length <= 1 &&
    (!deletedDepositId || deletedDepositId === persistedDepositIds[persistedDepositIds.length - 1]);

  if (!canDeleteOnlyLast) {
    return { status: "invalid", reason: "invalid-persisted-deposit-removal" };
  }

  if (draft.isMonthClosed && !draft.endingBalance) {
    return { status: "invalid", reason: "missing-ending-balance" };
  }

  let closingCommand: UpdateProviderCreditDepositRequest | undefined;
  if (draft.isMonthClosed) {
    const closingFields = { isMonthClosed: true, endingBalance: draft.endingBalance as string };
    const lastNewDepositIndex = newDepositCommands.length - 1;
    if (lastNewDepositIndex >= 0) {
      newDepositCommands[lastNewDepositIndex] = {
        ...newDepositCommands[lastNewDepositIndex],
        ...closingFields,
      };
    } else {
      closingCommand = closingFields;
    }
  }

  return {
    status: "valid",
    persistedDeposits,
    newDepositCommands,
    deletedDepositId,
    closingCommand,
  };
}

/** Calculates ordered prepaid consumption and blocks negative balance transitions. */
export function calculatePrepaidConsumption(
  draft: Pick<
    PrepaidCompetenceDraft,
    "startingBalance" | "creditDeposits" | "isMonthClosed" | "endingBalance"
  >,
): PrepaidConsumptionResult {
  let referenceBalance = toCents(draft.startingBalance);
  let consumedValue = 0;

  for (const deposit of draft.creditDeposits) {
    const balanceBeforeCredit = toCents(deposit.balanceBeforeCredit);
    const consumption = referenceBalance - balanceBeforeCredit;
    if (consumption < 0) return { status: "invalid", reason: "negative-deposit-consumption" };

    consumedValue += consumption;
    referenceBalance = balanceBeforeCredit + toCents(deposit.creditAmount);
  }

  if (draft.isMonthClosed) {
    const closingConsumption = referenceBalance - toCents(draft.endingBalance);
    if (closingConsumption < 0) {
      return { status: "invalid", reason: "negative-closing-consumption" };
    }
    consumedValue += closingConsumption;
  }

  return {
    status: "valid",
    consumedValue: fromCents(consumedValue),
    referenceBalance: fromCents(referenceBalance),
  };
}

/** Applies the optional contractual minimum to the calculated consumption. */
export function applyMinimumFranchise(
  consumedValue: string,
  minimumFranchiseValue?: string | null,
): string {
  const consumedCents = toCents(consumedValue);
  const franchiseCents = minimumFranchiseValue ? toCents(minimumFranchiseValue) : 0;
  return fromCents(Math.max(consumedCents, franchiseCents));
}

/** Allocates the effective cost by positive billable quantities with a deterministic residue. */
export function allocatePrepaidCost(
  effectiveCost: string,
  sources: ProviderInvoiceBillableSourceResponse[],
): PrepaidCostAllocationResult {
  const totalEligibleQuantity = sources.reduce(
    (total, source) => total + Math.max(source.clientBillableQuantity, 0),
    0,
  );
  const emptySources = sources.map((source) => ({ ...source, totalCost: "0.00" }));

  if (totalEligibleQuantity === 0) {
    return {
      status: "invalid",
      reason: "no-billable-queries",
      effectiveCost: fromCents(toCents(effectiveCost)),
      totalEligibleQuantity: 0,
      sources: emptySources,
    };
  }

  const effectiveCents = toCents(effectiveCost);
  const eligibleSources = sources.filter((source) => source.clientBillableQuantity > 0);
  let distributedCents = 0;
  const allocations = sources.map((source) => {
    if (source.clientBillableQuantity <= 0) return { ...source, totalCost: "0.00" };

    const isLastEligible = source === eligibleSources[eligibleSources.length - 1];
    const totalCost = isLastEligible
      ? effectiveCents - distributedCents
      : Math.round((effectiveCents * source.clientBillableQuantity) / totalEligibleQuantity);
    distributedCents += totalCost;
    return { ...source, totalCost: fromCents(totalCost) };
  });

  return {
    status: "valid",
    effectiveCost: fromCents(effectiveCents),
    totalEligibleQuantity,
    sources: allocations,
  };
}
