import type { BillingFilters } from "../types/billing.types";

/**
 * Define a estrutura de billing month option.
 */
export interface BillingMonthOption {
  value: string;
  label: string;
}

/** Mesma janela da sidebar de ajuste / fatura manual: atual − 24 … atual + 12. */
const COMPETENCE_PAST_MONTHS = 24;
const COMPETENCE_FUTURE_MONTHS = 12;

function formatMonthLabel(year: number, month: number) {
  const date = new Date(year, month - 1, 1);
  const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);
  const formattedMonth = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)}`;

  return `${formattedMonth} / ${year}`;
}

function toMonthValue(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/**
 * Monta opções de competência para o filtro da listagem.
 * Janela: mês atual − 24 … mês atual + 12 (igual ao select da sidebar).
 */
export function buildBillingMonthOptions(selectedValues: string[] = []): BillingMonthOption[] {
  const anchorDate = new Date();
  const optionCount = COMPETENCE_PAST_MONTHS + 1 + COMPETENCE_FUTURE_MONTHS;
  const options = Array.from({ length: optionCount }, (_, index) => {
    const offset = index - COMPETENCE_PAST_MONTHS;
    const date = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + offset, 1);

    return {
      value: toMonthValue(date.getFullYear(), date.getMonth() + 1),
      label: formatMonthLabel(date.getFullYear(), date.getMonth() + 1),
    };
  });

  for (const selectedValue of selectedValues) {
    if (!selectedValue || options.some((option) => option.value === selectedValue)) {
      continue;
    }

    const [year, month] = selectedValue.split("-").map(Number);
    if (!year || !month) continue;

    options.push({
      value: selectedValue,
      label: formatMonthLabel(year, month),
    });
  }

  return options.sort((current, next) => next.value.localeCompare(current.value));
}

/**
 * Busca current year month na API.
 * @param now - now
 */
export function getCurrentYearMonth(now = new Date()) {
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

/**
 * Indica se billing month range valid.
 * @param filters - filters
 */
export function isBillingMonthRangeValid(filters: Pick<BillingFilters, "startMonth" | "endMonth">) {
  if (!filters.startMonth || !filters.endMonth) {
    return true;
  }

  return filters.startMonth <= filters.endMonth;
}
