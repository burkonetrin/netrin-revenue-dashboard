/** Linha de consulta de requisição (Admin `billable` / `not_billable`). */
export interface BillingRequestConsultationRow {
  id: number;
  clientId: number;
  userId: number;
  origin: string;
  clientName: string;
  ip: string | null;
  username: string;
  document: string;
  statusCode: number;
  dataSourceId: number;
  dataSourceName: string | null;
  franchiseName: string | null;
  serviceType: string | null;
  executedAt: string;
  requestTimeMs: number | null;
  cache: boolean;
  taskId: string | null;
}
