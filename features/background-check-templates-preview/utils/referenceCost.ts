import { formatCurrency4 } from "@/shared/utils/currency";

export function parseReferenceCost(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatReferenceCostDisplay(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return formatCurrency4(value);
}

export function sumEligibleReferenceCosts(values: Array<number | null | undefined>): number | null {
  const numeric = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );
  if (numeric.length === 0) return null;
  return numeric.reduce((total, value) => total + value, 0);
}
