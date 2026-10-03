"use client";

import { Pagination } from "@heroui/react";

interface ClientPaginatedTableFooterProps {
  visibleCount: number;
  pagination?: { totalRecords?: number; totalPages?: number } | null;
  entityLabel: string;
  page: number;
  onPageChange: (page: number) => void;
}

export function ClientPaginatedTableFooter({
  visibleCount,
  pagination,
  entityLabel,
  page,
  onPageChange,
}: ClientPaginatedTableFooterProps) {
  return (
    <div className="flex justify-between items-center mt-4 gap-4 flex-wrap">
      <p className="text-sm text-gray-600">
        Mostrando <span className="font-semibold">{visibleCount}</span> de{" "}
        <span className="font-semibold">{pagination?.totalRecords ?? 0}</span>{" "}
        {entityLabel}
      </p>
      {pagination && (pagination.totalPages ?? 0) > 1 ? (
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pagination.totalPages ?? 1}
          onChange={onPageChange}
        />
      ) : null}
    </div>
  );
}
