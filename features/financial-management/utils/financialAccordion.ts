import type {
  CostManagementHierarchyLevel,
  CostManagementLevel,
  CostManagementLevelResult,
  CostManagementQuery,
  CostManagementRow,
} from "../types/costManagement.types";

export function supportsProjectsManualInvoices(hierarchy: CostManagementHierarchyLevel[]) {
  const productIndex = hierarchy.indexOf("product");
  return productIndex === 0 || (productIndex === 1 && hierarchy[0] === "client");
}

export function isManualInvoiceRow(row: Pick<CostManagementRow, "rowKind">) {
  return row.rowKind === "manual_invoice";
}

export function isFinancialRowExpandable(
  row: CostManagementRow,
  result: Pick<CostManagementLevelResult, "isLastLevel">,
) {
  if (isManualInvoiceRow(row)) return false;
  if (result.isLastLevel) return false;
  if (row.rowKind === "workflow_parent") return true;
  return row.isClickable;
}

export function isProjectsManualInvoiceDrillDown(
  hierarchy: CostManagementHierarchyLevel[],
  level: CostManagementLevel,
  row: CostManagementRow,
) {
  return (
    level === "product" &&
    row.entity.label === "Projetos" &&
    supportsProjectsManualInvoices(hierarchy)
  );
}

export function buildFinancialAccordionPanelKey(
  parentPath: Array<{ level: CostManagementLevel; value: string }> = [],
) {
  return parentPath.map(({ level, value }) => `${level}=${value}`).join("/") || "root";
}

export function getNextAccordionLevel(
  result: Pick<CostManagementLevelResult, "nextLevel" | "isLastLevel">,
) {
  return result.isLastLevel ? null : result.nextLevel;
}

export function buildAccordionChildQuery(
  query: CostManagementQuery,
  level: CostManagementLevel,
  row: CostManagementRow,
): CostManagementQuery {
  if (!row.entity.value) return query;

  if (level === "background_check_model") {
    return {
      ...query,
      backgroundCheckTemplateId: row.entity.value,
      search: "",
    };
  }

  if (level === "deductible" && row.rowKind === "workflow_parent") {
    const selected = { ...query.selected };
    if (selected.deductible === row.entity.value) {
      delete selected.deductible;
    }
    return {
      ...query,
      selected,
      workflowParentDeductibleId: row.entity.value,
      workflowChildDeductibleId: undefined,
      search: "",
    };
  }

  if (level === "workflow_child_deductible") {
    return {
      ...query,
      workflowChildDeductibleId: row.entity.value,
      workflowParentDeductibleId: undefined,
      selected: { ...query.selected, deductible: row.entity.value },
      search: "",
    };
  }

  return {
    ...query,
    selected: { ...query.selected, [level]: row.entity.value },
    search: "",
  };
}

export function resetAccordionQuery(query: CostManagementQuery): CostManagementQuery {
  return {
    ...query,
    selected: {},
    backgroundCheckTemplateId: undefined,
    workflowParentDeductibleId: undefined,
    workflowChildDeductibleId: undefined,
    search: "",
  };
}
