"use client";

import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { TableListFooter } from "@/shared/components/table/TableListFooter";
import { type ErrorResponse, getErrorMessage } from "@/shared/utils/errorParser";
import { Button } from "@heroui/react";
import type { AxiosError } from "axios";
import { CirclePlus, Eye, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { useProviderInvoices } from "../hooks/useProviderInvoices";
import type { ProviderInvoiceResponse } from "../types/providerInvoices.types";
import type { ProviderResponse } from "../types/providers.types";
import {
  formatAccumulatedValue,
  formatCompetenceMonth,
  formatLastCreditDeposit,
} from "../utils/providerInvoice.utils";
import { providerTableClassNames } from "../utils/providersTableColumns.shared";
import { ProviderPrepaidCompetenceDrawer } from "./ProviderPrepaidCompetenceDrawer";

export interface ProviderCostsTabProps {
  providerId: string;
  provider: ProviderResponse;
}

type CostRow = ProviderInvoiceResponse & {
  lastDeposit?: never;
  accumulated?: never;
  actions?: never;
};

/**
 * Aba Custos (pré-pago). Competências abertas usam o formulário de edição; fechadas são somente leitura.
 */
export function ProviderCostsTab({ providerId, provider }: ProviderCostsTabProps) {
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCompetence, setEditingCompetence] = useState<ProviderInvoiceResponse>();
  const [isReadOnly, setIsReadOnly] = useState(false);
  const { data, isLoading, error, refetch } = useProviderInvoices(providerId, {
    page,
    pageSize: 20,
  });

  const columns = useMemo<ColumnConfig<CostRow>[]>(
    () => [
      {
        id: "competenceMonth",
        label: "Competência",
        render: (value) => formatCompetenceMonth(String(value)),
      },
      {
        id: "lastDeposit",
        label: "Último depósito de crédito",
        render: (_, row) => formatLastCreditDeposit(row.creditDeposits),
      },
      {
        id: "accumulated",
        label: "Valor acumulado",
        render: (_, row) => formatAccumulatedValue(row),
      },
      {
        id: "actions",
        label: "Ações",
        align: "end",
        width: 80,
        render: (_, row) => (
          <div className="flex justify-end">
            {row.isOpen === true ? (
              <button
                type="button"
                className="text-primary cursor-pointer"
                aria-label="Editar competência"
                title="Editar competência"
                onClick={() => {
                  setEditingCompetence(row);
                  setIsReadOnly(false);
                  setIsDrawerOpen(true);
                }}
              >
                <Pencil size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="text-primary cursor-pointer"
                aria-label="Consultar competência"
                title="Consultar competência"
                onClick={() => {
                  setEditingCompetence(row);
                  setIsReadOnly(true);
                  setIsDrawerOpen(true);
                }}
              >
                <Eye size={18} />
              </button>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  const competences = data?.data ?? [];
  const pagination = data?.pagination;
  const errorMessage = getErrorMessage((error as AxiosError<ErrorResponse> | null) ?? null);

  return (
    <div className="space-y-6">
      <Button
        color="primary"
        radius="sm"
        startContent={<CirclePlus size={18} />}
        onPress={() => {
          setEditingCompetence(undefined);
          setIsReadOnly(false);
          setIsDrawerOpen(true);
        }}
      >
        Nova competência
      </Button>

      {errorMessage && <p className="text-sm text-danger-500">{errorMessage}</p>}

      <DynamicTable
        columns={columns}
        data={competences}
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhuma competência encontrada"
        classNames={providerTableClassNames}
      />

      <TableListFooter
        shownCount={competences.length}
        totalCount={pagination?.totalRecords ?? 0}
        entityLabel="competências"
        page={page}
        totalPages={pagination?.totalPages}
        onPageChange={setPage}
        variant="providers"
      />
      <ProviderPrepaidCompetenceDrawer
        providerId={providerId}
        provider={provider}
        editingCompetence={editingCompetence}
        isReadOnly={isReadOnly}
        isOpen={isDrawerOpen}
        onOpenChange={(isOpen) => {
          setIsDrawerOpen(isOpen);
          if (!isOpen) {
            setEditingCompetence(undefined);
            setIsReadOnly(false);
          }
        }}
        onSuccess={() => {
          setPage(1);
          void refetch();
        }}
      />
    </div>
  );
}
