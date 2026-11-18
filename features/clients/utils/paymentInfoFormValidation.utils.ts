import type { z } from "zod";

const requiredMessage = "Campo obrigatório";

type PaymentInfoFormShape = {
  paymentOnInvoiceIssueDate?: boolean;
  paymentArrangement: "standard" | "prepaid" | "postpaid";
  paymentPrepaidMonths: string;
  paymentPostpaidMonths: string;
  additionalDays: string;
  billingPeriodicity: string;
  dueType: "standard" | "weekday" | "specific_day" | "date_range";
  dueWeekday: string;
  dueSpecificDay: string;
  dueDateRangeStart: string;
  dueDateRangeEnd: string;
  addOrderNote: boolean;
  orderNote: string;
  profitCenter?: string;
};

function isPositiveInteger(value: string) {
  const parsed = Number.parseInt(value, 10);
  return /^\d+$/.test(value) && parsed > 0;
}

function parseDayOfMonth(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  if (!/^\d+$/.test(value) || Number.isNaN(parsed) || parsed < 1 || parsed > 31) {
    return null;
  }
  return parsed;
}

/** Valida regras condicionais do formulário de informações de pagamento. */
export function refinePaymentInfoFormValues(
  values: PaymentInfoFormShape,
  context: z.RefinementCtx,
) {
  if (!isPositiveInteger(values.billingPeriodicity)) {
    context.addIssue({
      code: "custom",
      path: ["billingPeriodicity"],
      message: "Informe um número inteiro maior ou igual a 1",
    });
  }

  if (!values.paymentOnInvoiceIssueDate) {
    if (!isPositiveInteger(values.additionalDays)) {
      context.addIssue({
        code: "custom",
        path: ["additionalDays"],
        message: "Informe um número inteiro maior ou igual a 1",
      });
    }
  }

  if (
    values.paymentArrangement === "prepaid" &&
    !isPositiveInteger(values.paymentPrepaidMonths)
  ) {
    context.addIssue({
      code: "custom",
      path: ["paymentPrepaidMonths"],
      message: "Informe um número de meses maior que zero",
    });
  }

  if (
    values.paymentArrangement === "postpaid" &&
    !isPositiveInteger(values.paymentPostpaidMonths)
  ) {
    context.addIssue({
      code: "custom",
      path: ["paymentPostpaidMonths"],
      message: "Informe um número de meses maior que zero",
    });
  }

  if (!values.paymentOnInvoiceIssueDate && values.dueType === "weekday" && !values.dueWeekday) {
    context.addIssue({
      code: "custom",
      path: ["dueWeekday"],
      message: requiredMessage,
    });
  }

  if (!values.paymentOnInvoiceIssueDate && values.dueType === "specific_day") {
    const day = Number.parseInt(values.dueSpecificDay, 10);
    if (!values.dueSpecificDay || Number.isNaN(day) || day < 1 || day > 31) {
      context.addIssue({
        code: "custom",
        path: ["dueSpecificDay"],
        message: "Informe um dia entre 1 e 31",
      });
    }
  }

  if (!values.paymentOnInvoiceIssueDate && values.dueType === "date_range") {
    const start = parseDayOfMonth(values.dueDateRangeStart);
    const end = parseDayOfMonth(values.dueDateRangeEnd);

    if (start === null) {
      context.addIssue({
        code: "custom",
        path: ["dueDateRangeStart"],
        message: "Informe um dia entre 1 e 31",
      });
    }
    if (end === null) {
      context.addIssue({
        code: "custom",
        path: ["dueDateRangeEnd"],
        message: "Informe um dia entre 1 e 31",
      });
    }
    if (start !== null && end !== null && start > end) {
      context.addIssue({
        code: "custom",
        path: ["dueDateRangeStart"],
        message: "O início deve ser menor ou igual ao fim",
      });
      context.addIssue({
        code: "custom",
        path: ["dueDateRangeEnd"],
        message: "O fim deve ser maior ou igual ao início",
      });
    }
  }

  if (values.addOrderNote && !values.orderNote.trim()) {
    context.addIssue({
      code: "custom",
      path: ["orderNote"],
      message: requiredMessage,
    });
  }
}

/** Valida centro de lucro quando o campo é exibido. */
export function refinePaymentInfoProfitCenter(
  values: PaymentInfoFormShape,
  context: z.RefinementCtx,
  showProfitCenterFields: boolean,
) {
  if (showProfitCenterFields && !values.profitCenter) {
    context.addIssue({
      code: "custom",
      path: ["profitCenter"],
      message: requiredMessage,
    });
  }
}

export { isPositiveInteger, parseDayOfMonth, requiredMessage };
