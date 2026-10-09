"use client";

import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { maskCurrency, unmaskCurrency } from "@/shared/utils/currency";
import { Input } from "@heroui/react";
import { useMemo } from "react";
import { providerTableClassNames } from "../utils/providersTableColumns.shared";
import {
  updateDirectInvoiceSource,
  type ProviderInvoiceDirectSource,
} from "../utils/providerInvoiceDirect.utils";

export interface ProviderInvoiceDirectSourcesTableProps {
  sources: ProviderInvoiceDirectSource[];
  onChange: (sources: ProviderInvoiceDirectSource[]) => void;
  isLoading?: boolean;
  error?: unknown;
}

export function ProviderInvoiceDirectSourcesTable({
  sources,
  onChange,
  isLoading = false,
  error,
}: ProviderInvoiceDirectSourcesTableProps) {
  const updateSource = (index: number, field: "unitCost" | "totalCost", value: string) => {
    const normalizedValue = value.trim() ? unmaskCurrency(value).toFixed(2) : "";
    onChange(sources.map((source, currentIndex) => {
      if (currentIndex !== index) return source;
      return normalizedValue
        ? updateDirectInvoiceSource(source, field, normalizedValue)
        : { ...source, [field]: "" };
    }));
  };

  const columns = useMemo<ColumnConfig<ProviderInvoiceDirectSource>[]>(
    () => [
      { id: "dataSourceName", label: "Fonte" },
      { id: "clientBillableQuantity", label: "Qtd bilhetadas", align: "end" },
      {
        id: "providerChargedQuantity",
        label: "Qtd cobrada",
        align: "end",
        render: (value, row) => {
          const index = sources.indexOf(row);
          return (
            <Input
              aria-label={`Quantidade cobrada ${row.dataSourceName}`}
              value={value === null ? "" : String(value)}
              inputMode="numeric"
              size="sm"
              onValueChange={(next) => {
                const normalized = next.trim();
                onChange(sources.map((source, currentIndex) => {
                  if (currentIndex !== index) return source;
                  return {
                    ...source,
                    providerChargedQuantity: normalized ? Number(normalized) : null,
                  };
                }));
              }}
            />
          );
        },
      },
      {
        id: "totalCost",
        label: "Valor total (R$)",
        align: "end",
        render: (value, row) => (
          <Input
            aria-label={`Valor total ${row.dataSourceName}`}
            value={maskCurrency(String(value))}
            size="sm"
            onValueChange={(next) => updateSource(sources.indexOf(row), "totalCost", next)}
          />
        ),
      },
      {
        id: "unitCost",
        label: "Por consulta (R$)",
        align: "end",
        render: (value, row) => (
          <Input
            aria-label={`Por consulta ${row.dataSourceName}`}
            value={maskCurrency(String(value))}
            size="sm"
            onValueChange={(next) => updateSource(sources.indexOf(row), "unitCost", next)}
          />
        ),
      },
    ],
    [onChange, sources],
  );

  if (error) {
    return <p role="alert" className="text-sm text-danger-500">Não foi possível carregar as fontes.</p>;
  }

  return (
    <DynamicTable
      columns={columns}
      data={sources}
      isLoading={isLoading}
      keyExtractor={(row) => row.dataSourceProviderId}
      emptyMessage="Nenhuma fonte vinculada para o período informado."
      classNames={providerTableClassNames}
    />
  );
}
