import type {
  GetDirectProviderResponse,
  GetIndirectProviderResponse,
  ProviderDataSource,
  ProviderUsageInfo,
} from "../types/providers.types";

export interface DetailLinkedParty {
  id: string;
  name: string;
}

export interface DirectDetailRow {
  sourceId: string;
  sourceName: string;
  defaultCostLabel: string;
  indirectProviders: DetailLinkedParty[];
}

export interface IndirectDetailRow {
  directProviderId: string;
  directProviderName: string;
  sources: DetailLinkedParty[];
}

function formatDefaultCostLabel(defaultCost: string | undefined): string {
  if (defaultCost === undefined || defaultCost === null || defaultCost === "") {
    return "—";
  }
  const normalized = defaultCost.replace(",", ".");
  const amount = Number(normalized);
  if (Number.isNaN(amount)) {
    return defaultCost;
  }
  return amount.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

/**
 * Label da célula de multi-itens (DET-03/04): 1 → nome; >1 → "{N} Fornecedores" / "{N} fontes".
 */
export function formatMultiItemCellLabel(
  items: DetailLinkedParty[],
  singularUnit: "fornecedor" | "fonte",
): string {
  if (items.length === 0) return "—";
  if (items.length === 1) return items[0].name;
  if (singularUnit === "fornecedor") {
    return `${items.length} Fornecedores`;
  }
  return `${items.length} fontes`;
}

export function getMultiItemTooltipNames(items: DetailLinkedParty[]): string[] {
  return items.map((item) => item.name);
}

function usageIncludesSource(usage: ProviderUsageInfo, sourceId: string): boolean {
  return usage.dataSources.some((ds) => ds.id === sourceId);
}

function dedupeLinkedParties(items: DetailLinkedParty[]): DetailLinkedParty[] {
  const byId = new Map<string, DetailLinkedParty>();
  for (const item of items) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }
  return [...byId.values()];
}

/**
 * Linhas da aba Detalhes para fornecedor direto (Variante 1).
 */
export function buildDirectDetailRows(detail: GetDirectProviderResponse): DirectDetailRow[] {
  const sources = detail.dataSources ?? [];
  const usages = detail.providerUsages ?? [];

  return sources.map((source: ProviderDataSource) => {
    const indirectProviders = dedupeLinkedParties(
      usages
        .filter((usage) => usageIncludesSource(usage, source.id))
        .map((usage) => ({ id: usage.id, name: usage.name })),
    );

    return {
      sourceId: source.id,
      sourceName: source.name,
      defaultCostLabel: formatDefaultCostLabel(source.defaultCost),
      indirectProviders,
    };
  });
}

/**
 * Linhas da aba Detalhes para fornecedor indireto (Variante 2).
 * Apenas fontes efetivamente vinculadas em cada usage (REQ-9).
 * Agrega por direto: a API pode repetir o mesmo `usage.id` (ex.: 1 entrada por fonte).
 */
export function buildIndirectDetailRows(detail: GetIndirectProviderResponse): IndirectDetailRow[] {
  const byDirectId = new Map<string, IndirectDetailRow>();

  for (const usage of detail.providerUsages ?? []) {
    const existing = byDirectId.get(usage.id);
    const sources = (usage.dataSources ?? []).map((ds) => ({ id: ds.id, name: ds.name }));

    if (!existing) {
      byDirectId.set(usage.id, {
        directProviderId: usage.id,
        directProviderName: usage.name,
        sources: dedupeLinkedParties(sources),
      });
      continue;
    }

    existing.sources = dedupeLinkedParties([...existing.sources, ...sources]);
  }

  return [...byDirectId.values()];
}

/** Texto do bloco Serviço; vazio → consumidor exibe "—". */
export function getIndirectServiceText(description: string | null | undefined): string {
  const trimmed = description?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : "";
}
