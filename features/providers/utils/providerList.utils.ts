import type { Provider } from "../types/providers.types";
import { buildProviderTypeOption } from "./providerType.utils";

/**
 * Label da coluna Tipo (SUP-02).
 */
export function getProviderTypeLabel(provider: Provider): string {
  if (provider.providerType?.label) return provider.providerType.label;
  const value = provider.providerType?.value;
  if (value === "direct" || value === "indirect_captcha" || value === "indirect_proxy") {
    return buildProviderTypeOption(value).label;
  }
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
