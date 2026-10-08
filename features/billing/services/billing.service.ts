import { AxiosError } from "axios";
import type { ApiBillingEntryResponse, ApiBillingTaskResponse } from "../types/billing-api.types";
import type { BillingAdjustmentPayload } from "../types/billing-adjustment.types";
import type { BillingContractDetail, BillingInvoiceDetail } from "../types/billing-detail.types";
import type { BillingManualInvoice } from "../types/billing-detail.types";
import type { BillingManualInvoicePayload } from "../types/billing-manual-invoice.types";
import type { BillingFilters, BillingInvoiceScope, BillingListResponse } from "../types/billing.types";
import { alignTotalizerWithData } from "../utils/billing.utils";
import {
  filterBillingMockList,
  getBillingMockDetail,
  resetBillingMockStore,
  updateBillingMockDetail,
} from "../mock/billingMockStore";
import { useBillingInvoiceStatusStore } from "../store/billing-invoice-status.store";
import { mergeStatusIntoRecord } from "../utils/billing-invoice-status.utils";

const delay = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runBillingAssessment(_year: number, _month: number): Promise<void> {
  await delay();
  resetBillingMockStore();
  useBillingInvoiceStatusStore.getState().reset();
}

export async function getBillingList(
  filters: BillingFilters,
  page: number,
  limit: number,
): Promise<BillingListResponse> {
  await delay();
  const fallbackLabel =
    filters.startMonth || filters.endMonth ? "Total no período" : "Total na competência";
  return alignTotalizerWithData(filterBillingMockList(filters, page, limit), fallbackLabel);
}

export async function getBillingDetail(
  id: string,
  source: "invoice" | "entry" = "invoice",
): Promise<BillingInvoiceDetail> {
  await delay();
  const detail = getBillingMockDetail(id, source);
  if (!detail) {
    throw new AxiosError("Fatura não encontrada", undefined, undefined, undefined, {
      status: 404,
      data: { message: "Fatura não encontrada" },
    } as never);
  }
  return mergeStatusIntoRecord(
    detail,
    useBillingInvoiceStatusStore.getState().getState(source, id),
  ) as BillingInvoiceDetail;
}

export async function getInvoiceDetail(invoiceId: string): Promise<BillingInvoiceDetail> {
  return getBillingDetail(invoiceId, "invoice");
}

export async function getBillingEntryDetail(entryId: string): Promise<BillingInvoiceDetail> {
  return getBillingDetail(entryId, "entry");
}

export async function getClientOpenBillingEntries(
  clientId: string,
  options?: { page?: number; limit?: number },
): Promise<BillingListResponse> {
  await delay();
  return filterBillingMockList({ clientId }, options?.page ?? 1, options?.limit ?? 10);
}

function applyAdjustmentToContract(
  contract: BillingContractDetail,
  payload: BillingAdjustmentPayload,
): BillingContractDetail {
  const next = { ...contract, adjustments: [...(contract.adjustments ?? [])] };

  if (payload.type === "discount" || payload.type === "surcharge") {
    next.adjustments.push({
      id: `adj-${Date.now()}`,
      type: payload.type,
      description: payload.adjustmentDescription ?? payload.type,
      amount: payload.amount ?? 0,
    });
    const delta =
      payload.type === "discount" ? -(payload.amount ?? 0) : (payload.amount ?? 0);
    next.total = (next.subtotalWithoutAdjustments ?? next.total) + delta;
  }

  if (payload.type === "due_date" && payload.dueDate) {
    next.dueDate = payload.dueDate;
  }

  if (payload.type === "competence" && payload.competence) {
    next.competence = payload.competence;
  }

  return next;
}

export async function submitEntryAdjustment(
  entryId: string,
  payload: BillingAdjustmentPayload,
  scope: BillingInvoiceScope,
): Promise<ApiBillingEntryResponse> {
  await delay(400);
  updateBillingMockDetail(entryId, "entry", (detail) => {
    const contracts = detail.contracts.map((contract) => {
      if (scope === "client") {
        return applyAdjustmentToContract(contract, payload);
      }
      if (payload.contractId && contract.id !== payload.contractId) {
        return contract;
      }
      return applyAdjustmentToContract(contract, payload);
    });

    const invoiceTotal = contracts.reduce((sum, c) => sum + (c.total ?? 0), 0);
    return {
      ...detail,
      contracts,
      totalAmount: invoiceTotal,
      invoiceTotal,
    };
  });

  return { id: entryId } as ApiBillingEntryResponse;
}

