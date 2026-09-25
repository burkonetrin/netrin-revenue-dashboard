"use client";

import { Button, Input, Select, SelectItem } from "@heroui/react";
import { Download } from "lucide-react";
import {
  CLIENT_TYPE_OPTIONS,
  COMPETENCE_OPTIONS,
  HEALTH_OPTIONS,
  PROFIT_CENTERS,
  SERVICES,
} from "../constants";
import type { DashboardFiltersState } from "../types";
import { MultiFilterSelect } from "./MultiFilterSelect";

interface DashboardFiltersBarProps {
  filters: DashboardFiltersState;
  onChange: (next: DashboardFiltersState) => void;
  onDownloadCsv?: () => void;
}

export function DashboardFiltersBar({
  filters,
  onChange,
  onDownloadCsv,
}: DashboardFiltersBarProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 flex flex-wrap gap-3 items-end justify-between">
      <div className="flex flex-wrap gap-3 items-end flex-1">
      <Input
        label="Busca por cliente"
        size="sm"
        className="min-w-[220px] max-w-sm"
        value={filters.search}
        onValueChange={(search) => onChange({ ...filters, search })}
        aria-label="Busca por cliente"
      />
      <Select
        label="Competência"
        size="sm"
        className="min-w-[180px] max-w-xs"
        selectedKeys={new Set([filters.competence])}
        onSelectionChange={(keys) => {
          const key = Array.from(keys)[0]?.toString() ?? COMPETENCE_OPTIONS[0].key;
          onChange({ ...filters, competence: key });
        }}
      >
        {COMPETENCE_OPTIONS.map((opt) => (
          <SelectItem key={opt.key}>{opt.label}</SelectItem>
        ))}
      </Select>
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
      <Button
        size="sm"
        variant="bordered"
        startContent={<Download className="size-4" aria-hidden />}
        onPress={onDownloadCsv}
      >
        Download CSV
      </Button>
    </div>
  );
}
