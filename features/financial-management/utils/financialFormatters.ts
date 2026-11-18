export function formatCurrency(value: string | null): string | null {
  if (value === null) return null;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(value),
  );
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatDecimal(value: string | null): string | null {
  if (value === null) return null;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function formatPercent(value: string | null): string | null {
  if (value === null) return null;
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(Number(value))}%`;
}

export type VariationPresentation = "increase" | "decrease" | "hidden";

export function getVariationPresentation(value: string | null): VariationPresentation {
  if (value === null || Number(value) === 0) return "hidden";
  return Number(value) > 0 ? "increase" : "decrease";
}
