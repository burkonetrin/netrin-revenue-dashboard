"use client";

import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { maskCurrency, unmaskCurrency } from "@/shared/utils/currency";
import { Input } from "@heroui/react";
import { useCallback, useMemo } from "react";
import {
  type DirectPrepaidSource,
  updateDirectPrepaidSource,
} from "../utils/providerDirectPrepaidSources.utils";
import { providerTableClassNames } from "../utils/providersTableColumns.shared";

export interface DirectPrepaidCompetenceSourcesTableProps {
  sources: DirectPrepaidSource[];
  onChange: (sources: DirectPrepaidSource[]) => void;
  isLoading?: boolean;
  error?: unknown;
  errorMessage?: string;
  isDisabled?: boolean;
}

/** Editable source costs for the direct prepaid competence, following the Figma table order. */
export function DirectPrepaidCompetenceSourcesTable({
  sources,
  onChange,
  isLoading = false,
  error,
  errorMessage,
  isDisabled = false,
}: DirectPrepaidCompetenceSourcesTableProps) {
  const updateSource = useCallback(
    (index: number, field: "unitCost" | "totalCost", value: string) => {
      const normalizedValue = value.trim() ? unmaskCurrency(value).toFixed(2) : "";
      onChange(
        sources.map((source, currentIndex) => {
          if (currentIndex !== index) return source;
          return normalizedValue
            ? updateDirectPrepaidSource(source, field, normalizedValue)
            : { ...source, [field]: "" };
        }),
      );
    },
    [onChange, sources],
  );

  const columns = useMemo<ColumnConfig<DirectPrepaidSource>[]>(
    () => [
      { id: "dataSourceName", label: "Fonte" },
      { id: "clientBillableQuantity", label: "Qtd bilhetadas", align: "end" },
      {
        id: "providerChargedQuantity",
        label: "Qtd cobradas",
        align: "end",
        render: (quantity, row) => {
          const index = sources.indexOf(row);
          return (
            <Input
              aria-label={`Quantidade cobrada ${row.dataSourceName}`}
              value={quantity === null ? "" : String(quantity)}
              inputMode="numeric"
              size="sm"
              isDisabled={isDisabled}
              onValueChange={(next) => {
                const normalized = next.trim();
                onChange(
                  sources.map((source, currentIndex) => {
                    if (currentIndex !== index) return source;
                    return {
                      ...source,
                      providerChargedQuantity: normalized ? Number(normalized) : null,
                    };
                  }),
                );
              }}
            />
          );
        },
      },
      {
        id: "totalCost",
        label: "Valor total (R$)",
        align: "end",
        render: (totalCost, row) => (
          <Input
            aria-label={`Valor total ${row.dataSourceName}`}
            value={maskCurrency(String(totalCost))}
            size="sm"
            isDisabled={isDisabled}
            onValueChange={(next) => updateSource(sources.indexOf(row), "totalCost", next)}
          />
        ),
      },
      {
        id: "unitCost",
        label: "Por consulta (R$)",
        align: "end",
        render: (unitCost, row) => (
          <Input
            aria-label={`Por consulta ${row.dataSourceName}`}
            value={maskCurrency(String(unitCost))}
            size="sm"
            isDisabled={isDisabled}
            onValueChange={(next) => updateSource(sources.indexOf(row), "unitCost", next)}
          />
        ),
      },
    ],
    [isDisabled, onChange, sources, updateSource],
  );

  if (error) {
    return (
      <p role="alert" className="text-sm text-danger-500">
        Não foi possível carregar as fontes.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <DynamicTable
        columns={columns}
        data={sources}
        isLoading={isLoading}
        keyExtractor={(row) => row.dataSourceProviderId}
        emptyMessage="Nenhuma fonte vinculada para o período informado."
        classNames={providerTableClassNames}
      />
      {sources.length > 0 && sources.every((source) => source.clientBillableQuantity <= 0) && (
        <p role="alert" className="text-sm text-warning-600">
          Não há consultas bilhetadas no período informado.
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="text-sm text-danger-500">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
