import type { DataSourceMonthFinancialsResponse } from "../types/data-sources.types";

export interface SourceMonthRange {
  from: string;
  to: string;
}

export interface SourceFinancialChartPoint {
  month: string;
  label: string;
  referenceCost: number;
  averageRealCost: number;
  averageRevenue: number;
  markup: number | null;
  referenceCostMissing: boolean;
  averageRealCostMissing: boolean;
  averageRevenueMissing: boolean;
}

export function getDefaultSourceMonthRange(now = new Date()): SourceMonthRange {
  const lastClosedMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const firstClosedMonth = new Date(now.getFullYear(), now.getMonth() - 12, 1);
  return {
    from: toMonthValue(firstClosedMonth),
    to: toMonthValue(lastClosedMonth),
  };
}

export function toMonthValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function toMonthDate(month: string): string {
  return `${month}-01`;
}

export function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return `${String(monthNumber).padStart(2, "0")}/${year}`;
}

function parseDecimal(value: string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildSourceFinancialChartData(
  from: string,
  to: string,
  sourceMonths: DataSourceMonthFinancialsResponse[],
): SourceFinancialChartPoint[] {
  const monthsByValue = new Map(sourceMonths.map((month) => [month.month, month]));
  const start = new Date(`${from}-01T00:00:00`);
  const end = new Date(`${to}-01T00:00:00`);
  const points: SourceFinancialChartPoint[] = [];

  for (const cursor = new Date(start); cursor <= end; cursor.setMonth(cursor.getMonth() + 1)) {
    const month = toMonthValue(cursor);
    const sourceMonth = monthsByValue.get(month);
    const referenceCost = parseDecimal(sourceMonth?.referenceCost);
    const averageRealCost = parseDecimal(sourceMonth?.averageRealCost);
    const averageRevenue = parseDecimal(sourceMonth?.averageRevenue);
    const reportedMarkup = parseDecimal(sourceMonth?.markup);
    const markup =
      averageRealCost == null || averageRealCost === 0
        ? null
        : (reportedMarkup ?? (averageRevenue == null ? null : averageRevenue / averageRealCost));

    points.push({
      month,
      label: formatMonthLabel(month),
      referenceCost: referenceCost ?? 0,
      averageRealCost: averageRealCost ?? 0,
      averageRevenue: averageRevenue ?? 0,
      markup,
      referenceCostMissing: referenceCost == null,
      averageRealCostMissing: averageRealCost == null,
      averageRevenueMissing: averageRevenue == null,
    });
  }

  return points;
}
