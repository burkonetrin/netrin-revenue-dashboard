"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { useEffect, useState } from "react";
import {
  CLIENTS,
  CONTRACT_ACTIONS,
  DETAIL_CONTEXT,
  DETAIL_PILL_TABS,
  type MockClient,
} from "../../clientesDashboardMockData";
import { ContractsTableMock } from "./ContractsTableMock";
import { DetailKpiGrid } from "./DetailKpiGrid";

interface ClientDetailViewProps {
  clientId: string;
  onBack: () => void;
  showInactiveItems: boolean;
}

export function ClientDetailView({
  clientId,
  onBack,
  showInactiveItems,
}: ClientDetailViewProps) {
  const c = CLIENTS.find((x) => x.id === clientId) as MockClient;
  const [activePill, setActivePill] = useState("Contratos");
  const [expandedContractId, setExpandedContractId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setExpandedContractId(null);
  }, [clientId]);

  if (!c) return null;

  return (
    <div>
      <nav className="text-[13px] text-zinc-500 mb-4">
        <button
          type="button"
          className="text-primary bg-transparent border-none p-0 cursor-pointer hover:underline"
          onClick={onBack}
        >
          Clientes
        </button>
        {" > "}
        Detalhes do cliente
      </nav>
      <h2 className="text-[22px] font-bold text-primary-dark m-0 mb-1.5">
        {c.nome.toUpperCase()}
      </h2>
      <p className="text-[13px] text-zinc-500 mb-5">
        {c.cnpj} | Início em {c.inicio}
      </p>
      <div className="flex flex-wrap gap-2 mb-5">
        {DETAIL_PILL_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`px-4 py-2 rounded-full border-none text-[13px] cursor-pointer font-inherit ${
              activePill === tab
                ? "bg-primary text-white"
                : "bg-zinc-100 text-zinc-600"
            }`}
            onClick={() => setActivePill(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mb-4">
        <Dropdown placement="bottom-start">
          <DropdownTrigger>
            <Button variant="bordered" size="sm" radius="sm">
              Ações ▾
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Ações de contrato" variant="flat">
            {CONTRACT_ACTIONS.map((action) => (
              <DropdownItem key={action}>{action}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
      <DetailKpiGrid />
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden p-0">
        <div className="overflow-x-auto">
          <ContractsTableMock
            contextKey={DETAIL_CONTEXT}
            expandedContractId={expandedContractId}
            onToggleContract={(id) =>
              setExpandedContractId((cur) => (cur === id ? null : id))
            }
            showInactiveItems={showInactiveItems}
            listMode={false}
          />
        </div>
      </div>
    </div>
  );
}
