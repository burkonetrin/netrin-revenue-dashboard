export interface BankValidationVolumetryParams {
  referenceMonth: string;
}

export interface BankValidationTransactionQualityParams {
  referenceMonth: string;
}

export interface BankValidationSourceInfo {
  key: string;
  label: string;
}

export interface BankValidationStatusCodeInfo {
  statusCode: number;
  description: string;
  category: string;
}

export interface BankValidationMetric {
  label: string;
  codes: BankValidationStatusCodeInfo[];
  total: number;
  bySource: Record<string, number>;
}

export interface BankValidationVolumetryMetrics {
  totalRequests: BankValidationMetric;
  billable: BankValidationMetric;
  exceededDeductible: BankValidationMetric;
  dailyLimit: BankValidationMetric;
  clientErrorLimit: BankValidationMetric;
  timeouts: BankValidationMetric;
  serviceUnavailable: BankValidationMetric;
  netrinFailures: BankValidationMetric;
  bankFailures: BankValidationMetric;
  blacklistCpf: BankValidationMetric;
  failureRate: BankValidationMetric;
}

export interface BankValidationVolumetryResponse {
  referenceMonth: string;
  sources: BankValidationSourceInfo[];
  metrics: BankValidationVolumetryMetrics;
}

export type BankValidationVolumeMetricKey = keyof BankValidationVolumetryMetrics;

export interface BankValidationTransactionQualityMetrics {
  totalRequests: BankValidationMetric;
  billable: BankValidationMetric;
  completedRequests: BankValidationMetric;
  invalidParams: BankValidationMetric;
  keyNotBelongs: BankValidationMetric;
  validAccounts: BankValidationMetric;
  invalidAccounts: BankValidationMetric;
  avgTime: BankValidationMetric;
  invalidParamsBillableRatio: BankValidationMetric;
  keyNotBelongsBillableRatio: BankValidationMetric;
  completedRequestsBillableRatio: BankValidationMetric;
  validAccountsCompletedRatio: BankValidationMetric;
  invalidAccountsCompletedRatio: BankValidationMetric;
}

export interface BankValidationTransactionQualityResponse {
  referenceMonth: string;
  sources: BankValidationSourceInfo[];
  metrics: BankValidationTransactionQualityMetrics;
}

export type BankValidationTransactionQualityMetricKey =
  keyof BankValidationTransactionQualityMetrics;

export type BankValidationMetricValueType = "number" | "percentage" | "seconds";

export interface BankValidationVolumeRow {
  id: BankValidationVolumeMetricKey;
  label: string;
  codes: BankValidationStatusCodeInfo[];
  total: number;
  bySource: Record<string, number>;
  valueType: BankValidationMetricValueType;
}

export interface BankValidationTransactionQualityRatio {
  total: number;
  bySource: Record<string, number>;
  denominatorLabel: "bilhetadas" | "efetivadas";
}

export interface BankValidationTransactionQualityRow {
  id: BankValidationTransactionQualityMetricKey;
  label: string;
  codes: BankValidationStatusCodeInfo[];
  total: number;
  bySource: Record<string, number>;
  valueType: BankValidationMetricValueType;
  ratio?: BankValidationTransactionQualityRatio;
}

export interface BankValidationTransactionQualitySummaryCard {
  id: "totalRequests" | "starkRequests" | "trioRequests";
  label: string;
  value?: number;
}
