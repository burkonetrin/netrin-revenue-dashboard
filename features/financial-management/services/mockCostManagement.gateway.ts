import type {
  CostManagementHierarchyLevel,
  CostManagementLevel,
  CostManagementLevelResult,
  CostManagementMetrics,
  CostManagementQuery,
  CostManagementRow,
  CostManagementSummary,
} from "../types/costManagement.types";
import {
  apiProducaoBackgroundCheckLabel,
  buildApiProducaoBackgroundCheckRow,
} from "./apiProducaoBackgroundCheckMock";
import {
  buildWorkflowChildDeductibleRows,
  buildWorkflowDeductibleRows,
  isWorkflowProductQuery,
  workflowEntityLabel,
} from "./workflowFranchiseMock";

const MOCK_MANUAL_INVOICE_REVENUE = "200.00";

type EntityRef = { value: string; label: string };

const CLIENTS: EntityRef[] = [
  { value: "client-1", label: "Banco Horizonte S.A." },
  { value: "client-2", label: "Cooperativa de Crédito Jatobá" },
  { value: "client-3", label: "Fênix Pagamentos e Tecnologia" },
  { value: "client-4", label: "Cerrado Agroindustrial Ltda." },
  { value: "client-5", label: "Delta Corretora de Seguros" },
  { value: "client-6", label: "Inova Factoring S.A." },
  { value: "client-7", label: "Litoral Energia Participações" },
  { value: "client-8", label: "Magma Indústria e Comércio" },
  { value: "client-9", label: "Kora Health Operadora" },
  { value: "client-10", label: "Pine Investimentos" },
  { value: "client-11", label: "Alpha FIDC Multiestratégia" },
  { value: "client-12", label: "Netrin Labs (uso interno)" },
];

const PRODUCTS: EntityRef[] = [
  { value: "product-1", label: "Background Check" },
  { value: "product-2", label: "Workflow" },
  { value: "product-3", label: "Projetos" },
  { value: "product-4", label: "IDV" },
  { value: "product-5", label: "Consulta composta" },
  { value: "product-6", label: "Monitoramento contínuo" },
  { value: "product-adjusted", label: "Background Check — faturamento ajustado" },
  { value: "product-minimum", label: "Workflow — mínimo contratual" },
];

const BACKGROUND_CHECK_MODELS: EntityRef[] = [
  { value: "template-7d8c", label: "PF — cadastro completo" },
  { value: "template-pj-standard", label: "PJ — due diligence padrão" },
  { value: "template-pj-plus", label: "PJ — due diligence ampliada" },
  { value: "template-onboarding", label: "Onboarding digital — KYC simplificado" },
  { value: "template-compliance", label: "Compliance — PLD e listas restritivas" },
];

const DATA_SOURCES: EntityRef[] = [
  { value: "data_source-1", label: "Receita Federal — CPF/CNPJ" },
  { value: "data_source-2", label: "Serasa Experian — restritivos" },
  { value: "data_source-3", label: "Boa Vista — SCPC" },
  { value: "data_source-4", label: "Quod — score e renda" },
  { value: "data_source-5", label: "Infosimples — certidões" },
  { value: "data_source-6", label: "JusBrasil — processos judiciais" },
  { value: "data_source-7", label: "TJSP — certidões cíveis" },
  { value: "data_source-8", label: "Base proprietária Netrin" },
];

const PROVIDERS: EntityRef[] = [
  { value: "provider-1", label: "Serasa Experian (contrato direto)" },
  { value: "provider-2", label: "Neoway Soluções" },
  { value: "provider-3", label: "Boa Vista Serviços" },
  { value: "provider-4", label: "BigData Corp" },
  { value: "provider-5", label: "Fornecedor regional — certidões" },
  { value: "provider-6", label: "Rateio custo indireto (SAP)" },
];

const ENTITY_LABEL_BY_VALUE = new Map<string, string>([
  ...CLIENTS,
  ...PRODUCTS,
  ...BACKGROUND_CHECK_MODELS,
  ...DATA_SOURCES,
  ...PROVIDERS,
].map((entity) => [entity.value, entity.label]));

