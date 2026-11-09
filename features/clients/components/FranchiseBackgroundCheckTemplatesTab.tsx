"use client";

import {
  type BackgroundCheckTemplate,
  useBackgroundCheckTemplatesByDeductible,
  useRemoveBackgroundCheckTemplateFromDeductible,
} from "@/features/background-check-templates";
import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { Button, addToast } from "@heroui/react";
import { Info, Trash2 } from "lucide-react";
import { useCallback, useMemo } from "react";
import { PermissionGuard } from "@/shared/components/guards/PermissionGuard";
import { CLIENTS_PERMISSIONS } from "../constants/clientsPermissions.constants";

interface FranchiseBackgroundCheckTemplatesTabProps {
  franchiseId: string;
  onEdit?: () => void;
}

function getConsultationTypeLabel(template: BackgroundCheckTemplate) {
  const consultationType = template.consultationType ?? template.consultation_type;
  if (consultationType && typeof consultationType === "object") return consultationType.label;
  return consultationType ?? template.queryType ?? template.query_type ?? "-";
}

function getSourcesCount(template: BackgroundCheckTemplate) {
  return template.sources ?? template.sourcesCount ?? template.sources_count ?? 0;
}

function formatCurrency(value: BackgroundCheckTemplate["cost"]) {
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "string") return value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Aba de templates de background check da franquia.
 */
export function FranchiseBackgroundCheckTemplatesTab({
  franchiseId,
  onEdit,
}: FranchiseBackgroundCheckTemplatesTabProps) {
  const { data: templates = [], isLoading } = useBackgroundCheckTemplatesByDeductible(franchiseId);
  const removeTemplate = useRemoveBackgroundCheckTemplateFromDeductible();

  const handleRemoveTemplate = useCallback(
    async (template: BackgroundCheckTemplate) => {
      try {
        await removeTemplate.mutateAsync({
          deductibleId: franchiseId,
          backgroundCheckTemplateIds: [template.id],
        });
        addToast({
          title: "Modelo removido",
          description: "O modelo foi removido da franquia.",
          color: "success",
        });
      } catch {
        addToast({
          title: "Erro ao remover",
          description: "Não foi possível remover o modelo da franquia.",
          color: "danger",
        });
      }
    },
    [franchiseId, removeTemplate],
  );

  const columns = useMemo<ColumnConfig<BackgroundCheckTemplate>[]>(
    () => [
      {
        id: "name",
        label: "Nome",
        render: (value) => <span className="font-medium text-default-800">{value}</span>,
      },
      {
        id: "description",
        label: "Descrição",
        render: (value) => <span className="text-default-600">{value || "-"}</span>,
      },
      {
        id: "consultationType",
        label: "Tipo de consulta",
        render: (_, row) => getConsultationTypeLabel(row),
      },
      {
        id: "cost",
        label: "Custo padrão (R$)",
        render: (_, row) => formatCurrency(row.cost),
      },
      {
        id: "sources",
        label: "Fontes",
        render: (_, row) => (
          <div className="flex items-center gap-3">
            <span>{getSourcesCount(row)}</span>
            <Info size={18} className="text-primary" />
          </div>
        ),
      },
      {
        id: "actions",
        label: "Ações",
        align: "end",
        render: (_, row) => (
          <div className="flex justify-end">
            <button
              type="button"
              className="cursor-pointer text-danger hover:text-danger-600 transition-colors disabled:opacity-50"
              onClick={(event) => {
                event.stopPropagation();
                void handleRemoveTemplate(row);
              }}
              disabled={removeTemplate.isPending}
              aria-label="Remover modelo"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
      },
    ],
    [handleRemoveTemplate, removeTemplate.isPending],
  );

  return (
    <div className="mt-6 space-y-6">
      <PermissionGuard permission={CLIENTS_PERMISSIONS.deductibleUpdateSources}>
        <Button color="primary" className="px-6 w-fit" radius="sm" onPress={onEdit}>
          Adicionar modelo
        </Button>
      </PermissionGuard>

      <DynamicTable
        columns={columns}
        data={templates}
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhum modelo Background Check vinculado"
        classNames={{
          th: "bg-default-100 text-gray-700 font-semibold text-xs",
          td: "text-gray-900 border-b border-gray-200 h-12 text-xs",
        }}
      />
    </div>
  );
}
