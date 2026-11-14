/** Status de fatura/nota conforme US 16369 (REQ-14). */
export type BillingInvoiceStatusKey =
  | "fatura_aberta"
  | "fatura_fechada"
  | "faturado"
  | "pagamento_aberto"
  | "pago_parcial"
  | "pago_total"
  | "pago_excedente"
  | "pagamento_parcelado"
  | "nota_vencida"
  | "nota_cancelada";

export type BillingInstallmentPaymentStatus = "em_aberto" | "pago";

export const BILLING_INSTALLMENT_PAYMENT_STATUS_LABEL: Record<
  BillingInstallmentPaymentStatus,
  string
> = {
  em_aberto: "Em aberto",
  pago: "Pago",
};

export interface BillingInstallmentPaymentLine {
  installmentNumber: number;
  amount: number;
  /** Data de vencimento (`YYYY-MM-DD`). */
  dueDate?: string;
  status: BillingInstallmentPaymentStatus;
}

export interface BillingInvoiceStatusMeta {
  paidAmount?: number;
  dueAmount?: number;
  /** Valor dos juros (status Pago com juros). */
  interestAmount?: number;
  /** Legado do protótipo; preferir `interestAmount`. */
  excessAmount?: number;
  cancelReason?: string;
  installments?: BillingInstallmentPaymentLine[];
}

export interface BillingInvoiceStatusState {
  status: BillingInvoiceStatusKey;
  /** Após faturar no Sankhya, o botão Aprovar fatura fica travado. */
  closeCheckboxLocked?: boolean;
  meta?: BillingInvoiceStatusMeta;
}

export const BILLING_INVOICE_STATUS_LABEL: Record<BillingInvoiceStatusKey, string> = {
  fatura_aberta: "A conferir",
  fatura_fechada: "Conferida",
  faturado: "Faturado",
  pagamento_aberto: "Pagamento aberto",
  pago_parcial: "Pago parcial",
  pago_total: "Pago totalmente",
  pago_excedente: "Pago com juros",
  pagamento_parcelado: "Pagamento parcelado",
  nota_vencida: "Nota vencida",
  nota_cancelada: "Nota cancelada",
};

export const BILLING_ENTRY_OPEN_STATUS_LABEL = "Fatura aberta";

/** Chave extra só no filtro da listagem (espelho / lançamento aberto). */
export type BillingInvoiceStatusFilterKey =
  | BillingInvoiceStatusKey
  | "fatura_aberta_espelho";

export const BILLING_INVOICE_STATUS_FILTER_OPTION_FATURA_ABERTA: BillingInvoiceStatusFilterKey =
  "fatura_aberta_espelho";

export const BILLING_INVOICE_STATUS_FILTER_OPTIONS: {
  value: BillingInvoiceStatusFilterKey;
  label: string;
}[] = [
  ...(Object.keys(BILLING_INVOICE_STATUS_LABEL) as BillingInvoiceStatusKey[]).map((value) => ({
    value,
    label: BILLING_INVOICE_STATUS_LABEL[value],
  })),
  {
    value: BILLING_INVOICE_STATUS_FILTER_OPTION_FATURA_ABERTA,
    label: BILLING_ENTRY_OPEN_STATUS_LABEL,
  },
];

export const BILLING_INVOICE_STATUS_FILTER_KEYS: BillingInvoiceStatusFilterKey[] =
  BILLING_INVOICE_STATUS_FILTER_OPTIONS.map((option) => option.value);

export const BILLING_INVOICE_STATUS_CHIP_CLASS: Record<BillingInvoiceStatusKey, string> = {
  fatura_aberta: "bg-zinc-100 text-zinc-700",
  fatura_fechada: "bg-slate-200 text-slate-800",
  faturado: "bg-indigo-100 text-indigo-900",
  pagamento_aberto: "bg-amber-100 text-amber-900",
  pago_parcial: "bg-orange-100 text-orange-800",
  pago_total: "bg-green-100 text-green-800",
  pago_excedente: "bg-violet-100 text-violet-900",
  pagamento_parcelado: "bg-sky-100 text-sky-900",
  nota_vencida: "bg-rose-100 text-rose-900",
  nota_cancelada: "bg-red-100 text-red-900",
};