function franchisesForQuery(query: CostManagementQuery): EntityRef[] {
  const clientName = labelFor(query.selected.client);
  const productName = labelFor(query.selected.product);
  const clientPrefix = clientName ? `${clientName} · ` : "";
  const productSuffix = productName ? ` (${productName})` : "";

  return [
    { value: "deductible-1", label: `${clientPrefix}API — produção${productSuffix}` },
    { value: "deductible-2", label: `${clientPrefix}Portal — operações${productSuffix}` },
    { value: "deductible-3", label: `${clientPrefix}Contrato 1847 — pacote nacional${productSuffix}` },
    { value: "deductible-4", label: `${clientPrefix}Contrato 2910 — filial Sudeste${productSuffix}` },
    { value: "deductible-5", label: `${clientPrefix}Homologação — ambiente restrito${productSuffix}` },
    { value: "deductible-6", label: `${clientPrefix}Sandbox — integração parceiros${productSuffix}` },
    { value: "deductible-7", label: `${clientPrefix}Centro de custo NL10801004${productSuffix}` },
    { value: "deductible-8", label: `${clientPrefix}Centro de custo NL10801016${productSuffix}` },
  ];
}

function dataSourcesForQuery(query: CostManagementQuery): EntityRef[] {
  const franchiseName = query.selected.deductible
    ? entityLabel("deductible", query.selected.deductible, query)
    : "";
  if (!franchiseName) return DATA_SOURCES;

  const shortFranchise = franchiseName.includes("·")
    ? franchiseName.split("·").at(-1)?.trim() ?? franchiseName
    : franchiseName;

  return DATA_SOURCES.map((source, index) => ({
    value: source.value,
    label:
      index < 3
        ? `${source.label} — ${shortFranchise}`
        : source.label,
  }));
}

function catalogForLevel(
  level: CostManagementHierarchyLevel,
  query: CostManagementQuery,
): EntityRef[] {
  switch (level) {
    case "client":
      return CLIENTS;
    case "product":
      if (query.hierarchy[0] === "product") return PRODUCTS;
      return PRODUCTS.filter(
        (product) => product.value !== "product-adjusted" && product.value !== "product-minimum",
      );
    case "deductible":
      return franchisesForQuery(query);
    case "data_source":
      return dataSourcesForQuery(query);
    case "provider":
      return PROVIDERS;
    default:
      return [];
  }
}

function labelFor(value: string | null | undefined) {
  if (!value) return "";
  return ENTITY_LABEL_BY_VALUE.get(value) ?? value;
}

function entityLabel(
  level: CostManagementHierarchyLevel,
  value: string | null | undefined,
  query?: CostManagementQuery,
) {
  if (!value) return "";

  if (query) {
  if (level === "deductible") {
    const apiProducaoLabel = apiProducaoBackgroundCheckLabel(value);
    if (apiProducaoLabel) return apiProducaoLabel;
    const workflowLabel = workflowEntityLabel(value);
    if (workflowLabel !== value) return workflowLabel;
    const franchise = franchisesForQuery(query).find((item) => item.value === value);
    if (franchise) return franchise.label;
  }
    if (level === "data_source") {
      const source = dataSourcesForQuery(query).find((item) => item.value === value);
      if (source) return source.label;
    }
  }

  return ENTITY_LABEL_BY_VALUE.get(value) ?? value;
}

const BACKGROUND_CHECK_PRODUCT_IDS = new Set(
  PRODUCTS.filter((product) => product.label.startsWith("Background Check")).map(
    (product) => product.value,
  ),
);

function isBackgroundCheckProduct(query: CostManagementQuery) {
  const productId = query.selected.product;
  if (!productId) return false;
  if (BACKGROUND_CHECK_PRODUCT_IDS.has(productId)) return true;
  return labelFor(productId).startsWith("Background Check");
}

function selectedHierarchyLevel(query: CostManagementQuery): CostManagementHierarchyLevel {
  return (
    query.hierarchy.find((level) => !query.selected[level]) ?? query.hierarchy.at(-1) ?? "client"
  );
}

function resolveLevel(query: CostManagementQuery): {
  level: CostManagementLevel;
  nextLevel: CostManagementLevel | null;
} {
  if (query.selected.client && query.selected.product && isBackgroundCheckProduct(query)) {
    if (!query.backgroundCheckTemplateId) {
      return { level: "background_check_model", nextLevel: "deductible" };
    }
  }

  if (
    isWorkflowProductQuery(query) &&
    query.workflowParentDeductibleId &&
    !query.selected.deductible
  ) {
    const deductibleIndex = query.hierarchy.indexOf("deductible");
    return {
      level: "workflow_child_deductible",
      nextLevel: query.hierarchy[deductibleIndex + 1] ?? null,
    };
  }

  const hierarchyLevel = selectedHierarchyLevel(query);
  const hierarchyIndex = query.hierarchy.indexOf(hierarchyLevel);
  const nextHierarchy = query.hierarchy[hierarchyIndex + 1] ?? null;

  return {
    level: hierarchyLevel,
    nextLevel: nextHierarchy,
  };
}

