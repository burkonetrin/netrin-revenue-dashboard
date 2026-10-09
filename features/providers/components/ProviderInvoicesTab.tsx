"use client";

import { DeleteConfirmModal } from "@/shared/components/DeleteConfirmModal";
import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { TableListFooter } from "@/shared/components/table/TableListFooter";
import { type ErrorResponse, getErrorMessage } from "@/shared/utils/errorParser";
import { Button } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { CirclePlus, Download, Eye, Pencil, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useArchiveProviderInvoice } from "../hooks/useArchiveProviderInvoice";
import { useProviderInvoices } from "../hooks/useProviderInvoices";
import type { ProviderInvoiceResponse } from "../types/providerInvoices.types";
import type { ProviderDetail } from "../types/providers.types";
import { formatCompetenceMonth, formatInvoiceValue } from "../utils/providerInvoice.utils";
import { resolveProviderInvoiceVariant } from "../utils/providerInvoiceVariant.utils";
import { invalidateProviderDetail } from "../utils/providersQueryInvalidation";
import { providerTableClassNames } from "../utils/providersTableColumns.shared";
import { ProviderInvoiceDrawer } from "./ProviderInvoiceDrawer";

export interface ProviderInvoicesTabProps {
  providerId: string;
  provider?: ProviderDetail;
}

type InvoiceRow = ProviderInvoiceResponse & { actions?: never };

/**
 * Aba Faturas (pós-pago), com edição habilitada somente para snapshots abertos.
 */
export function ProviderInvoicesTab({ providerId, provider }: ProviderInvoicesTabProps) {
  const [page, setPage] = useState(1);
  const [isInvoiceDrawerOpen, setIsInvoiceDrawerOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<ProviderInvoiceResponse>();
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [invoicePendingArchive, setInvoicePendingArchive] = useState<ProviderInvoiceResponse>();
  const queryClient = useQueryClient();
  const archiveInvoice = useArchiveProviderInvoice(providerId);
  const { data, isLoading, error } = useProviderInvoices(providerId, {
    page,
    pageSize: 20,
  });

  const columns = useMemo<ColumnConfig<InvoiceRow>[]>(
    () => [
      {
        id: "competenceMonth",
        label: "Competência",
        render: (value) => formatCompetenceMonth(String(value)),
      },
      {
        id: "invoiceTotalValue",
        label: "Valor",
        align: "center",
        render: (value) => formatInvoiceValue(String(value)),
      },
      {
        id: "actions",
        label: "Ações",
        align: "end",
        width: 128,
        render: (_, row) => (
          <div className="flex items-center justify-end gap-3">
            {row.isOpen === true && (
              <button
                type="button"
                className="text-primary cursor-pointer"
                aria-label="Editar fatura"
                title="Editar fatura"
                onClick={() => {
                  setEditingInvoice(row);
                  setIsInvoiceDrawerOpen(true);
                }}
              >
                <Pencil size={18} />
              </button>
            )}
            {row.isOpen !== true && (
              <button
                type="button"
                className="text-primary cursor-pointer"
                aria-label="Consultar fatura"
                title="Consultar fatura"
                onClick={() => {
                  setEditingInvoice(row);
                  setIsReadOnly(true);
                  setIsInvoiceDrawerOpen(true);
                }}
              >
                <Eye size={18} />
              </button>
            )}
            <button
              type="button"
              className={
                row.invoiceFileUrl
                  ? "text-primary cursor-pointer"
                  : "text-default-300 cursor-not-allowed"
              }
              aria-label="Download fatura"
              title={row.invoiceFileUrl ? "Baixar anexo da fatura" : "Fatura sem anexo"}
              disabled={!row.invoiceFileUrl}
              onClick={() => {
                if (row.invoiceFileUrl) {
                  window.open(row.invoiceFileUrl, "_blank", "noopener,noreferrer");
                }
              }}
            >
              <Download size={18} />
            </button>
            <button
              type="button"
              className="text-danger cursor-pointer"
              aria-label="Excluir fatura"
              title="Excluir fatura"
              onClick={() => setInvoicePendingArchive(row)}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const invoices = data?.data ?? [];
  const pagination = data?.pagination;
  const errorMessage = getErrorMessage((error as AxiosError<ErrorResponse> | null) ?? null);
  const variant = resolveProviderInvoiceVariant(provider);
  const canCreateInvoice =
    variant.status === "valid" &&
    (variant.variant === "indirect-postpaid" || variant.variant === "direct-postpaid");
  const handleInvoiceSaved = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["providers", "invoices", providerId] });
    invalidateProviderDetail(queryClient, providerId);
  }, [providerId, queryClient]);

  return (
    <div className="space-y-6">
      <Button
        color="primary"
        radius="sm"
        startContent={<CirclePlus size={18} />}
        onPress={() => {
          if (canCreateInvoice) {
            setEditingInvoice(undefined);
            setIsReadOnly(false);
            setIsInvoiceDrawerOpen(true);
          }
        }}
      >
        Nova fatura
      </Button>

      {errorMessage && <p className="text-sm text-danger-500">{errorMessage}</p>}

      <DynamicTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhuma fatura encontrada"
        classNames={providerTableClassNames}
      />

      <TableListFooter
        shownCount={invoices.length}
        totalCount={pagination?.totalRecords ?? 0}
        entityLabel="faturas"
        page={page}
        totalPages={pagination?.totalPages}
        onPageChange={setPage}
        variant="providers"
      />

      {canCreateInvoice && provider && (
        <ProviderInvoiceDrawer
          provider={provider}
          editingInvoice={editingInvoice}
          isReadOnly={isReadOnly}
          isOpen={isInvoiceDrawerOpen}
          onOpenChange={(isOpen) => {
            setIsInvoiceDrawerOpen(isOpen);
            if (!isOpen) {
              setEditingInvoice(undefined);
              setIsReadOnly(false);
            }
          }}
          onSuccess={handleInvoiceSaved}
        />
      )}

      <DeleteConfirmModal
        isOpen={Boolean(invoicePendingArchive)}
        onClose={() => setInvoicePendingArchive(undefined)}
        record={invoicePendingArchive ?? null}
        getRecordLabel={(invoice) => formatCompetenceMonth(invoice.competenceMonth)}
        entityLabel="fatura"
        description={
          <p>
            Tem certeza que deseja arquivar a fatura de competência{" "}
            <strong>
              {invoicePendingArchive &&
                formatCompetenceMonth(invoicePendingArchive.competenceMonth)}
            </strong>
            ?
          </p>
        }
        onConfirm={async (invoice) => {
          await archiveInvoice.mutateAsync(invoice.id);
        }}
      />
    </div>
  );
}
