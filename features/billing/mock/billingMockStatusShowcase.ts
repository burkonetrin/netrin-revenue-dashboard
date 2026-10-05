import type { BillingInvoiceDetail } from "../types/billing-detail.types";
import type { BillingInvoiceStatusState } from "../types/billing-invoice-status.types";
import {
  BILLING_INVOICE_STATUS_LABEL,
  type BillingInvoiceStatusKey,
} from "../types/billing-invoice-status.types";

const STATUS_ORDER: BillingInvoiceStatusKey[] = [
  "fatura_aberta",
  "fatura_fechada",
  "faturado",
  "pagamento_aberto",
  "pago_parcial",
  "pago_total",
  "pago_excedente",
  "nota_vencida",
  "nota_cancelada",
];

export const BILLING_LIST_STATUS_SHOWCASE_ORDER: BillingInvoiceStatusKey[] = STATUS_ORDER.filter(
  (status) => status !== "fatura_aberta",
);

export const BILLING_INVOICE_STATUS_LIST_SORT_ORDER: BillingInvoiceStatusKey[] = STATUS_ORDER;

function buildMinimalContract(
  contractId: string,
  franchiseId: string,
  itemId: string,
  name: string,
  total: number,
): BillingInvoiceDetail["contracts"][number] {
  return {
    id: contractId,
    name: "Contrato demonstração",
    franchises: [
      {
        id: franchiseId,
        billingItemId: itemId,
        name,
        pricingModel: "fixed",
        fixedPrice: total,
        consumption: {
          label: "1.000 de 1.000",
          sublabel: `R$ ${total.toLocaleString("pt-BR")},00`,
        },
        excessAmount: 0,
        total,
      },
    ],
    subtotalWithoutAdjustments: total,
    total,
  };
}

export function buildStatusShowcaseInvoice(
  status: BillingInvoiceStatusKey,
  index: number,
  competence: string,
): BillingInvoiceDetail {
  const id = `bill-st-${status}`;
  const total = 1200 + index * 137;
  const label = BILLING_INVOICE_STATUS_LABEL[status];

  const useMultiNotes = status === "fatura_fechada";

  const invoiceDetails = useMultiNotes
    ? {
        scope: "contract" as const,
        notes: [
          {
            id: `note-st-${status}-a`,
            ownerName: `${label} — Contrato A`,
            dueDate: "2026-05-10",
            billingStatus: "fatura_fechada" as const,
          },
          {
            id: `note-st-${status}-b`,
            ownerName: `${label} — Contrato B`,
            dueDate: "2026-06-20",
            billingStatus: "pago_parcial" as const,
            statusMeta: { paidAmount: 600, dueAmount: 400 },
          },
        ],
      }
    : {
        scope: "client" as const,
        notes: [
          {
            id: `note-st-${status}`,
            ownerName: `Demo ${label}`,
            dueDate: "2026-06-15",
          },
        ],
      };

  return {
    id,
    clientId: `client-status-${index + 1}`,
    clientName: `Demo ${label}`,
    profitCenter: index % 2 === 0 ? "Centro 01" : "Centro 02",
    competence,
    referenceMonth: competence,
    invoicePeriodMonths: 1,
    totalAmount: total,
    invoiceDetails,
    contracts: [
      buildMinimalContract(
        `contract-st-${status}`,
        `franchise-st-${status}`,
        `item-st-${status}`,
        `Franquia ${label}`,
        total,
      ),
    ],
    invoiceTotal: total,
  };
}

export function buildBillingStatusShowcaseInvoices(competence: string): BillingInvoiceDetail[] {
  return BILLING_LIST_STATUS_SHOWCASE_ORDER.map((status, index) =>
    buildStatusShowcaseInvoice(status, index, competence),
  );
}

export const billingStatusShowcaseSeed: Record<string, BillingInvoiceStatusState> = {
  "invoice:bill-st-fatura_fechada": { status: "fatura_fechada" },
  "invoice:bill-st-faturado": { status: "faturado", closeCheckboxLocked: true },
  "invoice:bill-st-pagamento_aberto": { status: "pagamento_aberto", closeCheckboxLocked: true },
  "invoice:bill-st-pago_parcial": {
    status: "pago_parcial",
    closeCheckboxLocked: true,
    meta: { paidAmount: 600, dueAmount: 400 },
  },
  "invoice:bill-st-pago_total": { status: "pago_total", closeCheckboxLocked: true },
  "invoice:bill-st-pago_excedente": {
    status: "pago_excedente",
    closeCheckboxLocked: true,
    meta: { excessAmount: 250 },
  },
  "invoice:bill-st-nota_vencida": {
    status: "nota_vencida",
    closeCheckboxLocked: true,
    meta: { paidAmount: 300, dueAmount: 900 },
  },
  "invoice:bill-st-nota_cancelada": {
    status: "nota_cancelada",
    closeCheckboxLocked: true,
    meta: { cancelReason: "Nota cancelada a pedido do cliente (demonstração)." },
  },
};
