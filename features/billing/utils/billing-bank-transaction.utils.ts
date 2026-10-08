import type {
  BillingBankTransactionRow,
} from "../types/billing-bank-transaction.types";
import { formatBillingRequestDateTime } from "./billing-request-consultation.utils";

export type AdminBankTransactionRow = {
  id: number;
  provider: string;
  transaction_value: number | null;
  transaction_cost: number | null;
  executed_at: string;
  data_source_id: number;
  data_source_name: string;
  client_id: number;
  client_name: string;
  user_id: number;
  username: string;
  status_code: number;
  message: string | null;
  chave_pix: string | null;
  tipo_chave: string | null;
  cpf_cnpj: string | null;
  document_holder_name: string | null;
  is_billable: boolean;
  bank_code: string | null;
  bank_branch: string | null;
  account: string | null;
  account_digit: string | null;
  micro_deposit_status: string | null;
  error_message: string | null;
  request_time: number | null;
  task_id: string | null;
};

function mapMicroDepositStatus(
  raw: string | null | undefined,
): BillingBankTransactionRow["microDepositStatus"] {
  if (!raw?.trim()) return null;
  const normalized = raw.trim().toLowerCase();
  if (normalized === "validated" || normalized === "validado") return "Validado";
  if (normalized === "invalidated" || normalized === "invalidado") return "Invalidado";
  return null;
}

export function mapAdminBankTransactionRow(row: AdminBankTransactionRow): BillingBankTransactionRow {
  const requestTimeMs =
    row.request_time != null && !Number.isNaN(Number(row.request_time))
      ? Math.round(Number(row.request_time))
      : null;

  return {
    id: row.id,
    microDepositStatus: mapMicroDepositStatus(row.micro_deposit_status),
    microDepositErrorMessage: row.error_message?.trim() || null,
    transactionValue: row.transaction_value,
    transactionCost: row.transaction_cost,
    executedAt: row.executed_at,
    requestTimeMs,
    dataSourceId: row.data_source_id,
    sourceName: row.data_source_name || row.provider,
    provider: row.provider,
    origin: row.is_billable ? "Billable" : "Not billable",
    taskId: row.task_id?.trim() || null,
    clientId: row.client_id,
    clientName: row.client_name,
    userId: row.user_id,
    username: row.username,
    statusCode: row.status_code,
    message: row.message,
    pixKey: row.chave_pix,
    pixKeyType: row.tipo_chave,
    document: row.cpf_cnpj,
    documentHolderName: row.document_holder_name,
    isBillable: row.is_billable,
    bankCode: row.bank_code,
    bankBranch: row.bank_branch,
    bankAccount: row.account,
    bankAccountDigit: row.account_digit,
  };
}

export function formatBankTransactionDateTime(isoOrNaive: string): string {
  return formatBillingRequestDateTime(isoOrNaive);
}

export function formatPixKeyTypeLabel(type: string | null | undefined): string {
  if (!type?.trim()) return "—";
  const normalized = type.trim().toLowerCase();
  if (normalized === "cpf") return "CPF";
  if (normalized === "cnpj") return "CNPJ";
  if (normalized === "telefone" || normalized === "phone") return "Telefone";
  return type;
}

export function formatBankAccountLine(
  branch: string | null,
  account: string | null,
  digit: string | null,
): string {
  if (!branch && !account) return "—";
  const accountPart = account
    ? digit
      ? `${account}-${digit}`
      : account
    : "—";
  return `Ag. ${branch ?? "—"} | C.C: ${accountPart}`;
}
