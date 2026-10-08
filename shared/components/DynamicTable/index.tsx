"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@heroui/react";
import { ChevronDown } from "lucide-react";
import type { DynamicTableProps } from "./types";

export function DynamicTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "Nenhum dado encontrado",
  classNames,
  layout = "auto",
  onRowClick,
  isRowClickable,
  sortDescriptor,
  onSortChange,
  expandable = false,
  expandColumnLabel,
  expandedContent,
  expandedRowKeys: externalExpandedRowKeys,
  onExpandedChange,
  isLoading,
  disableRowHover = false,
  getCellClassName,
}: DynamicTableProps<T>) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [internalExpandedRowKeys, setInternalExpandedRowKeys] = useState<
    Set<string | number>
  >(new Set());

  const expandedRowKeys = externalExpandedRowKeys ?? internalExpandedRowKeys;
  const setExpandedRowKeys =
    onExpandedChange || !externalExpandedRowKeys
      ? (key: string | number, isExpanded: boolean) => {
          if (onExpandedChange) {
            onExpandedChange(key, isExpanded);
          } else if (!externalExpandedRowKeys) {
            setInternalExpandedRowKeys((prev) => {
              const next = new Set(prev);
              if (isExpanded) next.add(key);
              else next.delete(key);
              return next;
            });
          }
        }
      : undefined;

  const displayColumns = useMemo(() => {
    if (!expandable) return columns;
    return [
      ...columns,
      {
        id: "__expand__",
        label: expandColumnLabel ?? "",
        align: expandColumnLabel ? ("start" as const) : ("end" as const),
        width: expandColumnLabel ? 100 : 50,
      },
    ];
  }, [columns, expandable, expandColumnLabel]);

  const handleRowClick = (row: T) => {
    if (expandable && setExpandedRowKeys) {
      const key = keyExtractor(row);
      setExpandedRowKeys(key, !expandedRowKeys.has(key));
    }
    onRowClick?.(row);
  };

  return (
    <Table
      removeWrapper
      aria-label="Tabela dinâmica"
      layout={layout}
      sortDescriptor={sortDescriptor}
      onSortChange={onSortChange}
      classNames={{
        wrapper: classNames?.wrapper || "shadow-none",
        table: classNames?.table,
        th:
          classNames?.th ||
          "bg-gray-50 text-gray-700 font-semibold text-xs first:rounded-s-lg last:rounded-e-lg",
        td:
          classNames?.td ||
          "text-gray-900 border-b border-gray-200 h-12 text-xs",
      }}
    >
      <TableHeader>
        {displayColumns.map((column) => (
          <TableColumn
            key={String(column.id)}
            align={column.align}
            width={column.width}
            className={column.headerClassName}
            allowsSorting={isMounted ? column.sortable : false}
          >
            {column.label}
          </TableColumn>
        ))}
      </TableHeader>
      <TableBody
        emptyContent={emptyMessage}
        isLoading={isLoading}
        loadingContent={<Spinner label="Carregando..." color="primary" />}
      >
        {data.map((row) => {
          const rowKey = keyExtractor(row);
          const isExpanded = expandable && expandedRowKeys.has(rowKey);
          const rowIsClickable = isRowClickable
            ? isRowClickable(row)
            : Boolean(onRowClick || expandable);

          return (
            <React.Fragment key={rowKey}>
              <TableRow
                className={
                  disableRowHover
                    ? rowIsClickable
                      ? "cursor-pointer"
                      : ""
                    : rowIsClickable
                      ? "hover:bg-gray-50 cursor-pointer"
                      : "hover:bg-gray-50"
                }
                onClick={() => handleRowClick(row)}
              >
                {displayColumns.map((column) => {
                  if (column.id === "__expand__") {
                    return (
                      <TableCell key={String(column.id)}>
                        <div
                          className={
                            expandColumnLabel
                              ? "flex justify-center"
                              : "flex justify-end"
                          }
                        >
                          <ChevronDown
                            size={20}
                            className={`text-gray-400 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </TableCell>
                    );
                  }
                  return (
                    <TableCell
                      key={String(column.id)}
                      className={
                        [column.cellClassName, getCellClassName?.(row, column.id)]
                          .filter(Boolean)
                          .join(" ") || undefined
                      }
                    >
                      {column.render
                        ? column.render(
                            (row as Record<string, unknown>)[column.id as string],
                            row,
                          )
                        : String(
                            (row as Record<string, unknown>)[column.id as string] ??
                              "",
                          )}
                    </TableCell>
                  );
                })}
              </TableRow>
              {expandable && isExpanded && expandedContent ? (
                <TableRow>
                  <TableCell
                    colSpan={displayColumns.length}
                    className="p-0 bg-gray-50"
                  >
                    <div className="p-4">{expandedContent(row)}</div>
                  </TableCell>
                </TableRow>
              ) : null}
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
