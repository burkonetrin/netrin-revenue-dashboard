"use client";

import { useMemo } from "react";
import { Button, Spinner } from "@heroui/react";
import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import type { DataSource } from "@/features/providers/types/data-sources.types";
import {
  buildProviderNameColumn,
  buildProviderStatusColumn,
} from "@/features/providers/utils/providersTableColumns.shared";
import { PermissionGuard } from "@/shared/components/guards/PermissionGuard";
import { CLIENTS_PERMISSIONS } from "../constants/clientsPermissions.constants";
import { useDeductibleIndividualLinkedDataSources } from "../hooks/useDeductibleIndividualLinkedDataSources";

interface FranchiseLinkedSourcesTabProps {
  franchiseId: string;
  onEdit: () => void;
}

/**
 * Aba de fontes vinculadas à franquia.
 */
export function FranchiseLinkedSourcesTab({
  franchiseId,
  onEdit,
}: FranchiseLinkedSourcesTabProps) {
  const {
    bundles,
    individualSources,
    isLoading,
    isLoadingBundles,
  } = useDeductibleIndividualLinkedDataSources(franchiseId);

  const sourcesColumns = useMemo<ColumnConfig<DataSource>[]>(
    () => [
      buildProviderStatusColumn<DataSource>(),
      buildProviderNameColumn<DataSource>(),
      {
        id: "description",
        label: "Detalhes",
        render: (value) => (
          <span className="text-default-500">{value || "—"}</span>
        ),
      },
      {
        id: "internalName",
        label: "Nome interno",
        render: (value) => (
          <code className="text-xs bg-default-100 px-2 py-0.5 rounded text-default-600">
            {value}
          </code>
        ),
      },
    ],
    [],
  );

  return (
    <div className="mt-6 space-y-8">
      <PermissionGuard permission={CLIENTS_PERMISSIONS.deductibleUpdateSources}>
        <Button
          color="primary"
          className="px-6 w-fit"
          radius="sm"
          onPress={onEdit}
        >
          Editar
        </Button>
      </PermissionGuard>

      <div className="space-y-3">
        <h3 className="text-xl font-medium text-default-700">
          Grupos de fontes
        </h3>

        {isLoadingBundles ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" color="primary" />
          </div>
        ) : bundles.length === 0 ? (
          <p className="text-sm text-default-400">
            Nenhum grupo de fontes vinculado
          </p>
        ) : (
          <div className="border border-default-200 rounded-lg max-h-[280px] overflow-y-auto">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                className="h-12 px-4 border-b border-default-200 last:border-b-0 flex items-center"
              >
                <span className="text-sm text-default-800">{bundle.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-medium text-default-700">
          Fontes individuais
        </h3>

        <DynamicTable
          columns={sourcesColumns}
          data={isLoading ? [] : individualSources}
          isLoading={isLoading}
          keyExtractor={(row) => row.id}
          emptyMessage="Nenhuma fonte individual vinculada"
          classNames={{
            th: "bg-default-100 text-default-600 font-bold text-[11px] uppercase tracking-wider",
            td: "text-default-700 border-b border-default-100 h-14 text-sm",
          }}
        />
      </div>
    </div>
  );
}