const metrics = (seed: number, defaultCost: string | null = null): CostManagementMetrics => ({
  cost: `${(seed * 1_247.55).toFixed(2)}`,
  unitCost: (0.28 + seed * 0.02).toFixed(2),
  revenue: `${(seed * 1_500).toFixed(2)}`,
  unitRevenue: "0.45",
  directMargin: `${(seed * 500).toFixed(2)}`,
  directMarginPercent: "33.33",
  markup: "1.50",
  billableConsultations: seed * 100,
  nonBillableConsultations: seed * 10,
  cacheConsultations: seed * 5,
  defaultCost,
  costVariationPercent: seed === 2 ? "-10" : seed === 3 ? null : "10",
  revenueVariationPercent: seed === 2 ? "-10" : seed === 3 ? null : "10",
  directMarginVariationPercent: seed === 2 ? "-10" : seed === 3 ? null : "10",
  markupVariationPercent: seed === 2 ? "-10" : seed === 3 ? null : "10",
  billableConsultationsVariationPercent: seed === 2 ? "-10" : seed === 3 ? null : "10",
  nonBillableConsultationsVariationPercent: seed === 2 ? "-10" : seed === 3 ? null : "10",
  cacheConsultationsVariationPercent: seed === 2 ? "-10" : seed === 3 ? null : "10",
});

function manualMetrics(revenue: string): CostManagementMetrics {
  return {
    cost: "0.00",
    revenue,
    unitCost: null,
    unitRevenue: null,
    directMargin: null,
    directMarginPercent: null,
    markup: null,
    billableConsultations: 0,
    nonBillableConsultations: 0,
    cacheConsultations: 0,
    defaultCost: null,
    costVariationPercent: null,
    revenueVariationPercent: null,
    directMarginVariationPercent: null,
    markupVariationPercent: null,
    billableConsultationsVariationPercent: null,
    nonBillableConsultationsVariationPercent: null,
    cacheConsultationsVariationPercent: null,
  };
}

function manualRow(
  id: string,
  revenue: string,
  client: CostManagementRow["client"],
): CostManagementRow {
  return {
    entity: { value: id, label: "Fatura manual" },
    rowKind: "manual_invoice",
    metrics: manualMetrics(revenue),
    isClickable: false,
    client,
  };
}

function getProjectManualRows(query: CostManagementQuery): CostManagementRow[] {
  const clientFilter = query.selected.client;
  const rows = [
    manualRow("manual-project-1", "1000000.00", {
      value: "client-1",
      label: entityLabel("client", "client-1"),
    }),
    manualRow("manual-project-2", "850000.00", {
      value: "client-2",
      label: entityLabel("client", "client-2"),
    }),
    manualRow("manual-project-3", "725000.00", {
      value: "client-5",
      label: entityLabel("client", "client-5"),
    }),
    manualRow("manual-project-4", "410000.00", {
      value: "client-8",
      label: entityLabel("client", "client-8"),
    }),
  ];
  return clientFilter ? rows.filter((row) => row.client?.value === clientFilter) : rows;
}

function getFranchiseRevenueRows(query: CostManagementQuery): CostManagementRow[] | null {
  const productId = query.selected.product;
  if (productId === "product-adjusted") {
    return franchisesForQuery(query)
      .slice(0, 4)
      .map((entity, index) => ({
        entity,
        rowKind: "entity",
        metrics: { ...metrics(index + 1), revenue: `${(1_100 + index * 90).toFixed(2)}` },
        isClickable: false,
        client: null,
      }));
  }
  if (productId === "product-minimum") {
    return franchisesForQuery(query)
      .slice(0, 4)
      .map((entity, index) => ({
        entity,
        rowKind: "entity",
        metrics: { ...metrics(index + 1), revenue: `${(850 + index * 55).toFixed(2)}` },
        isClickable: false,
        client: null,
      }));
  }
  return null;
}

