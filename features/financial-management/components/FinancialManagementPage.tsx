"use client";

import { PageTitle } from "@/shared/components/PageTitle";
import { FinancialIcon } from "@/shared/components/sidebar/icons";
import { nucleusPrivatePageShellSpaceY6Class } from "@/shared/styles/prototypePageShell";
import { Switch } from "@heroui/react";
import { useEffect, useState } from "react";
import type { CostManagementGateway } from "../services/costManagement.gateway";
import { prototypeCostManagementGateway } from "../services/costManagement.gateway";
import type {
  CostManagementHierarchyLevel,
  CostManagementLevel,
  CostManagementQuery,
  CostManagementRow,
  CostManagementSummary,
} from "../types/costManagement.types";
import { createInitialCostManagementQuery } from "../types/costManagement.types";
import { buildAccordionChildQuery } from "../utils/financialAccordion";
export {
  isProjectsManualInvoiceDrillDown,
  supportsProjectsManualInvoices,
} from "../utils/financialAccordion";
import { FinancialAccordionTable } from "./FinancialAccordionTable";
import { FinancialFilters } from "./FinancialFilters";
import { FinancialSummaryCards } from "./FinancialSummaryCards";
import { HierarchyOrderEditor } from "./HierarchyOrderEditor";

export function buildDrillDownQuery(
  query: CostManagementQuery,
  level: CostManagementLevel,
  row: CostManagementRow,
): CostManagementQuery {
  return buildAccordionChildQuery(query, level, row);
}

export function buildBreadcrumbQuery(
  query: CostManagementQuery,
  breadcrumbIndex: number,
): CostManagementQuery {
  const selected = Object.fromEntries(
    query.hierarchy
      .slice(0, breadcrumbIndex)
      .filter((level) => query.selected[level])
      .map((level) => [level, query.selected[level]]),
  );
  return { ...query, selected, search: "" };
}

export function FinancialManagementPage({
  gateway = prototypeCostManagementGateway,
  now = new Date(),
}: { gateway?: CostManagementGateway; now?: Date }) {
  const [query, setQuery] = useState(() => createInitialCostManagementQuery(now));
  const [summaryTemplateContext, setSummaryTemplateContext] = useState<
    Pick<CostManagementQuery, "selected" | "backgroundCheckTemplateId"> | undefined
  >();
  const [pendingHierarchy, setPendingHierarchy] = useState<CostManagementHierarchyLevel[]>(
    query.hierarchy,
  );
  const [summaryState, setSummaryState] = useState<{
    key: string;
    summary: CostManagementSummary;
  } | null>(null);
  const [summaryError, setSummaryError] = useState<Error | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [profitCenterOptions, setProfitCenterOptions] = useState<{ id: string; label: string }[]>(
    [],
  );
  const [tagOptions, setTagOptions] = useState<{ id: string; label: string }[]>([]);
  const summaryQuery = {
    ...query,
    selected: summaryTemplateContext?.selected ?? query.selected,
    backgroundCheckTemplateId: summaryTemplateContext?.backgroundCheckTemplateId,
  };
  const summaryKey = `${query.referenceMonth}-${query.hierarchy.join(",")}-${JSON.stringify(summaryQuery.selected)}-${query.profitCenterIds.join(",")}-${query.tagIds.join(",")}-${query.costType}-${summaryQuery.backgroundCheckTemplateId ?? ""}`;
  const summary = summaryState?.key === summaryKey ? summaryState.summary : null;

  // biome-ignore lint/correctness/useExhaustiveDependencies: filtros e paginação não devem recarregar os totalizadores.
  useEffect(() => {
    let active = true;
    setSummaryError(null);
    void gateway
      .getSummary(summaryQuery)
      .then((nextSummary) => {
        if (active) setSummaryState({ key: summaryKey, summary: nextSummary });
      })
      .catch(
        (cause) =>
          active &&
          setSummaryError(
            cause instanceof Error
              ? cause
              : new Error("Não foi possível carregar os totalizadores."),
          ),
      );
    return () => {
      active = false;
    };
  }, [gateway, summaryKey]);
  useEffect(() => {
    let active = true;
    gateway
      .getFilterOptions()
      .then((options) => {
        if (!active) return options;
        setProfitCenterOptions(options.profitCenters);
        setTagOptions(options.tags);
        setCatalogError(null);
        return options;
      })
      .catch(
        (cause) =>
          active &&
          setCatalogError(
            cause instanceof Error ? cause.message : "Não foi possível carregar filtros.",
          ),
      );
    return () => {
      active = false;
    };
  }, [gateway]);
  const patchQuery = (patch: Partial<CostManagementQuery>) => {
    setSummaryTemplateContext(undefined);
    setQuery((current) => ({ ...current, ...patch }));
  };
  const generate = () => {
    setSummaryTemplateContext(undefined);
    setQuery((current) => ({
      ...current,
      hierarchy: pendingHierarchy,
      selected: {},
      search: "",
    }));
  };
  const costModeSwitch = (
    <Switch
      aria-label="Calcular com custo real"
      size="sm"
      isSelected={query.costType === "real"}
      onValueChange={(isReal) => patchQuery({ costType: isReal ? "real" : "reference" })}
      classNames={{ label: "text-sm text-default-500" }}
    >
      Calcular com custo real
    </Switch>
  );

  return (
    <div className={nucleusPrivatePageShellSpaceY6Class}>
      <PageTitle icon={<FinancialIcon color="currentColor" />} label="Gestão Financeira" />
      {summary ? (
        <FinancialSummaryCards summary={summary} headerEndContent={costModeSwitch} />
      ) : (
        <div className="flex justify-end">{costModeSwitch}</div>
      )}
      <div className="flex flex-wrap items-end gap-6">
        <HierarchyOrderEditor
          value={pendingHierarchy}
          onChange={setPendingHierarchy}
          onGenerate={generate}
        />
        <span className="mb-2 hidden h-7 w-px bg-default-200 xl:block" />
        <FinancialFilters
          value={query}
          onChange={patchQuery}
          onClear={() => patchQuery({ profitCenterIds: [], tagIds: [] })}
          profitCenterOptions={profitCenterOptions}
          tagOptions={tagOptions}
          catalogError={catalogError}
          now={now}
        />
      </div>
      {summaryError ? (
        <section
          role="alert"
          className="rounded-xl border border-danger-200 p-4 text-sm text-danger-600"
        >
          {summaryError.message}
        </section>
      ) : null}
      <FinancialAccordionTable
        gateway={gateway}
        query={query}
        onBackgroundCheckTemplateChange={setSummaryTemplateContext}
      />
    </div>
  );
}
