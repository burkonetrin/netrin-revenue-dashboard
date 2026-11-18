import { Spinner } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { useFinancialAccordion } from "../hooks/useFinancialAccordion";
import type { CostManagementGateway } from "../services/costManagement.gateway";
import type { CostManagementLevel, CostManagementQuery } from "../types/costManagement.types";
import {
  buildAccordionChildQuery,
  isManualInvoiceRow,
  supportsProjectsManualInvoices,
} from "../utils/financialAccordion";
import { getWorkflowParentId } from "../services/workflowFranchiseMock";
import { FinancialAccordionLevel } from "./FinancialAccordionLevel";

export function FinancialAccordionTable({
  gateway,
  query,
  onBackgroundCheckTemplateChange,
}: {
  gateway: CostManagementGateway;
  query: CostManagementQuery;
  onBackgroundCheckTemplateChange?: (
    context: Pick<CostManagementQuery, "selected" | "backgroundCheckTemplateId"> | undefined,
  ) => void;
}) {
  const controller = useFinancialAccordion(gateway, query);
  const root = controller.state.panels.root;
  const [rootSort, setRootSort] = useState({
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
  });
  const backgroundCheckBranch = useRef<{
    modelPanelKey: string;
    productPanelKey: string | null;
  } | null>(null);

  useEffect(() => {
    setRootSort({ sortBy: query.sortBy, sortDirection: query.sortDirection });
  }, [query.sortBy, query.sortDirection]);

  if (root.status === "loading" && !root.result) {
    return (
      <div className="flex min-h-[260px] items-center justify-center">
        <Spinner label="Carregando..." color="primary" />
      </div>
    );
  }
  if (root.status === "error" && !root.result) {
    return (
      <div role="alert">
        <span>{root.error}</span>
        <button type="button" onClick={() => controller.retry("root")}>
          Tentar novamente
        </button>
      </div>
    );
  }
  if (!root.result) return null;

  const excludeManualInvoices = !supportsProjectsManualInvoices(query.hierarchy);
  const rootResult = excludeManualInvoices
    ? {
        ...root.result,
        rows: {
          ...root.result.rows,
          data: root.result.rows.data.filter((row) => !isManualInvoiceRow(row)),
        },
      }
    : root.result;

  return (
    <FinancialAccordionLevel
      panelKey="root"
      result={rootResult}
      panel={root}
      panels={controller.state.panels}
      showVariations
      excludeManualInvoices={excludeManualInvoices}
      onSearchChange={controller.setSearch}
      sortBy={rootSort.sortBy}
      sortDirection={rootSort.sortDirection}
      onSortChange={(key, sortBy, sortDirection) => {
        if (key === "root") {
          const nextDirection =
            rootSort.sortBy === sortBy && rootSort.sortDirection
              ? rootSort.sortDirection === "asc"
                ? "desc"
                : "asc"
              : sortDirection;
          setRootSort({ sortBy, sortDirection: nextDirection });
          backgroundCheckBranch.current = null;
          onBackgroundCheckTemplateChange?.(undefined);
          controller.reset({ ...query, sortBy, sortDirection: nextDirection });
        } else {
          controller.setSort(key, sortBy, sortDirection);
        }
      }}
      onRetry={controller.retry}
      onClose={(key) => {
        controller.closePanel(key);
        const branch = backgroundCheckBranch.current;
        if (branch && (key === branch.modelPanelKey || key === branch.productPanelKey)) {
          backgroundCheckBranch.current = null;
          onBackgroundCheckTemplateChange?.(undefined);
        } else if (
          branch &&
          key
            .split("/")
            .includes(`background_check_model=${branch.modelPanelKey.split("=").at(-1)}`)
        ) {
          const parentSelected: CostManagementQuery["selected"] = {};
          for (const part of key.split("/").slice(0, -1)) {
            const separator = part.indexOf("=");
            if (separator < 0) continue;
            const pathLevel = part.slice(0, separator) as CostManagementLevel;
            if (pathLevel !== "background_check_model") {
              parentSelected[pathLevel as keyof CostManagementQuery["selected"]] = part.slice(
                separator + 1,
              );
            }
          }
          onBackgroundCheckTemplateChange?.({
            selected: parentSelected,
            backgroundCheckTemplateId: branch.modelPanelKey.split("=").at(-1),
          });
        }
      }}
      onToggle={(row, key, level, canExpand) => {
        const isUnsupportedProjectsRow =
          level === "product" &&
          row.entity.label === "Projetos" &&
          !supportsProjectsManualInvoices(query.hierarchy);
        if (!canExpand || isUnsupportedProjectsRow) return;
        const selected: CostManagementQuery["selected"] = {};
        let backgroundCheckTemplateId = query.backgroundCheckTemplateId;
        let workflowParentDeductibleId = query.workflowParentDeductibleId;
        let workflowChildDeductibleId = query.workflowChildDeductibleId;
        const path = key === "root" ? [] : key.split("/");
        for (const part of path) {
          const separator = part.indexOf("=");
          if (separator < 0) continue;
          const pathLevel = part.slice(0, separator) as CostManagementLevel;
          const value = part.slice(separator + 1);
          if (pathLevel === "background_check_model") {
            backgroundCheckTemplateId = value;
          } else if (pathLevel === "deductible" && value === getWorkflowParentId()) {
            workflowParentDeductibleId = value;
          } else if (pathLevel === "workflow_child_deductible") {
            workflowChildDeductibleId = value;
          } else {
            selected[pathLevel as keyof CostManagementQuery["selected"]] = value;
          }
        }
        const childQuery = buildAccordionChildQuery(
          {
            ...query,
            selected,
            backgroundCheckTemplateId,
            workflowParentDeductibleId,
            workflowChildDeductibleId,
          },
          level,
          row,
        );
        if (level === "background_check_model" && row.entity.value) {
          const productPanelKey = path.find((part) => part.startsWith("product=")) ?? null;
          backgroundCheckBranch.current = {
            modelPanelKey: key,
            productPanelKey,
          };
          onBackgroundCheckTemplateChange?.({
            selected: childQuery.selected,
            backgroundCheckTemplateId: childQuery.backgroundCheckTemplateId,
          });
        } else if (backgroundCheckBranch.current) {
          onBackgroundCheckTemplateChange?.({
            selected: childQuery.selected,
            backgroundCheckTemplateId: childQuery.backgroundCheckTemplateId,
          });
        }
        const parentKey = key.split("/").slice(0, -1).join("/") || "root";
        controller.openPanel(key, parentKey, childQuery, true);
      }}
    />
  );
}
