/** Status de fatura/nota conforme US 16369 (REQ-14). */
export type BillingInvoiceStatusKey =
  | "fatura_aberta"
  | "fatura_fechada"
  | "faturado"
  | "pagamento_aberto"
  | "pago_parcial"
  | "pago_total"
  | "pago_excedente"
  | "nota_vencida"
  | "nota_cancelada";

export interface BillingInvoiceStatusMeta {
  paidAmount?: number;
  dueAmount?: number;
  excessAmount?: number;
  cancelReason?: string;
}

export interface BillingInvoiceStatusState {
  status: BillingInvoiceStatusKey;
  /** Após faturar no Sankhya, o checkbox Fechar fatura fica travado. */
  closeCheckboxLocked?: boolean;
  meta?: BillingInvoiceStatusMeta;
}

export const BILLING_INVOICE_STATUS_LABEL: Record<BillingInvoiceStatusKey, string> = {
  fatura_aberta: "Fatura aberta",
  fatura_fechada: "Fatura fechada",
  faturado: "Faturado",
  pagamento_aberto: "Pagamento aberto",
  pago_parcial: "Pago parcial",
  pago_total: "Pago totalmente",
  pago_excedente: "Pago excedente",
  nota_vencida: "Nota vencida",
  nota_cancelada: "Nota cancelada",
};

export const BILLING_INVOICE_STATUS_FILTER_OPTIONS: {
  value: BillingInvoiceStatusKey;
  label: string;
}[] = (Object.keys(BILLING_INVOICE_STATUS_LABEL) as BillingInvoiceStatusKey[]).map(
  (value) => ({
    value,
    label: BILLING_INVOICE_STATUS_LABEL[value],
  }),
);

export const BILLING_INVOICE_STATUS_CHIP_CLASS: Record<BillingInvoiceStatusKey, string> = {
  fatura_aberta: "bg-zinc-100 text-zinc-700",
  fatura_fechada: "bg-slate-200 text-slate-800",
  faturado: "bg-indigo-100 text-indigo-900",
  pagamento_aberto: "bg-amber-100 text-amber-900",
  pago_parcial: "bg-orange-100 text-orange-800",
  pago_total: "bg-green-100 text-green-800",
  pago_excedente: "bg-violet-100 text-violet-900",
  nota_vencida: "bg-rose-100 text-rose-900",
  nota_cancelada: "bg-red-100 text-red-900",
};
