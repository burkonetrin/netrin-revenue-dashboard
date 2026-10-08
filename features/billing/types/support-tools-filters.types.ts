export type SupportToolsCacheFilter = "yes" | "no";

export interface SupportToolsRequestConsultationFilters {
  startDate: string;
  endDate: string;
  origins: string[];
  usernames: string[];
  document: string;
  dataSourceNames: string[];
  clients: string[];
  statusCodes: string[];
  caches: SupportToolsCacheFilter[];
}

export interface SupportToolsBankTransactionFilters {
  startDate: string;
  endDate: string;
  microDeposits: string[];
  statusCodes: string[];
  sourceNames: string[];
  origins: string[];
  document: string;
  pixKeyTypes: string[];
  pixKey: string;
  bankCode: string;
  bankBranch: string;
  bankAccount: string;
  clients: string[];
  usernames: string[];
}

export const EMPTY_REQUEST_CONSULTATION_FILTERS: SupportToolsRequestConsultationFilters = {
  startDate: "",
  endDate: "",
  origins: [],
  usernames: [],
  document: "",
  dataSourceNames: [],
  clients: [],
  statusCodes: [],
  caches: [],
};

export const EMPTY_BANK_TRANSACTION_FILTERS: SupportToolsBankTransactionFilters = {
  startDate: "",
  endDate: "",
  microDeposits: [],
  statusCodes: [],
  sourceNames: [],
  origins: [],
  document: "",
  pixKeyTypes: [],
  pixKey: "",
  bankCode: "",
  bankBranch: "",
  bankAccount: "",
  clients: [],
  usernames: [],
};
