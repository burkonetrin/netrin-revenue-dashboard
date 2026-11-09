import type {
  BankValidationTransactionQualityMetricKey,
  BankValidationVolumeMetricKey,
} from "../types/bank-validation.types";

export const BANK_VALIDATION_VOLUME_METRIC_ORDER: BankValidationVolumeMetricKey[] = [
  "totalRequests",
  "billable",
  "exceededDeductible",
  "dailyLimit",
  "clientErrorLimit",
  "timeouts",
  "serviceUnavailable",
  "netrinFailures",
  "bankFailures",
  "failureRate",
];

export const BANK_VALIDATION_VOLUME_METRIC_LABELS: Record<BankValidationVolumeMetricKey, string> = {
  totalRequests: "Total de requisições",
  billable: "Bilhetadas",
  exceededDeductible: "Franquia excedida",
  dailyLimit: "Limite diário",
  clientErrorLimit: "Limite erro cliente",
  timeouts: "Timeouts",
  serviceUnavailable: "Serviço indisponível",
  netrinFailures: "Falhas Netrin",
  bankFailures: "Falhas Bancárias",
  blacklistCpf: "Blacklist CPF",
  failureRate: "Taxa de falhas: (Netrin + Bancárias) / Total",
};

export const BANK_VALIDATION_PERCENTAGE_METRICS: BankValidationVolumeMetricKey[] = ["failureRate"];

export const BANK_VALIDATION_QUALITY_BILLABLE_METRIC_ORDER = [
  "avgTime",
  "billable",
  "invalidParams",
  "keyNotBelongs",
  "completedRequests",
] as const satisfies BankValidationTransactionQualityMetricKey[];

export const BANK_VALIDATION_QUALITY_COMPLETED_METRIC_ORDER = [
  "completedRequests",
  "validAccounts",
  "invalidAccounts",
] as const satisfies BankValidationTransactionQualityMetricKey[];

export const BANK_VALIDATION_QUALITY_METRIC_LABELS: Partial<
  Record<BankValidationTransactionQualityMetricKey, string>
> = {
  avgTime: "Tempo médio (s)",
  billable: "Bilhetadas",
  invalidParams: "Parâmetros inválidos",
  keyNotBelongs: "Chave não pertence",
  completedRequests: "Requisições efetivadas",
  validAccounts: "Contas válidas",
  invalidAccounts: "Contas inválidas",
};

export const BANK_VALIDATION_STATUS_CODE_TOOLTIPS: Record<number, string> = {
  200: "Sucesso",
  603: "Serviço indisponível",
  604: "Serviço indisponível",
  609: "Parâmetros inválidos",
  610: "Limite diário",
  611: "Franquia excedida",
  621: "Limite erro cliente",
  622: "Serviço indisponível",
  624: "Blacklist CPF",
  625: "Timeout",
  626: "Chave não pertence",
  627: "Falha Netrin",
  650: "Falha Netrin",
};

export const BANK_VALIDATION_STATUS_CODE_DISPLAY_ORDER = [
  200, 609, 626, 611, 610, 621, 625, 622, 603, 604, 650, 627, 624,
] as const;
