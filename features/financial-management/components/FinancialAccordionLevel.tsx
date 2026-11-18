import { Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import type { FinancialAccordionPanelState } from "../state/financialAccordion.state";
import type {
  CostManagementLevel,
  CostManagementLevelResult,
  CostManagementRow,
} from "../types/costManagement.types";
import {
  buildFinancialAccordionPanelKey,
  isFinancialRowExpandable,
  isManualInvoiceRow,
} from "../utils/financialAccordion";
import { FinancialAnalyticsTable } from "./FinancialAnalyticsTable";

const levelLabels: Record<CostManagementLevel, string> = {
  client: "Clientes",
  product: "Produtos",
  background_check_model: "Modelos Background Check",
  workflow_child_deductible: "Franquias Workflow (filhas)",
  deductible: "Franquias",
  data_source: "Fontes",
  provider: "Fornecedores",
};

interface FinancialAccordionLevelProps {
  panelKey: string;
  result: CostManagementLevelResult;
  panel: FinancialAccordionPanelState;
  panels: Record<string, FinancialAccordionPanelState>;
  showVariations: boolean;
  excludeManualInvoices?: boolean;
  onToggle: (
    row: CostManagementRow,
    childKey: string,
    level: CostManagementLevel,
    canExpand: boolean,
  ) => void;
  onClose: (childKey: string) => void;
  onSearchChange: (key: string, search: string) => void;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSortChange: (key: string, sortBy: string, sortDirection: "asc" | "desc") => void;
  onRetry: (key: string) => void;
}

function childKey(panelKey: string, level: CostManagementLevel, row: CostManagementRow) {
  return buildFinancialAccordionPanelKey([
    ...(panelKey === "root"
      ? []
      : panelKey.split("/").map((part) => {
          const [level, value] = part.split("=");
          return { level: level as CostManagementLevel, value };
        })),
    { level, value: row.entity.value ?? row.entity.label },
  ]);
}

export function FinancialAccordionLevel({
  panelKey,
  result,
  panel,
  panels,
  showVariations,
  excludeManualInvoices = false,
  onToggle,
  onClose,
  onSearchChange,
  sortBy,
  sortDirection,
  onSortChange,
  onRetry,
}: FinancialAccordionLevelProps) {
  const [sort, setSort] = useState({ sortBy, sortDirection });
  useEffect(() => setSort({ sortBy, sortDirection }), [sortBy, sortDirection]);

  const handleSortChange = (nextSortBy: string, requestedDirection: "asc" | "desc") => {
    const nextDirection =
      sort.sortBy === nextSortBy && sort.sortDirection
        ? sort.sortDirection === "asc"
          ? "desc"
          : "asc"
        : requestedDirection;
    setSort({ sortBy: nextSortBy, sortDirection: nextDirection });
    onSortChange(panelKey, nextSortBy, nextDirection);
  };

  const visibleResult = excludeManualInvoices
    ? {
        ...result,
        rows: {
          ...result.rows,
          data: result.rows.data.filter((row) => !isManualInvoiceRow(row)),
        },
      }
    : result;
  const isProjectsManualList = result.breadcrumbs.some(
    (breadcrumb) => breadcrumb.level === "product" && breadcrumb.entity.label === "Projetos",
  );

  const renderChild = (row: CostManagementRow) => {
    const key = childKey(panelKey, result.level, row);
    const child = panels[key];
    if (!child?.expanded) return null;

    return (
      <div data-testid={`accordion-child-${key}`}>
        {child.status === "loading" && !child.result ? (
          <div className="flex h-[56px] items-center justify-center">
            <Spinner label="Carregando..." color="primary" />
          </div>
        ) : null}
        {child.status === "error" ? (
          <div role="alert">
            <span>{child.error}</span>
            <button type="button" onClick={() => onRetry(key)}>
              Tentar novamente
            </button>
          </div>
        ) : null}
        {child.status === "empty" && child.result ? (
          <div className="h-[56px]">
            <p className="text-sm font-semibold text-default-700">
              {levelLabels[child.result.level]} (0 resultados)
            </p>
            <p className="pt-4 text-sm text-default-500">
              Nenhum dado encontrado para os filtros selecionados.
            </p>
          </div>
        ) : null}
        {child.result && child.status !== "empty" ? (
          <FinancialAccordionLevel
            panelKey={key}
            result={child.result}
            panel={child}
            panels={panels}
            showVariations={false}
            excludeManualInvoices={excludeManualInvoices}
            onToggle={onToggle}
            onClose={onClose}
            onSearchChange={onSearchChange}
            onSortChange={onSortChange}
            onRetry={onRetry}
          />
        ) : null}
      </div>
    );
  };

  return (
    <div data-panel-key={panelKey}>
      <FinancialAnalyticsTable
        result={visibleResult}
        search={panel.search}
        showVariations={showVariations}
        isLoading={panel.status === "loading"}
        panelMode
        isProjectsManualList={isProjectsManualList}
        sortBy={sort.sortBy}
        sortDirection={sort.sortDirection}
        isRowExpanded={(row) => Boolean(panels[childKey(panelKey, result.level, row)]?.expanded)}
        onSearchChange={(search) => onSearchChange(panelKey, search)}
        onSortChange={handleSortChange}
        onPageChange={() => undefined}
        onDrillDown={() => undefined}
        onExpandedChange={(key, expanded) => {
          const row = result.rows.data.find(
            (candidate) => (candidate.entity.value ?? candidate.entity.label) === key,
          );
          if (row && expanded)
            onToggle(
              row,
              childKey(panelKey, result.level, row),
              result.level,
              isFinancialRowExpandable(row, result),
            );
          if (row && !expanded) onClose(childKey(panelKey, result.level, row));
        }}
        expandedContent={renderChild}
        onBreadcrumbClick={() => undefined}
      />
    </div>
  );
}
