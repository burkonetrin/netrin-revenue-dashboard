import type { ClientHealth, ProfitCenter, ServiceName } from "./types";

/** URL pública da simulação (sem login). */
export const PROTOTYPE_BASE_PATH = "/demo/commercial-dashboard";

/** Listagem e detalhe de faturamento no protótipo. */
export const BILLING_BASE_PATH = `${PROTOTYPE_BASE_PATH}/faturamento`;

/** Ferramentas de suporte (consulta de requisições + task ID) — rota legada `/faturamento/tasks`. */
export const BILLING_TASKS_BASE_PATH = `${BILLING_BASE_PATH}/tasks`;

/** Fontes e fornecedores (espelho do menu `/providers` do Nucleus). */
export const PROVIDERS_BASE_PATH = `${PROTOTYPE_BASE_PATH}/fontes-fornecedores`;

/** Inteligência de dados (dados bancários + impedidos de apostar). */
export const DATA_INTELLIGENCE_BASE_PATH = `${PROTOTYPE_BASE_PATH}/inteligencia-de-dados`;

export function personRestrictionSportDetailPath(sportId: string): string {
  return `${DATA_INTELLIGENCE_BASE_PATH}/impedidos/${sportId}`;
}

/** Prévia isolada de modelos Background Check. */
export const PROVIDERS_BGC_PREVIEW_PATH = `${PROVIDERS_BASE_PATH}/modelos-background-check-preview`;

export function clientFranchiseDetailPath(
  clientId: string,
  franchiseId: string,
  contractId: string,
): string {
  const params = new URLSearchParams({ contractId });
  return `${PROTOTYPE_BASE_PATH}/clientes/${clientId}/franquias/${franchiseId}?${params.toString()}`;
}

/** Detalhe analítico de uma fonte (espelho `/providers/sources/[id]`). */
export function providersSourceDetailPath(sourceId: string): string {
  return `${PROVIDERS_BASE_PATH}/fontes/${sourceId}`;
}

export const PROFIT_CENTERS: ProfitCenter[] = [
  "Junior",
  "Camila",
  "Juliana",
  "Transição",
  "Maria",
  "Matheus",
  "Dielson",
];

export const SERVICES: ServiceName[] = [
  "API",
  "Ariba",
  "BGC",
  "BDV",
  "PLD",
  "Workflow",
  "Monitoramento",
  "SAP",
  "IDV",
  "Projetos",
];

export const HEALTH_OPTIONS: { key: ClientHealth; label: string }[] = [
  { key: "risco_alto", label: "Risco alto (≤ 50%)" },
  { key: "risco_medio", label: "Risco médio (50% a 90%)" },
  { key: "sucesso", label: "Sucesso (90% a 100%)" },
  { key: "oportunidade", label: "Oportunidade (> 100%)" },
];

export const CLIENT_TYPE_OPTIONS = [
  { key: "base", label: "Clientes base" },
  { key: "novos_negocios", label: "Novos negócios" },
];

export const COMPETENCE_OPTIONS = [
  { key: "2025-09", label: "Setembro/2025" },
  { key: "2025-08", label: "Agosto/2025" },
  { key: "2025-07", label: "Julho/2025" },
  { key: "2025-06", label: "Junho/2025" },
];

export const HEALTH_CHART_LABELS: Record<ClientHealth, string> = {
  risco_alto: "Risco alto (≤ 50%)",
  risco_medio: "Risco médio (50% a 90%)",
  sucesso: "Sucesso (90% a 100%)",
  oportunidade: "Oportunidade (> 100%)",
};

export const HEALTH_CHIP_COLOR: Record<
  ClientHealth,
  "danger" | "warning" | "success" | "secondary"
> = {
  risco_alto: "danger",
  risco_medio: "warning",
  sucesso: "success",
  oportunidade: "secondary",
};
