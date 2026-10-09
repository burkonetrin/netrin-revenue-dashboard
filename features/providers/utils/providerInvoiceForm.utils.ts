import { REQUIRED_FIELD_MESSAGE } from "./providerForm.utils";

export interface ProviderInvoiceFormInput {
  competenceMonth: string;
  assessmentStartDate: string;
  assessmentEndDate: string;
  invoiceTotalValue: string;
  minimumFranchiseValue?: string;
  invoiceFile?: File | null;
}

export type ProviderInvoiceFormField =
  | "competenceMonth"
  | "assessmentStartDate"
  | "assessmentEndDate"
  | "invoiceTotalValue"
  | "minimumFranchiseValue";

export type ProviderInvoiceFormErrors = Partial<Record<ProviderInvoiceFormField, string>>;

export interface NormalizedProviderInvoiceForm {
  competenceMonth: string;
  assessmentStartDate: string;
  assessmentEndDate: string;
  invoiceTotalValue: string;
  minimumFranchiseValue: string | null;
  invoiceFile: File | null;
}

export type ProviderInvoiceFormValidation =
  | { valid: true; value: NormalizedProviderInvoiceForm; errors: Record<string, never> }
  | { valid: false; value: null; errors: ProviderInvoiceFormErrors };

const INVALID_COMPETENCE_MESSAGE = "Informe uma competência válida (MM/AAAA)";
const INVALID_DATE_MESSAGE = "Informe uma data válida";
const INVALID_PERIOD_MESSAGE = "O período inicial deve ser anterior ou igual ao período final";
const INVALID_MONEY_MESSAGE = "Informe um valor válido e não negativo";

function normalizeMoney(value: string): string | null {
  const trimmed = value.trim().replace(/^R\$\s?/, "");
  if (!trimmed || trimmed.startsWith("-")) return null;

  const normalized = trimmed.includes(",") ? trimmed.replace(/\./g, "").replace(",", ".") : trimmed;
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? String(parsed) : null;
}

function normalizeCompetence(value: string): string | null {
  const match = /^(0[1-9]|1[0-2])\/(\d{4})$/.exec(value.trim());
  return match ? `${match[2]}-${match[1]}-01` : null;
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/**
 * Valida e normaliza o formulário de fatura indireta pós-paga.
 */
export function validateAndNormalizeProviderInvoiceForm(
  input: ProviderInvoiceFormInput,
): ProviderInvoiceFormValidation {
  const errors: ProviderInvoiceFormErrors = {};
  const competenceMonth = input.competenceMonth.trim();
  const assessmentStartDate = input.assessmentStartDate.trim();
  const assessmentEndDate = input.assessmentEndDate.trim();
  const invoiceTotalValue = input.invoiceTotalValue.trim();
  const minimumFranchiseValue = input.minimumFranchiseValue?.trim() ?? "";

  if (!competenceMonth) errors.competenceMonth = REQUIRED_FIELD_MESSAGE;
  else if (!normalizeCompetence(competenceMonth)) {
    errors.competenceMonth = INVALID_COMPETENCE_MESSAGE;
  }

  if (!assessmentStartDate) errors.assessmentStartDate = REQUIRED_FIELD_MESSAGE;
  else if (!isValidIsoDate(assessmentStartDate)) {
    errors.assessmentStartDate = INVALID_DATE_MESSAGE;
  }

  if (!assessmentEndDate) errors.assessmentEndDate = REQUIRED_FIELD_MESSAGE;
  else if (!isValidIsoDate(assessmentEndDate)) {
    errors.assessmentEndDate = INVALID_DATE_MESSAGE;
  }

  if (
    !errors.assessmentStartDate &&
    !errors.assessmentEndDate &&
    assessmentStartDate > assessmentEndDate
  ) {
    errors.assessmentStartDate = INVALID_PERIOD_MESSAGE;
    errors.assessmentEndDate = INVALID_PERIOD_MESSAGE;
  }

  if (!invoiceTotalValue) errors.invoiceTotalValue = REQUIRED_FIELD_MESSAGE;
  else if (normalizeMoney(invoiceTotalValue) === null) {
    errors.invoiceTotalValue = INVALID_MONEY_MESSAGE;
  }

  if (minimumFranchiseValue && normalizeMoney(minimumFranchiseValue) === null) {
    errors.minimumFranchiseValue = INVALID_MONEY_MESSAGE;
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, value: null, errors };
  }

  return {
    valid: true,
    errors: {},
    value: {
      competenceMonth: normalizeCompetence(competenceMonth) as string,
      assessmentStartDate,
      assessmentEndDate,
      invoiceTotalValue: normalizeMoney(invoiceTotalValue) as string,
      minimumFranchiseValue: minimumFranchiseValue ? normalizeMoney(minimumFranchiseValue) : null,
      invoiceFile: input.invoiceFile ?? null,
    },
  };
}
