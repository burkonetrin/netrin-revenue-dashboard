"use client";

import { SlidersHorizontal } from "lucide-react";
import { Fragment, useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Checkbox } from "@heroui/react";
import { PROTOTYPE_BASE_PATH } from "@/constants";
import { FieldInput, OutlineButton, PrimaryButton } from "@/design-system/ui";
import { ClientsListToolbarOverflow } from "./ClientsListToolbarOverflow";
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
import { TOOLTIP_TITLE_CLASS } from "@/shared/constants/tooltip.constants";
import { RowActionsDropdown } from "./RowActionsDropdown";
import { CompetenceWithActiveClients } from "./CompetenceWithActiveClients";
import {
  clientHierarchySortableTableHeadCellClass,
  clientHierarchySublineClassName,
  clientHierarchyTableClassName,
  clientHierarchyTableHeadCellCenterClass,
  clientHierarchyTableHeadCellClass,
} from "@/shared/styles/tableClassNames";
import { TableExpandButton } from "./TableExpandButton";
import {
  ClientWorkflowSidebars,
  clientActionToWorkflowKind,
  type ClientWorkflowKind,
} from "./ClientWorkflowSidebars";
import {
  BillingBillClientsConfirmModal,
  BillingBillSingleClientConfirmModal,
  BillingBulkCloseConfirmModal,
} from "@/features/billing/components/BillingListConfirmModals";
import { useBillingInvoiceStatusStore } from "@/features/billing/store/billing-invoice-status.store";
import { getBillClientsBatchPreview } from "@/features/billing/utils/billing-bill-clients.utils";
import { getCurrentMonth } from "@/features/billing/utils/billing-list.utils";
import { formatBillingCompetence } from "@/features/billing/utils/billing.utils";
import {
  isClientListCloseEligible,
  isClientListCloseToggleEligible,
  isClientListBillEligible,
  useClientListInvoiceStatusStore,
} from "@/features/clients/store/client-list-invoice-status.store";
import { resolveClientListInvoiceStatus } from "@/features/clients/utils/client-list-invoice-display.utils";

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
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isBulkCloseModalOpen, setIsBulkCloseModalOpen] = useState(false);
  const [isBillClientsModalOpen, setIsBillClientsModalOpen] = useState(false);
  const [billSingleClient, setBillSingleClient] = useState<MockClient | null>(null);

  const statusRevision = useClientListInvoiceStatusStore((state) => state.revision);
  const closeManyClients = useClientListInvoiceStatusStore((state) => state.closeMany);
  const setClientClosed = useClientListInvoiceStatusStore((state) => state.setClosed);
  const billSingleClientInvoice = useClientListInvoiceStatusStore((state) => state.billClient);
  const billingStatusRevision = useBillingInvoiceStatusStore((state) => state.byKey);
  const billClientsClosedInCompetence = useBillingInvoiceStatusStore(
    (state) => state.billClientsClosedInCompetence,
  );

  const currentCompetence = getCurrentMonth();
  const billClientsPreview = useMemo(() => {
    void billingStatusRevision;
    return getBillClientsBatchPreview(currentCompetence);
  }, [currentCompetence, billingStatusRevision]);

  const openWorkflowForClient = (client: MockClient, action: string) => {
    if (action === "Fechar fatura" || action === "Reabrir fatura") {
      if (!isClientListCloseToggleEligible(client.id)) return;
      const state = useClientListInvoiceStatusStore.getState().getState(client.id);
      setClientClosed(client.id, state.status !== "fatura_fechada");
      setSelectedClientIds((prev) => {
        if (!prev.has(client.id)) return prev;
        const next = new Set(prev);
        next.delete(client.id);
        return next;
      });
      return;
    }
    if (action === "Faturar cliente") {
      if (!isClientListBillEligible(client.id)) return;
      setBillSingleClient(client);
      return;
    }
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

  const eligibleClientIds = useMemo(() => {
    void statusRevision;
    return list.filter((client) => isClientListCloseEligible(client.id)).map((c) => c.id);
  }, [list, statusRevision]);

  const headerChecked =
    eligibleClientIds.length > 0 &&
    eligibleClientIds.every((id) => selectedClientIds.has(id));
  const headerIndeterminate =
    !headerChecked && eligibleClientIds.some((id) => selectedClientIds.has(id));

  const handleToggleRow = useCallback((clientId: string, selected: boolean) => {
    setSelectedClientIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(clientId);
      else next.delete(clientId);
      return next;
    });
  }, []);

  const handleToggleHeader = useCallback(
    (selected: boolean) => {
      if (!selected) {
        setSelectedClientIds(new Set());
        return;
      }
      setSelectedClientIds(new Set(eligibleClientIds));
    },
    [eligibleClientIds],
  );

  const selectedCount = selectedClientIds.size;
  const activeClientsDisplayed = useMemo(
    () => list.filter((client) => client.ativo).length,
    [list],
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

  const billClientsModalDescription = (
    <div className="flex flex-col gap-4">
      <p className="m-0">
        Faturando {billClientsPreview.closedClientCount} clientes para a competência{" "}
        {formatBillingCompetence(currentCompetence)}
      </p>
      {billClientsPreview.openInvoiceCount > 0 ? (
        <p className="m-0">
          Ainda existem {billClientsPreview.openInvoiceCount} faturas abertas nesta competência.
          Esses clientes não serão faturados.
        </p>
      ) : null}
    </div>
  );

  return (
    <div>
      <div className="mb-4 listagem-head">
        <CompetenceWithActiveClients
          className="mb-3"
          competenceLabel={competenceLabel}
          activeClientCount={activeClientsDisplayed}
        />
        <div className="flex flex-wrap gap-2.5 items-center w-full">
          <FieldInput
            type="search"
            placeholder="Pesquise por cliente, nome fantasia ou CNPJ"
            autoComplete="off"
            className="flex-1 min-w-[220px] max-w-[360px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <OutlineButton onClick={onOpenFilters}>
            <SlidersHorizontal />
            Filtros
          </OutlineButton>
          <ClientsListToolbarOverflow
            showInactiveItems={showInactiveItems}
            openInvoiceClientCount={billClientsPreview.openClientCount}
            onBillClients={() => setIsBillClientsModalOpen(true)}
            onToggleShowInactive={onToggleShowInactive}
          />
          {selectedCount > 0 ? (
            <PrimaryButton
              className="ms-auto shrink-0"
              onClick={() => setIsBulkCloseModalOpen(true)}
            >
              Fechar faturas selecionadas ({selectedCount})
            </PrimaryButton>
          ) : null}
        </div>
      </div>
      <div className="overflow-x-auto overflow-y-visible">
        <table className={clientHierarchyTableClassName}>
          <thead>
            <tr>
              <th className={`${clientHierarchyTableHeadCellClass} w-12`}>
                <Checkbox
                  radius="sm"
                  isSelected={headerChecked}
                  isIndeterminate={headerIndeterminate}
                  isDisabled={eligibleClientIds.length === 0}
                  onValueChange={handleToggleHeader}
                  aria-label="Selecionar todas as faturas elegíveis"
                />
              </th>
              <th className={clientHierarchyTableHeadCellClass}>Status</th>
              <th className={clientHierarchyTableHeadCellClass}>Razão social</th>
              <th className={clientHierarchyTableHeadCellClass}>Produtos</th>
              <th className={clientHierarchyTableHeadCellClass}>Referência</th>
              <th
                className={clientHierarchySortableTableHeadCellClass(
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
                className={clientHierarchySortableTableHeadCellClass(
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
                className={`${clientHierarchyTableHeadCellCenterClass} w-[72px]`}
              >
                Detalhes
              </th>
              <th className={`${clientHierarchyTableHeadCellCenterClass} w-14`}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const open = effectiveExpanded === c.id;
              void statusRevision;
              const displayInvoiceStatus = resolveClientListInvoiceStatus(
                c.id,
                c.faturaStatus,
              );
              const rowCloseEligible = isClientListCloseEligible(c.id);

              return (
                <Fragment key={c.id}>
                  <tr>
                    <td
                      className="px-4 py-3.5 border-b border-zinc-100 align-middle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        radius="sm"
                        isSelected={selectedClientIds.has(c.id)}
                        isDisabled={!rowCloseEligible}
                        onValueChange={(checked) => handleToggleRow(c.id, checked)}
                        aria-label={`Selecionar ${c.nome}`}
                      />
                    </td>
                    <td className="px-4 py-3.5 border-b border-zinc-100 align-top">
                      <ClientStatusChip ativo={c.ativo} />
                    </td>
                    <td className="px-4 py-3.5 border-b border-zinc-100 align-top">
                      <Link
                        to={`${PROTOTYPE_BASE_PATH}/clientes/${c.id}`}
                        className="text-primary block no-underline hover:underline"
                      >
                        {c.nome}
                      </Link>
                      <span
                        className={`block mt-0.5 font-normal ${clientHierarchySublineClassName}`}
                      >
                        {c.cnpj}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 border-b border-zinc-100 align-top">
                      <div className="flex items-center gap-1.5 flex-nowrap">
                        {c.prod}
                        <MockInfoTooltip
                          content={
                            <div>
                              <p className={`${TOOLTIP_TITLE_CLASS} m-0`}>Produtos</p>
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
                        statusKey={displayInvoiceStatus}
                        valorPagoParcial={c.valorPagoParcial}
                        valorPagoExcedente={c.pagamentoExcedente?.valor}
                        excedenteDestino={c.pagamentoExcedente?.destino}
                        parcelasAtrasadas={c.parcelasAtrasadas}
                      />
                    </td>
                    <td className="px-4 py-3.5 border-b border-zinc-100 align-top">
                      <div className="flex items-center gap-2 flex-nowrap">
                        <span>{c.cons}%</span>
                        <HealthChip health={c.s} />
                      </div>
                      <div className={`mt-1 ${clientHierarchySublineClassName}`}>
                        {c.usado.toLocaleString("pt-BR")} de{" "}
                        {c.lim.toLocaleString("pt-BR")}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-zinc-100 align-top text-center">
                      <TableExpandButton
                        expanded={open}
                        ariaLabel="Detalhes"
                        onClick={() =>
                          setExpandedListClientId(open ? null : c.id)
                        }
                      />
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
                        <div className="border-l border-primary-100 px-4 py-4 bg-gray-50/50">
                          <DetailKpiGrid />
                          <div className="mt-4 overflow-x-auto">
                            <ContractsTableMock
                              contextKey={c.id}
                              billingReference={c.referencia}
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
      <BillingBulkCloseConfirmModal
        isOpen={isBulkCloseModalOpen}
        selectedCount={selectedCount}
        onClose={() => setIsBulkCloseModalOpen(false)}
        onConfirm={() => {
          closeManyClients(Array.from(selectedClientIds));
          setSelectedClientIds(new Set());
          setIsBulkCloseModalOpen(false);
        }}
      />
      <BillingBillClientsConfirmModal
        isOpen={isBillClientsModalOpen}
        onClose={() => setIsBillClientsModalOpen(false)}
        description={billClientsModalDescription}
        onConfirm={() => {
          billClientsClosedInCompetence(currentCompetence);
          setIsBillClientsModalOpen(false);
        }}
      />
      <BillingBillSingleClientConfirmModal
        isOpen={billSingleClient != null}
        onClose={() => setBillSingleClient(null)}
        onConfirm={() => {
          if (!billSingleClient) return;
          billSingleClientInvoice(billSingleClient.id);
          setBillSingleClient(null);
        }}
      />
    </div>
  );
}
