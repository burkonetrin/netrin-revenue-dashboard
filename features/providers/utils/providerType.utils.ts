import type { ProviderType } from "../types/providers.types";

export type IndirectProviderKind =
  | "indirect_captcha"
  | "indirect_proxy"
  | "indirect_infra";

/** Filtro de listagem: `indirect` agrupa captcha e proxy. */
export type ProviderTypeFilter = ProviderType | "indirect";

const TYPE_LABELS: Record<ProviderType, string> = {
  direct: "Direto",
  indirect_captcha: "Indireto - Captcha",
  indirect_proxy: "Indireto - Proxy",
  indirect_infra: "Indireto - Infra",
};

export function buildProviderTypeOption(value: ProviderType) {
  return { label: TYPE_LABELS[value], value };
}

export function isDirectProviderType(value: ProviderType | ""): value is "direct" {
  return value === "direct";
}

export function isIndirectProviderType(value: ProviderType | ""): value is IndirectProviderKind {
  return (
    value === "indirect_captcha" ||
    value === "indirect_proxy" ||
    value === "indirect_infra"
  );
}

export function isProviderType(value: string): value is ProviderType {
  return value in TYPE_LABELS;
}

export function matchesProviderTypeFilter(
  providerValue: ProviderType,
  filter: ProviderTypeFilter,
): boolean {
  if (filter === "indirect") {
    return isIndirectProviderType(providerValue);
  }
  return providerValue === filter;
}

export function getIndirectProviderBadgeLabel(value: ProviderType): string | null {
  if (value === "indirect_captcha") return "Captcha";
  if (value === "indirect_proxy") return "Proxy";
  if (value === "indirect_infra") return "Infra";
  return null;
}
