import { parseReferenceCost } from "@/features/background-check-templates-preview/utils/referenceCost";
import type { SourceGroupFormSource } from "../types/data-source-bundles.types";
import type { DataSource } from "../types/data-sources.types";

export function toSourceGroupFormSourceFromDataSource(
  source: Pick<DataSource, "id" | "name" | "referenceCost" | "defaultCost">,
): SourceGroupFormSource {
  const parsed = parseReferenceCost(source.referenceCost);
  const referenceCost = parsed ?? source.defaultCost ?? 0;
  return {
    id: source.id,
    name: source.name,
    referenceCost,
    realCost: referenceCost,
  };
}
