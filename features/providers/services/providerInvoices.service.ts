/**
 * Serviço de faturas/competências de fornecedor — protótipo usa mock local.
 */

import type {
  CreateProviderInvoiceCompetenceRequest,
  CreateProviderInvoiceRequest,
  ProviderInvoiceBillableSourceResponse,
  ProviderInvoiceFileUploadResponse,
  ProviderInvoiceListResponse,
  ProviderInvoiceResponse,
  ProviderInvoicesQueryParams,
  UpdateProviderCreditDepositRequest,
  UpdateProviderInvoiceCompetenceRequest,
  UpdateProviderInvoiceRequest,
} from "../types/providerInvoices.types";
import * as mock from "../mock/providersMockStore";

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

export async function listProviderInvoices(
  providerId: string,
  params?: ProviderInvoicesQueryParams,
): Promise<ProviderInvoiceListResponse> {
  await delay();
  return mock.mockListProviderInvoices(providerId, params ?? {});
}

export interface ProviderInvoiceBillableSourcesQuery {
  assessmentStartDate: string;
  assessmentEndDate: string;
}

export async function listBillableInvoiceSources(
  providerId: string,
  _params: ProviderInvoiceBillableSourcesQuery,
): Promise<ProviderInvoiceBillableSourceResponse[]> {
  await delay();
  return mock.mockListBillableInvoiceSources(providerId);
}

export async function uploadProviderInvoiceFile(
  providerId: string,
  competenceMonth: string,
  _invoiceFile: File,
): Promise<ProviderInvoiceFileUploadResponse> {
  await delay();
  return mock.mockUploadProviderInvoiceFile(providerId, competenceMonth);
}

export async function createProviderInvoice(
  providerId: string,
  payload: CreateProviderInvoiceRequest,
): Promise<ProviderInvoiceResponse> {
  await delay();
  return mock.mockCreateProviderInvoice(providerId, payload);
}

export async function updateProviderInvoice(
  providerId: string,
  invoiceId: string,
  payload: UpdateProviderInvoiceRequest,
): Promise<ProviderInvoiceResponse> {
  await delay();
  return mock.mockUpdateProviderInvoice(providerId, invoiceId, payload);
}

export async function createProviderInvoiceCompetence(
  providerId: string,
  payload: CreateProviderInvoiceCompetenceRequest,
): Promise<ProviderInvoiceResponse> {
  await delay();
  return mock.mockCreateProviderInvoiceCompetence(providerId, payload);
}

export async function updateProviderInvoiceCompetence(
  providerId: string,
  invoiceId: string,
  payload: UpdateProviderInvoiceCompetenceRequest,
): Promise<ProviderInvoiceResponse> {
  await delay();
  return mock.mockUpdateProviderInvoiceCompetence(providerId, invoiceId, payload);
}

export async function addProviderCreditDeposit(
  providerId: string,
  invoiceId: string,
  payload: UpdateProviderCreditDepositRequest,
): Promise<ProviderInvoiceResponse> {
  await delay();
  return mock.mockAddProviderCreditDeposit(providerId, invoiceId, payload);
}

export async function removeProviderCreditDeposit(
  providerId: string,
  invoiceId: string,
  depositId: string,
): Promise<ProviderInvoiceResponse> {
  await delay();
  return mock.mockRemoveProviderCreditDeposit(providerId, invoiceId, depositId);
}

export async function getProviderInvoiceSnapshot(
  invoiceId: string,
): Promise<ProviderInvoiceResponse> {
  await delay();
  return mock.mockGetProviderInvoiceSnapshot(invoiceId);
}

export async function archiveProviderInvoice(invoiceId: string): Promise<ProviderInvoiceResponse> {
  await delay();
  return mock.mockArchiveProviderInvoice(invoiceId);
}
