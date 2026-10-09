"use client";

import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { Button, Chip, Input } from "@heroui/react";
import { CirclePlus, Link, Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { BackgroundCheckTemplatePreviewRow } from "../types/backgroundCheckTemplatePreview.types";
import { providerTableClassNames } from "@/features/providers/utils/providersTableColumns.shared";
import { filterBackgroundCheckTemplatePreviewRows } from "../utils/mapBackgroundCheckTemplatePreview";

export type BackgroundCheckTemplatesPreviewTableProps = {
  rows: BackgroundCheckTemplatePreviewRow[];
  isLoading?: boolean;
  canCreate?: boolean;
  canViewBindings?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  onCreate?: () => void;
  onBindings?: (row: BackgroundCheckTemplatePreviewRow) => void;
  onEdit?: (row: BackgroundCheckTemplatePreviewRow) => void;
  onDelete?: (row: BackgroundCheckTemplatePreviewRow) => void;
};

const consultationTypeLabels: Record<string, string> = {
  "br-person": "Pessoa Física",
  "br-entity": "Pessoa Jurídica",
  "intl-entity": "Pessoa estrangeira",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  minimumFractionDigits: 2,
  style: "currency",
});

function formatCost(value: number | null) {
  return value === null ? "-" : currencyFormatter.format(value);
}

function actionButtonLabel(action: "bindings" | "edit" | "delete", name: string) {
  const labels = {
    bindings: `Ver vínculos de ${name}`,
    edit: `Editar modelo ${name}`,
    delete: `Excluir modelo ${name}`,
  };
  return labels[action];
}

export function BackgroundCheckTemplatesPreviewTable({
  rows,
  isLoading = false,
  canCreate = true,
  canViewBindings = true,
  canUpdate = true,
  canDelete = true,
  onCreate,
  onBindings,
  onEdit,
  onDelete,
}: BackgroundCheckTemplatesPreviewTableProps) {
  const [search, setSearch] = useState("");
  const filteredRows = useMemo(
    () => filterBackgroundCheckTemplatePreviewRows(rows, search),
    [rows, search],
  );

  const columns = useMemo<ColumnConfig<BackgroundCheckTemplatePreviewRow>[]>(
    () => [
      {
        id: "isActive",
        label: "Status",
        render: (isActive) => (
          <Chip
            size="sm"
            variant="flat"
            color={isActive ? "success" : "default"}
            classNames={{
              content: "text-xs",
              base: "h-7",
            }}
          >
            {isActive ? "Ativo" : "Inativo"}
          </Chip>
        ),
      },
      { id: "name", label: "Nome", cellClassName: "text-sm font-medium" },
      {
        id: "description",
        label: "Descrição",
        render: (description) => <span className="text-sm">{description || "-"}</span>,
      },
      {
        id: "consultationType",
        label: "Tipo de consulta",
        render: (consultationType) => (
          <span className="text-sm">{consultationTypeLabels[String(consultationType)] ?? "-"}</span>
        ),
      },
      {
        id: "defaultCost",
        label: "Custo padrão (R$)",
        render: (cost) => <span className="text-sm">{formatCost(cost)}</span>,
      },
      {
        id: "realCost",
        label: "Custo real (R$)",
        render: (cost) => <span className="text-sm">{formatCost(cost)}</span>,
      },
      {
        id: "sourceNames",
        label: "Fontes",
        render: (sourceNames: string[]) => (
          <span className="text-sm">{sourceNames.length > 0 ? sourceNames.join(", ") : "-"}</span>
        ),
      },
      {
        id: "actions",
        label: "Ações",
        align: "end",
        render: (_value, row) => (
          <div className="flex items-center justify-end gap-1">
            {canViewBindings && (
              <Button
                aria-label={actionButtonLabel("bindings", row.name)}
                title="Ver vínculos"
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => onBindings?.(row)}
              >
                <Link size={18} className="text-primary" aria-hidden="true" />
              </Button>
            )}
            {canUpdate && (
              <Button
                aria-label={actionButtonLabel("edit", row.name)}
                title="Editar modelo"
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => onEdit?.(row)}
              >
                <Pencil size={18} className="text-primary" aria-hidden="true" />
              </Button>
            )}
            {canDelete && (
              <Button
                aria-label={actionButtonLabel("delete", row.name)}
                title="Excluir modelo"
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onPress={() => onDelete?.(row)}
              >
                <Trash2 size={16} aria-hidden="true" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [canDelete, canUpdate, canViewBindings, onBindings, onDelete, onEdit],
  );

  return (
    <section className="flex flex-col gap-4" aria-label="Modelos Background Check">
      <div className="flex items-center gap-3">
        <Input
          aria-label="Pesquisar modelos"
          className="max-w-sm flex-1 text-sm"
          placeholder="Pesquise por modelo ou fonte"
          value={search}
          onValueChange={setSearch}
          startContent={<Search size={18} className="text-default-400" />}
        />
        {canCreate && (
          <Button
            color="primary"
            radius="sm"
            className="text-sm"
            onPress={onCreate}
            startContent={<CirclePlus size={18} />}
          >
            Novo modelo
          </Button>
        )}
      </div>

      <DynamicTable
        columns={columns}
        data={filteredRows}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhum modelo encontrado"
        isLoading={isLoading}
        classNames={providerTableClassNames}
      />
    </section>
  );
}
