/**
 * Pacote de fontes vinculado à franquia (detalhado).
 */
export interface DeductibleLinkedBundle {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload para vincular fontes à franquia.
 */
export interface AssignDeductibleDataSourcesRequest {
  dataSourceIds: string[];
}

/**
 * Item de pacote de fontes a vincular.
 */
export interface DeductibleBundleAssignItem {
  dataSourceBundleId: string;
  syncWithDeductible: boolean;
}

/**
 * Payload para vincular pacotes de fontes.
 */
export interface AssignDeductibleBundlesRequest {
  items: DeductibleBundleAssignItem[];
}

/**
 * Payload para remover pacotes de fontes.
 */
export interface RemoveDeductibleBundlesRequest {
  items: DeductibleBundleAssignItem[];
}

/**
 * Fonte selecionável no passo de fontes da franquia.
 */
export interface FranchiseSourceItem {
  id: string;
  name: string;
}

/**
 * Estado do passo de fontes na criação de franquia.
 */
export interface FranchiseSourcesStepState {
  selectedBundleIds: string[];
  selectedSources: FranchiseSourceItem[];
}

/**
 * Snapshot de fontes selecionadas da franquia.
 */
export interface DeductibleSourcesSnapshot {
  bundleIds: string[];
  dataSourceIds: string[];
}

/**
 * Estado inicial do passo de fontes.
 */
export const INITIAL_SOURCES_STEP_STATE: FranchiseSourcesStepState = {
  selectedBundleIds: [],
  selectedSources: [],
};

/**
 * Snapshot inicial vazio de fontes.
 */
export const INITIAL_SOURCES_SNAPSHOT: DeductibleSourcesSnapshot = {
  bundleIds: [],
  dataSourceIds: [],
};
