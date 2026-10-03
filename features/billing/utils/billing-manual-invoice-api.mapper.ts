import type { ApiCreateManualInvoiceRequest } from "../types/billing-api.types";
import type { BillingManualInvoicePayload } from "../types/billing-manual-invoice.types";

function resolveIsSeparateNfe(payload: BillingManualInvoicePayload): boolean {
  if (payload.scope === "deductible") return true;
  return payload.separateNote;
}

function resolveDueDate(payload: BillingManualInvoicePayload): string | undefined {
  if (!payload.dueDate) return undefined;
  // Mesma nota e nota separada: envia data completa (YYYY-MM-DD).
  // Persistência com isSeparateNfe=false depende do BE aceitar/devolver o dueDate.
  return payload.dueDate;
}

/** Converte o payload do formulário de fatura manual para o body da API. */
export function mapManualInvoicePayloadToApiRequest(
  payload: BillingManualInvoicePayload,
): ApiCreateManualInvoiceRequest {
  const isSeparateNfe = resolveIsSeparateNfe(payload);
  const dueDate = resolveDueDate(payload);

  const request: ApiCreateManualInvoiceRequest = {
    clientId: payload.clientId,
    competenceMonth: `${payload.competence.slice(0, 7)}-01`,
    totalValue: payload.amount.toFixed(4),
    profitCenterId: payload.profitCenter,
    overageProfitCenterId: payload.excessProfitCenter ?? null,
    productId: payload.productId,
    description: payload.description,
    isSeparateNfe,
  };

  if (dueDate) {
    request.dueDate = dueDate;
  }

  // Unificação por cliente: API rejeita contractId ("não aceitam vínculo de contrato").
  if (payload.scope === "contract" && payload.contractId) {
    request.contractId = payload.contractId;
  }

  return request;
}