function getBackgroundCheckModelRows(nextLevel: CostManagementLevel | null): CostManagementRow[] {
  return BACKGROUND_CHECK_MODELS.map((model, index) => ({
    entity: model,
    rowKind: "entity",
    metrics: metrics(index + 1),
    isClickable: Boolean(nextLevel),
    client: null,
  }));
}

function getRowsForLevel(
  level: CostManagementLevel,
  nextLevel: CostManagementLevel | null,
  query: CostManagementQuery,
) {
  if (level === "background_check_model") {
    return getBackgroundCheckModelRows(nextLevel);
  }

  if (level === "workflow_child_deductible") {
    const clientName = labelFor(query.selected.client);
    const productName = labelFor(query.selected.product);
    const context = [clientName, productName].filter(Boolean).join(" — ");
    return buildWorkflowChildDeductibleRows(context, Boolean(nextLevel));
  }

  const hierarchyLevel = level as CostManagementHierarchyLevel;
  const entities = catalogForLevel(hierarchyLevel, query);
  const sourceRows = entities.map((entity, index) =>
    buildEntityRow(entity, index, hierarchyLevel, nextLevel, query),
  );

  if (hierarchyLevel === "deductible") {
    const franchiseRows = getFranchiseRevenueRows(query);
    if (franchiseRows) return franchiseRows;
    if (query.selected.product === "product-3") return getProjectManualRows(query);
    if (query.selected.product === "product-1") {
      const clientName = labelFor(query.selected.client);
      const productName = labelFor(query.selected.product);
      const context = [clientName, productName].filter(Boolean).join(" — ");
      const franchisesWithoutApiProducaoGenerica = sourceRows.filter(
        (row) => row.entity.value !== "deductible-1",
      );
      const apiProducaoRow = buildApiProducaoBackgroundCheckRow(context, Boolean(nextLevel));
      return [apiProducaoRow, ...franchisesWithoutApiProducaoGenerica];
    }
    if (isWorkflowProductQuery(query)) {
      const clientName = labelFor(query.selected.client);
      const productName = labelFor(query.selected.product);
      const context = [clientName, productName].filter(Boolean).join(" — ");
      return buildWorkflowDeductibleRows(context, Boolean(nextLevel));
    }
  }

  return sourceRows;
}

function buildEntityRow(
  entity: EntityRef,
  index: number,
  hierarchyLevel: CostManagementHierarchyLevel,
  nextLevel: CostManagementLevel | null,
  query: CostManagementQuery,
): CostManagementRow {
  const seed = index + 1;
  const isClientWithManualRevenue =
    hierarchyLevel === "client" &&
    query.hierarchy[0] === "client" &&
    query.hierarchy[1] !== "product" &&
    entity.value === "client-1";

  return {
    entity,
    rowKind: "entity",
    metrics: isClientWithManualRevenue
      ? {
          ...metrics(seed),
          revenue: "1700.00",
          manualInvoiceRevenue: MOCK_MANUAL_INVOICE_REVENUE,
        }
      : metrics(seed, hierarchyLevel === "data_source" ? `${(seed * 0.25).toFixed(2)}` : null),
    isClickable: Boolean(nextLevel),
    client:
      hierarchyLevel === "product" && query.selected.client
        ? { value: query.selected.client, label: entityLabel("client", query.selected.client, query) }
        : null,
  };
}

function filterRows(rows: CostManagementRow[], search: string) {
  if (search === "__empty__") return [];
  const term = search.trim().toLowerCase();
  if (!term) return rows;
  return rows.filter((row) => row.entity.label.toLowerCase().includes(term));
}

function sortRows(rows: CostManagementRow[], query: CostManagementQuery) {
  if (!query.sortBy) return rows;

  const direction = query.sortDirection === "desc" ? -1 : 1;
  return [...rows].sort(
    (left, right) =>
      direction * Number(left.metrics[query.sortBy as keyof CostManagementMetrics] ?? 0) -
      direction * Number(right.metrics[query.sortBy as keyof CostManagementMetrics] ?? 0),
  );
}