export async function createManualInvoice(
  payload: BillingManualInvoicePayload,
): Promise<BillingManualInvoice> {
  await delay(400);
  const manual: BillingManualInvoice = {
    id: `manual-${Date.now()}`,
    competence: payload.competence,
    description: payload.description,
    value: payload.amount,
    dueDate: payload.dueDate,
    separateNote: payload.separateNote,
    contractId: payload.contractId,
    contractName: payload.contractName,
    productId: payload.productId,
    productName: payload.productName,
    profitCenter: payload.profitCenter,
    excessProfitCenter: payload.excessProfitCenter,
  };

  const entry = recordsFindEntryForClient(payload.clientId, payload.competence);
  if (entry) {
    updateBillingMockDetail(entry.id, "entry", (detail) => ({
      ...detail,
      manualInvoices: [...(detail.manualInvoices ?? []), manual],
    }));
  }

  return manual;
}

function recordsFindEntryForClient(clientId: string, competence: string) {
  return filterBillingMockList({ clientId, startMonth: competence, endMonth: competence }, 1, 50)
    .data.find((row) => row.source === "entry");
}

export async function reassessBillingClient(_clientId: string) {
  await delay();
  return { status: "ok" as const };
}

export async function getBillingPaymentContext(_clientId: string) {
  return null;
}

const DEMO_BILLING_TASK_ID = "6a7b2b0fa94508c6a6835449";

const KNOWN_MOCK_TASK_IDS = new Set([
  DEMO_BILLING_TASK_ID,
  "652f6f0a2b0e4c1a1b2c3d4e",
  "a1b2c3d4e5f6789012345678",
  "deadbeefdeadbeefdeadbeef",
]);

function buildDemoBillingTaskResponse(taskId: string): ApiBillingTaskResponse {
  if (taskId === DEMO_BILLING_TASK_ID) {
    return {
      client: {
        id: 1291,
        name: "CINPAL COMPANHIA INDUSTRIAL DE PECAS PARA AUTOMOVEIS",
        tenant: "cinpal_companhia_industrial_de_pecas_para_aut",
      },
      billingTask: {
        id: taskId,
        userId: "4135",
        userUsername: "cinpal_companhia_industrial_de_pecas_par.for.bgc",
        requestOrigin: "netrin-bff-api",
        providerName: "ineodigital",
        dataSource: "CenprotRegionalProtesto",
        processId: null,
        serviceType: "bgcApi",
        requestUrl:
          "http://api.netrin.com.br/v1/consulta-composta?token=e481a013-f2fb-4b11-a352-e497abec429f&timeout=90&s=consulta-protestos-cenprot-regional&cpf=37940580892",
        requestBody: {
          body: {
            cpf: "37940580892",
            timeout: "90",
          },
        },
      },
    };
  }

  return {
    client: {
      id: 1001,
      name: "Cliente protótipo",
      tenant: "prototype_tenant",
    },
    billingTask: {
      id: taskId,
      userId: "100",
      userUsername: "usuario.demo",
      requestOrigin: "netrin-bff-api",
      providerName: "netrin",
      dataSource: "Fonte demo",
      processId: null,
      serviceType: "api",
      requestUrl: "https://api.netrin.com.br/v1/consulta-composta",
      requestBody: { body: { document: "00000000000" } },
    },
  };
}

/** GET /v1/billing/tasks/{task_id} — mock no protótipo; ID demo alinhado ao Administrator/tenant. */
export async function getBillingTask(taskId: string): Promise<ApiBillingTaskResponse> {
  await delay();
  if (!KNOWN_MOCK_TASK_IDS.has(taskId)) {
    throw new AxiosError("Task não encontrada", undefined, undefined, undefined, {
      status: 404,
      data: { message: "Task não encontrada para o identificador informado." },
    } as never);
  }

  return buildDemoBillingTaskResponse(taskId);
}
