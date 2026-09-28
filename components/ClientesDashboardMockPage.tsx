"use client";

import { Button } from "@heroui/react";
import { Download, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import {
  BAR_CTR,
  BAR_HEALTH,
  BAR_PROD,
  CLIENTS,
} from "../clientesDashboardMockData";
import { ChartCard } from "./charts/ChartCard";
import { DashboardViewTabs } from "./CohortRetentionPanel";
import { PrototypeBanner } from "./PrototypeBanner";
import {
  ClientesFilterDrawer,
  type FilterDrawerStatus,
} from "./clientes-mock-hero/ClientesFilterDrawer";
import { ClientsListSection } from "./clientes-mock-hero/ClientsListSection";
import { CohortTableMock } from "./clientes-mock-hero/CohortTableMock";
import { DashboardKpiGrid } from "./clientes-mock-hero/DashboardKpiGrid";
import { EvolutionChartMock } from "./clientes-mock-hero/EvolutionChartMock";
import { HorizontalBarsMock } from "./clientes-mock-hero/HorizontalBarsMock";
import { PageTitle } from "@/shared/components/PageTitle";
import { CustomersIcon } from "@/shared/components/sidebar/icons";

const outlineBtnClass =
  "border-zinc-200 bg-white text-zinc-700 font-normal data-[hover=true]:bg-zinc-50";

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
  const [filterDrawerMounted, setFilterDrawerMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterDrawerStatus>({
    ativo: false,
    inativo: false,
  });
  const [showInactiveItems, setShowInactiveItems] = useState(false);

  useEffect(() => {
    if (filterOpen) setFilterDrawerMounted(true);
  }, [filterOpen]);

  const filterToolbar = (
    <div className="flex flex-wrap gap-2.5 mb-2">
      <Button
        variant="bordered"
        size="sm"
        className={outlineBtnClass}
        startContent={<SlidersHorizontal className="size-4 opacity-70" />}
        onPress={() => setFilterOpen(true)}
      >
        Filtros
      </Button>
      <Button
        variant="bordered"
        size="sm"
        className={outlineBtnClass}
        startContent={<Download className="size-4 opacity-70" />}
        onPress={downloadClientsCsv}
      >
        Download CSV
      </Button>
    </div>
  );

  const dashboardContent = (
    <section>
      {filterToolbar}
      <p className="text-sm text-zinc-600 my-2 mb-6">
        Período:{" "}
        <span className="font-medium text-zinc-900">{periodLabel}</span>
      </p>
      <DashboardKpiGrid />
      <ChartCard title="Evolução mensal">
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
      <ChartCard className="overflow-visible mb-0">
        <ClientsListSection
          statusFilter={statusFilter}
          showInactiveItems={showInactiveItems}
          onOpenFilters={() => setFilterOpen(true)}
          onToggleShowInactive={() => setShowInactiveItems((v) => !v)}
          competenceLabel={periodLabel}
        />
      </ChartCard>
    </section>
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto py-7 px-8 pb-12">
      <div className="mb-4">
        <PrototypeBanner />
      </div>
      <div className="mb-5">
        <PageTitle
          icon={<CustomersIcon color="currentColor" />}
          label="Clientes"
        />
      </div>
      <DashboardViewTabs
        dashboard={dashboardContent}
        clientes={clientesContent}
      />
      {filterDrawerMounted ? (
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
      ) : null}
    </div>
  );
}
