const sourceCurrencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

export function formatSourceCurrency(value: number | string | null | undefined): string {
  if (value == null || value === "") return "—";
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? sourceCurrencyFormatter.format(numericValue) : "—";
}
