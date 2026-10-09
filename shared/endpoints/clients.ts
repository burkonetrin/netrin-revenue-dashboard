import { getBaseURL } from "@/shared/utils/env";

/** Modos de emissão de NF-e aceitos pelo payment-info-tab. */
export type PaymentTabNfeMode = "contract" | "deductible" | "unify";

/** Status de configuração retornado pelo payment-info-tab. */
export type PaymentTabConfigStatus = "pending" | "configured";

/** Valores enumerados retornados pela API como `{ label, value }`. */
export interface PaymentTabEnumOption {
  label: string;
  value: string;
}

/** Métodos de pagamento aceitos pelo PaymentInfoRequest do OpenAPI. */
export type PaymentTabPaymentMethod = "BOLETO" | "TRANSFERENCIA_BANCARIA";

/** Moedas aceitas pelo PaymentInfoRequest do OpenAPI. */
export type PaymentTabCurrency = "BRL" | "USD";

/**
 * Payload de payment-info usado pela aba nova.
 *
 * Centro de lucro não pertence ao contrato novo da aba.
 */
export interface PaymentInfoRequest {
  nfeBranch?: string | null;
  nfeBranchCode?: string | null;
  paymentMethod?: PaymentTabPaymentMethod | null;
  currency?: PaymentTabCurrency | null;
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

/** Informações de pagamento retornadas pela resposta da aba. */
export interface PaymentInfoTabResponse {
  id: string;
  clientId?: string | null;
  contractId?: string | null;
  deductibleId?: string | null;
  contractInvoiceGroupId?: string | null;
  nfeBranch?: string | null;
  nfeBranchCode?: string | null;
  paymentMethod?: PaymentTabEnumOption | null;
  currency: PaymentTabEnumOption;
  billingPeriodicity?: string | null;
  dueAdditionalDays?: number | null;
  dueType: PaymentTabEnumOption;
  dueWeekday?: number | null;
  dueSpecificDay?: number | null;
  dueDateRangeStart?: number | null;
  dueDateRangeEnd?: number | null;
  paymentArrangement: PaymentTabEnumOption;
  paymentPrepaidMonths?: number | null;
  paymentPostpaidMonths?: number | null;
  nfeAddConsumptionInfo: boolean;
  nfeAddBankInfo: boolean;
  nfeAddOrderObservation: boolean;
  nfeOrderObservationText?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Franquia retornada por `PaymentTabContractResponse`. */
export interface PaymentTabFranchiseResponse {
  id: string;
  name: string;
  isActive: boolean;
  isTest: boolean;
  status: PaymentTabConfigStatus;
  paymentInfo?: PaymentInfoTabResponse | null;
}

export type TaxRule = "gross" | "net";

export interface ContractRefResponse {
  value: string;
  label?: string;
}

/** Contrato retornado pela resposta autoritativa da aba. */
export interface PaymentTabContractResponse {
  id: string;
  name: string;
  isActive: boolean;
  hasMinimumValue: boolean;
  taxRule?: TaxRule | null;
  savedMode?: PaymentTabNfeMode | null;
  draftMode?: PaymentTabNfeMode | null;
  status: PaymentTabConfigStatus;
  groupId?: string | null;
  paymentInfo?: PaymentInfoTabResponse | null;
  franchises: PaymentTabFranchiseResponse[];
  unifiableContracts?: ContractRefResponse[];
}

/** Grupo de contratos retornado pela resposta autoritativa da aba. */
export interface PaymentTabGroupResponse {
  id: string;
  contractIds: string[];
  status: PaymentTabConfigStatus;
  paymentInfo?: PaymentInfoTabResponse | null;
}

/** Estado persistido e draft da nota única do cliente. */
export interface PaymentTabSingleNfeResponse {
  enabled: boolean;
  draftEnabled?: boolean | null;
  status: PaymentTabConfigStatus;
  paymentInfo?: PaymentInfoTabResponse | null;
  canEnable?: boolean;
  disabledReason?: string | null;
  taxRule?: TaxRule | null;
}

/** Resposta completa de `GET /payment-info-tab`. */
export interface PaymentTabClientResponse {
  clientId: string;
  sapCode?: string | null;
  singleNfe: PaymentTabSingleNfeResponse;
  contracts: PaymentTabContractResponse[];
  groups: PaymentTabGroupResponse[];
}

/** Resposta resumida de pendências da aba. */
export interface PaymentTabStatusResponse {
  hasPending: boolean;
}

/** Payload para ligar/desligar a nota única do cliente. */
export interface SetClientSingleNfeRequest {
  enabled: boolean;
  paymentInfo?: PaymentInfoRequest | null;
}

/** Payload para trocar o modo de emissão do contrato. */
export interface SetNfeModeRequest {
  mode: PaymentTabNfeMode;
}

/** Payload para criar um grupo de contratos. */
export interface CreatePaymentTabGroupRequest {
  contractIds: string[];
  paymentInfo: PaymentInfoRequest;
}

/** Payload para incluir contrato em grupo. */
export interface AddToPaymentTabGroupRequest {
  contractId: string;
}

/** Payload para remover contratos de grupo. */
export interface RemoveFromPaymentTabGroupRequest {
  contractIds: string[];
}

const BASE_URL = getBaseURL();

/**
 * Endpoints da API de clientes, contatos e informações de pagamento.
 */
export const CLIENTS_ENDPOINTS = {
  /**
   * GET /v1/clients
   * Listar clientes (paginado)
   * Query params: page, pageSize, name, cnpj, search, isActive
   */
  LIST: `${BASE_URL}v1/clients`,

  /**
   * GET /v1/clients/{id}
   * Obter detalhes de um cliente
   */
  GET_BY_ID: (clientId: string) => `${BASE_URL}v1/clients/${clientId}`,

  /**
   * GET /v1/clients/payment-situations
   * Lista oficial de situações de pagamento
   */
  PAYMENT_SITUATIONS: `${BASE_URL}v1/clients/payment-situations`,

  /**
   * POST /v1/clients
   * Criar novo cliente
   */
  CREATE_FULL: `${BASE_URL}v1/clients`,

  /**
   * POST /v1/clients/by-cnpj
   * Criar cliente informando apenas CNPJ
   */
  CREATE_BY_CNPJ: `${BASE_URL}v1/clients/by-cnpj`,

  /**
   * PUT /v1/clients/{id}
   * Atualizar cliente
   */
  UPDATE: (clientId: string) => `${BASE_URL}v1/clients/${clientId}`,

  /**
   * PATCH /v1/clients/{client_id}/nfe-unification-level
   * Altera o nível de unificação NFe de um cliente
   */
  UPDATE_NFE_UNIFICATION_LEVEL: (clientId: string) =>
    `${BASE_URL}v1/clients/${clientId}/nfe-unification-level`,

  /**
   * PATCH /v1/clients/{id}/active
   * Altera o status de ativação de um cliente
   */
  UPDATE_ACTIVE: (clientId: string) => `${BASE_URL}v1/clients/${clientId}/active`,

  /**
   * PATCH /v1/clients/{client_id}/test
   * Altera o status de teste de um cliente
   */
  UPDATE_TEST: (clientId: string) => `${BASE_URL}v1/clients/${clientId}/test`,

  /**
   * DELETE /v1/clients/{id}
   * Deletar cliente
   */
  DELETE: (clientId: string) => `${BASE_URL}v1/clients/${clientId}`,

  /**
   * GET /v1/clients/{id}/franchises
   * Listar franquias do cliente
   */
  GET_FRANCHISES: (clientId: string) => `${BASE_URL}v1/clients/${clientId}/franchises`,

  /**
   * GET /v1/clients/{id}/users
   * Listar usuários do cliente
   * Query: page, pageSize, sortBy, sortDirection (asc|desc)
   */
  GET_USERS: (clientId: string) => `${BASE_URL}v1/client/${clientId}/users`,

  /**
   * GET /v1/clients/{client_id}/contacts
   * Listar contatos do cliente
   */
  GET_CONTACTS: (clientId: string) => `${BASE_URL}v1/clients/${clientId}/contacts`,

  /**
   * POST /v1/clients/{client_id}/contacts
   * Criar contato do cliente
   */
  CREATE_CONTACT: (clientId: string) => `${BASE_URL}v1/clients/${clientId}/contacts`,

  /**
   * PUT /v1/clients/{client_id}/contacts/{contact_id}
   * Atualizar contato do cliente
   */
  UPDATE_CONTACT: (clientId: string, contactId: string) =>
    `${BASE_URL}v1/clients/${clientId}/contacts/${contactId}`,

  /**
   * DELETE /v1/clients/{client_id}/contacts/{contact_id}
   * Arquivar contato do cliente
   */
  DELETE_CONTACT: (clientId: string, contactId: string) =>
    `${BASE_URL}v1/clients/${clientId}/contacts/${contactId}`,

  /**
   * GET /v1/clients/{id}/sources
   * Listar fontes de dados do cliente
   */
  GET_SOURCES: (clientId: string) => `${BASE_URL}v1/clients/${clientId}/sources`,

  /**
   * GET /v1/clients/{id}/financial
   * Dados financeiros do cliente
   */
  GET_FINANCIAL: (clientId: string) => `${BASE_URL}v1/clients/${clientId}/financial`,

  /**
   * GET /v1/clients/{client_id}/unified
   * Histórico unificado de faturamento do cliente (BillingListResponse)
   * Query params: page, limit (omitir reference-month para histórico completo)
   */
  GET_UNIFIED: (clientId: string) => `${BASE_URL}v1/clients/${clientId}/unified`,

  /**
   * GET /v1/clients/{id}/consumption
   * Consumo do cliente
   */
  GET_CONSUMPTION: (clientId: string) => `${BASE_URL}v1/clients/${clientId}/consumption`,

  /**
   * GET/PUT /v1/clients/{client_id}/payment-info
   * Informações de pagamento do cliente
   */
  PAYMENT_INFO: (clientId: string) => `${BASE_URL}v1/clients/${clientId}/payment-info`,

  /**
   * GET /v1/clients/{client_id}/payment-info-tab
   * Estado completo autoritativo da aba de informações de pagamento.
   */
  PAYMENT_INFO_TAB: (clientId: string) =>
    `${BASE_URL}v1/clients/${clientId}/payment-info-tab`,

  /**
   * GET /v1/clients/{client_id}/payment-info-tab/status
   * Pendência derivada do estado completo da aba.
   */
  PAYMENT_INFO_TAB_STATUS: (clientId: string) =>
    `${BASE_URL}v1/clients/${clientId}/payment-info-tab/status`,

  /**
   * PUT /v1/clients/{client_id}/payment-info-tab/single-nfe
   * Atualizar nota única do cliente.
   */
  PAYMENT_INFO_TAB_SINGLE_NFE: (clientId: string) =>
    `${BASE_URL}v1/clients/${clientId}/payment-info-tab/single-nfe`,

  /**
   * PUT /v1/clients/{client_id}/payment-info-tab/contracts/{contract_id}/nfe-mode
   * Atualizar modo de emissão do contrato.
   */
  PAYMENT_INFO_TAB_CONTRACT_NFE_MODE: (clientId: string, contractId: string) =>
    `${BASE_URL}v1/clients/${clientId}/payment-info-tab/contracts/${contractId}/nfe-mode`,

  PAYMENT_INFO_TAB_CONTRACT_TAX_RULE: (clientId: string, contractId: string) =>
    `${BASE_URL}v1/clients/${clientId}/payment-info-tab/contracts/${contractId}/tax-rule`,

  PAYMENT_INFO_TAB_TAX_RULE: (clientId: string) =>
    `${BASE_URL}v1/clients/${clientId}/payment-info-tab/tax-rule`,

  /**
   * POST /v1/clients/{client_id}/payment-info-tab/groups
   * Criar grupo de contratos.
   */
  PAYMENT_INFO_TAB_GROUPS: (clientId: string) =>
    `${BASE_URL}v1/clients/${clientId}/payment-info-tab/groups`,

  /**
   * PUT/DELETE /v1/clients/{client_id}/payment-info-tab/groups/{group_id}/members
   * Incluir ou remover contratos de um grupo.
   */
  PAYMENT_INFO_TAB_GROUP_MEMBERS: (clientId: string, groupId: string) =>
    `${BASE_URL}v1/clients/${clientId}/payment-info-tab/groups/${groupId}/members`,

  /**
   * PUT /v1/clients/{client_id}/payment-info-tab/groups/{group_id}/payment-info
   * Atualizar payment-info do grupo.
   */
  PAYMENT_INFO_TAB_GROUP_PAYMENT_INFO: (clientId: string, groupId: string) =>
    `${BASE_URL}v1/clients/${clientId}/payment-info-tab/groups/${groupId}/payment-info`,

  /**
   * GET /v1/clients/{client_id}/payment-infos/status
   * Status de preenchimento das informações de pagamento
   */
  PAYMENT_INFOS_STATUS: (clientId: string) =>
    `${BASE_URL}v1/clients/${clientId}/payment-infos/status`,

  /**
   * GET/PUT /v1/clients/{client_id}/contract/{contract_id}/payment-info
   * Informações de pagamento do contrato
   */
  CONTRACT_PAYMENT_INFO: (clientId: string, contractId: string) =>
    `${BASE_URL}v1/clients/${clientId}/contract/${contractId}/payment-info`,

  /**
   * GET/PUT /v1/clients/{client_id}/contract/{contract_id}/deductible/{deductible_id}/payment-info
   * Informações de pagamento da franquia
   */
  DEDUCTIBLE_PAYMENT_INFO: (clientId: string, contractId: string, deductibleId: string) =>
    `${BASE_URL}v1/clients/${clientId}/contract/${contractId}/deductible/${deductibleId}/payment-info`,

  /**
   * GET/PUT/DELETE /v1/clients/{client_id}/contract/{contract_id}/deductible/{deductible_id}/profit-center
   * Centro de lucro da franquia
   */
  DEDUCTIBLE_PROFIT_CENTER: (clientId: string, contractId: string, deductibleId: string) =>
    `${BASE_URL}v1/clients/${clientId}/contract/${contractId}/deductible/${deductibleId}/profit-center`,

  /**
   * GET /v1/profit-centers
   * Centros de lucro disponíveis
   */
  PROFIT_CENTERS: `${BASE_URL}v1/profit-centers`,

  /**
   * GET /v1/clients/by-cep/address/{cep}
   * Consulta endereço por CEP
   */
  BY_CEP_ADDRESS: (cep: string) => `${BASE_URL}v1/clients/by-cep/address/${cep}`,

  /**
   * GET /v1/clients/by-cnpj/preview/{cnpj}
   * Consulta preview de cliente por CNPJ
   */
  BY_CNPJ_PREVIEW: (cnpj: string) => `${BASE_URL}v1/clients/by-cnpj/preview/${cnpj}`,
} as const;

export default CLIENTS_ENDPOINTS;
