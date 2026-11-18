import type { PaymentInfoFormValues } from "../../types/contractsFranchises.types";

/**
 * Defaults oficiais do form na aba payment (REQ-9/16).
 * Filial/código/arranjo/moeda/vencimento pré-preenchidos; demais obrigatórios vazios;
 * 3 checkboxes opcionais desmarcados.
 */
export function officialPaymentInfoDefaults(): PaymentInfoFormValues {
  return {
    nfeBranch: "1420 - São Leopoldo",
    nfeBranchCode: "2001",
    paymentOnInvoiceIssueDate: false,
    paymentArrangement: "standard",
    paymentPrepaidMonths: "",
    paymentPostpaidMonths: "",
    paymentMethod: "",
    currency: "BRL",
    profitCenter: "",
    overflowProfitCenter: "",
    additionalDays: "",
    billingPeriodicity: "1",
    dueType: "standard",
    dueWeekday: "",
    dueSpecificDay: "",
    dueDateRangeStart: "",
    dueDateRangeEnd: "",
    addClientConsumptionInfo: false,
    addBankInfo: false,
    addOrderNote: false,
    orderNote: "",
  };
}
