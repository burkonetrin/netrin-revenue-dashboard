"use client";

import { Pagination } from "@heroui/react";

interface TableListFooterProps {
  shownCount: number;
  totalCount: number;
  entityLabel: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function TableListFooter({
  shownCount,
  totalCount,
  entityLabel,
  page,
  totalPages,
  onPageChange,
}: TableListFooterProps) {
  const showPagination =
    page !== undefined &&
    totalPages !== undefined &&
    totalPages > 1 &&
    onPageChange;

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-gray-600">
        Mostrando <span className="font-semibold">{shownCount}</span> de{" "}
        <span className="font-semibold">{totalCount}</span> {entityLabel}
      </p>
      {showPagination ? (
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={totalPages}
          onChange={onPageChange}
        />
      ) : null}
    </div>
  );
}
