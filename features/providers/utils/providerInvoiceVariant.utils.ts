export type ProviderInvoiceVariant =
  | "indirect-postpaid"
  | "direct-postpaid"
  | "indirect-prepaid"
  | "direct-prepaid";

import {
  isDirectProviderType,
  isIndirectProviderType,
} from "./providerType.utils";
import type { ProviderType } from "../types/providers.types";

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

  const raw = input.providerType.value as ProviderType | null | undefined;
  if (!raw || (!isDirectProviderType(raw) && !isIndirectProviderType(raw))) {
    return { status: "invalid", reason: "unknown-provider-type" };
  }

  if (typeof input.isPrepaid !== "boolean") {
    return { status: "invalid", reason: "missing-prepaid-state" };
  }

  const billingKind: "direct" | "indirect" = raw === "direct" ? "direct" : "indirect";
  const variant =
    `${billingKind}-${input.isPrepaid ? "prepaid" : "postpaid"}` as ProviderInvoiceVariant;

  return { status: "valid", variant };
}
