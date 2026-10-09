"use client";

import { Chip } from "@heroui/react";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";

function renderProviderActiveStatusChip(value: boolean) {
  return (
    <Chip
      size="sm"
      variant="flat"
      color={value ? "success" : "danger"}
      className={
        value
          ? "bg-success-50 text-success-700 border-success-100"
          : "bg-danger-50 text-danger-700 border-danger-100"
      }
    >
      {value ? "Ativo" : "Inativo"}
    </Chip>
  );
}

/** Coluna de status ativo/inativo das tabelas de providers. */
export function buildProviderStatusColumn<T>(): ColumnConfig<T> {
  return {
    id: "isActive",
    label: "Status",
    width: 100,
    render: (value) => renderProviderActiveStatusChip(Boolean(value)),
  };
}

/** Coluna de nome das tabelas de providers. */
export function buildProviderNameColumn<T>(): ColumnConfig<T> {
  return {
    id: "name",
    label: "Nome",
    sortable: true,
    render: (value) => <span className="font-medium text-default-800">{String(value)}</span>,
  };
}

/** Coluna de ID truncado das tabelas de providers. */
export function buildProviderIdColumn<T>(): ColumnConfig<T> {
  return {
    id: "id",
    label: "ID",
    width: 60,
    render: (value) => (
      <span className="text-default-400 font-mono text-xs">{String(value).slice(0, 8)}</span>
    ),
  };
}

/** Coluna de descrição das tabelas de providers. */
export function buildProviderDescriptionColumn<T>(): ColumnConfig<T> {
  return {
    id: "description",
    label: "Descrição",
    render: (value) => (
      <span className="text-default-500 line-clamp-1">{value ? String(value) : "—"}</span>
    ),
  };
}

/** Coluna de nome interno das tabelas de providers. */
export function buildProviderInternalNameColumn<T>(): ColumnConfig<T> {
  return {
    id: "internalName",
    label: "Nome interno",
    render: (value) => (
      <code className="text-xs bg-default-100 px-2 py-0.5 rounded text-default-600">
        {String(value)}
      </code>
    ),
  };
}

/** classNames compartilhados das tabelas de providers (espelha staging Nucleus). */
export const providerTableClassNames = {
  th: "bg-default-100 text-gray-500 font-semibold text-xs h-11",
  td: "text-gray-900 border-b border-gray-200 h-12 text-xs",
} as const;

/** Cabeçalho de `<table>` nativa (mesmo visual do `providerTableClassNames.th`). */
export const providerNativeTableHeadCellClass =
  "bg-default-100 text-gray-500 font-semibold text-xs h-11 px-4 text-left align-middle border-b border-gray-200";

/** Layout do rodapé de drawers (alinhado ao billing / demais telas). */
export const providerDrawerFooterClass = "flex w-full justify-end gap-2.5";

/** Botão secundário (cancelar / voltar) em drawers de providers. */
export const providerDrawerSecondaryButtonClass = "h-10 border border-gray-300 px-6";

/** Botão primário em drawers de providers. */
export const providerDrawerPrimaryButtonClass =
  "h-10 px-6 font-semibold text-white shadow-md";

/** Totalizador compacto (mesmo visual do painel comercial / faturamento, menor). */
export const providerCompactTotalizerCardClass = "rounded-sm bg-sky-50 px-3 py-2.5";
export const providerCompactTotalizerLabelClass = "text-xs text-gray-500";
export const providerCompactTotalizerValueClass =
  "mt-1 text-base font-semibold text-gray-900";
