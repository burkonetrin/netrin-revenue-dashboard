"use client";

import { CLIENTS_PERMISSIONS } from "@/features/clients/constants/clientsPermissions.constants";
import { BILLING_BASE_PATH, PROTOTYPE_BASE_PATH } from "@/constants";
import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { usePermission } from "@/shared/hooks/usePermission";
import { formatCurrency } from "@/shared/utils/currency";
import { Checkbox, Tooltip } from "@heroui/react";
import { Link } from "react-router-dom";
import { useMemo, type ReactNode } from "react";
import { canClientsOrBillingInvoice } from "../constants/billingInvoicePermissions.constants";
import {
  HEROUI_TOOLTIP_PANEL_CLASS_NAMES,
  TOOLTIP_TITLE_CLASS,
} from "@/shared/constants/tooltip.constants";
import type { BillingInvoiceRecord } from "../types/billing.types";
import {
  formatBillingCompetence,
  formatBillingReferencePeriod,
  getBillingDueDateDisplay,
  getBillingListingDueDateView,
  getBillingListingTooltipNotes,
  getBillingNoteDownloadTooltipTitle,
} from "../utils/billing.utils";
import { BillingInvoiceStatusBadge } from "./BillingInvoiceStatusBadge";
import { BillingInvoiceStatusInfoContent } from "./BillingInvoiceStatusInfoContent";
import {
  BillingDownloadCell,
} from "./BillingDownloadCell";
import {
  buildBillingRecordKey,
  isBillingCloseEligible,
  resolveNoteBillingStatus,
  shouldShowMultiNoteInlineStatusDetails,
} from "../utils/billing-invoice-status.utils";

interface BillingTableProps {
  records: BillingInvoiceRecord[];
  isLoading?: boolean;
  showClientColumn?: boolean;
  monthColumn?: "competence" | "reference" | "both";
  onDetailsClick?: (record: BillingInvoiceRecord) => void;
  className?: string;
  selection?: {
    selectedKeys: Set<string>;
    onToggleRow: (key: string, selected: boolean) => void;
    headerChecked: boolean;
    headerIndeterminate: boolean;
    onToggleHeader: (selected: boolean) => void;
  };
}

