import {
  getDeductibleById,
  listDeductiblesByContract,
  setDeductibleActiveState,
} from "./deductibleMock.service";
import type {
  CreateDeductibleRequest,
  DeductibleResponse,
} from "../types/deductibles.types";

export async function getDeductibles(
  contractId: string,
  _params?: unknown,
) {
  return listDeductiblesByContract(contractId);
}

export { getDeductibleById };

export async function updateDeductibleStatus(
  contractId: string,
  deductibleId: string,
  isActive: boolean,
): Promise<void> {
  setDeductibleActiveState(contractId, deductibleId, isActive);
}

export async function createDeductible(
  _contractId: string,
  _data: CreateDeductibleRequest,
): Promise<{ id: string }> {
  return { id: `franchise-${Date.now()}` };
}

export async function updateDeductible(
  contractId: string,
  deductibleId: string,
  data: CreateDeductibleRequest,
): Promise<DeductibleResponse> {
  const existing = await getDeductibleById(contractId, deductibleId);
  return {
    id: deductibleId,
    name: data.name,
    description: data.description ?? "",
    isTest: data.isTest,
    testPeriodMonths: data.testPeriodMonths ?? null,
    beginningTerm: data.beginningTerm,
    endTerm: data.endTerm,
    automaticRenovation: data.automaticRenovation,
    proofExpiration: data.proofExpiration,
    billingModel: existing.billingModel,
    automaticBlocking: data.automaticBlocking,
    isActive: data.isActive,
    excessUnitPrice: data.excessUnitPrice ?? null,
    products: existing.products,
    fixedPrice: data.fixedPrice,
    priceRanges: data.priceRanges,
  };
}

export async function getBillingModels() {
  const { MOCK_BILLING_MODELS } = await import("./deductibleMock.service");
  return MOCK_BILLING_MODELS;
}