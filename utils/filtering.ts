import type {
  ClientMock,
  ClientsFiltersState,
  DashboardFiltersState,
  FranchiseMock,
  BarChartPoint,
} from "../types";
import { prototypePreviousValue } from "./comparison";

function matchesSearch(client: ClientMock, search: string): boolean {
  if (!search.trim()) return true;
  const q = search.trim().toLowerCase();
  return (
    client.razaoSocial.toLowerCase().includes(q) ||
    client.id.toLowerCase().includes(q) ||
    client.cnpj.includes(q.replace(/\D/g, ""))
  );
}

function collectFranchises(client: ClientMock): FranchiseMock[] {
  return client.contracts.flatMap((c) => c.franchises);
}

function matchesMulti(
  selected: string[],
  value: string,
  allToken = "todos",
): boolean {
  if (selected.length === 0 || selected.includes(allToken)) return true;
  return selected.includes(value);
}

function matchesHealthFilter(
  selected: string[],
  health: string,
  allToken = "todos",
): boolean {
  if (selected.length === 0 || selected.includes(allToken)) return true;
  return selected.includes(health);
}

export function filterClientsForDashboard(
  clients: ClientMock[],
  filters: DashboardFiltersState,
): ClientMock[] {
  return clients.filter((client) => {
    if (!matchesSearch(client, filters.search)) return false;
    if (!matchesHealthFilter(filters.health, client.saude)) return false;
    if (!matchesMulti(filters.clientTypes, client.tipo)) return false;

    const franchises = collectFranchises(client);
    if (
      filters.profitCenters.length > 0 &&
      !filters.profitCenters.includes("todos") &&
      !franchises.some((f) => filters.profitCenters.includes(f.centroCusto))
    ) {
      return false;
    }
    if (
      filters.services.length > 0 &&
      !filters.services.includes("todos") &&
      !franchises.some((f) => filters.services.includes(f.servico))
    ) {
      return false;
    }
    return true;
  });
}

function passesNumericFilter(
  value: number,
  operator: "none" | "gt" | "lt",
  raw: string,
): boolean {
  if (operator === "none" || !raw.trim()) return true;
  const threshold = Number.parseFloat(raw.replace(",", "."));
  if (Number.isNaN(threshold)) return true;
  if (operator === "gt") return value > threshold;
  return value < threshold;
}

export function filterAndSortClients(
  clients: ClientMock[],
  filters: ClientsFiltersState,
): ClientMock[] {
  let result = clients.filter((client) => {
    if (!matchesSearch(client, filters.search)) return false;
    if (!matchesHealthFilter(filters.health, client.saude)) return false;
    if (!matchesMulti(filters.clientTypes, client.tipo)) return false;

    const franchises = collectFranchises(client);
    if (
      filters.profitCenters.length > 0 &&
      !filters.profitCenters.includes("todos") &&
      !franchises.some((f) => filters.profitCenters.includes(f.centroCusto))
    ) {
      return false;
    }
    if (
      filters.services.length > 0 &&
      !filters.services.includes("todos") &&
      !franchises.some((f) => filters.services.includes(f.servico))
    ) {
      return false;
    }
    if (
      !passesNumericFilter(
        client.faturadoPorMes,
        filters.billingOperator,
        filters.billingValue,
      )
    ) {
      return false;
    }
    if (
      !passesNumericFilter(
        client.consumoMedioPct,
        filters.consumptionOperator,
        filters.consumptionValue,
      )
    ) {
      return false;
    }
    return true;
  });

  if (filters.sortBilling !== "none") {
    result = [...result].sort((a, b) =>
      filters.sortBilling === "desc"
        ? b.faturadoPorMes - a.faturadoPorMes
        : a.faturadoPorMes - b.faturadoPorMes,
    );
  } else if (filters.sortConsumption !== "none") {
    result = [...result].sort((a, b) =>
      filters.sortConsumption === "desc"
        ? b.consumoMedioPct - a.consumoMedioPct
        : a.consumoMedioPct - b.consumoMedioPct,
    );
  }

  return result;
}

export function aggregateByService(clients: ClientMock[]) {
  const map = new Map<string, { franchises: number; billing: number }>();
  for (const client of clients) {
    for (const contract of client.contracts) {
      for (const fr of contract.franchises) {
        const entry = map.get(fr.servico) ?? { franchises: 0, billing: 0 };
        entry.franchises += 1;
        entry.billing += fr.mediaFaturamento3m;
        map.set(fr.servico, entry);
      }
    }
  }
  return Array.from(map.entries())
    .map(([label, data]) => ({ label, ...data }))
    .sort((a, b) => b.billing - a.billing);
}

export function aggregateByProfitCenter(clients: ClientMock[]) {
  const map = new Map<string, { franchises: number; billing: number }>();
  for (const client of clients) {
    for (const contract of client.contracts) {
      for (const fr of contract.franchises) {
        const entry = map.get(fr.centroCusto) ?? { franchises: 0, billing: 0 };
        entry.franchises += 1;
        entry.billing += fr.mediaFaturamento3m;
        map.set(fr.centroCusto, entry);
      }
    }
  }
  return Array.from(map.entries())
    .map(([label, data]) => ({ label, ...data }))
    .sort((a, b) => b.billing - a.billing);
}

export function aggregateHealth(clients: ClientMock[]) {
  const counts = {
    risco_alto: 0,
    risco_medio: 0,
    sucesso: 0,
    oportunidade: 0,
  };
  for (const client of clients) {
    counts[client.saude] += 1;
  }
  return counts;
}

export function toBarChartPoints(
  rows: { label: string; billing: number }[],
): BarChartPoint[] {
  return rows.map((row, i) => ({
    label: row.label,
    value: row.billing,
    previous: prototypePreviousValue(row.billing, i, 0.93),
  }));
}
