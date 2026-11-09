import {
  getDeductibleById,
  listDeductiblesByContract,
  setDeductibleActiveState,
} from "./deductibleMock.service";

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

export async function createDeductible(): Promise<void> {
  return;
}

export async function updateDeductible(): Promise<void> {
  return;
}

export async function getBillingModels() {
  const { MOCK_BILLING_MODELS } = await import("./deductibleMock.service");
  return MOCK_BILLING_MODELS;
}