function sumTotals(rows: CostManagementRow[]): CostManagementMetrics {
  let cost = 0;
  let revenue = 0;
  let directMargin = 0;
  let billableConsultations = 0;
  let nonBillableConsultations = 0;
  let cacheConsultations = 0;
  let manualInvoiceRevenue = 0;

  for (const row of rows) {
    cost += Number(row.metrics.cost);
    revenue += Number(row.metrics.revenue ?? 0);
    directMargin += Number(row.metrics.directMargin ?? 0);
    billableConsultations += row.metrics.billableConsultations;
    nonBillableConsultations += row.metrics.nonBillableConsultations;
    cacheConsultations += row.metrics.cacheConsultations;
    if (row.metrics.manualInvoiceRevenue) {
      manualInvoiceRevenue += Number(row.metrics.manualInvoiceRevenue);
    }
  }

  const totals: CostManagementMetrics = {
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
    defaultCost: null,
    costVariationPercent: "6.8",
    revenueVariationPercent: "9.2",
    directMarginVariationPercent: "4.5",
    markupVariationPercent: "3.1",
    billableConsultationsVariationPercent: "11.0",
    nonBillableConsultationsVariationPercent: "-2.4",
    cacheConsultationsVariationPercent: "1.8",
  };

  if (manualInvoiceRevenue > 0) {
    totals.manualInvoiceRevenue = manualInvoiceRevenue.toFixed(2);
  }

  return totals;
}

function getBreadcrumbs(query: CostManagementQuery) {
  const crumbs = query.hierarchy
    .filter((item) => query.selected[item])
    .map((item) => {
      const value = query.selected[item] ?? null;
      return {
        level: item as CostManagementLevel,
        entity: { value, label: entityLabel(item, value, query) },
      };
    });

  if (query.backgroundCheckTemplateId) {
    const modelLabel =
      BACKGROUND_CHECK_MODELS.find((model) => model.value === query.backgroundCheckTemplateId)
        ?.label ?? query.backgroundCheckTemplateId;
    crumbs.push({
      level: "background_check_model",
      entity: {
        value: query.backgroundCheckTemplateId,
        label: modelLabel,
      },
    });
  }

  return crumbs;
}

export const mockCostManagementGateway = {
  async getFilterOptions() {
    return {
      profitCenters: [
        { id: "pc-retail", label: "Varejo nacional" },
        { id: "pc-enterprise", label: "Empresas estratégicas" },
        { id: "pc-fintech", label: "Fintechs parceiras" },
        { id: "pc-public", label: "Setor público" },
        { id: "pc-agro", label: "Agro e cooperativas" },
        { id: "pc-health", label: "Saúde e benefícios" },
      ],
      tags: [
        { id: "tag-priority", label: "Prioridade" },
        { id: "tag-credit", label: "Crédito" },
        { id: "tag-onboarding", label: "Onboarding" },
        { id: "tag-churn-risk", label: "Risco de churn" },
        { id: "tag-premium", label: "Premium" },
        { id: "tag-indirect", label: "Custo indireto" },
      ],
    };
  },

  async getSummary(query: CostManagementQuery): Promise<CostManagementSummary> {
    if (query.search === "__error__") throw new Error("Falha ao carregar gestão financeira");

    return {
      referenceMonth: query.referenceMonth,
      hierarchy: query.hierarchy,
      totals: {
        ...metrics(1),
        revenue: "1700.00",
        manualInvoiceRevenue: MOCK_MANUAL_INVOICE_REVENUE,
      },
      indirectProviderCost: "48250.75",
      indirectProviderCostNote:
        "Este valor já foi rateado entre os fornecedores diretos e está incluído no custo total.",
      indirectProviderCostVariationPercent: "7.5",
      unallocatedIndirectProviderCost: "1250.00",
    };
  },

  async getLevel(query: CostManagementQuery): Promise<CostManagementLevelResult> {
    if (query.search === "__error__") throw new Error("Falha ao carregar gestão financeira");

    const { level, nextLevel } = resolveLevel(query);
    const rows = getRowsForLevel(level, nextLevel, query);
    const sortedRows = sortRows(filterRows(rows, query.search), query);

    return {
      level,
      nextLevel,
      isLastLevel: nextLevel === null,
      breadcrumbs: getBreadcrumbs(query),
      totals: sumTotals(sortedRows),
      rows: {
        data: sortedRows,
        pagination: {
          page: 1,
          pageSize: sortedRows.length,
          totalPages: 1,
          totalRecords: sortedRows.length,
          hasNext: false,
          hasPrevious: false,
        },
      },
    };
  },
};