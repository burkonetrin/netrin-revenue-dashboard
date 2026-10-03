/**
 * Tipos da API de jobs de comprovantes (US 14168).
 * OpenAPI: ComprovantesJobGenerateResponse / ComprovantesJobStatusResponse.
 */

export type ComprovantesJobStatus = "queued" | "running" | "ready" | "failed";

export type BillingComprovantesSource = "invoice" | "entry";

export interface ComprovantesJobGenerateResponse {
  jobId: string;
  status: ComprovantesJobStatus | string;
}

export interface ComprovantesJobFileResponse {
  itemId: string;
  deductible: {
    value: string;
    label: string;
  };
  downloadReady?: boolean;
}

export interface ComprovantesJobStatusResponse {
  jobId: string;
  status: ComprovantesJobStatus | string;
  progress?: number;
  zipReady?: boolean;
  files?: ComprovantesJobFileResponse[];
  error?: string | null;
}
