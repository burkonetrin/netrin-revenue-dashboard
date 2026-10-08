import type { BillingRequestConsultationRow } from "../types/billing-request-consultation.types";

/** Espelha `sanitize_client_ip` do Administrator (consumption_migration). */
export function formatBillingRequestIp(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const value = raw.trim();
  if (value.startsWith("[")) {
    const end = value.indexOf("]");
    if (end > 0) return value.slice(1, end);
  }
  const colon = value.lastIndexOf(":");
  if (colon > 0 && value.includes(".") && !value.includes("::")) {
    return value.slice(0, colon);
  }
  return value;
}

export function formatBillingRequestDateTime(isoOrNaive: string): string {
  const parsed = new Date(isoOrNaive.includes("T") ? isoOrNaive : `${isoOrNaive.replace(" ", "T")}Z`);
  if (Number.isNaN(parsed.getTime())) return isoOrNaive;
  return parsed.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatBillingRequestDurationMs(ms: number | null | undefined): string {
  if (ms == null || Number.isNaN(ms)) return "—";
  return `${Math.round(ms)} ms`;
}

const CONSULTATION_CODE_DESCRIPTIONS: Record<number, string> = {
  200: "Consulta concluída com sucesso (resposta bilhetável).",
  201: "Consulta criada ou aceita com sucesso.",
  204: "Consulta concluída sem conteúdo na resposta.",
  304: "Resposta atendida por cache (não modificada).",
  400: "Requisição inválida — parâmetros ou documento malformado.",
  404: "Registro não encontrado na fonte consultada.",
  422: "Consulta recusada — dados inconsistentes ou fora das regras da fonte.",
  500: "Erro interno na fonte ou no serviço de consulta.",
  503: "Fonte indisponível no momento da requisição.",
  606: "Código de retorno específico da consulta (ex.: CEP/endereço não localizado na fonte).",
};

/** Descrição exibida no tooltip do código da consulta (`billable.code` / `not_billable.code`). */
export function getBillingConsultationCodeDescription(code: number): string {
  const known = CONSULTATION_CODE_DESCRIPTIONS[code];
  if (known) return known;
  if (code >= 200 && code <= 399) {
    return "Resposta considerada bilhetável (código 2xx/3xx).";
  }
  if (code >= 400 && code <= 599) {
    return "Resposta não bilhetável (código 4xx/5xx).";
  }
  return "Código de retorno registrado na bilhetagem para esta consulta.";
}

export function formatBillingRequestCache(cached: boolean): string {
  return cached ? "Sim" : "Não";
}

export type AdminBillableRequestRow = {
  source: "billable" | "not_billable";
  id: number;
  client_id: number;
  user_id: number;
  provider: string;
  client_name: string;
  client_ip: string | null;
  username: string;
  search_key: string;
  code: number;
  data_source_id: number;
  data_source_name: string | null;
  deductible_name: string | null;
  service_type_name: string | null;
  executed_at: string;
  request_time: number | null;
  is_cache: boolean;
  task_id: string | null;
};

export function mapAdminBillableRowToConsultation(
  row: AdminBillableRequestRow,
): BillingRequestConsultationRow {
  return {
    id: row.id,
    clientId: row.client_id,
    userId: row.user_id,
    origin: row.source === "billable" ? "Billable" : "Not billable",
    clientName: row.client_name,
    ip: formatBillingRequestIp(row.client_ip),
    username: row.username,
    document: row.search_key,
    statusCode: row.code,
    dataSourceId: row.data_source_id,
    dataSourceName: row.data_source_name,
    franchiseName: row.deductible_name,
    serviceType: row.service_type_name,
    executedAt: row.executed_at,
    requestTimeMs: row.request_time,
    cache: row.is_cache,
    taskId: row.task_id,
  };
}
