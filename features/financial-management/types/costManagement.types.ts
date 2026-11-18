import type { PaginationInfo } from "@/shared/types/pagination.types";

export const COST_MANAGEMENT_LEVELS = [
  "client",
  "product",
  "deductible",
  "data_source",
  "provider",
] as const;

export type CostManagementHierarchyLevel = (typeof COST_MANAGEMENT_LEVELS)[number];
export type CostManagementLevel =
  | CostManagementHierarchyLevel
  | "background_check_model"
  | "workflow_child_deductible";

export interface CostManagementWorkflowMetricSplit {
  cost: string;
  revenue: string;
  billableConsultations: number;
  nonBillableConsultations: number;
  cacheConsultations: number;
}

export interface CostManagementWorkflowSplit {
  withWorkflow: CostManagementWorkflowMetricSplit;
  withoutWorkflow: CostManagementWorkflowMetricSplit;
}

export interface CostManagementEntityRef {
  value: string | null;
  label: string;
}

export interface CostManagementMetrics {
  cost: string;
  unitCost?: string | null;
  revenue?: string | null;
  unitRevenue?: string | null;
  manualInvoiceRevenue?: string | null;
  directMargin?: string | null;
  directMarginPercent?: string | null;
  markup?: string | null;
  billableConsultations: number;
  nonBillableConsultations: number;
  cacheConsultations: number;
  defaultCost?: string | null;
  costVariationPercent?: string | null;
  revenueVariationPercent?: string | null;
  directMarginVariationPercent?: string | null;
  markupVariationPercent?: string | null;
  billableConsultationsVariationPercent?: string | null;
  nonBillableConsultationsVariationPercent?: string | null;
  cacheConsultationsVariationPercent?: string | null;
}

export interface CostManagementRow {
  entity: CostManagementEntityRef;
  metrics: CostManagementMetrics;
  rowKind?: string;
  workflowSplit?: CostManagementWorkflowSplit;
  isClickable: boolean;
  client: CostManagementEntityRef | null;
}

export interface CostManagementBreadcrumb {
  level: CostManagementLevel;
  entity: CostManagementEntityRef;
}

export interface CostManagementSummary {
  referenceMonth: string;
  hierarchy: CostManagementHierarchyLevel[];
  totals: CostManagementMetrics;
  indirectProviderCost: string;
  indirectProviderCostNote: string;
  indirectProviderCostVariationPercent?: string | null;
  unallocatedIndirectProviderCost?: string | null;
}

export interface CostManagementLevelResult {
  level: CostManagementLevel;
  nextLevel: CostManagementLevel | null;
  isLastLevel: boolean;
  breadcrumbs: CostManagementBreadcrumb[];
  totals: CostManagementMetrics;
  rows: {
    data: CostManagementRow[];
    pagination: PaginationInfo;
  };
}

export interface CostManagementQuery {
  referenceMonth: string;
  hierarchy: CostManagementHierarchyLevel[];
  selected: Partial<Record<CostManagementHierarchyLevel, string>>;
  backgroundCheckTemplateId?: string;
  workflowParentDeductibleId?: string;
  workflowChildDeductibleId?: string;
  profitCenterIds: string[];
  tagIds: string[];
  search: string;
  costType?: "reference" | "real";
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export function createInitialCostManagementQuery(now = new Date()): CostManagementQuery {
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const referenceMonth = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, "0")}-01`;

  return {
    referenceMonth,
    hierarchy: [...COST_MANAGEMENT_LEVELS],
    selected: {},
    profitCenterIds: [],
    tagIds: [],
    search: "",
    costType: "reference",
  };
}
