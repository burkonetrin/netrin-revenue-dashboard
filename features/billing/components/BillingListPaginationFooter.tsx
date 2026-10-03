"use client";

import { Pagination } from "@heroui/react";

interface BillingListPaginationFooterProps {
  isTableLoading: boolean;
  recordsCount: number;
  totalRecords: number;
  page: number;
  totalPages: number;
  showPagination: boolean;
  onPageChange: (page: number) => void;
}

/**
 * Rodapé de contagem e paginação da listagem de faturas.
 */
export function BillingListPaginationFooter({
  isTableLoading,
  recordsCount,
  totalRecords,
  page,
  totalPages,
  showPagination,
  onPageChange,
}: BillingListPaginationFooterProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-600">
        {isTableLoading ? (
          "Carregando faturas..."
        ) : (
          <>
            Mostrando <span className="font-semibold">{recordsCount}</span> de{" "}
            <span className="font-semibold">{totalRecords}</span> faturas
          </>
        )}
      </p>

      {!isTableLoading && showPagination && (
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={totalPages}
          onChange={onPageChange}
        />
      )}
    </div>
  );
}
