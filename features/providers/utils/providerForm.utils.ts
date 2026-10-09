import type {
  CreateProviderRequest,
  GetDirectProviderResponse,
  ProviderDetail,
  ProviderFormState,
  ProviderUsageItemRequest,
  UpdateProviderRequest,
} from "../types/providers.types";

export const REQUIRED_FIELD_MESSAGE = "Campo obrigatório";

export type ProviderFormErrors = Partial<
  Record<"name" | "providerType" | "service" | "linkedSources" | "usages", string>
>;

export function createEmptyProviderFormState(): ProviderFormState {
  return {
    name: "",
    isPrepaid: false,
    providerType: "",
    service: "",
    linkedSources: [],
    usesIndirectProviders: false,
    usagesByProviderId: {},
    usedByDirectProviders: false,
  };
}

function isDirectDetail(detail: ProviderDetail): detail is GetDirectProviderResponse {
  return detail.providerType.value === "direct";
}

function usagesFromDetail(detail: ProviderDetail): Record<string, string[]> {
  const usagesByProviderId: Record<string, string[]> = {};
  for (const usage of detail.providerUsages ?? []) {
    const existing = usagesByProviderId[usage.id] ?? [];
    const merged = new Set([...existing, ...usage.dataSources.map((ds) => ds.id)]);
    usagesByProviderId[usage.id] = [...merged];
  }
  return usagesByProviderId;
}

function buildProviderUsages(
  usagesByProviderId: Record<string, string[]>,
): ProviderUsageItemRequest[] {
  return Object.entries(usagesByProviderId)
    .filter(([, dataSourceIds]) => dataSourceIds.length > 0)
    .map(([providerId, dataSourceIds]) => ({ providerId, dataSourceIds }));
}

/**
 * Hidrata o form a partir do detalhe GET.
 */
export function mapProviderDetailToFormState(detail: ProviderDetail): ProviderFormState {
  const usagesByProviderId = usagesFromDetail(detail);
  const hasUsages = Object.keys(usagesByProviderId).length > 0;

  if (isDirectDetail(detail)) {
    return {
      name: detail.name,
      isPrepaid: detail.isPrepaid,
      providerType: "direct",
      service: "",
      linkedSources: (detail.dataSources ?? []).map((ds) => ({
        id: ds.id,
        name: ds.name,
        defaultCost:
          ds.defaultCost === undefined || ds.defaultCost === null ? "" : String(ds.defaultCost),
      })),
      usesIndirectProviders: hasUsages,
      usagesByProviderId,
      usedByDirectProviders: false,
    };
  }

  return {
    name: detail.name,
    isPrepaid: detail.isPrepaid,
    providerType: "indirect",
    service: detail.description ?? "",
    linkedSources: [],
    usesIndirectProviders: false,
    usagesByProviderId,
    usedByDirectProviders: hasUsages,
  };
}

/**
 * Mapeia form → CreateProviderRequest (dataSourceIds só UUIDs; sem defaultCost).
 */
export function mapFormToCreateRequest(form: ProviderFormState): CreateProviderRequest {
  if (form.providerType !== "direct" && form.providerType !== "indirect") {
    throw new Error("providerType is required to create a provider");
  }

  const base: CreateProviderRequest = {
    name: form.name.trim(),
    providerType: form.providerType,
    isPrepaid: form.isPrepaid,
  };

  if (form.providerType === "direct") {
    return {
      ...base,
      dataSourceIds: form.linkedSources.map((s) => s.id),
      providerUsages: form.usesIndirectProviders
        ? buildProviderUsages(form.usagesByProviderId)
        : [],
    };
  }

  return {
    ...base,
    description: form.service.trim() || null,
    providerUsages: form.usedByDirectProviders ? buildProviderUsages(form.usagesByProviderId) : [],
  };
}

/**
 * Mapeia form → UpdateProviderRequest (omite providerType/isPrepaid).
 */
export function mapFormToUpdateRequest(form: ProviderFormState): UpdateProviderRequest {
  if (form.providerType === "direct") {
    return {
      name: form.name.trim(),
      description: null,
      dataSourceIds: form.linkedSources.map((s) => s.id),
      providerUsages: form.usesIndirectProviders
        ? buildProviderUsages(form.usagesByProviderId)
        : [],
    };
  }

  return {
    name: form.name.trim(),
    description: form.service.trim() || null,
    providerUsages: form.usedByDirectProviders ? buildProviderUsages(form.usagesByProviderId) : [],
  };
}

/**
 * Valida o formulário conforme ACs SUP-04/05/06/07.
 */
export function validateProviderForm(form: ProviderFormState): ProviderFormErrors {
  const errors: ProviderFormErrors = {};

  if (!form.name.trim()) {
    errors.name = REQUIRED_FIELD_MESSAGE;
  }

  if (form.providerType !== "direct" && form.providerType !== "indirect") {
    errors.providerType = REQUIRED_FIELD_MESSAGE;
  }

  if (form.providerType === "direct" && form.linkedSources.length < 1) {
    errors.linkedSources = REQUIRED_FIELD_MESSAGE;
  }

  if (form.providerType === "indirect" && !form.service.trim()) {
    errors.service = REQUIRED_FIELD_MESSAGE;
  }

  if (form.providerType === "direct" && form.usesIndirectProviders) {
    const linkedIds = new Set(form.linkedSources.map((s) => s.id));
    const invalidUsage = Object.values(form.usagesByProviderId).some((ids) =>
      ids.some((id) => !linkedIds.has(id)),
    );
    if (invalidUsage) {
      errors.usages = REQUIRED_FIELD_MESSAGE;
    }
  }

  return errors;
}

export function isProviderFormValid(form: ProviderFormState): boolean {
  return Object.keys(validateProviderForm(form)).length === 0;
}
