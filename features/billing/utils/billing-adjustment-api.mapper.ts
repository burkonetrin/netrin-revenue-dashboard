/**
 * Mapeia payload de ajuste do formulário para o formato da API de entries.
 */

import type { ApiBillingEntryAdjustmentRequest } from "../types/billing-api.types";
import type { BillingAdjustmentPayload } from "../types/billing-adjustment.types";
import type { BillingInvoiceScope } from "../types/billing.types";

function isMonetaryAdjustment(type: BillingAdjustmentPayload["type"]) {
  return type === "discount" || type === "surcharge";
}

function mapAdjustmentType(
  type: BillingAdjustmentPayload["type"],
): ApiBillingEntryAdjustmentRequest["type"] {
  if (type === "invoice_description") return "description";
  return type;
}

function omitEmpty<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  ) as Partial<T>;
}

/**
 * Converte o ajuste interno em corpo de requisição da API de faturamento.
 */
export function mapAdjustmentPayloadToEntryApiRequest(
  payload: BillingAdjustmentPayload,
  _scope: BillingInvoiceScope,
): ApiBillingEntryAdjustmentRequest {
  const apiType = mapAdjustmentType(payload.type);

  if (apiType === "description") {
    return {
      type: apiType,
      billingEntryDescription: payload.invoiceDescription ?? null,
    };
  }

  if (apiType === "competence") {
    return {
      type: apiType,
      competenceMonth: payload.competence ? `${payload.competence.slice(0, 7)}-01` : null,
      description: payload.adjustmentDescription ?? null,
    };
  }

  if (apiType === "due_date") {
    return omitEmpty({
      type: apiType,
      dueDate: payload.dueDate ?? null,
      description: payload.adjustmentDescription ?? null,
      contractId: payload.contractId ?? null,
      deductibleId: payload.franchiseId ?? null,
    }) as ApiBillingEntryAdjustmentRequest;
  }

  const request: ApiBillingEntryAdjustmentRequest = {
    type: apiType,
    description: payload.adjustmentDescription ?? null,
  };

  if (isMonetaryAdjustment(payload.type) && payload.amount !== undefined) {
    request.amount = payload.amount.toFixed(4);
  }

  if (payload.franchiseId) {
    request.deductibleId = payload.franchiseId;
  } else if (payload.contractId) {
    request.contractId = payload.contractId;
  }

  return omitEmpty(request) as ApiBillingEntryAdjustmentRequest;
}
