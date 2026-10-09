"use client";

import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { formatCurrency } from "@/shared/utils/currency";
import { type ErrorResponse, getErrorMessage } from "@/shared/utils/errorParser";
import type { AxiosError } from "axios";
import { useMemo } from "react";
import type { ProviderInvoiceSourceAllocation } from "../utils/providerInvoiceAllocation.utils";
import { providerTableClassNames } from "../utils/providersTableColumns.shared";

export interface ProviderInvoiceBillableSourcesTableProps {
  sources: ProviderInvoiceSourceAllocation[];
  isLoading?: boolean;
  error?: unknown;
}

export function ProviderInvoiceBillableSourcesTable({
  sources,
  isLoading = false,
  error,
}: ProviderInvoiceBillableSourcesTableProps) {
  const columns = useMemo<ColumnConfig<ProviderInvoiceSourceAllocation>[]>(
    () => [
      { id: "directProviderName", label: "Fornecedor" },
      { id: "dataSourceName", label: "Fonte" },
      {
        id: "clientBillableQuantity",
        label: "Qtd bilhetadas",
        align: "end",
      },
      {
        id: "totalCost",
        label: "Valor total (R$)",
        align: "end",
        render: (value) => formatCurrency(String(value)),
      },
      {
        id: "unitCost",
        label: "Por consulta (R$)",
        align: "end",
        render: (value) => formatCurrency(String(value)),
      },
    ],
    [],
  );

  const errorMessage = getErrorMessage((error as AxiosError<ErrorResponse> | null) ?? null);
  const hasSources = sources.length > 0;
  const hasEligibleQueries = sources.some((source) => source.clientBillableQuantity > 0);

  if (errorMessage) {
    return (
      <p role="alert" className="text-sm text-danger-500">
        {errorMessage}
      </p>
    );
  }

  return (
    <div className="space-y-3">

      <DynamicTable
        columns={columns}
        data={sources}
        isLoading={isLoading}
        keyExtractor={(row) => `${row.directProviderId}-${row.dataSourceProviderId}`}
        emptyMessage="Nenhuma fonte vinculada para o período informado."
        classNames={providerTableClassNames}
      />
      {!isLoading && hasSources && !hasEligibleQueries && (
        <p role="alert" className="text-sm text-warning-600">
          Não há consultas bilhetadas no período informado.
        </p>
      )}
    </div>
  );
}
