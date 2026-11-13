"use client";

import { Download, Funnel, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@heroui/react";
import {
  CLIENTS,
  parseClientHealthFilterParam,
  type ClientHealthKey,
} from "../clientesDashboardMockData";
import { ChartCard } from "./charts/ChartCard";
import { DashboardViewTabs } from "./CohortRetentionPanel";
import {
  ClientesFilterDrawer,
  type FilterDrawerStatus,
} from "./clientes-mock-hero/ClientesFilterDrawer";
import { ClientesGoalsDrawer } from "./clientes-mock-hero/ClientesGoalsDrawer";
import {
  ClientsListSection,
  filterClientsForList,
} from "./clientes-mock-hero/ClientsListSection";
import { CompetenceWithActiveClients } from "./clientes-mock-hero/CompetenceWithActiveClients";
import { CohortTableMock } from "./clientes-mock-hero/CohortTableMock";
import { ClientHealthDonutPanel } from "./clientes-mock-hero/ClientHealthDonutPanel";
import { DashboardKpiGrid } from "./clientes-mock-hero/DashboardKpiGrid";
import { EvolutionChartMock } from "./clientes-mock-hero/EvolutionChartMock";
import { ProductNumbersMock } from "./clientes-mock-hero/ProductNumbersMock";
import { ProfitCenterNumbersMock } from "./clientes-mock-hero/ProfitCenterNumbersMock";
import { FieldInput, OutlineButton, PageHead } from "@/design-system/ui";

function downloadClientsCsv() {
  const header = "Razão social;CNPJ;Faturamento;Consumo %";
  const rows = CLIENTS.map(
    (c) => `"${c.nome}";${c.cnpj};${c.fat};${c.cons}`,
  );
  const blob = new Blob([[header, ...rows].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "clientes-mock.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function buildSearchParamsForTab(
  tab: "dashboard" | "clientes",
  healthFilters: ClientHealthKey[],
): Record<string, string> {
  if (tab === "dashboard") {
    return {};
  }
  const next: Record<string, string> = { tab: "clientes" };
  if (healthFilters.length === 1) {
    next.health = healthFilters[0];
  }
  return next;
}

export function ClientesDashboardMockPage() {
  const [periodLabel, setPeriodLabel] = useState("set/2025");
  const [filterOpen, setFilterOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterDrawerStatus>({
    ativo: false,
    inativo: false,
  });
  const [showInactiveItems, setShowInactiveItems] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const mainViewTab =
    searchParams.get("tab") === "clientes" ? "clientes" : "dashboard";

  const [appliedHealthFilters, setAppliedHealthFilters] = useState<ClientHealthKey[]>(
    () => {
      const fromUrl = parseClientHealthFilterParam(searchParams.get("health"));
      return fromUrl ? [fromUrl] : [];
    },
  );

  useEffect(() => {
    const fromUrl = parseClientHealthFilterParam(searchParams.get("health"));
    if (fromUrl) {
      setAppliedHealthFilters((current) =>
        current.length === 1 && current[0] === fromUrl ? current : [fromUrl],
      );
      return;
    }
    if (searchParams.get("tab") !== "clientes") {
      setAppliedHealthFilters([]);
    }
  }, [searchParams]);

  const navigateToClientsWithHealth = (healthKey: ClientHealthKey) => {
    setAppliedHealthFilters([healthKey]);
    setSearchParams({ tab: "clientes", health: healthKey });
  };

  const hasFilters = useMemo(
    () =>
      statusFilter.ativo ||
      statusFilter.inativo ||
      appliedHealthFilters.length > 0,
    [statusFilter, appliedHealthFilters],
  );

  const activeClientsDisplayed = useMemo(
    () =>
      filterClientsForList({
        statusFilter,
        search: clientSearch,
        showInactive: showInactiveItems,
        sort: { key: null, dir: "desc" },
        healthFilters: appliedHealthFilters,
      }).filter((client) => client.ativo).length,
    [
      statusFilter,
      clientSearch,
      showInactiveItems,
      appliedHealthFilters,
    ],
  );

  const competenceSubtitle = (
    <CompetenceWithActiveClients
      variant="subtitle"
      competencePrefix="Competência:"
      competenceLabel={periodLabel}
      activeClientCount={activeClientsDisplayed}
    />
  );

  const dashboardToolbar = (
    <div className="flex flex-wrap gap-2.5 items-center w-full">
      <FieldInput
        type="search"
        placeholder="Pesquise por cliente, nome fantasia ou CNPJ"
        autoComplete="off"
        className="flex-1 min-w-[220px] max-w-[360px]"
        value={clientSearch}
        onChange={(e) => setClientSearch(e.target.value)}
      />
      <OutlineButton onClick={downloadClientsCsv}>
        <Download />
        Download CSV
      </OutlineButton>
    </div>
  );

  const dashboardContent = (
    <section className="flex flex-col gap-4">
      {competenceSubtitle}
      {dashboardToolbar}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_minmax(300px,380px)] xl:items-stretch">
        <DashboardKpiGrid className="mb-0" />
        <ClientHealthDonutPanel onHealthFilter={navigateToClientsWithHealth} />
      </div>
      <ChartCard title="Faturamento por centro de lucro" className="mb-6">
        <ProfitCenterNumbersMock />
      </ChartCard>
      <ChartCard title="Números de Produto" className="mb-6">
        <ProductNumbersMock competenceLabel={periodLabel} />
      </ChartCard>
      <ChartCard title="Evolução mensal" className="mb-6">
        <EvolutionChartMock />
      </ChartCard>
      <ChartCard title="Cohort" className="mb-0">
        <CohortTableMock />
      </ChartCard>
    </section>
  );

  const clientesContent = (
    <section className="flex flex-col gap-4">
      {competenceSubtitle}
      <ClientsListSection
          statusFilter={statusFilter}
          healthFilters={appliedHealthFilters}
          showInactiveItems={showInactiveItems}
          onToggleShowInactive={() => setShowInactiveItems((v) => !v)}
          competenceLabel={periodLabel}
          clientSearch={clientSearch}
          onClientSearchChange={setClientSearch}
        />
    </section>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <PageHead icon={<Users />} title="Clientes" />
        <div className="flex shrink-0 flex-nowrap items-center gap-2">
          <div
            className={`flex items-center rounded-lg ${
              hasFilters ? "bg-primary-600" : "bg-transparent"
            }`}
          >
            <Button
              startContent={<Funnel size={18} className="text-gray-400" />}
              radius="sm"
              variant={hasFilters ? "solid" : "bordered"}
              color={hasFilters ? "primary" : "default"}
              onPress={() => setFilterOpen(true)}
              className={hasFilters ? "text-white" : ""}
            >
              {hasFilters ? "Filtros ativos" : "Filtros"}
            </Button>
          </div>
          <Button radius="sm" variant="bordered" onPress={() => setGoalsOpen(true)}>
            Configurar meta
          </Button>
        </div>
      </div>
      <DashboardViewTabs
        selectedKey={mainViewTab}
        onSelectedKeyChange={(key) => {
          setSearchParams(buildSearchParamsForTab(key, appliedHealthFilters));
        }}
        dashboard={dashboardContent}
        clientes={clientesContent}
      />
      <ClientesFilterDrawer
        isOpen={filterOpen}
        onOpenChange={setFilterOpen}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        healthFilters={appliedHealthFilters}
        onClearAll={() => {
          setAppliedHealthFilters([]);
          if (mainViewTab === "clientes") {
            setSearchParams({ tab: "clientes" });
          }
        }}
        onApply={({ healthFilters }) => {
          setAppliedHealthFilters(healthFilters);
          setPeriodLabel("set/2025");
          const nextTab = mainViewTab === "clientes" || healthFilters.length > 0
            ? "clientes"
            : "dashboard";
          setSearchParams(buildSearchParamsForTab(nextTab, healthFilters));
        }}
      />
      <ClientesGoalsDrawer
        isOpen={goalsOpen}
        onOpenChange={setGoalsOpen}
        competenceLabel={periodLabel}
      />
    </div>
  );
}
