import { getBaseURL } from "@/shared/utils/env";

const BASE_URL = getBaseURL();

/**
 * Endpoints da API de contratos e franquias vinculadas.
 */
export const CONTRACTS_ENDPOINTS = {
  
  /**
   * GET /v1/clients/{client_id}/contract
   * Listar contratos do cliente com paginação, filtros e busca
   */
  LIST_BY_CLIENT: (clientId: string) => `${BASE_URL}v1/clients/${clientId}/contract`,

  /**
   * GET /v1/clients/{client_id}/contract/{contract_id}
   * Obter detalhes de um contrato dentro do cliente
   */
  GET_BY_CLIENT_AND_ID: (clientId: string, contractId: string) => 
    `${BASE_URL}v1/clients/${clientId}/contract/${contractId}`,

  /**
   * POST /v1/clients/{client_id}/contract
   * Criar novo contrato para o cliente
   */
  CREATE: (clientId: string) => `${BASE_URL}v1/clients/${clientId}/contract`,

  /**
   * PUT /v1/clients/{client_id}/contract/{contract_id}
   * Atualizar contrato pelo cliente
   */
  UPDATE_BY_CLIENT: (clientId: string, contractId: string) => 
    `${BASE_URL}v1/clients/${clientId}/contract/${contractId}`,

  /**
   * PATCH /v1/clients/{client_id}/contract/{contract_id}/active
   * Atualizar status do contrato pelo cliente
   */
  UPDATE_STATUS_BY_CLIENT: (clientId: string, contractId: string) => 
    `${BASE_URL}v1/clients/${clientId}/contract/${contractId}/active`,

  /**
   * GET /v1/contracts/{id}
   * Obter detalhes de um contrato
   */
  GET_BY_ID: (contractId: string) => `${BASE_URL}v1/contracts/${contractId}`,

  /**
   * PUT /v1/contracts/{id}
   * Atualizar contrato
   */
  UPDATE: (contractId: string) => `${BASE_URL}v1/contracts/${contractId}`,

  /**
   * PATCH /v1/contracts/{id}
   * Atualização parcial de contrato
   */
  PATCH: (contractId: string) => `${BASE_URL}v1/contracts/${contractId}`,

  /**
   * DELETE /v1/contracts/{id}
   * Deletar contrato
   */
  DELETE: (contractId: string) => `${BASE_URL}v1/contracts/${contractId}`,

  /**
   * POST /v1/contract/{contract_id}/deductible
   * Criar uma nova franquia para o contrato
   */
  CREATE_DEDUCTIBLE: (contractId: string) => `${BASE_URL}v1/contract/${contractId}/deductible`,

  /**
   * GET /v1/contract/{contract_id}/deductible
   * Listar franquias do contrato com paginação, filtros e busca
   */
  LIST_DEDUCTIBLES: (contractId: string) => `${BASE_URL}v1/contract/${contractId}/deductible`,

  /**
   * GET /v1/contract/{contract_id}/deductible/{deductible_id}
   * Retorna uma franquia pelo ID dentro do contrato
   */
  GET_DEDUCTIBLE: (contractId: string, deductibleId: string) => `${BASE_URL}v1/contract/${contractId}/deductible/${deductibleId}`,

  /**
   * POST /v1/contract/{contract_id}/deductible/{deductible_id}/renew
   * Renova uma franquia pelo ID dentro do contrato
   */
  RENEW_DEDUCTIBLE: (contractId: string, deductibleId: string) =>
    `${BASE_URL}v1/contract/${contractId}/deductible/${deductibleId}/renew`,

  /**
   * PATCH /v1/contract/{contract_id}/deductible/{deductible_id}/active
   * Atualiza status de ativação de uma franquia
   */
  PATCH_DEDUCTIBLE_ACTIVE: (contractId: string, deductibleId: string) => `${BASE_URL}v1/contract/${contractId}/deductible/${deductibleId}/active`,

  /**
   * PUT /v1/contract/{contract_id}/deductible/{deductible_id}
   * Atualiza uma franquia existente
   */
  UPDATE_DEDUCTIBLE: (contractId: string, deductibleId: string) => `${BASE_URL}v1/contract/${contractId}/deductible/${deductibleId}`,
} as const;

export default CONTRACTS_ENDPOINTS;
