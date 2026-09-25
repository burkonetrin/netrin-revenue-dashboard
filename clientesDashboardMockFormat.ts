import {
  INVOICE_STATUS,
  type InvoiceStatusKey,
} from "./clientesDashboardMockData";

export const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);

export const fmtN = (n: number) => n.toLocaleString("pt-BR");

export const fmtMil = (n: number) =>
  `${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;

export const fc = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export const fmtDetail = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

export const pctDelta = (c: number, p: number) =>
  p === 0 ? (c ? 100 : 0) : ((c - p) / p) * 100;

export function formatMetricVal(key: string, v: number): string {
  if (key === "cl" || key === "ct" || key === "fr") return fmtN(v);
  if (key === "proj") return fmt(v);
  return fmt(v);
}

export function nfeCountLabel(n: number): string {
  if (!n) return "—";
  return n === 1 ? "1 nota" : `${n} notas`;
}

export function invoiceStatusLabel(
  statusKey: InvoiceStatusKey,
  valorPagoParcial?: number,
): string {
  const meta = INVOICE_STATUS[statusKey] ?? {
    label: statusKey,
    chip: "inv-open",
  };
  if (statusKey === "pago_parcial" && valorPagoParcial != null) {
    return `${meta.label} (${fmt(valorPagoParcial)})`;
  }
  return meta.label;
}
