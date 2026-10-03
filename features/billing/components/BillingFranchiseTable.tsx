"use client";

import { CLIENTS_PERMISSIONS } from "@/features/clients/constants/clientsPermissions.constants";
import { DynamicTable } from "@/shared/components/DynamicTable";
import { usePermission } from "@/shared/hooks/usePermission";
import { Button } from "@heroui/react";
import { Mail } from "lucide-react";
import { useMemo } from "react";
import { canClientsOrBillingInvoice } from "../constants/billingInvoicePermissions.constants";
import type { BillingFranchiseLine } from "../types/billing-detail.types";
import type { BillingInvoiceScope } from "../types/billing.types";
import { getFranchiseTableColumns, getFranchiseValueDisplay } from "../utils/billing-detail.utils";
import { formatBillingDate } from "../utils/billing.utils";
import { BillingFranchiseConsumptionCell } from "./BillingFranchiseConsumptionCell";
import { BillingFranchiseExcessCell } from "./BillingFranchiseExcessCell";
import { BillingFranchiseTotalCell } from "./BillingFranchiseTotalCell";
import { BillingFranchiseValueCell } from "./BillingFranchiseValueCell";

interface BillingFranchiseTableProps {
  franchises: BillingFranchiseLine[];
  scope: BillingInvoiceScope;
  onSendEmail: (franchise: BillingFranchiseLine) => void;
  hideBottomBorder?: boolean;
}

/**
 * Tabela de franquias e consumo no detalhe da fatura.
 */
export function BillingFranchiseTable({
  franchises,
  scope,
  onSendEmail,
  hideBottomBorder = false,
}: BillingFranchiseTableProps) {
  const { can } = usePermission();
  const canSendEmail = canClientsOrBillingInvoice(can, CLIENTS_PERMISSIONS.sendEmail);

  const columns = useMemo(() => {
    const baseColumns = getFranchiseTableColumns(scope);

    return baseColumns.map((column) => {
      switch (column.id) {
        case "dueDate":
          return {
            ...column,
            render: (_value: unknown, row: BillingFranchiseLine) => {
              return formatBillingDate(row.dueDate ?? "");
            },
          };
        case "pricingModel":
          return {
            ...column,
            render: (_value: unknown, row: BillingFranchiseLine) => {
              const display = getFranchiseValueDisplay(row);
              return (
                <BillingFranchiseValueCell
                  text={display.text}
                  showTooltip={display.showTooltip}
                  franchise={row}
                />
              );
            },
          };
        case "consumption":
          return {
            ...column,
            render: (_value: unknown, row: BillingFranchiseLine) => (
              <BillingFranchiseConsumptionCell consumption={row.consumption} />
            ),
          };
        case "excessAmount":
          return {
            ...column,
            render: (_value: unknown, row: BillingFranchiseLine) => (
              <BillingFranchiseExcessCell franchise={row} />
            ),
          };
        case "total":
          return {
            ...column,
            render: (_value: number, row: BillingFranchiseLine) => (
              <BillingFranchiseTotalCell franchise={row} />
            ),
          };
        case "sendEmail":
          return {
            ...column,
            render: (_value: unknown, row: BillingFranchiseLine) => {
              if (!canSendEmail) return null;

              return (
                <div className="flex justify-center">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    aria-label={`Enviar detalhes de ${row.name}`}
                    onPress={() => onSendEmail(row)}
                  >
                    <Mail size={16} className="text-primary" />
                  </Button>
                </div>
              );
            },
          };
        default:
          return column;
      }
    });
    // canSendEmail deriva de rbacPermissions
  }, [canSendEmail, onSendEmail, scope]);

  return (
    <DynamicTable
      columns={columns}
      data={franchises}
      keyExtractor={(row) => row.id}
      disableRowHover
      emptyMessage="Nenhuma franquia encontrada"
      classNames={{
        wrapper: "shadow-none mb-0",
        table: hideBottomBorder
          ? "w-full [&_tbody_tr:not(:last-child)_td]:border-b [&_tbody_tr:not(:last-child)_td]:border-gray-200"
          : "w-full",
        th: "bg-default-100 text-gray-500 font-semibold text-xs h-11",
        td: hideBottomBorder
          ? "text-gray-900 h-12 text-xs align-middle"
          : "text-gray-900 border-b border-gray-200 h-12 text-xs align-middle",
      }}
    />
  );
}
