/** Default do período (meses) ao marcar franquia de teste. */
export const DEFAULT_TEST_PERIOD_MONTHS = 1;

const MIN_TEST_PERIOD_MONTHS = 1;
const MAX_TEST_PERIOD_MONTHS = 12;

/**
 * Valida o período da franquia de teste.
 * Obrigatório e no intervalo 1..12 somente quando isTest; caso contrário, ignora.
 */
export function isValidTestPeriodMonths(value: unknown, isTest: boolean): boolean {
  if (!isTest) return true;

  if (value === null || value === undefined || value === "") return false;

  const numeric =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;

  if (!Number.isInteger(numeric)) return false;
  if (numeric < MIN_TEST_PERIOD_MONTHS || numeric > MAX_TEST_PERIOD_MONTHS) {
    return false;
  }

  return true;
}
