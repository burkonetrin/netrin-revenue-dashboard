import { getBaseURL } from "@/shared/utils/env";

const BASE_URL = getBaseURL();

/**
 * Endpoints da API de provedores de dados.
 */
export const PROVIDERS_ENDPOINTS = {
  /**
   * GET /v1/providers
   * Lista provedores de dados
   */
  LIST: `${BASE_URL}v1/providers`,

  /**
   * POST /v1/providers
   * Cria um novo provedor
   */
  CREATE: `${BASE_URL}v1/providers`,

  /**
   * GET /v1/providers/{id}
   * Retorna um provedor pelo ID
   */
  DETAIL: (id: string) => `${BASE_URL}v1/providers/${id}`,

  /**
   * PUT /v1/providers/{id}
   * Atualiza um provedor pelo ID
   */
  UPDATE: (id: string) => `${BASE_URL}v1/providers/${id}`,

  /**
   * DELETE /v1/providers/{id}
   * Arquiva um provedor pelo ID
   */
  DELETE: (id: string) => `${BASE_URL}v1/providers/${id}`,

  /**
   * GET /v1/providers/{id}/invoices
   * Lista faturas/competências de um fornecedor
   */
  LIST_INVOICES: (id: string) => `${BASE_URL}v1/providers/${id}/invoices`,

  /**
   * GET /v1/providers/{id}/invoices/billable-sources
   * Lista fontes e consultas bilhetadas do período de apuração
   */
  LIST_BILLABLE_INVOICE_SOURCES: (id: string) =>
    `${BASE_URL}v1/providers/${id}/invoices/billable-sources`,

  /**
   * POST /v1/providers/{id}/invoices/upload
   * Envia o arquivo opcional da fatura
   */
  UPLOAD_INVOICE: (id: string) => `${BASE_URL}v1/providers/${id}/invoices/upload`,

  /**
   * POST /v1/providers/{id}/invoices
   * Cadastra uma fatura pós-paga
   */
  CREATE_INVOICE: (id: string) => `${BASE_URL}v1/providers/${id}/invoices`,

  /**
   * PATCH /v1/providers/{provider_id}/invoices/{invoice_id}
   * Atualiza uma fatura pós-paga aberta
   */
  UPDATE_INVOICE: (providerId: string, invoiceId: string) =>
    `${BASE_URL}v1/providers/${providerId}/invoices/${invoiceId}`,

  /**
   * POST /v1/providers/{id}/invoice-competences
   * Cadastra uma competência pré-paga
   */
  CREATE_INVOICE_COMPETENCE: (id: string) => `${BASE_URL}v1/providers/${id}/invoice-competences`,

  /**
   * PATCH /v1/providers/{provider_id}/invoice-competences/{invoice_id}
   * Atualiza uma competência pré-paga aberta.
   */
  UPDATE_INVOICE_COMPETENCE: (providerId: string, invoiceId: string) =>
    `${BASE_URL}v1/providers/${providerId}/invoice-competences/${invoiceId}`,

  /**
   * POST /v1/providers/{provider_id}/invoice-competences/{invoice_id}/credit-deposits
   * Adiciona crédito ou fecha uma competência pré-paga aberta.
   */
  ADD_CREDIT_DEPOSIT: (providerId: string, invoiceId: string) =>
    `${BASE_URL}v1/providers/${providerId}/invoice-competences/${invoiceId}/credit-deposits`,

  /**
   * DELETE /v1/providers/{provider_id}/invoice-competences/{invoice_id}/credit-deposits/{deposit_id}
   * Remove o último depósito de uma competência pré-paga aberta.
   */
  DELETE_CREDIT_DEPOSIT: (providerId: string, invoiceId: string, depositId: string) =>
    `${BASE_URL}v1/providers/${providerId}/invoice-competences/${invoiceId}/credit-deposits/${depositId}`,

  /**
   * GET /v1/provider-invoices/{id}
   * Consulta o snapshot de uma fatura salva
   */
  INVOICE_DETAIL: (id: string) => `${BASE_URL}v1/provider-invoices/${id}`,

  /**
   * DELETE /v1/provider-invoices/{id}
   * Arquiva uma fatura pós-paga pelo ID.
   */
  ARCHIVE_INVOICE: (id: string) => `${BASE_URL}v1/provider-invoices/${id}`,
} as const;

export default PROVIDERS_ENDPOINTS;
