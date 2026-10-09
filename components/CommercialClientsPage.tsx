"use client";

import { useMemo, useState } from "react";
import { PageHead } from "@/design-system/ui";
import { Users } from "lucide-react";
import { MOCK_CLIENTS } from "../mockData";
import type { ClientsFiltersState } from "../types";
import { filterAndSortClients } from "../utils/filtering";
import { ClientHierarchyCard } from "./ClientHierarchyCard";
import { ClientsFiltersBar } from "./ClientsFiltersBar";
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
    <div className="space-y-6">
      <PageHead icon={<Users />} title="Clientes" />

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
