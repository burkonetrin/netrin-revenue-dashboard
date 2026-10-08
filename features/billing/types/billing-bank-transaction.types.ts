export type BankPixKeyType = "cpf" | "cnpj" | "telefone" | string;

export type BankMicroDepositUiStatus = "Validado" | "Invalidado";

export interface BillingBankTransactionRow {
  id: number;
  microDepositStatus: BankMicroDepositUiStatus | null;
  microDepositErrorMessage: string | null;
  transactionValue: number | null;
  transactionCost: number | null;
  executedAt: string;
  requestTimeMs: number | null;
  dataSourceId: number;
  sourceName: string;
  provider: string;
  origin: string;
  taskId: string | null;
  clientId: number;
  clientName: string;
  userId: number;
  username: string;
  statusCode: number;
  message: string | null;
  pixKey: string | null;
  pixKeyType: BankPixKeyType | null;
  document: string | null;
  documentHolderName: string | null;
  isBillable: boolean;
  bankCode: string | null;
  bankBranch: string | null;
  bankAccount: string | null;
  bankAccountDigit: string | null;
}
