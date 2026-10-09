"use client";

import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import { maskCurrency4 } from "@/shared/utils/currency";
import { Input } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { useMemo } from "react";
import { providerTableClassNames } from "../utils/providersTableColumns.shared";

export type LinkedSourceRow = {
  id: string;
  name: string;
  defaultCost: string;
};

export interface ProviderLinkedSourcesTableProps {
  sources: LinkedSourceRow[];
  onChange: (sources: LinkedSourceRow[]) => void;
}

type RowWithActions = LinkedSourceRow & { remove?: never };

/**
 * Mini-tabela Fontes | Custo padrão | lixeira (custo UI-only; SUP-05).
 */
export function ProviderLinkedSourcesTable({ sources, onChange }: ProviderLinkedSourcesTableProps) {
  const columns = useMemo<ColumnConfig<RowWithActions>[]>(
    () => [
      {
        id: "name",
        label: "Fontes",
        render: (value) => (
          <span className="text-sm font-medium text-default-800">{String(value)}</span>
        ),
      },
      {
        id: "defaultCost",
        label: "Custo padrão",
        width: 160,
        render: (value, row) => (
          <Input
            aria-label={`Custo padrão ${row.name}`}
            size="sm"
            radius="sm"
            placeholder="R$ 0,0000"
            value={value ? maskCurrency4(String(value)) : ""}
            onValueChange={(next) => {
              const masked = maskCurrency4(next);
              onChange(
                sources.map((source) => {
                  return source.id === row.id ? { ...source, defaultCost: masked } : source;
                }),
              );
            }}
            classNames={defaultInputClassNames}
          />
        ),
      },
      {
        id: "remove",
        label: "",
        align: "end",
        width: 56,
        render: (_, row) => (
          <button
            type="button"
            className="text-danger hover:text-danger-600 p-1 rounded-full hover:bg-danger-50 transition-all cursor-pointer"
            aria-label={`Remover ${row.name}`}
            onClick={() => onChange(sources.filter((source) => source.id !== row.id))}
          >
            <Trash2 size={18} />
          </button>
        ),
      },
    ],
    [onChange, sources],
  );

  if (sources.length === 0) {
    return null;
  }

  return (
    <DynamicTable
      columns={columns}
      data={sources}
      keyExtractor={(row) => row.id}
      emptyMessage=""
      classNames={providerTableClassNames}
    />
  );
}
