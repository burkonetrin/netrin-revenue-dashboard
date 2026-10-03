import type { BillingDestinationSource, BillingInvoiceDestination } from "../types/billing.types";
import type { BillingPaymentContext } from "./billing-payment-context.mapper";

type DestinationInput = {
  clientId?: string;
  clientName?: string;
  dueDate?: string | null;
  source?: BillingDestinationSource;
  nfeMetadata?: Array<Record<string, unknown>> | null;
  items?: Array<Record<string, unknown>> | null;
  cascadeContracts?: Array<{
    id?: string;
    contractId?: string;
    name?: string;
    label?: string;
  }> | null;
};

const stringValue = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const stringList = (value: unknown): string[] =>
  Array.isArray(value)
    ? [...new Set(value.map(stringValue).filter((item): item is string => Boolean(item)))]
    : [];

function add(
  destinations: BillingInvoiceDestination[],
  destination: BillingInvoiceDestination,
): void {
  const key = `${destination.kind}:${destination.ids.join(",")}`;
  if (!destinations.some((current) => `${current.kind}:${current.ids.join(",")}` === key)) {
    destinations.push(destination);
  }
}

export function mapBillingDestinations(
  input: DestinationInput,
  context?: BillingPaymentContext | null,
): BillingInvoiceDestination[] {
  const destinations: BillingInvoiceDestination[] = [];
  const source = input.source ?? "billing_snapshot";
  const items = input.items ?? [];

  for (const metadata of input.nfeMetadata ?? []) {
    const metadataType = stringValue(metadata.type)?.toLowerCase();
    const metadataNames = stringList(metadata.names);
    const metadataContractIds = stringList(metadata.contractIds);
    const contractId = stringValue(metadata.contractId ?? metadata.contract_id);
    const metadataDeductible = metadata.deductible as Record<string, unknown> | undefined;
    const franchiseId = stringValue(
      metadata.franchiseId ??
        metadata.franchise_id ??
        metadata.deductibleId ??
        metadata.deductible_id ??
        metadataDeductible?.value,
    );
    const id = stringValue(metadata.id);
    const name = stringValue(
      metadata.ownerName ??
        metadata.owner_name ??
        metadata.label ??
        metadataDeductible?.label,
    );
    const dueDate = stringValue(metadata.dueDate ?? metadata.due_date) ?? input.dueDate ?? null;
    if (metadataType === "group" && metadataNames.length >= 2) {
      add(destinations, {
        kind: "contract_group",
        ids: metadataContractIds.length >= 2 ? metadataContractIds : metadataNames,
        names: metadataNames,
        dueDate,
        source,
      });
      continue;
    }
    if (
      (metadataType === "franchise" || metadataType === "deductible") &&
      metadataNames.length > 0
    ) {
      const destinationId = franchiseId ?? id ?? metadataNames[0];
      add(destinations, {
        kind: "franchise",
        ids: [destinationId],
        names: metadataNames,
        dueDate,
        source,
        franchiseId,
      });
      continue;
    }
    if (!name) continue;
    const groupId = contractId ? context?.groupIdByContractId.get(contractId) : undefined;
    const group = groupId
      ? context?.groups.find((candidate) => candidate.id === groupId)
      : undefined;
    if (group) {
      add(destinations, {
        kind: "contract_group",
        ids: group.contractIds,
        names: group.contractNames,
        dueDate,
        source,
      });
    } else if (franchiseId) {
      add(destinations, {
        kind: "franchise",
        ids: [franchiseId],
        names: [name],
        dueDate,
        source,
        franchiseId,
      });
    } else if (contractId || id) {
      add(destinations, {
        kind: "contract",
        ids: [contractId ?? id ?? ""],
        names: [name],
        dueDate,
        source,
        contractId,
      });
    }
  }

  for (const item of items) {
    const contract = item.contract as Record<string, unknown> | undefined;
    const deductible = item.deductible as Record<string, unknown> | undefined;
    const contractId = stringValue(contract?.value ?? item.contractId);
    const franchiseId = stringValue(deductible?.value ?? item.franchiseId);
    const contractName = stringValue(contract?.label);
    const franchiseName = stringValue(deductible?.label);
    const dueDate = stringValue(item.dueDate) ?? input.dueDate ?? null;
    const itemMode = stringValue(item.contractNfeMode)?.toLowerCase();
    const contractGroupId = stringValue(item.contractGroupId);
    const groupContractNames = stringList(item.groupContractNames);
    const groupId = contractId ? context?.groupIdByContractId.get(contractId) : undefined;
    const group = groupId
      ? context?.groups.find((candidate) => candidate.id === groupId)
      : undefined;
    if (itemMode === "unify" && contractGroupId && groupContractNames.length > 0) {
      add(destinations, {
        kind: "contract_group",
        ids: [contractGroupId],
        names: groupContractNames,
        dueDate,
        source: "billing_item",
      });
    } else if ((!itemMode || itemMode === "deductible") && franchiseId && franchiseName) {
      add(destinations, {
        kind: "franchise",
        ids: [franchiseId],
        names: [franchiseName],
        dueDate,
        source: "billing_item",
        franchiseId,
      });
    } else if (contractGroupId && groupContractNames.length > 0) {
      add(destinations, {
        kind: "contract_group",
        ids: [contractGroupId],
        names: groupContractNames,
        dueDate,
        source: "billing_item",
      });
    } else if (itemMode !== "contract" && group) {
      add(destinations, {
        kind: "contract_group",
        ids: group.contractIds,
        names: group.contractNames,
        dueDate,
        source: "billing_item",
      });
    } else if (contractId && contractName) {
      add(destinations, {
        kind: "contract",
        ids: [contractId],
        names: [contractName],
        dueDate,
        source: "billing_item",
        contractId,
      });
    }
  }

  const cascadeContracts = (input.cascadeContracts ?? [])
    .map((contract) => ({
      id: stringValue(contract.id ?? contract.contractId),
      name: stringValue(contract.name ?? contract.label),
    }))
    .filter((contract): contract is { id: string; name: string } =>
      Boolean(contract.id && contract.name),
    );
  const uniqueCascadeContracts = cascadeContracts.filter(
    ({ id }, index) => cascadeContracts.findIndex((contract) => contract.id === id) === index,
  );
  if (uniqueCascadeContracts.length >= 2) {
    add(destinations, {
      kind: "contract_group",
      ids: uniqueCascadeContracts.map(({ id }) => id),
      names: uniqueCascadeContracts.map(({ name }) => name),
      dueDate: input.dueDate ?? null,
      source,
    });
  }

  if (destinations.length === 0 && input.clientId && input.clientName) {
    destinations.push({
      kind: "client",
      ids: [input.clientId],
      names: [input.clientName],
      dueDate: input.dueDate ?? null,
      source,
    });
  }
  return destinations;
}
