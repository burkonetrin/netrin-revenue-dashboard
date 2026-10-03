// @ts-nocheck
import type { PaymentTabClientResponse } from "@/shared/endpoints/clients";

export interface BillingPaymentContract {
  id: string;
  name: string;
  groupId?: string;
  mode?: string | null;
  franchiseIds: string[];
}

export interface BillingPaymentGroup {
  id: string;
  contractIds: string[];
  contractNames: string[];
}

export interface BillingPaymentContext {
  clientId: string;
  singleNfeEnabled: boolean;
  contracts: BillingPaymentContract[];
  franchises: Map<string, string>;
  groups: BillingPaymentGroup[];
  groupIdByContractId: Map<string, string>;
}

export function mapBillingPaymentContext(
  response: PaymentTabClientResponse | null | undefined,
): BillingPaymentContext | null {
  if (!response) return null;

  const responseContracts = response.contracts ?? [];
  const contractsById = new Map(
    responseContracts
      .filter((contract) => Boolean(contract.id && contract.name.trim()))
      .map((contract) => [contract.id, contract]),
  );
  const groupIdByContractId = new Map<string, string>();
  const groupsById = new Map<string, BillingPaymentGroup>();

  for (const group of response.groups ?? []) {
    const contractIds = [...new Set(group.contractIds)].filter((id) => contractsById.has(id));
    const namedContracts = contractIds
      .map((id) => ({ id, name: contractsById.get(id)?.name.trim() ?? "" }))
      .filter(({ name }) => Boolean(name));
    const uniqueNamedContracts = namedContracts.filter(
      ({ name }, index) => namedContracts.findIndex((candidate) => candidate.name === name) === index,
    );
    if (uniqueNamedContracts.length < 2) continue;

    const groupId =
      group.id ||
      uniqueNamedContracts
        .map(({ id }) => id)
        .map((id) => contractsById.get(id)?.paymentInfo?.contractInvoiceGroupId)
        .find(Boolean);
    if (!groupId) continue;
    if (groupsById.has(groupId)) continue;

    const validGroup = {
      id: groupId,
      contractIds: uniqueNamedContracts.map(({ id }) => id),
      contractNames: uniqueNamedContracts.map(({ name }) => name),
    };
    groupsById.set(groupId, validGroup);
    for (const contractId of validGroup.contractIds) {
      groupIdByContractId.set(contractId, groupId);
    }
  }

  const groupedContractIds = new Set(
    [...groupsById.values()].flatMap((group) => group.contractIds),
  );
  for (const contract of contractsById.values()) {
    const groupId = contract.groupId ?? contract.paymentInfo?.contractInvoiceGroupId;
    if (
      groupId &&
      groupedContractIds.has(contract.id) &&
      groupsById.has(groupId) &&
      !groupIdByContractId.has(contract.id)
    ) {
      groupIdByContractId.set(contract.id, groupId);
    }
  }

  const groupIds = new Set(groupsById.keys());

  return {
    clientId: response.clientId,
    singleNfeEnabled: response.singleNfe?.enabled ?? false,
    contracts: [...contractsById.values()].map((contract) => ({
      id: contract.id,
      name: contract.name.trim(),
      groupId: groupIds.has(groupIdByContractId.get(contract.id) ?? "")
        ? groupIdByContractId.get(contract.id)
        : undefined,
      mode: contract.savedMode ?? contract.draftMode,
      franchiseIds: [
        ...new Set((contract.franchises ?? []).map((franchise) => franchise.id).filter(Boolean)),
      ],
    })),
    franchises: new Map(
      responseContracts.flatMap((contract) =>
        (contract.franchises ?? [])
          .filter((franchise) => franchise.id && franchise.name.trim())
          .map((franchise) => [franchise.id, franchise.name.trim()] as const),
      ),
    ),
    groups: [...groupsById.values()],
    groupIdByContractId,
  };
}
