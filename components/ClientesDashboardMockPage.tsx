"use client";

import { Download, SlidersHorizontal, Users } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { ClientsListSection } from "./clientes-mock-hero/ClientsListSection";
import { CompetenceWithActiveClients } from "./clientes-mock-hero/CompetenceWithActiveClients";
import { CohortTableMock } from "./clientes-mock-hero/CohortTableMock";
import { DashboardKpiGrid } from "./clientes-mock-hero/DashboardKpiGrid";
import { EvolutionChartMock } from "./clientes-mock-hero/EvolutionChartMock";
import { HorizontalBarsMock } from "./clientes-mock-hero/HorizontalBarsMock";
import { OutlineButton, PageHead } from "@/design-system/ui";

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
  const [statusFilter, setStatusFilter] = useState<FilterDrawerStatus>({
    ativo: false,
    inativo: false,
  });
  const [showInactiveItems, setShowInactiveItems] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const mainViewTab =
    searchParams.get("tab") === "clientes" ? "clientes" : "dashboard";

  const activeClientsOnDashboard = CLIENTS.filter((client) => client.ativo).length;

  const filterToolbar = (
    <div className="flex flex-wrap gap-2.5 mb-2">
      <OutlineButton onClick={() => setFilterOpen(true)}>
        <SlidersHorizontal />
        Filtros
      </OutlineButton>
      <OutlineButton onClick={downloadClientsCsv}>
        <Download />
        Download CSV
      </OutlineButton>
    </div>
  );

  const dashboardContent = (
    <section>
      {filterToolbar}
      <CompetenceWithActiveClients
        className="mb-6"
        competencePrefix="Período:"
        competenceLabel={periodLabel}
        activeClientCount={activeClientsOnDashboard}
      />
      <DashboardKpiGrid />
      <ChartCard title="Evolução mensal" className="mb-6">
        <EvolutionChartMock />
      </ChartCard>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
        <ChartCard title="Faturamento por produto" className="mb-0 min-h-[280px]">
          <HorizontalBarsMock rows={BAR_PROD} color="#652cdd" />
        </ChartCard>
        <ChartCard title="Faturamento por centro de lucro" className="mb-0 min-h-[280px]">
          <HorizontalBarsMock rows={BAR_CTR} color="#8456e4" />
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
        onOpenFilters={() => setFilterOpen(true)}
        onToggleShowInactive={() => setShowInactiveItems((v) => !v)}
        competenceLabel={periodLabel}
      />
    </section>
  );

  return (
    <div className="space-y-6">
      <PageHead icon={<Users />} title="Clientes" />
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
    </div>
  );
}
