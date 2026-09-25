"use client";

import { Button, Input, Select, SelectItem } from "@heroui/react";
import {
  CLIENT_TYPE_OPTIONS,
  HEALTH_OPTIONS,
  PROFIT_CENTERS,
  SERVICES,
} from "../constants";
import type { ClientsFiltersState } from "../types";
import { MultiFilterSelect } from "./MultiFilterSelect";

interface ClientsFiltersBarProps {
  filters: ClientsFiltersState;
  onChange: (next: ClientsFiltersState) => void;
}

export function ClientsFiltersBar({ filters, onChange }: ClientsFiltersBarProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 flex flex-wrap gap-3 items-end">
        <Input
          label="Busca por cliente"
          size="sm"
          className="min-w-[220px] max-w-sm"
          value={filters.search}
          onValueChange={(search) => onChange({ ...filters, search })}
        />
        <MultiFilterSelect
          label="Saúde dos clientes"
          options={HEALTH_OPTIONS.map((h) => ({ key: h.key, label: h.label }))}
          selectedKeys={filters.health}
          onChange={(health) => onChange({ ...filters, health })}
        />
        <MultiFilterSelect
          label="Centros de lucro"
          options={PROFIT_CENTERS.map((c) => ({ key: c, label: c }))}
          selectedKeys={filters.profitCenters}
          onChange={(profitCenters) => onChange({ ...filters, profitCenters })}
        />
        <MultiFilterSelect
          label="Tipo"
          options={CLIENT_TYPE_OPTIONS.map((t) => ({
            key: t.key,
            label: t.label,
          }))}
          selectedKeys={filters.clientTypes}
          onChange={(clientTypes) => onChange({ ...filters, clientTypes })}
        />
        <MultiFilterSelect
          label="Serviço"
          options={SERVICES.map((s) => ({ key: s, label: s }))}
          selectedKeys={filters.services}
          onChange={(services) => onChange({ ...filters, services })}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 flex flex-wrap gap-3 items-end">
        <Select
          label="Faturamento"
          size="sm"
          className="min-w-[140px]"
          selectedKeys={new Set([filters.billingOperator])}
          onSelectionChange={(keys) => {
            const op =
              (Array.from(keys)[0]?.toString() as ClientsFiltersState["billingOperator"]) ??
              "none";
            onChange({ ...filters, billingOperator: op });
          }}
        >
          <SelectItem key="none">Sem filtro</SelectItem>
          <SelectItem key="gt">Maior que</SelectItem>
          <SelectItem key="lt">Menor que</SelectItem>
        </Select>
        <Input
          label="Valor (R$)"
          size="sm"
          type="number"
          className="min-w-[140px] max-w-[160px]"
          value={filters.billingValue}
          onValueChange={(billingValue) =>
            onChange({ ...filters, billingValue })
          }
          isDisabled={filters.billingOperator === "none"}
        />
        <Select
          label="Consumo"
          size="sm"
          className="min-w-[140px]"
          selectedKeys={new Set([filters.consumptionOperator])}
          onSelectionChange={(keys) => {
            const op =
              (Array.from(keys)[0]?.toString() as ClientsFiltersState["consumptionOperator"]) ??
              "none";
            onChange({ ...filters, consumptionOperator: op });
          }}
        >
          <SelectItem key="none">Sem filtro</SelectItem>
          <SelectItem key="gt">Maior que</SelectItem>
          <SelectItem key="lt">Menor que</SelectItem>
        </Select>
        <Input
          label="Consumo (%)"
          size="sm"
          type="number"
          className="min-w-[140px] max-w-[160px]"
          value={filters.consumptionValue}
          onValueChange={(consumptionValue) =>
            onChange({ ...filters, consumptionValue })
          }
          isDisabled={filters.consumptionOperator === "none"}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-zinc-600 self-center mr-2">Ordenar:</span>
        <Button
          size="sm"
          variant={filters.sortBilling === "desc" ? "solid" : "flat"}
          color="primary"
          onPress={() =>
            onChange({
              ...filters,
              sortBilling: filters.sortBilling === "desc" ? "none" : "desc",
              sortConsumption: "none",
            })
          }
        >
          Faturamento ↓
        </Button>
        <Button
          size="sm"
          variant={filters.sortBilling === "asc" ? "solid" : "flat"}
          color="primary"
          onPress={() =>
            onChange({
              ...filters,
              sortBilling: filters.sortBilling === "asc" ? "none" : "asc",
              sortConsumption: "none",
            })
          }
        >
          Faturamento ↑
        </Button>
        <Button
          size="sm"
          variant={filters.sortConsumption === "desc" ? "solid" : "flat"}
          color="secondary"
          onPress={() =>
            onChange({
              ...filters,
              sortConsumption:
                filters.sortConsumption === "desc" ? "none" : "desc",
              sortBilling: "none",
            })
          }
        >
          Consumo ↓
        </Button>
        <Button
          size="sm"
          variant={filters.sortConsumption === "asc" ? "solid" : "flat"}
          color="secondary"
          onPress={() =>
            onChange({
              ...filters,
              sortConsumption:
                filters.sortConsumption === "asc" ? "none" : "asc",
              sortBilling: "none",
            })
          }
        >
          Consumo ↑
        </Button>
      </div>
    </div>
  );
}
