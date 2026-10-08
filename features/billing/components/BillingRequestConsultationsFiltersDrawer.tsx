"use client";

import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import { Input, addToast } from "@heroui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BillingRequestConsultationRow } from "../types/billing-request-consultation.types";
import {
  EMPTY_REQUEST_CONSULTATION_FILTERS,
  type SupportToolsCacheFilter,
  type SupportToolsRequestConsultationFilters,
} from "../types/support-tools-filters.types";
import { buildConsultationFilterSuggestions } from "../utils/consultation-filter-suggestions.utils";
import { isSupportToolsDateRangeValid } from "../utils/support-tools-filters.utils";
import { billingDrawerClassNames } from "./billing-drawer.shared";
import { SupportToolsDateRangeFields } from "./support-tools/SupportToolsDateRangeFields";
import { SupportToolsFilterAutocomplete } from "./support-tools/SupportToolsFilterAutocomplete";
import { SupportToolsFilterField } from "./support-tools/SupportToolsFilterField";
import { SupportToolsFiltersDrawerFooter } from "./support-tools/SupportToolsFiltersDrawerFooter";
import { SupportToolsMultiSelectFilter } from "./support-tools/SupportToolsMultiSelectFilter";
import {
  SUPPORT_TOOLS_BANK_STATUS_OPTIONS,
  SUPPORT_TOOLS_CACHE_OPTIONS,
  SUPPORT_TOOLS_ORIGIN_OPTIONS,
  SUPPORT_TOOLS_COMMA_SEPARATED_HINT,
} from "./support-tools/support-tools-filter-options";

interface BillingRequestConsultationsFiltersDrawerProps {
  isOpen: boolean;
  filters: SupportToolsRequestConsultationFilters;
  suggestionRows: BillingRequestConsultationRow[];
  onOpenChange: (isOpen: boolean) => void;
  onApply: (filters: SupportToolsRequestConsultationFilters) => void;
  onClear: () => void;
}

function mergeStatusCodeOptions(statusCodes: string[]) {
  const merged = new Map<string, { value: string; label: string }>();
  for (const option of SUPPORT_TOOLS_BANK_STATUS_OPTIONS) {
    merged.set(option.value, option);
  }
  for (const code of statusCodes) {
    merged.set(code, { value: code, label: code });
  }
  return [...merged.values()].sort((a, b) => a.label.localeCompare(b.label, "pt-BR", { numeric: true }));
}

export function BillingRequestConsultationsFiltersDrawer({
  isOpen,
  filters,
  suggestionRows,
  onOpenChange,
  onApply,
  onClear,
}: BillingRequestConsultationsFiltersDrawerProps) {
  const drawerWasOpenRef = useRef(false);
  const [local, setLocal] = useState(filters);

  const suggestions = useMemo(
    () => buildConsultationFilterSuggestions(suggestionRows),
    [suggestionRows],
  );

  const statusOptions = useMemo(
    () => mergeStatusCodeOptions(suggestions.statusCodes),
    [suggestions.statusCodes],
  );

  useEffect(() => {
    if (!isOpen) {
      drawerWasOpenRef.current = false;
      return;
    }
    if (drawerWasOpenRef.current) return;
    drawerWasOpenRef.current = true;
    setLocal(filters);
  }, [filters, isOpen]);

  const patch = (partial: Partial<SupportToolsRequestConsultationFilters>) => {
    setLocal((prev) => ({ ...prev, ...partial }));
  };

  const handleApply = () => {
    if (!isSupportToolsDateRangeValid(local.startDate, local.endDate)) {
      addToast({
        title: "Período inválido",
        description: "A data inicial deve ser anterior ou igual à data final.",
        color: "warning",
        timeout: 4000,
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    if ((local.startDate && !local.endDate) || (!local.startDate && local.endDate)) {
      addToast({
        title: "Período incompleto",
        description: "Selecione a data inicial e a data final.",
        color: "warning",
        timeout: 4000,
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    onApply(local);
    onOpenChange(false);
  };

  const handleClear = () => {
    setLocal(EMPTY_REQUEST_CONSULTATION_FILTERS);
    onClear();
  };

  return (
    <DynamicDrawer
      size="lg"
      title="Filtros"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={billingDrawerClassNames}
      component={
        <div className="flex flex-col gap-4">
          <SupportToolsDateRangeFields
            startDate={local.startDate}
            endDate={local.endDate}
            onStartDateChange={(value) => patch({ startDate: value })}
            onEndDateChange={(value) => patch({ endDate: value })}
          />

          <SupportToolsMultiSelectFilter
            label="Origem"
            ariaLabel="Origem"
            placeholder="Selecione a origem"
            options={SUPPORT_TOOLS_ORIGIN_OPTIONS}
            values={local.origins}
            onChange={(values) => patch({ origins: values })}
          />

          <SupportToolsFilterField label="Usuário">
            <SupportToolsFilterAutocomplete
              ariaLabel="Usuário"
              selectedValues={local.usernames}
              onSelectedValuesChange={(values) => patch({ usernames: values })}
              suggestions={suggestions.usernames}
              placeholder="Digite para buscar o usuário"
            />
          </SupportToolsFilterField>

          <SupportToolsFilterField label="Documento" hint={SUPPORT_TOOLS_COMMA_SEPARATED_HINT}>
            <Input
              aria-label="Documento"
              value={local.document}
              onValueChange={(value) => patch({ document: value.replace(/[^\d,]/g, "") })}
              inputMode="numeric"
              radius="sm"
              classNames={defaultInputClassNames}
            />
          </SupportToolsFilterField>

          <SupportToolsFilterField label="Fontes">
            <SupportToolsFilterAutocomplete
              ariaLabel="Fontes"
              selectedValues={local.dataSourceNames}
              onSelectedValuesChange={(values) => patch({ dataSourceNames: values })}
              suggestions={suggestions.sourceNames}
              placeholder="Digite para buscar a fonte"
            />
          </SupportToolsFilterField>

          <SupportToolsFilterField label="Cliente">
            <SupportToolsFilterAutocomplete
              ariaLabel="Cliente"
              selectedValues={local.clients}
              onSelectedValuesChange={(values) => patch({ clients: values })}
              suggestions={suggestions.clientNames}
              placeholder="Digite para buscar o cliente"
            />
          </SupportToolsFilterField>

          <SupportToolsMultiSelectFilter
            label="Código"
            ariaLabel="Código"
            placeholder="Selecione o código"
            options={statusOptions}
            values={local.statusCodes}
            onChange={(values) => patch({ statusCodes: values })}
          />

          <SupportToolsMultiSelectFilter
            label="Cache"
            ariaLabel="Cache"
            placeholder="Selecione"
            options={SUPPORT_TOOLS_CACHE_OPTIONS}
            values={local.caches}
            onChange={(values) => patch({ caches: values as SupportToolsCacheFilter[] })}
          />
        </div>
      }
      footer={
        <SupportToolsFiltersDrawerFooter
          onClose={() => onOpenChange(false)}
          onClear={handleClear}
          onApply={handleApply}
        />
      }
    />
  );
}
