import type { ProviderType } from "../types/providers.types";

export type ProviderInvoiceVariant =
  | "indirect-postpaid"
  | "direct-postpaid"
  | "indirect-prepaid"
  | "direct-prepaid";

export type ProviderInvoiceVariantResolution =
  | { status: "valid"; variant: ProviderInvoiceVariant }
  | {
      status: "invalid";
      reason: "missing-provider-type" | "unknown-provider-type" | "missing-prepaid-state";
    };

export interface ProviderInvoiceVariantInput {
  providerType?: { value?: string | null } | null;
  isPrepaid?: boolean | null;
}

/**
 * Resolve a provider invoice drawer variant without silently assuming a type.
 */
export function resolveProviderInvoiceVariant(
  input: ProviderInvoiceVariantInput | null | undefined,
): ProviderInvoiceVariantResolution {
  if (!input?.providerType) {
    return { status: "invalid", reason: "missing-provider-type" };
  }

  if (input.providerType.value !== "direct" && input.providerType.value !== "indirect") {
    return { status: "invalid", reason: "unknown-provider-type" };
  }

  if (typeof input.isPrepaid !== "boolean") {
    return { status: "invalid", reason: "missing-prepaid-state" };
  }

  const providerType: ProviderType = input.providerType.value;
  const variant =
    `${providerType}-${input.isPrepaid ? "prepaid" : "postpaid"}` as ProviderInvoiceVariant;

  return { status: "valid", variant };
}
