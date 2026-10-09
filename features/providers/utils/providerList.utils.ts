import type { Provider, ProviderType } from "../types/providers.types";

const TYPE_LABELS: Record<ProviderType, string> = {
  direct: "Direto",
  indirect: "Indireto",
};

/**
 * Label da coluna Tipo (SUP-02).
 */
export function getProviderTypeLabel(provider: Provider): string {
  if (provider.providerType?.label) return provider.providerType.label;
  if (provider.providerType?.value) return TYPE_LABELS[provider.providerType.value];
  return "—";
}

/**
 * Coluna Serviço: Direto → "Fonte"; Indireto → description (SUP-02).
 */
export function getProviderServiceLabel(provider: Provider): string {
  if (provider.providerType?.value === "direct") return "Fonte";
  const description = provider.description?.trim();
  return description || "—";
}
