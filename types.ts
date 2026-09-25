export type ClientHealth =
  | "risco_alto"
  | "risco_medio"
  | "sucesso"
  | "oportunidade";

export type ClientType = "base" | "novos_negocios";

export type ProfitCenter =
  | "Junior"
  | "Camila"
  | "Juliana"
  | "Transição"
  | "Maria"
  | "Matheus"
  | "Dielson";

export type ServiceName =
  | "API"
  | "Ariba"
  | "BGC"
  | "BDV"
  | "PLD"
  | "Workflow"
  | "Monitoramento"
  | "SAP"
  | "IDV"
  | "Projetos";

export interface FranchiseMock {
  id: string;
  name: string;
  vigencia: string;
  renovacaoAutomatica: boolean;
  mediaFaturamento3m: number;
  produto: string;
  modeloCobranca: string;
  centroCusto: ProfitCenter;
  consumoMedioPct: number;
  receita12m: number;
  servico: ServiceName;
}

export interface ContractMock {
  id: string;
  name: string;
  vigencia: string;
  renovacaoAutomatica: boolean;
  receita12m: number;
  mediaFaturamento3m: number;
  minimoContratado: number;
  consumoMedioFranquiasPct: number;
  mrr: number;
  franchises: FranchiseMock[];
}

export interface ClientMock {
  id: string;
  cnpj: string;
  razaoSocial: string;
  dataInicio: string;
  mediaFaturamento3m: number;
  saude: ClientHealth;
  receita12m: number;
  minimoContratado: number;
  faturadoPorMes: number;
  mrr: number;
  tipo: ClientType;
  consumoMedioPct: number;
  contracts: ContractMock[];
}

export interface DashboardFiltersState {
  search: string;
  competence: string;
  health: string[];
  profitCenters: string[];
  clientTypes: string[];
  services: string[];
}

export interface ClientsFiltersState {
  search: string;
  health: string[];
  profitCenters: string[];
  clientTypes: string[];
  services: string[];
  billingOperator: "none" | "gt" | "lt";
  billingValue: string;
  consumptionOperator: "none" | "gt" | "lt";
  consumptionValue: string;
  sortBilling: "none" | "desc" | "asc";
  sortConsumption: "none" | "desc" | "asc";
}

export interface KpiSnapshot {
  current: number;
  previous: number;
  isPercent?: boolean;
}

export interface BarChartPoint {
  label: string;
  value: number;
  previous: number;
}
