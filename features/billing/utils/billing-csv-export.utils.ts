/**
 * Helpers de competência e filename para export CSV de faturamento (BILCSV-07–13).
 */

import type { BillingFilters } from "../types/billing.types";
import { parseFilenameFromContentDisposition } from "./billing-comprovantes-download.utils";
import { getCurrentMonth } from "./billing-list.utils";

const COMPETENCE_PATTERN = /^(\d{4})-(\d{2})$/;

/**
 * Resolve a competência YYYY-MM a exportar a partir dos filtros da listagem.
 * - Com startMonth: usa startMonth (mês único ou início do intervalo — BILCSV-07/08).
 * - Só endMonth: usa endMonth.
 * - Sem período: getCurrentMonth() (BILCSV-09).
 */
export function resolveExportCompetenceFromFilters(
  filters: Pick<BillingFilters, "startMonth" | "endMonth">,
): string {
  if (filters.startMonth) {
    return filters.startMonth;
  }
  if (filters.endMonth) {
    return filters.endMonth;
  }
  return getCurrentMonth();
}

/**
 * Converte competência YYYY-MM em year/month path params.
 * Retorna null se inválida (BILCSV-10).
 */
export function parseBillingCompetenceToYearMonth(
  competence: string,
): { year: number; month: number } | null {
  const match = COMPETENCE_PATTERN.exec(competence.trim());
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return null;
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  return { year, month };
}

/**
 * Nome do ZIP: Content-Disposition quando presente; senão faturamento_MM-YYYY.zip (BILCSV-13).
 */
export function resolveBillingCsvExportFilename(options: {
  year: number;
  month: number;
  contentDisposition?: string;
}): string {
  const fromHeader = parseFilenameFromContentDisposition(options.contentDisposition);
  if (fromHeader) {
    return fromHeader;
  }

  const mm = String(options.month).padStart(2, "0");
  return `faturamento_${mm}-${options.year}.zip`;
}
