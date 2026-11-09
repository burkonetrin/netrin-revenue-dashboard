/**
 * Serviço de volumetria e qualidade bancária (protótipo com mock).
 */

import type {
  BankValidationTransactionQualityParams,
  BankValidationTransactionQualityResponse,
  BankValidationVolumetryParams,
  BankValidationVolumetryResponse,
} from "../types/bank-validation.types";
import {
  getBankValidationTransactionQualityMock,
  getBankValidationVolumetryMock,
} from "./bankValidationMock.service";

/**
 * Busca métricas de volumetria geral para o mês informado.
 */
export async function getBankValidationVolumetry(
  params: BankValidationVolumetryParams,
): Promise<BankValidationVolumetryResponse> {
  return getBankValidationVolumetryMock(params);
}

/**
 * Busca métricas de qualidade das transações para o mês informado.
 */
export async function getBankValidationTransactionQuality(
  params: BankValidationTransactionQualityParams,
): Promise<BankValidationTransactionQualityResponse> {
  return getBankValidationTransactionQualityMock(params);
}
