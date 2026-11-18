import type {
  CostManagementMetrics,
  CostManagementQuery,
  CostManagementRow,
} from "../types/costManagement.types";

const WORKFLOW_PRODUCT_ID = "product-2";

type SeedMetrics = ReturnType<typeof baseSeedMetrics>;

function baseSeedMetrics(seed: number) {
  const cost = seed * 1_247.55;
  const revenue = seed * 1_500;
  const directMargin = revenue - cost * 0.72;
  return {
    cost: cost.toFixed(2),
    unitCost: (0.28 + seed * 0.02).toFixed(2),
    revenue: revenue.toFixed(2),
    unitRevenue: (0.42 + seed * 0.01).toFixed(2),
    directMargin: directMargin.toFixed(2),
    directMarginPercent: ((directMargin / revenue) * 100).toFixed(2),
    markup: (revenue / cost).toFixed(2),
    billableConsultations: seed * 120,
    nonBillableConsultations: seed * 14,
    cacheConsultations: seed * 6,
    costVariationPercent: seed % 2 === 0 ? "8.5" : "-4.2",
    revenueVariationPercent: seed % 2 === 0 ? "6.1" : "-3.0",
    directMarginVariationPercent: "5.0",
    markupVariationPercent: "2.4",
    billableConsultationsVariationPercent: "11.2",
    nonBillableConsultationsVariationPercent: "-1.5",
    cacheConsultationsVariationPercent: "0.8",
  } satisfies CostManagementMetrics;
}

function aggregateWorkflowParent(
  parent: SeedMetrics,
  children: SeedMetrics[],
): CostManagementMetrics {
  let cost = Number(parent.cost);
  let revenue = Number(parent.revenue);
  let billableConsultations = parent.billableConsultations;
  let nonBillableConsultations = parent.nonBillableConsultations;
  let cacheConsultations = parent.cacheConsultations;

  for (const child of children) {
    cost += Number(child.cost);
    revenue += Number(child.revenue);
    billableConsultations += child.billableConsultations;
    nonBillableConsultations += child.nonBillableConsultations;
    cacheConsultations += child.cacheConsultations;
  }

  const directMargin = revenue - cost;
  return {
    cost: cost.toFixed(2),
    unitCost: billableConsultations > 0 ? (cost / billableConsultations).toFixed(4) : null,
    revenue: revenue.toFixed(2),
    unitRevenue: billableConsultations > 0 ? (revenue / billableConsultations).toFixed(4) : null,
    directMargin: directMargin.toFixed(2),
    directMarginPercent: revenue > 0 ? ((directMargin / revenue) * 100).toFixed(2) : "0",
    markup: cost > 0 ? (revenue / cost).toFixed(2) : null,
    billableConsultations,
    nonBillableConsultations,
    cacheConsultations,
    costVariationPercent: parent.costVariationPercent,
    revenueVariationPercent: parent.revenueVariationPercent,
    directMarginVariationPercent: parent.directMarginVariationPercent,
    markupVariationPercent: parent.markupVariationPercent,
    billableConsultationsVariationPercent: parent.billableConsultationsVariationPercent,
    nonBillableConsultationsVariationPercent: parent.nonBillableConsultationsVariationPercent,
    cacheConsultationsVariationPercent: parent.cacheConsultationsVariationPercent,
  };
}

const WORKFLOW_PORTAL_PARENT_ID = "deductible-wf-portal";

const WORKFLOW_CHILD_A = "deductible-wf-child-a";
const WORKFLOW_CHILD_B = "deductible-wf-child-b";
const WORKFLOW_CHILD_C = "deductible-wf-child-c";

const portalParentOwn = baseSeedMetrics(3);
const workflowChildA = baseSeedMetrics(2);
const workflowChildB = baseSeedMetrics(1);
const workflowChildC = baseSeedMetrics(2);

export function isWorkflowProductQuery(query: CostManagementQuery) {
  return query.selected.product === WORKFLOW_PRODUCT_ID;
}

export function getWorkflowParentId() {
  return WORKFLOW_PORTAL_PARENT_ID;
}

export function buildWorkflowDeductibleRows(
  contextLabel: string,
  _nextLevelClickable: boolean,
): CostManagementRow[] {
  const prefix = contextLabel ? `${contextLabel} · ` : "";

  const portalParentRow: CostManagementRow = {
    entity: {
      value: WORKFLOW_PORTAL_PARENT_ID,
      label: `${prefix}Franquia Workflow Portal`,
    },
    rowKind: "workflow_parent",
    metrics: aggregateWorkflowParent(portalParentOwn, [
      workflowChildA,
      workflowChildB,
      workflowChildC,
    ]),
    isClickable: true,
    client: null,
  };

  return [portalParentRow];
}

export function buildWorkflowChildDeductibleRows(
  contextLabel: string,
  nextLevelClickable: boolean,
): CostManagementRow[] {
  const prefix = contextLabel ? `${contextLabel} · ` : "";
  return [
    {
      entity: {
        value: WORKFLOW_CHILD_A,
        label: `${prefix}Portal — Task Service (Camunda 08h–20h)`,
      },
      rowKind: "workflow_child",
      metrics: workflowChildA,
      isClickable: nextLevelClickable,
      client: null,
    },
    {
      entity: {
        value: WORKFLOW_CHILD_B,
        label: `${prefix}Portal — Worker batch noturno`,
      },
      rowKind: "workflow_child",
      metrics: workflowChildB,
      isClickable: nextLevelClickable,
      client: null,
    },
    {
      entity: {
        value: WORKFLOW_CHILD_C,
        label: `${prefix}Portal — Listener assíncrono`,
      },
      rowKind: "workflow_child",
      metrics: workflowChildC,
      isClickable: nextLevelClickable,
      client: null,
    },
  ];
}

export function workflowEntityLabel(value: string | null | undefined) {
  if (!value) return "";
  const catalog: Record<string, string> = {
    [WORKFLOW_PORTAL_PARENT_ID]: "Franquia Workflow Portal",
    [WORKFLOW_CHILD_A]: "Portal — Task Service (Camunda 08h–20h)",
    [WORKFLOW_CHILD_B]: "Portal — Worker batch noturno",
    [WORKFLOW_CHILD_C]: "Portal — Listener assíncrono",
  };
  return catalog[value] ?? value;
}