"use client";

import { SlidersHorizontal } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import {
  FieldInput,
  OutlineButton,
  PrimaryButton,
  ToggleSwitch,
} from "@/design-system/ui";
import {
  CLIENTS,
  LIST_COLSPAN,
  type MockClient,
} from "../../clientesDashboardMockData";
import { clientRowActionsMenu } from "../../clientesDashboardMockFormat";
import type { FilterDrawerStatus } from "./ClientesFilterDrawer";
import { ContractsTableMock } from "./ContractsTableMock";
import { DetailKpiGrid } from "./DetailKpiGrid";
import { FaturadoWithBadge } from "./FaturadoCell";
import {
  ClientStatusChip,
  HealthChip,
} from "./MockChips";
import { MockInfoTooltip } from "./MockInfoTooltip";
import { RowActionsDropdown } from "./RowActionsDropdown";
import {
  nucleusSortableTableHeadCellClass,
  nucleusTableHeadCellCenterClass,
  nucleusTableHeadCellClass,
} from "@/shared/styles/tableClassNames";
import {
  BillClientsConfirmModal,
  ClientWorkflowSidebars,
  clientActionToWorkflowKind,
  type ClientWorkflowKind,
} from "./ClientWorkflowSidebars";

export type TableSort = { key: "fat" | "cons" | null; dir: "asc" | "desc" };

