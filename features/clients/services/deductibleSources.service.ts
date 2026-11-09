import type { DataSource } from "@/features/providers/types/data-sources.types";
import { getDeductibleLinkedSourcesMock } from "./deductibleMock.service";
import type {
  AssignDeductibleBundlesRequest,
  AssignDeductibleDataSourcesRequest,
  DeductibleLinkedBundle,
  RemoveDeductibleBundlesRequest,
} from "../types/deductible-sources.types";

/**
 * Lista fontes vinculadas à franquia.
 */
export async function getDeductibleLinkedDataSources(
  deductibleId: string,
): Promise<DataSource[]> {
  const { individualSources } = await getDeductibleLinkedSourcesMock(deductibleId);
  return individualSources as DataSource[];
}

/**
 * Lista pacotes de fontes vinculados à franquia.
 */
export async function getDeductibleLinkedBundles(
  deductibleId: string,
): Promise<DeductibleLinkedBundle[]> {
  return getDeductibleLinkedSourcesMock(deductibleId).then(({ bundles }) => bundles);
}

/**
 * Vincula fontes à franquia.
 */
export async function assignDeductibleDataSources(
  _deductibleId: string,
  _data: AssignDeductibleDataSourcesRequest,
): Promise<void> {
  return;
}

/**
 * Remove fontes da franquia.
 */
export async function removeDeductibleDataSources(
  _deductibleId: string,
  _data: AssignDeductibleDataSourcesRequest,
): Promise<void> {
  return;
}

/**
 * Vincula pacotes de fontes à franquia.
 */
export async function assignDeductibleBundles(
  _deductibleId: string,
  _data: AssignDeductibleBundlesRequest,
): Promise<void> {
  return;
}

/**
 * Remove pacotes de fontes da franquia.
 */
export async function removeDeductibleBundles(
  _deductibleId: string,
  _data: RemoveDeductibleBundlesRequest,
): Promise<void> {
  return;
}

/**
 * Chave de cache das fontes da franquia.
 */
export const deductibleLinkedSourcesQueryKey = (deductibleId: string) =>
  ["deductible", deductibleId, "linked-data-sources"] as const;

/**
 * Chave de cache dos pacotes da franquia.
 */
export const deductibleLinkedBundlesQueryKey = (deductibleId: string) =>
  ["deductible", deductibleId, "linked-data-source-bundles"] as const;
