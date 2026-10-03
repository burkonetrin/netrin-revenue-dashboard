"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { MoreHorizontal, RefreshCw } from "lucide-react";

interface BillingListToolbarActionsProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  canCreateInvoice?: boolean;
  onAddInvoice?: () => void;
  canExportCsv?: boolean;
  isExportingCsv?: boolean;
  onExportCsv?: () => void;
  isExportDisabled?: boolean;
}

/**
 * Toolbar da listagem: atualizar consumo + menu ⋮ (CSV, adicionar fatura).
 */
export function BillingListToolbarActions({
  isRefreshing,
  onRefresh,
  canCreateInvoice = false,
  onAddInvoice,
  canExportCsv = false,
  isExportingCsv = false,
  onExportCsv,
  isExportDisabled = false,
}: BillingListToolbarActionsProps) {
  const showExportCsv = Boolean(canExportCsv && onExportCsv);
  const showAddInvoice = Boolean(canCreateInvoice && onAddInvoice);
  const hasOverflowActions = showExportCsv || showAddInvoice;

  return (
    <>
      <Button
        startContent={!isRefreshing ? <RefreshCw size={18} className="text-gray-400" /> : undefined}
        radius="sm"
        variant="bordered"
        onPress={onRefresh}
        isLoading={isRefreshing}
      >
        {isRefreshing ? "Atualizando..." : "Atualizar consumo"}
      </Button>

      {hasOverflowActions ? (
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button
              isIconOnly
              radius="sm"
              variant="bordered"
              aria-label="Mais ações de faturamento"
            >
              <MoreHorizontal size={18} className="text-gray-400" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Ações de faturamento"
            onAction={(key) => {
              if (key === "export-csv") {
                onExportCsv?.();
                return;
              }
              if (key === "add-invoice") {
                onAddInvoice?.();
              }
            }}
          >
            {showExportCsv ? (
              <DropdownItem
                key="export-csv"
                className="text-[13px]"
                isDisabled={isExportDisabled && !isExportingCsv}
              >
                {isExportingCsv ? "Baixando..." : "Baixar CSV"}
              </DropdownItem>
            ) : null}
            {showAddInvoice ? (
              <DropdownItem key="add-invoice" className="text-[13px]">
                Adicionar fatura
              </DropdownItem>
            ) : null}
          </DropdownMenu>
        </Dropdown>
      ) : null}
    </>
  );
}
