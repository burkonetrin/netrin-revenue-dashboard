"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { MoreHorizontal } from "lucide-react";

interface ClientsListToolbarOverflowProps {
  showInactiveItems: boolean;
  openInvoiceClientCount: number;
  onNewClient?: () => void;
  onBillClients: () => void;
  onToggleShowInactive: () => void;
}

/** Menu ⋮ da listagem de clientes — mesmo padrão do faturamento. */
export function ClientsListToolbarOverflow({
  showInactiveItems,
  openInvoiceClientCount,
  onNewClient,
  onBillClients,
  onToggleShowInactive,
}: ClientsListToolbarOverflowProps) {
  const billClientsLabel =
    openInvoiceClientCount > 0
      ? `Faturar clientes (${openInvoiceClientCount})`
      : "Faturar clientes";
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          isIconOnly
          radius="sm"
          variant="bordered"
          aria-label="Mais ações da listagem de clientes"
        >
          <MoreHorizontal size={18} className="text-gray-400" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Ações da listagem de clientes"
        onAction={(key) => {
          if (key === "new-client") {
            onNewClient?.();
            return;
          }
          if (key === "bill-clients") {
            onBillClients();
            return;
          }
          if (key === "toggle-inactive") {
            onToggleShowInactive();
          }
        }}
      >
        <DropdownItem key="new-client" className="text-[13px]">
          Novo cliente
        </DropdownItem>
        <DropdownItem key="bill-clients" className="text-[13px]">
          {billClientsLabel}
        </DropdownItem>
        <DropdownItem key="toggle-inactive" className="text-[13px]">
          {showInactiveItems ? "Ocultar itens inativos" : "Exibir itens inativos"}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
