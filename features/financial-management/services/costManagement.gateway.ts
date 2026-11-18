import type {
  CostManagementLevelResult,
  CostManagementQuery,
  CostManagementSummary,
} from "../types/costManagement.types";
import type { FinancialFilterOption } from "../components/FinancialFilters";
import { mockCostManagementGateway } from "./mockCostManagement.gateway";

export interface CostManagementGateway {
  getSummary(query: CostManagementQuery): Promise<CostManagementSummary>;
  getLevel(query: CostManagementQuery): Promise<CostManagementLevelResult>;
  getFilterOptions(): Promise<{
    profitCenters: FinancialFilterOption[];
    tags: FinancialFilterOption[];
  }>;
}

/** Protótipo comercial — sempre mock local (layout e fluxos de staging). */
export const prototypeCostManagementGateway: CostManagementGateway = mockCostManagementGateway;