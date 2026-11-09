/**
 * Modo de pagamento da franquia (herdar ou novo).
 */
export type PaymentMode = "sameContractInfo" | "newInfo";

/**
 * Nível de unificação de fatura na API.
 */
export type InvoiceUnificationLevel = "CLIENT" | "CONTRACT" | "DEDUCTIBLE";

/**
 * Arranjo de pagamento (padrão, pré ou pós-pago).
 */
export type PaymentArrangement = "standard" | "prepaid" | "postpaid";

/**
 * Tipo de vencimento do pagamento.
 */
export type PaymentDueType = "standard" | "weekday" | "specific_day" | "date_range";

/**
 * Método de pagamento aceito.
 */
export type PaymentMethod = "BOLETO" | "TRANSFERENCIA_BANCARIA";

/**
 * Moeda do pagamento.
 */
export type PaymentCurrency = "BRL" | "USD";

/**
 * Opção label/valor de campo de pagamento.
 */
export interface PaymentInfoOption {
  label: string;
  value: string;
}

/**
 * Centro de lucro retornado pela API.
 */
export interface ProfitCenterResponse {
  id: string;
  code: string;
  name: string;
  tipo: PaymentInfoOption;
  isActive: boolean;
}

/**
 * Payload de centros de lucro da franquia.
 */
export interface DeductibleProfitCenterRequest {
  profitCenterId?: string | null;
  overageProfitCenterId?: string | null;
}

/**
 * Centros de lucro vinculados à franquia.
 */
export interface DeductibleProfitCenterResponse {
  deductibleId?: string | null;
  profitCenter?: PaymentInfoOption | null;
  overageProfitCenter?: PaymentInfoOption | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Payload de informações de pagamento.
 */
export interface PaymentInfoRequest {
  nfeBranch?: string | null;
  nfeBranchCode?: string | null;
  paymentMethod?: PaymentMethod | null;
  currency?: PaymentCurrency | null;
  profitCenterId?: string | null;
  overageProfitCenterId?: string | null;
  billingPeriodicity?: string | null;
  dueAdditionalDays?: number | null;
  dueType?: string | null;
  dueWeekday?: number | null;
  dueSpecificDay?: number | null;
  dueDateRangeStart?: number | null;
  dueDateRangeEnd?: number | null;
  paymentArrangement?: string | null;
  paymentPrepaidMonths?: number | null;
  paymentPostpaidMonths?: number | null;
  nfeAddConsumptionInfo?: boolean | null;
  nfeAddBankInfo?: boolean | null;
  nfeAddOrderObservation?: boolean | null;
  nfeOrderObservationText?: string | null;
}

/**
 * Informações de pagamento retornadas pela API.
 */
export interface PaymentInfoResponse {
  id: string;
  clientId?: string | null;
  contractId?: string | null;
  deductibleId?: string | null;
  nfeBranch?: string | null;
  nfeBranchCode?: string | null;
  paymentMethod?: PaymentInfoOption | null;
  currency: PaymentInfoOption;
  profitCenter?: PaymentInfoOption | null;
  overageProfitCenter?: PaymentInfoOption | null;
  billingPeriodicity?: string | null;
  dueAdditionalDays?: number | null;
  dueType: PaymentInfoOption;
  dueWeekday?: number | null;
  dueSpecificDay?: number | null;
  dueDateRangeStart?: number | null;
  dueDateRangeEnd?: number | null;
  paymentArrangement: PaymentInfoOption;
  paymentPrepaidMonths?: number | null;
  paymentPostpaidMonths?: number | null;
  nfeAddConsumptionInfo: boolean;
  nfeAddBankInfo: boolean;
  nfeAddOrderObservation: boolean;
  nfeOrderObservationText?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Status de preenchimento de pagamento por dono.
 */
export interface PaymentInfoStatusItemResponse {
  ownerId: string;
  ownerType: PaymentInfoOption;
  ownerName: string;
  isFilled: boolean;
  isActive?: boolean | null;
  isTest?: boolean | null;
  paymentInfo?: PaymentInfoResponse | null;
  ownerParentId?: string | null;
  ownerParentName?: string | null;
}

/**
 * Resumo do status de pagamentos do cliente.
 */
export interface PaymentInfoStatusResponse {
  total: number;
  filled: number;
  missing: number;
  items: PaymentInfoStatusItemResponse[];
}

/**
 * Modelo de cobrança da franquia.
 */
export type BillingModel = "fixedPrice" | "fixedPriceWithOverage" | "priceRange";

/**
 * Faixa de preço do modelo por intervalo.
 */
export interface FranchiseTier {
  id: string;
  min: string;
  max: string;
  price: string;
}

/**
 * Franquia resumida vinculada a um contrato.
 */
export interface ContractFranchise {
  id: string;
  status: "ativo" | "inativo";
  type: string;
  name: string;
  billing: string;
  startDate: string;
  endDate: string;
  service: string;
  automaticRenewal: "Sim" | "Não";
  automaticBlock: "Liberado" | "Bloqueado";
}

/**
 * Contrato com suas franquias associadas.
 */
export interface ContractWithFranchises {
  id: string;
  status: "ativo" | "inativo";
  contractName: string;
  minimumValue: string;
  startDate: string;
  franchises: ContractFranchise[];
}

/**
 * Valores do formulário de informações de pagamento.
 */
export interface PaymentInfoFormValues {
  nfeBranch: string;
  nfeBranchCode: string;
  paymentArrangement: PaymentArrangement;
  paymentPrepaidMonths: string;
  paymentPostpaidMonths: string;
  paymentMethod: PaymentMethod | "";
  currency: PaymentCurrency | "";
  profitCenter: string;
  overflowProfitCenter: string;
  additionalDays: string;
  billingPeriodicity: string;
  dueType: PaymentDueType;
  dueWeekday: string;
  dueSpecificDay: string;
  dueDateRangeStart: string;
  dueDateRangeEnd: string;
  addClientConsumptionInfo: boolean;
  addBankInfo: boolean;
  addOrderNote: boolean;
  orderNote: string;
}

/**
 * Estado do formulário de nova franquia.
 */
export interface NewFranchiseFormState {
  paymentMode: PaymentMode | null;
  selectedBranchNf: string;
  selectedBranchCode: string;
  paymentMethod: string;
  currency: string;
  profitCenter: string;
  overflowProfitCenter: string;
  additionalDays: string;
  addClientConsumptionInfo: boolean;
  addBankInfo: boolean;
  addOrderNote: boolean;
  franchiseName: string;
  startDate: string;
  endDate: string;
  franchisePeriod: string;
  selectedProducts: string[];
  receiptExpirationDays: string;
  isActive: boolean;
  autoRenewal: boolean;
  isCredit: boolean;
  billingModel: BillingModel | null;
  purchasedQueries: string;
  paidValue: string;
  exceededQueryValue: string;
  blockOnLimit: boolean;
  tiers: FranchiseTier[];
  sourceGroups: Array<{ id: string; value: string }>;
  selectedSources: string[];
}
