/**
 * Produto vinculado a uma franquia.
 */
export interface DeductibleProduct {
  id: string;
  name: string;
  internalName?: string;
  serviceTypeId?: string;
  service_type_id?: string;
  serviceType?: {
    id: string;
    name: string;
    internalName?: string;
    internal_name?: string;
  };
  service_type?: {
    id: string;
    name: string;
    internalName?: string;
    internal_name?: string;
  };
  serviceTypes?: Array<{
    id: string;
    name: string;
    internalName?: string;
    internal_name?: string;
  }>;
}

/**
 * Identificador do modelo de cobrança da franquia.
 */
export type DeductibleBillingModel = string;

/**
 * Seção do payload de modelo de cobrança.
 */
export type BillingModelPayloadSection = "fixedPrice" | "priceRanges";

/**
 * Opção de modelo de cobrança disponível.
 */
export interface BillingModelOption {
  label: string;
  value: string;
  requiredBillingModels: BillingModelPayloadSection[];
}

/**
 * Campo de modelo de cobrança com metadados.
 */
export type BillingModelField = Pick<BillingModelOption, "label" | "value"> & {
  requiredBillingModels?: BillingModelPayloadSection[];
};

/**
 * Dados de preço fixo da franquia.
 */
export interface FixedPriceInfo {
  includedConsultations: number;
  packagePrice: number;
}

/**
 * Faixa de preço por volume de consultas.
 * `maxConsultations` null = faixa aberta (sem limite superior / excedente).
 */
export interface PriceRange {
  minConsultations: number;
  maxConsultations: number | null;
  unitPrice: number;
}

/**
 * Produto e tipo de serviço vinculados à franquia.
 */
export interface DeductibleProductInput {
  productId: string;
  serviceTypeId: string;
}

/**
 * Valor monetário aceito pela API (number | string decimal).
 */
export type ApiMonetaryValue = number | string;

/**
 * Payload enviado à API para criação/atualização de franquia.
 */
export type CreateDeductibleApiPayload = Omit<
  CreateDeductibleRequest,
  "excessUnitPrice" | "fixedPrice" | "priceRanges"
> & {
  excessUnitPrice: ApiMonetaryValue | null;
  fixedPrice?: {
    includedConsultations: number;
    packagePrice: ApiMonetaryValue;
  };
  priceRanges?: Array<{
    minConsultations: number;
    maxConsultations: number | null;
    unitPrice: ApiMonetaryValue;
  }>;
};

/**
 * Payload para criação de franquia.
 */
export interface CreateDeductibleRequest {
  name: string;
  description: string;
  isTest: boolean;
  /** Período da franquia de teste em meses (1..12). Só aplica quando isTest. */
  testPeriodMonths?: number | null;
  beginningTerm: string; // ISO Date
  endTerm: string; // ISO Date
  automaticRenovation: boolean;
  proofExpiration: number;
  billingModel: DeductibleBillingModel;
  automaticBlocking: boolean;
  isActive: boolean;
  /** Só usado em fixed_price; modelos com faixa enviam null. */
  excessUnitPrice: number | null;
  fixedPrice?: FixedPriceInfo;
  priceRanges?: PriceRange[];
  productIds: DeductibleProductInput[];
}

/**
 * Franquia retornada pela API.
 */
export interface DeductibleResponse
  extends Omit<CreateDeductibleRequest, "billingModel" | "productIds"> {
  id: string;
  billingModel: BillingModelField;
  products?: DeductibleProduct[];
}

/**
 * Parâmetros de listagem de franquias.
 */
export interface ListDeductiblesParams {
  page?: number;
  pageSize?: number;
  sortBy?: string | null;
  sortDirection?: string | null;
  search?: string | null;
  isActive?: boolean | null;
  isTest?: boolean | null;
  billingModel?: DeductibleBillingModel | null;
}

/**
 * Resposta paginada de franquias.
 */
export interface PaginatedDeductiblesResponse {
  data: DeductibleResponse[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Preço fixo detalhado com metadados da API.
 */
export interface DetailedFixedPriceInfo extends Omit<FixedPriceInfo, "packagePrice"> {
  id: string;
  packagePrice: ApiMonetaryValue;
  createdAt: string;
  updatedAt: string;
}

/**
 * Faixa de preço detalhada com metadados da API.
 */
export interface DetailedPriceRange extends Omit<PriceRange, "unitPrice"> {
  id: string;
  unitPrice: ApiMonetaryValue;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fonte de dados vinculada à franquia.
 */
export interface DeductibleLinkedDataSource {
  id: string;
  name: string;
}

/**
 * Pacote de fontes vinculado à franquia (resumo).
 */
export interface DeductibleLinkedBundle {
  id: string;
  name: string;
  syncWithDeductible?: boolean;
}

/**
 * Franquia detalhada com relacionamentos.
 */
export interface DetailedDeductibleResponse
  extends Omit<
    CreateDeductibleRequest,
    "billingModel" | "fixedPrice" | "priceRanges" | "productIds" | "excessUnitPrice"
  > {
  id: string;
  contractId: string;
  billingModel: BillingModelField;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  excessUnitPrice: ApiMonetaryValue | null;
  fixedPrice?: DetailedFixedPriceInfo;
  priceRanges?: DetailedPriceRange[];
  products?: DeductibleProduct[];
  dataSources?: DeductibleLinkedDataSource[];
  dataSourceBundles?: DeductibleLinkedBundle[];
  hideBillingModel?: boolean;
  hideDataSourcesStep?: boolean;
  hideTestFlag?: boolean;
  hideAutomaticRenovation?: boolean;
  hideProfitCenter?: boolean;
}
