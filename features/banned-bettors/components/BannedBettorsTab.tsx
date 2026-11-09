"use client";

import { usePersonRestrictionSports } from "@/features/banned-bettors/hooks/usePersonRestrictionSports";
import { useTriggerPersonRestrictionSportUpdate } from "@/features/banned-bettors/hooks/useTriggerPersonRestrictionSportUpdate";
import type { PersonRestrictionSportListItem } from "@/features/banned-bettors/types/person-restriction.types";
import { personRestrictionSportDetailPath } from "@/constants";
import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { useMemo } from "react";

function formatBrDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
import { Link } from "react-router-dom";

/** Listagem de esportes — aba Impedidos de apostar. */
export function BannedBettorsTab() {
  const { data: sports = [], isLoading, error } = usePersonRestrictionSports();
  const triggerUpdate = useTriggerPersonRestrictionSportUpdate();
  const sortedSports = useMemo(
    () => [...sports].sort((first, second) => Number(first.id) - Number(second.id)),
    [sports],
  );

  const allColumns: ColumnConfig<PersonRestrictionSportListItem>[] = useMemo(
    () => [
      {
        id: "id",
        label: "ID",
        width: 100,
      },
      {
        id: "name",
        label: "Esporte",
        render: (value, row) => (
          <Link
            to={personRestrictionSportDetailPath(row.id)}
            className="text-primary hover:underline font-medium"
          >
            {value}
          </Link>
        ),
      },
      {
        id: "lastUpdate",
        label: "Última atualização",
        render: (value) => (value ? formatBrDate(value) : "—"),
      },
      {
        id: "daysNextUpdate",
        label: "Periodicidade de atualização (dias)",
      },
      {
        id: "action",
        label: "Ações",
        width: 50,
        render: (_, row) => (
          <button
            type="button"
            disabled={!row.canTriggerUpdate || triggerUpdate.isPending}
            onClick={() => triggerUpdate.mutate(row.id)}
            className="rounded-md border border-default-300 bg-white px-3 py-2 text-xs text-gray-900 transition-colors hover:bg-default-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Atualizar
          </button>
        ),
      },
    ],
    [triggerUpdate],
  );

  return (
    <div className="space-y-6">
      {error && <p role="alert">Não foi possível carregar os esportes impedidos.</p>}
      <DynamicTable
        columns={allColumns}
        data={sortedSports}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhuma pessoa impedida encontrada"
        isLoading={isLoading}
        classNames={{
          th: "bg-gray-50 text-gray-700 font-semibold text-xs",
          td: "text-gray-900 border-b border-gray-200 h-12 text-xs",
        }}
      />
    </div>
  );
}
