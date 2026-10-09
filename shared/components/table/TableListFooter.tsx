"use client";

import { Pagination } from "@heroui/react";
import { ColumnSelector } from "@/shared/components/ColumnSelector";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";

interface TableListFooterProps<T> {
  shownCount: number;
  totalCount: number;
  entityLabel: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  availableColumns?: ColumnConfig<T>[];
  selectedColumns?: string[];
  onColumnsChange?: (columns: string[]) => void;
  variant?: "default" | "providers";
}

function TableListPagination({
  page,
  totalPages,
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  return (
    <Pagination
      isCompact
      showControls
      showShadow
      color="primary"
      page={page}
      total={totalPages}
      onChange={onPageChange}
      className={className}
    />
  );
}

/** Rodapé de listagem com contagem, paginação opcional e seletor de colunas. */
export function TableListFooter<T>({
  shownCount,
  totalCount,
  entityLabel,
  page,
  totalPages,
  onPageChange,
  availableColumns,
  selectedColumns,
  onColumnsChange,
  variant = "default",
}: TableListFooterProps<T>) {
  const showPagination =
    page !== undefined && totalPages !== undefined && totalPages > 1 && onPageChange;
  const showColumnSelector =
    availableColumns && selectedColumns && onColumnsChange;

  if (variant === "providers") {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-default-100">
        <div className="flex items-center gap-4">
          <p className="text-sm text-default-500">
            Mostrando{" "}
            <span className="font-semibold text-default-700">{shownCount}</span> de{" "}
            <span className="font-semibold text-default-700">{totalCount}</span>{" "}
            {entityLabel}
          </p>
          {showColumnSelector && (
            <>
              <div className="hidden sm:block h-4 w-px bg-default-200" />
              <ColumnSelector
                availableColumns={availableColumns}
                selectedColumns={selectedColumns}
                onChange={onColumnsChange}
              />
            </>
          )}
        </div>
        {showPagination && (
          <TableListPagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            className="font-sans"
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-gray-600">
        Mostrando <span className="font-semibold">{shownCount}</span> de{" "}
        <span className="font-semibold">{totalCount}</span> {entityLabel}
      </p>
      <div className="flex items-center gap-4">
        {showPagination && (
          <TableListPagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
        {showColumnSelector && (
          <ColumnSelector
            availableColumns={availableColumns}
            selectedColumns={selectedColumns}
            onChange={onColumnsChange}
          />
        )}
      </div>
    </div>
  );
}