function BillingDueDate({ record }: { record: BillingInvoiceRecord }) {
  const { notes, scope } = record.invoiceDetails;
  const view = getBillingListingDueDateView(notes);
  const dueDateDisplayOptions = {
    source: record.source,
    emptyLabel: scope === "client" ? "-" : undefined,
  } as const;
  const status = record.billingStatus ?? "fatura_aberta";
  const meta = record.statusMeta;

  const statusBadge = <BillingInvoiceStatusBadge status={status} meta={meta} />;

  const dueDateWithBadge = (dueDateLabel: ReactNode) => (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span>{dueDateLabel}</span>
      {statusBadge}
    </span>
  );

  if (view.kind === "placeholder") {
    return dueDateWithBadge(getBillingDueDateDisplay(undefined, dueDateDisplayOptions));
  }

  if (view.kind === "single") {
    return dueDateWithBadge(getBillingDueDateDisplay(view.dueDate, dueDateDisplayOptions));
  }

  const orderedNotes = getBillingListingTooltipNotes(scope, view.notes);
  const showInlineNoteDetails = shouldShowMultiNoteInlineStatusDetails(orderedNotes);
  const recordStatus = record.billingStatus ?? "fatura_aberta";
  const recordMeta = record.statusMeta;

  return (
    <Tooltip
      placement="right"
      showArrow={true}
      radius="sm"
      content={
        <div className="flex max-h-[344px] flex-col gap-4 overflow-y-auto rounded-xl px-3 py-1">
          {orderedNotes.map((note) => (
            <div key={note.id} className="space-y-3">
              {(note.destinations?.length ? note.destinations : [undefined]).map(
                (destination, destinationIndex) => {
                  const destinationNote = destination
                    ? { ...note, destinations: [destination] }
                    : note;
                  const dueDate = destination?.dueDate ?? note.dueDate;
                  const noteStatus = resolveNoteBillingStatus(note, recordStatus);
                  const noteMeta = note.statusMeta ?? recordMeta;

                  return (
                    <div key={`${note.id}-${destination?.kind ?? "note"}-${destinationIndex}`}>
                      <p className={TOOLTIP_TITLE_CLASS}>
                        {getBillingNoteDownloadTooltipTitle(destinationNote, scope)}
                      </p>
                      {destination?.kind === "contract_group"
                        ? destination.names.map((name) => <p key={`${note.id}-${name}`}>{name}</p>)
                        : null}
                      <div className="space-y-1">
                        <p className="inline-flex flex-wrap items-center gap-2">
                          <span>
                            Vencimento: {getBillingDueDateDisplay(dueDate, dueDateDisplayOptions)}
                          </span>
                          <BillingInvoiceStatusBadge
                            status={noteStatus}
                            meta={noteMeta}
                            suppressInfoTooltip={showInlineNoteDetails}
                          />
                        </p>
                        {showInlineNoteDetails ? (
                          <BillingInvoiceStatusInfoContent status={noteStatus} meta={noteMeta} />
                        ) : null}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          ))}
        </div>
      }
      classNames={HEROUI_TOOLTIP_PANEL_CLASS_NAMES}
    >
      <button type="button" className="text-gray-900 hover:text-primary">
        {orderedNotes.length} notas
      </button>
    </Tooltip>
  );
}

export function BillingTable({
  records,
  isLoading,
  showClientColumn = true,
  monthColumn = "competence",
  onDetailsClick,
  className,
  selection,
}: BillingTableProps) {
  const { can } = usePermission();
  const canViewInvoiceDetails = canClientsOrBillingInvoice(can, CLIENTS_PERMISSIONS.invoiceDetails);

  const columns = useMemo<ColumnConfig<BillingInvoiceRecord>[]>(() => {
    const referenceColumn: ColumnConfig<BillingInvoiceRecord> = {
      id: "referenceMonth",
      label: "Referência",
      render: (_value, row) =>
        formatBillingReferencePeriod(row.referenceMonth, row.invoicePeriodMonths),
    };

    const competenceColumn: ColumnConfig<BillingInvoiceRecord> = {
      id: "competence",
      label: "Competência",
      render: (value: string) => formatBillingCompetence(value),
    };

    const monthColumns: ColumnConfig<BillingInvoiceRecord>[] =
      monthColumn === "both"
        ? [referenceColumn, competenceColumn]
        : monthColumn === "reference"
          ? [referenceColumn]
          : [competenceColumn];

    const selectionColumn: ColumnConfig<BillingInvoiceRecord> | null = selection
      ? {
          id: "__select__",
          label: "",
          width: 48,
          headerClassName: "w-12",
          render: (_value, row) => {
            const key = buildBillingRecordKey(row);
            const selectable = isBillingCloseEligible(row.billingStatus ?? "fatura_aberta");
            return (
              <Checkbox
                radius="sm"
                isSelected={selection.selectedKeys.has(key)}
                isDisabled={!selectable}
                onValueChange={(checked) => selection.onToggleRow(key, checked)}
                aria-label={`Selecionar ${row.clientName}`}
                onClick={(event) => event.stopPropagation()}
              />
            );
          },
        }
      : null;

    const baseColumns: ColumnConfig<BillingInvoiceRecord>[] = [
      ...(selectionColumn ? [selectionColumn] : []),
      {
        id: "clientName",
        label: "Cliente",
        render: (value: string, row) => (
          <Link
            to={`${PROTOTYPE_BASE_PATH}/clientes/${row.clientId}`}
            className="text-primary underline"
            onClick={(event) => event.stopPropagation()}
          >
            {value}
          </Link>
        ),
      },
      ...(canViewInvoiceDetails
        ? [
            {
              id: "details",
              label: "Detalhes da fatura",
              render: (_value: unknown, row: BillingInvoiceRecord) => (
                <Link
                  to={`${BILLING_BASE_PATH}/${row.id}${row.source === "entry" ? "?source=entry" : ""}`}
                  className="text-primary underline"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!onDetailsClick) return;
                    event.preventDefault();
                    onDetailsClick(row);
                  }}
                >
                  Detalhes
                </Link>
              ),
            } satisfies ColumnConfig<BillingInvoiceRecord>,
          ]
        : []),
      ...monthColumns,
      {
        id: "invoiceDetails",
        label: "Vencimento",
        render: (_value, row) => <BillingDueDate record={row} />,
      },
      {
        id: "download",
        label: "Download",
        cellClassName: "align-middle",
        render: (_value, row) => <BillingDownloadCell record={row} />,
      },
      {
        id: "totalAmount",
        label: "Consumo acumulado",
        render: (value: number) => formatCurrency(value),
      },
    ];

    const columnsWithHeader = baseColumns.map((column) => {
      if (column.id !== "__select__" || !selection) return column;
      return {
        ...column,
        label: (
          <Checkbox
            radius="sm"
            isSelected={selection.headerChecked}
            isIndeterminate={selection.headerIndeterminate}
            onValueChange={selection.onToggleHeader}
            aria-label="Selecionar todas as faturas elegíveis"
          />
        ),
      };
    });

    return showClientColumn
      ? columnsWithHeader
      : columnsWithHeader.filter((column) => column.id !== "clientName");
  }, [canViewInvoiceDetails, monthColumn, onDetailsClick, selection, showClientColumn]);

  return (
    <div className={className}>
      <DynamicTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        keyExtractor={(row) => buildBillingRecordKey(row)}
        emptyMessage="Nenhuma fatura encontrada"
        classNames={{
          th: "bg-default-100 text-gray-500 font-semibold text-xs h-11",
          td: "text-gray-900 border-b border-gray-200 h-12 text-xs",
        }}
      />
    </div>
  );
}
