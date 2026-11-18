import { DynamicTable } from "@/shared/components/DynamicTable";
import { TableListFooter } from "@/shared/components/table/TableListFooter";
import { Input, Spinner } from "@heroui/react";
import { ChevronRight, Search } from "lucide-react";
import type { ReactNode } from "react";
import type {
  CostManagementBreadcrumb,
  CostManagementLevelResult,
  CostManagementRow,
} from "../types/costManagement.types";
import { isFinancialRowExpandable } from "../utils/financialAccordion";
import {
  buildTableRows,
  financialLevelLabels,
  getFinancialColumns,
  getProjectsManualColumns,
  isDrillableRow,
  type FinancialTableRow,
} from "./financialAnalyticsTable.helpers";

interface FinancialAnalyticsTableProps {
  result: CostManagementLevelResult;
  search: string;
  showVariations: boolean;
  isLoading?: boolean;
  onSearchChange: (search: string) => void;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSortChange: (sortBy: string, sortDirection: "asc" | "desc") => void;
  onPageChange: (page: number) => void;
  onDrillDown: (row: CostManagementRow) => void;
  onBreadcrumbClick: (index: number) => void;
  isProjectsManualList?: boolean;
  panelMode?: boolean;
  isRowExpanded?: (row: CostManagementRow) => boolean;
  expandedContent?: (row: CostManagementRow) => ReactNode;
  onExpandedChange?: (key: string | number, expanded: boolean) => void;
}

export function FinancialAnalyticsTable({
  result,
  search,
  showVariations,
  isLoading,
  onSearchChange,
  sortBy,
  sortDirection,
  onSortChange,
  onPageChange,
  onDrillDown,
  onBreadcrumbClick,
  isProjectsManualList = false,
  panelMode = false,
  isRowExpanded = () => false,
  expandedContent,
  onExpandedChange,
}: FinancialAnalyticsTableProps) {
  const rows = buildTableRows(result, !isProjectsManualList || result.rows.data.length > 0);
  const columns = isProjectsManualList
    ? getProjectsManualColumns()
    : getFinancialColumns(result.level, showVariations).map((column) =>
        panelMode
          ? {
              ...column,
              label:
                column.label === "Consultas bilhetadas"
                  ? "Bilhetadas"
                  : column.label === "Consultas não bilhetadas"
                    ? "Não bilhetadas"
                    : column.label,
            }
          : column,
      );
  const handleRowClick = (row: FinancialTableRow) => {
    if (isDrillableRow(row, result)) onDrillDown(row);
  };
  const expandable =
    panelMode &&
    !result.isLastLevel &&
    rows.some((row) => isFinancialRowExpandable(row, result));
  const panelColumns = columns;
  return (
    <section aria-label="Tabela analítica" className="financial-analytics-table">
      <div className="mb-4 space-y-3">
        {!panelMode || rows.length === 0 ? (
          <nav
            aria-label={panelMode ? "Nível financeiro" : "Breadcrumb financeiro"}
            className="flex flex-wrap items-center gap-1 text-sm text-default-500"
          >
            {!panelMode
              ? result.breadcrumbs.map((breadcrumb, index) => (
                  <Breadcrumb
                    key={`${breadcrumb.level}-${breadcrumb.entity.value}`}
                    breadcrumb={breadcrumb}
                    onClick={() => onBreadcrumbClick(index)}
                  />
                ))
              : null}
            <span className="font-semibold text-default-800">
              {isProjectsManualList ? "Faturas manuais" : financialLevelLabels[result.level]}
              {isProjectsManualList ? null : (
                <span className="font-normal text-default-500">
                  {" "}
                  ({result.rows.pagination.totalRecords} resultados)
                </span>
              )}
            </span>
          </nav>
        ) : null}
        {isProjectsManualList ? null : (
          <Input
            aria-label={`Pesquisar por ${financialLevelLabels[result.level].slice(0, -1).toLocaleLowerCase("pt-BR")}`}
            size="sm"
            value={search}
            onValueChange={onSearchChange}
            placeholder={`Pesquisar por ${financialLevelLabels[result.level].slice(0, -1).toLocaleLowerCase("pt-BR")}`}
            startContent={<Search size={16} />}
            className="max-w-xs"
            classNames={{ base: "h-10", inputWrapper: "h-10", input: "text-sm" }}
          />
        )}
      </div>
      {panelMode && isLoading ? (
        <div className="flex h-14 items-center justify-center">
          <Spinner label="Carregando..." color="primary" />
        </div>
      ) : (
        <DynamicTable
          columns={panelColumns.map((column, index) => ({
            ...column,
            ...(isProjectsManualList && index === 0
              ? { label: "Faturas manuais" }
              : panelMode && rows.length > 0 && index === 0
                ? {
                    label: `${financialLevelLabels[result.level]} (${result.rows.pagination.totalRecords} resultados)`,
                  }
                : {}),
            headerClassName: `${column.headerClassName ?? ""} text-left`,
            render: column.render,
          }))}
          data={rows}
          keyExtractor={(row) => (row.isTotal ? "total" : (row.entity.value ?? row.entity.label))}
          emptyMessage="Nenhum dado encontrado para os filtros selecionados."
          isLoading={isLoading}
          onRowClick={panelMode ? undefined : handleRowClick}
          isRowClickable={(row) =>
            isDrillableRow(row, result) || isFinancialRowExpandable(row, result)
          }
          isRowExpandable={(row) => isFinancialRowExpandable(row, result)}
          expandable={expandable}
          expandButtonLabel="nível"
          expandedRowKeys={
            expandable
              ? new Set(
                  rows
                    .filter((row) => isFinancialRowExpandable(row, result))
                    .filter((row) => isRowExpanded(row))
                    .map((row) => row.entity.value ?? row.entity.label),
                )
              : undefined
          }
          expandedContent={panelMode ? (row) => expandedContent?.(row) : undefined}
          expandedContentClassName={
            panelMode ? "border-l border-[#38BDF8] pb-3 pl-3 pr-3 pt-3" : undefined
          }
          onExpandedChange={panelMode ? onExpandedChange : undefined}
          sortDescriptor={
            sortBy
              ? { column: sortBy, direction: sortDirection === "desc" ? "descending" : "ascending" }
              : undefined
          }
          onSortChange={({ column, direction }) =>
            onSortChange(String(column), direction === "descending" ? "desc" : "asc")
          }
          classNames={{
            table: "border-collapse border-spacing-0",
            th: "bg-default-100 text-left text-xs font-semibold text-default-600",
            td: panelMode
              ? "h-[58px] border-b border-default-100 bg-white text-left text-xs"
              : "h-[58px] border-b border-default-100 text-left text-xs",
          }}
        />
      )}
      {panelMode ? null : (
        <div className="mt-4 flex justify-end">
          <TableListFooter
            shownCount={result.rows.data.length}
            totalCount={result.rows.pagination.totalRecords}
            entityLabel={
              isProjectsManualList
                ? "faturas manuais"
                : financialLevelLabels[result.level].toLocaleLowerCase("pt-BR")
            }
            page={result.rows.pagination.page}
            totalPages={result.rows.pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </section>
  );
}

function Breadcrumb({
  breadcrumb,
  onClick,
}: { breadcrumb: CostManagementBreadcrumb; onClick: () => void }) {
  return (
    <>
      <button type="button" className="cursor-pointer hover:text-primary" onClick={onClick}>
        {breadcrumb.entity.label}
      </button>
      <ChevronRight size={16} aria-hidden className="text-default-400" />
    </>
  );
}