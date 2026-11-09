import { API_ENDPOINTS } from "@/shared/endpoints";
import api from "@/shared/lib/axios";
import { isAxiosError } from "axios";
import {
  getDeductiblePaymentInfoMock,
  getDeductibleProfitCenterMock,
} from "./deductibleMock.service";
import type {
  DeductibleProfitCenterRequest,
  DeductibleProfitCenterResponse,
  PaymentInfoRequest,
  PaymentInfoResponse,
  PaymentInfoStatusResponse,
  ProfitCenterResponse,
} from "../types/contractsFranchises.types";

/**
 * Busca informações de pagamento do cliente.
 */
export async function getClientPaymentInfo(clientId: string): Promise<PaymentInfoResponse | null> {
  try {
    const response = await api.get<PaymentInfoResponse | null>(
      API_ENDPOINTS.CLIENTS.PAYMENT_INFO(clientId),
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}

/**
 * Busca informações de pagamento do contrato.
 */
export async function getContractPaymentInfo(
  clientId: string,
  contractId: string,
): Promise<PaymentInfoResponse | null> {
  try {
    const response = await api.get<PaymentInfoResponse | null>(
      API_ENDPOINTS.CLIENTS.CONTRACT_PAYMENT_INFO(clientId, contractId),
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}

/**
 * Busca informações de pagamento da franquia.
 */
export async function getDeductiblePaymentInfo(
  clientId: string,
  contractId: string,
  deductibleId: string,
): Promise<PaymentInfoResponse | null> {
  return getDeductiblePaymentInfoMock(clientId, contractId, deductibleId);
}

/**
 * Salva informações de pagamento do cliente.
 */
export async function saveClientPaymentInfo(
  clientId: string,
  data: PaymentInfoRequest,
): Promise<PaymentInfoResponse> {
  const response = await api.put<PaymentInfoResponse>(
    API_ENDPOINTS.CLIENTS.PAYMENT_INFO(clientId),
    data,
  );
  return response.data;
}

/**
 * Salva informações de pagamento do contrato.
 */
export async function saveContractPaymentInfo(
  clientId: string,
  contractId: string,
  data: PaymentInfoRequest,
): Promise<PaymentInfoResponse> {
  const response = await api.put<PaymentInfoResponse>(
    API_ENDPOINTS.CLIENTS.CONTRACT_PAYMENT_INFO(clientId, contractId),
    data,
  );
  return response.data;
}

/**
 * Salva informações de pagamento da franquia.
 */
export async function saveDeductiblePaymentInfo(
  clientId: string,
  contractId: string,
  deductibleId: string,
  data: PaymentInfoRequest,
): Promise<PaymentInfoResponse> {
  const response = await api.put<PaymentInfoResponse>(
    API_ENDPOINTS.CLIENTS.DEDUCTIBLE_PAYMENT_INFO(clientId, contractId, deductibleId),
    data,
  );
  return response.data;
}

/**
 * Busca centros de lucro da franquia.
 */
export async function getDeductibleProfitCenter(
  clientId: string,
  contractId: string,
  deductibleId: string,
): Promise<DeductibleProfitCenterResponse | null> {
  return getDeductibleProfitCenterMock(clientId, contractId, deductibleId);
}

/**
 * Salva centros de lucro da franquia.
 */
export async function saveDeductibleProfitCenter(
  clientId: string,
  contractId: string,
  deductibleId: string,
  data: DeductibleProfitCenterRequest,
): Promise<DeductibleProfitCenterResponse> {
  const response = await api.put<DeductibleProfitCenterResponse>(
    API_ENDPOINTS.CLIENTS.DEDUCTIBLE_PROFIT_CENTER(clientId, contractId, deductibleId),
    data,
  );
  return response.data;
}

/**
 * Remove centros de lucro da franquia.
 */
export async function deleteDeductibleProfitCenter(
  clientId: string,
  contractId: string,
  deductibleId: string,
): Promise<void> {
  await api.delete(
    API_ENDPOINTS.CLIENTS.DEDUCTIBLE_PROFIT_CENTER(clientId, contractId, deductibleId),
  );
}

/**
 * Busca status de preenchimento dos pagamentos.
 */
export async function getPaymentInfosStatus(clientId: string): Promise<PaymentInfoStatusResponse> {
  const response = await api.get<PaymentInfoStatusResponse>(
    API_ENDPOINTS.CLIENTS.PAYMENT_INFOS_STATUS(clientId),
  );
  return response.data;
}

/**
 * Lista centros de lucro disponíveis.
 */
export async function getProfitCenters(): Promise<ProfitCenterResponse[]> {
  const response = await api.get<ProfitCenterResponse[]>(API_ENDPOINTS.CLIENTS.PROFIT_CENTERS);
  return response.data;
}
