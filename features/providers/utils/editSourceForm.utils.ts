import type {
  GetDirectProviderResponse,
  ProviderUsageInfo,
  ProviderType,
} from "../types/providers.types";

const sourceDefaultIndirectCaptcha: Record<string, Record<string, string>> = {
  "ds-receita": { "prov-receita-mirror": "prov-aggregator" },
};

const sourceDefaultIndirectProxy: Record<string, Record<string, string>> = {
  "ds-receita": { "prov-receita-mirror": "prov-proxy-bridge" },
};

/** Retorna o id do indireto padrão gravado para a combinação fonte + fornecedor direto. */
export function getPersistedDefaultIndirectProviderId(
  sourceId: string,
  directProviderId: string,
  kind: "captcha" | "proxy",
): string {
  const map =
    kind === "captcha" ? sourceDefaultIndirectCaptcha : sourceDefaultIndirectProxy;
  return map[sourceId]?.[directProviderId] ?? "";
}

function isDirectDetail(detail: unknown): detail is GetDirectProviderResponse {
  return (
    typeof detail === "object" &&
    detail !== null &&
    "dataSources" in detail &&
    Array.isArray((detail as GetDirectProviderResponse).dataSources)
  );
}

/** Filtra usos indiretos do fornecedor direto que incluem a fonte informada. */
export function getIndirectUsagesForSource(
  directDetail: GetDirectProviderResponse | undefined,
  sourceId: string,
  indirectType: Extract<ProviderType, "indirect_captcha" | "indirect_proxy">,
): ProviderUsageInfo[] {
  if (!directDetail) {
    return [];
  }

  const usages: ProviderUsageInfo[] = [];
  for (const usage of directDetail.providerUsages ?? []) {
    if (usage.providerType.value !== indirectType) {
      continue;
    }
    const linkedToSource = usage.dataSources.some((dataSource) => dataSource.id === sourceId);
    if (linkedToSource) {
      usages.push(usage);
    }
  }
  return usages;
}

/** Monta lista com os nomes dos indiretos vinculados ao direto para a fonte. */
export function getIndirectProviderNamesForSource(
  directDetail: unknown,
  sourceId: string,
): string[] {
  if (!isDirectDetail(directDetail)) {
    return [];
  }

  const names: string[] = [];
  for (const usage of directDetail.providerUsages ?? []) {
    const linkedToSource = usage.dataSources.some((dataSource) => dataSource.id === sourceId);
    if (linkedToSource) {
      names.push(usage.name);
    }
  }
  return names;
}

/** Monta texto com os nomes dos indiretos vinculados ao direto para a fonte. */
export function formatIndirectProviderNamesForSource(
  directDetail: unknown,
  sourceId: string,
): string {
  return getIndirectProviderNamesForSource(directDetail, sourceId).join(", ");
}
