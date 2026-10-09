import type { DataSourceBundle } from "@/features/providers/types/data-source-bundles.types";

/**
 * Mescla pacotes de fontes removendo duplicatas por ID.
 */
export function mergeDataSourceBundlesById(
  bundleLists: DataSourceBundle[][],
): DataSourceBundle[] {
  const byId = new Map<string, DataSourceBundle>();

  for (const bundles of bundleLists) {
    for (const bundle of bundles) {
      byId.set(bundle.id, bundle);
    }
  }

  return Array.from(byId.values());
}
