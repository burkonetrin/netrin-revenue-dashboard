import { getBaseURL } from "@/shared/utils/env";

const BASE_URL = getBaseURL();

/**
 * Endpoints da API de faturamento e apuração mensal.
 */
export const BILLING_ENDPOINTS = {
  REASSESS_CLIENT: (clientId: string) => `${BASE_URL}v1/billing/clients/${clientId}/reassess`,
  /**
   * GET /v1/billing/invoices
   * Listagem de faturas com filtros, paginação e totalizador
   */
  LIST_INVOICES: `${BASE_URL}v1/billing/invoices`,

  /**
   * GET /v1/billing/invoices/{invoice_id}
   * Detalhe completo de uma fatura
   */
  GET_INVOICE: (invoiceId: string) => `${BASE_URL}v1/billing/invoices/${invoiceId}`,

  /**
   * GET /v1/billing/all
   * Listagem unificada de BillingEntries e Invoices com paginação e totalizador combinados
   */
  LIST_ALL: `${BASE_URL}v1/billing/all`,

  /**
   * GET /v1/billing/entries/{entry_id}
   * Detalhe completo de um rascunho (BillingEntry)
   */
  GET_ENTRY: (entryId: string) => `${BASE_URL}v1/billing/entries/${entryId}`,

  /**
   * POST /v1/billing/run/{year}/{month}
   * Executa a apuração do mês e recalcula BillingEntries
   */
  RUN_ASSESSMENT: (year: number, month: number) => `${BASE_URL}v1/billing/run/${year}/${month}`,

  /**
   * GET /v1/billing/export/{year}/{month}
   * Download do ZIP (CSV de faturamento + META) da competência
   */
  EXPORT: (year: number, month: number) => `${BASE_URL}v1/billing/export/${year}/${month}`,

  /**
   * POST /v1/billing/entries/{entry_id}/adjustments
   * Registra um ajuste manual em uma BillingEntry (fatura em aberto)
   */
  CREATE_ENTRY_ADJUSTMENT: (entryId: string) =>
    `${BASE_URL}v1/billing/entries/${entryId}/adjustments`,

  /**
   * POST /v1/billing/entries/manual
   * Adiciona item manual (projeto/setup) na BillingEntry da competência
   */
  CREATE_MANUAL_INVOICE: `${BASE_URL}v1/billing/entries/manual`,

  /**
   * POST /v1/billing/entries/{entry_id}/{billing_entry_item_id}/email-consumption
   * Envia por e-mail o CSV de consumo de um item de BillingEntry
   */
  EMAIL_ENTRY_CONSUMPTION: (entryId: string, itemId: string) =>
    `${BASE_URL}v1/billing/entries/${entryId}/${itemId}/email-consumption`,

  /**
   * POST /v1/billing/invoices/{invoice_id}/{invoice_item_id}/email-consumption
   * Envia por e-mail o CSV de consumo de um item de Invoice
   */
  EMAIL_INVOICE_CONSUMPTION: (invoiceId: string, itemId: string) =>
    `${BASE_URL}v1/billing/invoices/${invoiceId}/${itemId}/email-consumption`,

  /**
   * POST /v1/billing/entries/{entry_id}/history/comprovantes/generate
   * Dispara geração assíncrona do ZIP de comprovantes (BillingEntry)
   */
  GENERATE_ENTRY_COMPROVANTES: (entryId: string) =>
    `${BASE_URL}v1/billing/entries/${entryId}/history/comprovantes/generate`,

  /**
   * POST /v1/billing/invoices/{invoice_id}/history/comprovantes/generate
   * Dispara geração assíncrona do ZIP de comprovantes (Invoice)
   */
  GENERATE_INVOICE_COMPROVANTES: (invoiceId: string) =>
    `${BASE_URL}v1/billing/invoices/${invoiceId}/history/comprovantes/generate`,

  /**
   * GET /v1/billing/history/comprovantes-jobs/{job_id}
   * Status / progresso do job de comprovantes
   */
  GET_COMPROVANTES_JOB: (jobId: string) =>
    `${BASE_URL}v1/billing/history/comprovantes-jobs/${jobId}`,

  /**
   * GET /v1/billing/history/comprovantes-jobs/{job_id}/zip
   * Download do ZIP (application/zip) quando ready
   */
  GET_COMPROVANTES_JOB_ZIP: (jobId: string) =>
    `${BASE_URL}v1/billing/history/comprovantes-jobs/${jobId}/zip`,
} as const;

export default BILLING_ENDPOINTS;
