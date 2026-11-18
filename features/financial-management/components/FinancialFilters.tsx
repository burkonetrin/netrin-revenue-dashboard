"use client";

import { Button, Checkbox, Select, SelectItem } from "@heroui/react";
import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { CalendarDays, Filter, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { CostManagementQuery } from "../types/costManagement.types";

export interface FinancialFilterOption {
  id: string;
  label: string;
}

export function formatCompetence(referenceMonth: string) {
  const [year, month] = referenceMonth.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);
  return `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} / ${year}`;
}

export function buildCompetenceOptions(now = new Date(), count = 24) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index - 1, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
    return { value, label: formatCompetence(value) };
  });
}

interface FinancialFiltersProps {
  value: CostManagementQuery;
  onChange: (patch: Partial<CostManagementQuery>) => void;
  onClear: () => void;
  profitCenterOptions?: FinancialFilterOption[];
  tagOptions?: FinancialFilterOption[];
  catalogError?: string | null;
  now?: Date;
}

export function FinancialFilters({
  value,
  onChange,
  onClear,
  profitCenterOptions = [],
  tagOptions = [],
  catalogError,
  now,
}: FinancialFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftProfitCenterIds, setDraftProfitCenterIds] = useState<string[]>(value.profitCenterIds);
  const [draftTagIds, setDraftTagIds] = useState<string[]>(value.tagIds);
  const competenceOptions = useMemo(() => buildCompetenceOptions(now), [now]);
  const hasActiveFilters = value.profitCenterIds.length > 0 || value.tagIds.length > 0;
  const openFilters = () => {
    setDraftProfitCenterIds(value.profitCenterIds);
    setDraftTagIds(value.tagIds);
    setIsOpen(true);
  };
  const applyFilters = () => {
    onChange({ profitCenterIds: draftProfitCenterIds, tagIds: draftTagIds });
    setIsOpen(false);
  };
  const clearFilters = () => {
    setDraftProfitCenterIds([]);
    setDraftTagIds([]);
    onClear();
    setIsOpen(false);
  };

  return (
    <section
      aria-label="Filtros financeiros"
      className="relative flex min-w-max flex-nowrap items-center gap-3"
    >
      <Select
        aria-label="Competência"
        selectedKeys={new Set([value.referenceMonth])}
        onSelectionChange={(keys) => {
          if (keys === "all" || keys.size === 0) return;
          onChange({ referenceMonth: Array.from(keys)[0] as string });
        }}
        className="w-48 min-w-0 shrink"
        startContent={<CalendarDays size={18} className="shrink-0 text-default-500" aria-hidden />}
        classNames={{
          trigger: "h-10 rounded-lg border border-default-200 bg-white px-3",
          value: "text-sm text-default-700",
        }}
      >
        {competenceOptions.map((option) => (
          <SelectItem key={option.value} textValue={option.label}>
            {option.label}
          </SelectItem>
        ))}
      </Select>

      <div className="inline-flex w-max shrink-0">
        {hasActiveFilters ? (
          <div className="flex h-10 items-center rounded-lg bg-secondary text-white">
            <Button
              type="button"
              color="secondary"
              className="h-10 rounded-r-none text-sm text-white"
              onPress={openFilters}
            >
              Filtros ativos
            </Button>
            <span className="h-6 w-px bg-white/60" />
            <button
              type="button"
              aria-label="Limpar filtros"
              className="px-2"
              onClick={clearFilters}
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            radius="sm"
            variant="bordered"
            color="default"
            className="h-10 text-sm"
            startContent={<Filter size={18} className="text-gray-400" />}
            onPress={openFilters}
          >
            Filtros
          </Button>
        )}

        <DynamicDrawer
          title="Filtros"
          size="lg"
          isOpen={isOpen}
          onOpenChange={(open) => {
            if (!open) setIsOpen(false);
          }}
          dataTestId="financial-filters-drawer"
          classNames={{
            base: "h-full",
            header: "px-6 py-4 text-[30px]! font-semibold! leading-9! text-foreground",
            body: "flex-1! mb-0 overflow-y-auto px-6 pt-4 pb-8",
            footer: "mt-auto !w-full !flex-row !justify-end px-6 pb-4 pt-0",
          }}
          component={
            <div aria-label="Opções de filtros" className="flex w-full flex-col gap-8">
            {catalogError ? (
              <p role="alert" className="mb-4 text-sm text-danger-600">
                {catalogError}
              </p>
            ) : null}
            <FilterCheckboxGroup
              label="Centros de lucro"
              options={profitCenterOptions}
              selectedIds={draftProfitCenterIds}
              onChange={setDraftProfitCenterIds}
            />
            <hr className="border-t border-default-200" />
            <FilterCheckboxGroup
              label="Tags"
              options={tagOptions}
              selectedIds={draftTagIds}
              onChange={setDraftTagIds}
            />
            </div>
          }
          footer={
            <div className="flex w-full items-center justify-end gap-4">
              <Button variant="bordered" className="h-10 px-4 text-sm" onPress={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button variant="bordered" className="h-10 px-4 text-sm" onPress={clearFilters}>
                Limpar filtros
              </Button>
              <Button color="secondary" className="h-10 px-4 text-sm" onPress={applyFilters}>
                Filtrar
              </Button>
            </div>
          }
        />
      </div>
    </section>
  );
}

function FilterCheckboxGroup({
  label,
  options,
  selectedIds,
  onChange,
}: {
  label: string;
  options: FinancialFilterOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-4 text-base font-medium text-zinc-500">{label}</legend>
      {options.map((option) => (
        <Checkbox
          key={option.id}
          isSelected={selectedIds.includes(option.id)}
          onValueChange={(selected) =>
            onChange(
              selected
                ? [...selectedIds, option.id]
                : selectedIds.filter((id) => id !== option.id),
            )
          }
          classNames={{ label: "text-xs text-foreground" }}
        >
          {option.label}
        </Checkbox>
      ))}
    </fieldset>
  );
}
