"use client";

import { useMemo, useState } from "react";
import { PageTitle } from "@/shared/components/PageTitle";
import { CustomersIcon } from "@/shared/components/sidebar/icons";
import { MOCK_CLIENTS } from "../mockData";
import type { ClientsFiltersState } from "../types";
import { filterAndSortClients } from "../utils/filtering";
import { ClientHierarchyCard } from "./ClientHierarchyCard";
import { ClientsFiltersBar } from "./ClientsFiltersBar";
import { PrototypeBanner } from "./PrototypeBanner";

const defaultFilters: ClientsFiltersState = {
  search: "",
  health: ["todos"],
  profitCenters: ["todos"],
  clientTypes: ["todos"],
  services: ["todos"],
  billingOperator: "none",
  billingValue: "",
  consumptionOperator: "none",
  consumptionValue: "",
  sortBilling: "none",
  sortConsumption: "none",
};

export function CommercialClientsPage() {
  const [filters, setFilters] = useState<ClientsFiltersState>(defaultFilters);

  const clients = useMemo(
    () => filterAndSortClients(MOCK_CLIENTS, filters),
    [filters],
  );

  return (
    <div className="size-full p-6 space-y-6">
      <PrototypeBanner />
      <PageTitle
        icon={<CustomersIcon color="currentColor" />}
        label="Clientes"
      />

      <ClientsFiltersBar filters={filters} onChange={setFilters} />

      <p className="text-sm text-zinc-600">
        {clients.length} cliente(s) exibido(s) — dados mock do protótipo.
      </p>

      <div className="space-y-4">
        {clients.length === 0 ? (
          <p className="text-center text-zinc-500 py-12 rounded-xl border border-dashed border-zinc-300">
            Nenhum cliente corresponde aos filtros.
          </p>
        ) : (
          clients.map((client) => (
            <ClientHierarchyCard key={client.id} client={client} />
          ))
        )}
      </div>
    </div>
  );
}
