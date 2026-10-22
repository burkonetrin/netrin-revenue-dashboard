"use client";

import { Download, Funnel, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@heroui/react";
import {
  BAR_CTR,
  BAR_HEALTH,
  BAR_PROD,
  CLIENTS,
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
  clientsMatchingSearch,
} from "./clientes-mock-hero/ClientsListSection";
import { CompetenceWithActiveClients } from "./clientes-mock-hero/CompetenceWithActiveClients";
import { CohortTableMock } from "./clientes-mock-hero/CohortTableMock";
import { DashboardKpiGrid } from "./clientes-mock-hero/DashboardKpiGrid";
import { EvolutionChartMock } from "./clientes-mock-hero/EvolutionChartMock";
import { ProductNumbersMock } from "./clientes-mock-hero/ProductNumbersMock";
import { ProfitCenterNumbersMock } from "./clientes-mock-hero/ProfitCenterNumbersMock";
import { HorizontalBarsMock } from "./clientes-mock-hero/HorizontalBarsMock";
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

  const hasFilters = useMemo(
    () => statusFilter.ativo || statusFilter.inativo,
    [statusFilter],
  );

  const activeClientsOnDashboard = clientsMatchingSearch(CLIENTS, clientSearch).filter(
    (client) => client.ativo,
  ).length;

  const dashboardToolbar = (
    <div className="flex flex-wrap gap-2.5 items-center mb-2 w-full">
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
    <section>
      {dashboardToolbar}
      <CompetenceWithActiveClients
        className="mb-6"
        competencePrefix="Período:"
        competenceLabel={periodLabel}
        activeClientCount={activeClientsOnDashboard}
      />
      <DashboardKpiGrid />
      <ChartCard title="Faturamento por centro de lucro" className="mb-6">
        <ProfitCenterNumbersMock />
      </ChartCard>
      <ChartCard title="Números de Produto" className="mb-6">
        <ProductNumbersMock competenceLabel={periodLabel} />
      </ChartCard>
      <ChartCard title="Evolução mensal" className="mb-6">
        <EvolutionChartMock />
      </ChartCard>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
        <ChartCard title="Faturamento por produto" className="mb-0 min-h-[280px]">
          <HorizontalBarsMock rows={BAR_PROD} color="#652cdd" showRevenueBreakdown />
        </ChartCard>
        <ChartCard title="Faturamento por centro de lucro" className="mb-0 min-h-[280px]">
          <HorizontalBarsMock rows={BAR_CTR} color="#8456e4" showRevenueBreakdown />
        </ChartCard>
        <ChartCard title="Saúde dos clientes (% consumo)" className="mb-0 min-h-[280px]">
          <HorizontalBarsMock
            rows={BAR_HEALTH}
            color="#22c55e"
            money={false}
            health
          />
        </ChartCard>
      </div>
      <ChartCard title="Cohort" className="mb-0">
        <CohortTableMock />
      </ChartCard>
    </section>
  );

  const clientesContent = (
    <section>
      <ClientsListSection
        statusFilter={statusFilter}
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
          if (key === "clientes") {
            setSearchParams({ tab: "clientes" });
          } else {
            setSearchParams({});
          }
        }}
        dashboard={dashboardContent}
        clientes={clientesContent}
      />
      <ClientesFilterDrawer
        isOpen={filterOpen}
        onOpenChange={setFilterOpen}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onApply={() => {
          setPeriodLabel("set/2025");
          setFilterOpen(false);
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