function clientsMatchingSearch(list: MockClient[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  const qDigits = q.replace(/\D/g, "");
  return list.filter((c) => {
    if (c.nome.toLowerCase().includes(q)) return true;
    if (c.cnpj.toLowerCase().includes(q)) return true;
    if (qDigits && c.cnpj.replace(/\D/g, "").includes(qDigits)) return true;
    return false;
  });
}

function clientsMatchingStatusFilter(
  statusFilter: FilterDrawerStatus,
): MockClient[] {
  const checked: string[] = [];
  if (statusFilter.ativo) checked.push("ativo");
  if (statusFilter.inativo) checked.push("inativo");
  if (!checked.length || checked.length === 2) return CLIENTS;
  if (checked.includes("ativo")) return CLIENTS.filter((c) => c.ativo);
  return CLIENTS.filter((c) => !c.ativo);
}

function sortedClients(
  statusFilter: FilterDrawerStatus,
  search: string,
  showInactive: boolean,
  sort: TableSort,
) {
  let list = clientsMatchingSearch(
    [...clientsMatchingStatusFilter(statusFilter)],
    search,
  );
  if (!showInactive) list = list.filter((c) => c.ativo);
  if (sort.key === "fat") {
    list.sort((a, b) =>
      sort.dir === "asc" ? a.fat - b.fat : b.fat - a.fat,
    );
  }
  if (sort.key === "cons") {
    list.sort((a, b) =>
      sort.dir === "asc" ? a.cons - b.cons : b.cons - a.cons,
    );
  }
  return list;
}

interface ClientsListSectionProps {
  statusFilter: FilterDrawerStatus;
  showInactiveItems: boolean;
  onOpenFilters: () => void;
  onToggleShowInactive: () => void;
  competenceLabel: string;
}

export function ClientsListSection({
  statusFilter,
  showInactiveItems,
  onOpenFilters,
  onToggleShowInactive,
  competenceLabel,
}: ClientsListSectionProps) {
  const [search, setSearch] = useState("");
  const [expandedListClientId, setExpandedListClientId] = useState<string | null>(
    null,
  );
  const [expandedContractByClient, setExpandedContractByClient] = useState<
    Record<string, string | null>
  >({});
  const [tableSort, setTableSort] = useState<TableSort>({
    key: null,
    dir: "desc",
  });
  const [workflowClient, setWorkflowClient] = useState<MockClient | null>(
    null,
  );
  const [workflowKind, setWorkflowKind] = useState<ClientWorkflowKind | null>(
    null,
  );
  const [billModalOpen, setBillModalOpen] = useState(false);

  const openWorkflowForClient = (client: MockClient, action: string) => {
    const kind = clientActionToWorkflowKind(action);
    if (!kind) return;
    setWorkflowClient(client);
    setWorkflowKind(kind);
  };

  const closeWorkflow = () => {
    setWorkflowClient(null);
    setWorkflowKind(null);
  };

  const list = useMemo(
    () =>
      sortedClients(statusFilter, search, showInactiveItems, tableSort),
    [statusFilter, search, showInactiveItems, tableSort],
  );

  const effectiveExpanded =
    expandedListClientId &&
    list.some((c) => c.id === expandedListClientId)
      ? expandedListClientId
      : null;

  const toggleSort = (key: "fat" | "cons") => {
    setTableSort((prev) => {
      if (prev.key === key) {
        return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      }
      return { key, dir: "desc" };
    });
  };

  const sortIcon = (key: "fat" | "cons") => {
    if (tableSort.key !== key) return "↕";
    return tableSort.dir === "asc" ? "↑" : "↓";
  };

  return (
    <div>
      <div className="mb-4 listagem-head">
        <h2 className="text-lg font-semibold mb-3 m-0 text-zinc-900">
          {competenceLabel}
        </h2>
        <div className="flex flex-wrap gap-3 items-center w-full">
          <FieldInput
            type="search"
            placeholder="Buscar cliente..."
            autoComplete="off"
            className="flex-1 min-w-[220px] max-w-[360px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <PrimaryButton className="shrink-0">Cadastrar cliente</PrimaryButton>
          <div className="flex flex-wrap items-center gap-2.5 ms-auto shrink-0">
            <OutlineButton onClick={onOpenFilters}>
              <SlidersHorizontal />
              Filtros
            </OutlineButton>
            <OutlineButton onClick={() => setBillModalOpen(true)}>
              Faturar clientes
            </OutlineButton>
            <ToggleSwitch
              label="Exibir itens inativos"
              checked={showInactiveItems}
              onChange={(next) => {
                if (next !== showInactiveItems) onToggleShowInactive();
              }}
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th className={nucleusTableHeadCellClass}>Status</th>
              <th className={nucleusTableHeadCellClass}>Razão social</th>
              <th className={nucleusTableHeadCellClass}>Produtos</th>
              <th className={nucleusTableHeadCellClass}>Referência</th>
              <th
                className={nucleusSortableTableHeadCellClass(
                  tableSort.key === "fat",
                )}
                onClick={() => toggleSort("fat")}
              >
                Valor{" "}
                <span className="inline-flex align-middle ml-1 opacity-70">
                  {sortIcon("fat")}
                </span>
              </th>
              <th
                className={nucleusSortableTableHeadCellClass(
                  tableSort.key === "cons",
                )}
                onClick={() => toggleSort("cons")}
              >
                % Consumo{" "}
                <span className="inline-flex align-middle ml-1 opacity-70">
                  {sortIcon("cons")}
                </span>
              </th>
              <th
                className={`${nucleusTableHeadCellCenterClass} w-[72px]`}
              >
                Detalhes
              </th>
              <th className={`${nucleusTableHeadCellCenterClass} w-14`}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const open = effectiveExpanded === c.id;
              return (
                <Fragment key={c.id}>
                  <tr>
                    <td className="px-4 py-3.5 border-b border-zinc-100 align-top">
                      <ClientStatusChip ativo={c.ativo} />
                    </td>
                    <td className="px-4 py-3.5 border-b border-zinc-100 align-top">
                      <span className="font-medium text-zinc-900 block">
                        {c.nome}
                      </span>
                      <span className="block text-[11px] text-zinc-500 mt-0.5 font-normal">
                        {c.cnpj}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 border-b border-zinc-100 align-top">
                      <div className="flex items-center gap-1.5">
                        {c.prod}
                        <MockInfoTooltip
                          content={
                            <div>
                              <strong>Produtos</strong>
                              <ul className="list-none p-0 m-1 mt-1">
                                {c.produtos.map((p) => (
                                  <li key={p}>{p}</li>
                                ))}
                              </ul>
                            </div>
                          }
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-zinc-100 align-top text-zinc-700">
                      {c.referencia}
                    </td>
                    <td className="px-4 py-3.5 border-b border-zinc-100 align-top">
                      <FaturadoWithBadge
                        amount={c.fat}
                        statusKey={c.faturaStatus}
                        valorPagoParcial={c.valorPagoParcial}
                        valorPagoExcedente={c.pagamentoExcedente?.valor}
                        excedenteDestino={c.pagamentoExcedente?.destino}
                        parcelasAtrasadas={c.parcelasAtrasadas}
                      />
                    </td>
                    <td className="px-4 py-3.5 border-b border-zinc-100 align-top">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{c.cons}%</span>
                        <HealthChip health={c.s} />
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1">
                        {c.usado.toLocaleString("pt-BR")} de{" "}
                        {c.lim.toLocaleString("pt-BR")}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-zinc-100 align-top text-center">
                      <button
                        type="button"
                        className="border-none bg-transparent cursor-pointer p-1 text-zinc-600"
                        aria-label="Detalhes"
                        onClick={() =>
                          setExpandedListClientId(
                            open ? null : c.id,
                          )
                        }
                      >
                        {open ? "▴" : "▾"}
                      </button>
                    </td>
                    <td
                      className="px-4 py-3.5 border-b border-zinc-100 align-top text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RowActionsDropdown
                        menu={clientRowActionsMenu(c)}
                        ariaLabel="Ações do cliente"
                        onSelectAction={(action) =>
                          openWorkflowForClient(c, action)
                        }
                      />
                    </td>
                  </tr>
                  {open ? (
                    <tr className="client-detail-row">
                      <td colSpan={LIST_COLSPAN} className="p-0 border-b border-zinc-100 align-top">
                        <div className="px-4 py-4 bg-zinc-50">
                          <DetailKpiGrid />
                          <div className="mt-4 bg-white border border-zinc-200 overflow-hidden">
                            <div className="overflow-x-auto">
                              <ContractsTableMock
                                contextKey={c.id}
                                expandedContractId={
                                  expandedContractByClient[c.id] ?? null
                                }
                                onToggleContract={(id) =>
                                  setExpandedContractByClient((prev) => ({
                                    ...prev,
                                    [c.id]:
                                      prev[c.id] === id ? null : id,
                                  }))
                                }
                                showInactiveItems={showInactiveItems}
                                listMode
                                inlineDetail
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <ClientWorkflowSidebars
        client={workflowClient}
        kind={workflowKind}
        onClose={closeWorkflow}
      />
      <BillClientsConfirmModal
        open={billModalOpen}
        clientCount={list.length}
        competenceLabel={competenceLabel}
        onClose={() => setBillModalOpen(false)}
        onConfirm={() => {}}
      />
    </div>
  );
}
