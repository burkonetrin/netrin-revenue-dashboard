"use client";

import {
  clientHierarchyFranchiseTableHeadCellClass,
  clientHierarchySortableTableHeadCellClass,
  clientHierarchySublineClassName,
  clientHierarchyTableClassName,
  clientHierarchyTableHeadCellClass,
} from "@/shared/styles/tableClassNames";
import { TableExpandButton } from "./TableExpandButton";
import { Button } from "@heroui/react";
import { Fragment, useMemo, useState, type ReactNode } from "react";
import {
  hierarchySortIcon,
  sortHierarchyRows,
  toggleHierarchySort,
  type HierarchySortState,
} from "./hierarchyTableSort.utils";
import {
  CONTRACTS_MOCK,
  type MockContract,
  type MockFranchise,
} from "../../clientesDashboardMockData";
import {
  fmt,
  fmtDetail,
  fmtN,
  formatBillingReferenceInterval,
  franchiseBillingModelTooltipContent,
} from "../../clientesDashboardMockFormat";
import { FaturadoWithBadge } from "./FaturadoCell";
import { FranchisePopover } from "./FranchisePopover";
import { MockInfoTooltip } from "./MockInfoTooltip";
import { TOOLTIP_TITLE_CLASS } from "@/shared/constants/tooltip.constants";

const CONTRACT_COLSPAN = 9;

type ContractSortKey =
  | "minimo"
  | "media"
  | "total12"
  | "mrr"
  | "cons"
  | "faturado";

type FranchiseSortKey = "valor" | "consVal" | "excVal" | "faturado";

const CONTRACT_SORT_INITIAL: HierarchySortState<ContractSortKey> = {
  key: null,
  dir: "desc",
};

const FRANCHISE_SORT_INITIAL: HierarchySortState<FranchiseSortKey> = {
  key: null,
  dir: "desc",
};

function contractSortValue(ct: MockContract, key: ContractSortKey): number {
  switch (key) {
    case "minimo":
      return ct.minimo ?? -1;
    case "media":
      return ct.media;
    case "total12":
      return ct.total12;
    case "mrr":
      return ct.mrr;
    case "cons":
      return ct.cons;
    case "faturado":
      return ct.faturado;
    default:
      return 0;
  }
}

function franchiseSortValue(f: MockFranchise, key: FranchiseSortKey): number {
  switch (key) {
    case "valor":
      return f.valor;
    case "consVal":
      return f.consVal;
    case "excVal":
      return f.excVal;
    case "faturado":
      return f.totalPeriodo;
    default:
      return 0;
  }
}

function SortableHeadCell<K extends string>({
  label,
  sortKey,
  sort,
  onToggle,
  className = "",
}: {
  label: ReactNode;
  sortKey: K;
  sort: HierarchySortState<K>;
  onToggle: (key: K) => void;
  className?: string;
}) {
  const active = sort.key === sortKey;
  return (
    <th
      className={`${clientHierarchySortableTableHeadCellClass(active)} ${className}`.trim()}
      onClick={() => onToggle(sortKey)}
    >
      {label}{" "}
      <span className="inline-flex align-middle ml-1 opacity-70">
        {hierarchySortIcon(sort, sortKey)}
      </span>
    </th>
  );
}

function isMockItemActive(item: { ativo?: boolean }) {
  return item.ativo !== false;
}

function visibleContracts(showInactive: boolean) {
  return CONTRACTS_MOCK.filter(
    (ct) => showInactive || isMockItemActive(ct),
  );
}

function visibleFranchises(list: MockFranchise[], showInactive: boolean) {
  return list.filter((f) => showInactive || isMockItemActive(f));
}

function FranchiseNestedTable({
  franchises,
  listMode,
  billingReference,
}: {
  franchises: MockFranchise[];
  listMode: boolean;
  billingReference?: string;
}) {
  const [franchiseSort, setFranchiseSort] =
    useState<HierarchySortState<FranchiseSortKey>>(FRANCHISE_SORT_INITIAL);

  const referenceSubline =
    billingReference?.trim()
      ? formatBillingReferenceInterval(billingReference)
      : null;

  const sortedFranchises = useMemo(
    () =>
      sortHierarchyRows(franchises, franchiseSort, franchiseSortValue),
    [franchises, franchiseSort],
  );

  const toggleFranchiseSort = (key: FranchiseSortKey) => {
    setFranchiseSort((prev) => toggleHierarchySort(prev, key));
  };

  const franchiseCell =
    "px-4 py-3.5 align-top bg-white border-b border-zinc-100";
  const franchiseCellCenter =
    "px-4 py-3.5 align-top text-center bg-white border-b border-zinc-100";

  return (
    <div className="my-2 mx-0">
      {!listMode ? (
        <Button color="primary" size="sm" className="mb-3">
          Nova franquia
        </Button>
      ) : null}
      <table className={`${clientHierarchyTableClassName} bg-white`}>
        <thead>
          <tr>
            <th className={clientHierarchyFranchiseTableHeadCellClass}>Franquia</th>
            <th className={clientHierarchyFranchiseTableHeadCellClass}>Centro de lucro</th>
            <th className={clientHierarchyFranchiseTableHeadCellClass}>Produto</th>
            <SortableHeadCell
              label="Valor"
              sortKey="valor"
              sort={franchiseSort}
              onToggle={toggleFranchiseSort}
              className={clientHierarchyFranchiseTableHeadCellClass}
            />
            <SortableHeadCell
              label="Consultas"
              sortKey="consVal"
              sort={franchiseSort}
              onToggle={toggleFranchiseSort}
              className={clientHierarchyFranchiseTableHeadCellClass}
            />
            <SortableHeadCell
              label="Excedente"
              sortKey="excVal"
              sort={franchiseSort}
              onToggle={toggleFranchiseSort}
              className={clientHierarchyFranchiseTableHeadCellClass}
            />
            <SortableHeadCell
              label="Faturado"
              sortKey="faturado"
              sort={franchiseSort}
              onToggle={toggleFranchiseSort}
              className={clientHierarchyFranchiseTableHeadCellClass}
            />
            <th className={`${clientHierarchyFranchiseTableHeadCellClass} w-10`} />
          </tr>
        </thead>
        <tbody>
          {sortedFranchises.map((f) => {
            const billingTooltip = franchiseBillingModelTooltipContent(f);
            return (
            <tr key={f.id} className="bg-white">
              <td className={franchiseCell}>
                <a href="#" className="block text-primary no-underline">
                  {f.name}
                </a>
                <span
                  className={`block mt-0.5 font-normal whitespace-nowrap ${clientHierarchySublineClassName}`}
                >
                  {f.vigencia}
                </span>
              </td>
              <td className={franchiseCell}>
                {f.centro}
                <span className={`block mt-0.5 ${clientHierarchySublineClassName}`}>
                  {f.excLabel}
                </span>
              </td>
              <td className={`${franchiseCell} whitespace-nowrap`}>{f.product}</td>
              <td className={franchiseCell}>
                <div className="inline-flex items-center gap-1.5 flex-nowrap max-w-full">
                  {f.valorLabel ? (
                    <span>{f.valorLabel}</span>
                  ) : (
                    <span>{fmtDetail(f.valor)}</span>
                  )}
                  <MockInfoTooltip
                    content={
                      <div className="space-y-1">
                        <p className={`${TOOLTIP_TITLE_CLASS} m-0`}>
                          {billingTooltip.line1}
                        </p>
                        <p className="m-0">{billingTooltip.line2}</p>
                      </div>
                    }
                  />
                </div>
                <span className={`block mt-0.5 ${clientHierarchySublineClassName}`}>
                  MRR {fmtDetail(f.mrr)}
                </span>
              </td>
              <td className={franchiseCell}>
                <div className="inline-flex items-center gap-1.5 flex-nowrap">
                  <span>{fmtDetail(f.consVal)}</span>
                  <MockInfoTooltip
                    content={
                      <span>
                        <span className={TOOLTIP_TITLE_CLASS}>Consumo neste mês</span>
                        <br />
                        {f.consMes} consultas — {fmt(f.consMesVal)}
                      </span>
                    }
                  />
                </div>
                <span className={`block mt-0.5 ${clientHierarchySublineClassName}`}>
                  {f.consUsed} de {fmtN(f.consLim)}
                </span>
                {referenceSubline ? (
                  <span
                    className={`block mt-0.5 ${clientHierarchySublineClassName}`}
                  >
                    {referenceSubline}
                  </span>
                ) : null}
              </td>
              <td className={franchiseCell}>
                <div>{fmtDetail(f.excVal)}</div>
                <span
                  className={`block mt-0.5 whitespace-nowrap ${clientHierarchySublineClassName}`}
                >
                  {fmtN(f.excQ)} consultas
                </span>
              </td>
              <td className={franchiseCell}>
                <FaturadoWithBadge
                  amount={f.totalPeriodo}
                  statusKey={f.faturaStatus}
                  valorPagoParcial={f.valorPagoParcial}
                  detailed
                  layout="badge-right"
                />
                <span className={`block mt-0.5 ${clientHierarchySublineClassName}`}>
                  {fmtN(f.consUsed)} consultas
                </span>
              </td>
              <td className={franchiseCellCenter}>
                <FranchisePopover franchise={f} noRenew={listMode} />
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface ContractsTableMockProps {
  contextKey: string;
  billingReference?: string;
  expandedContractId: string | null;
  onToggleContract: (contractId: string) => void;
  showInactiveItems: boolean;
  listMode?: boolean;
  inlineDetail?: boolean;
}

export function ContractsTableMock({
  billingReference,
  expandedContractId,
  onToggleContract,
  showInactiveItems,
  listMode = false,
  inlineDetail = false,
}: ContractsTableMockProps) {
  const contracts = visibleContracts(showInactiveItems);
  const [contractSort, setContractSort] =
    useState<HierarchySortState<ContractSortKey>>(CONTRACT_SORT_INITIAL);

  const sortedContracts = useMemo(
    () => sortHierarchyRows(contracts, contractSort, contractSortValue),
    [contracts, contractSort],
  );

  const toggleContractSort = (key: ContractSortKey) => {
    setContractSort((prev) => toggleHierarchySort(prev, key));
  };

  const cellPad = inlineDetail ? "px-4 py-3.5" : "px-3 py-3";
  const headCell = inlineDetail
    ? `${clientHierarchyTableHeadCellClass} whitespace-nowrap`
    : `${clientHierarchyTableHeadCellClass} h-10 px-3 whitespace-nowrap`;
  const tableClass = `${clientHierarchyTableClassName} bg-white`;

  return (
    <table className={tableClass}>
      <thead>
        <tr>
          <th className={headCell}>Contrato</th>
          <th className={headCell}>Imposto</th>
          <SortableHeadCell
            label="Valor mínimo"
            sortKey="minimo"
            sort={contractSort}
            onToggle={toggleContractSort}
            className={headCell}
          />
          <SortableHeadCell
            label="Média últimos 3 meses"
            sortKey="media"
            sort={contractSort}
            onToggle={toggleContractSort}
            className={headCell}
          />
          <SortableHeadCell
            label="Total últimos 12 meses"
            sortKey="total12"
            sort={contractSort}
            onToggle={toggleContractSort}
            className={headCell}
          />
          <SortableHeadCell
            label="MRR"
            sortKey="mrr"
            sort={contractSort}
            onToggle={toggleContractSort}
            className={headCell}
          />
          <SortableHeadCell
            label="Consumo médio"
            sortKey="cons"
            sort={contractSort}
            onToggle={toggleContractSort}
            className={headCell}
          />
          <SortableHeadCell
            label="Faturado"
            sortKey="faturado"
            sort={contractSort}
            onToggle={toggleContractSort}
            className={headCell}
          />
          <th className={headCell}>Franquias</th>
        </tr>
      </thead>
      <tbody>
        {sortedContracts.map((ct: MockContract) => {
          const open = expandedContractId === ct.id;
          const franchises = visibleFranchises(ct.franchises, showInactiveItems);
          const contractCell = `${cellPad} border-b border-zinc-100 align-top bg-white${
            open ? " whitespace-nowrap" : ""
          }`;
          return (
            <Fragment key={ct.id}>
              <tr className="bg-white">
                <td className={contractCell}>
                  <a href="#" className="text-primary no-underline">
                    {ct.name}
                  </a>
                  <span
                    className={`block mt-0.5 font-normal whitespace-nowrap ${clientHierarchySublineClassName}`}
                  >
                    {ct.vigencia}
                  </span>
                  {ct.renovacao ? (
                    <span className="inline-block text-[11px] bg-zinc-100 px-2 py-0.5 rounded-full text-zinc-600 mt-1">
                      Com renovação
                    </span>
                  ) : null}
                </td>
                <td className={contractCell}>{ct.imposto}</td>
                <td className={contractCell}>
                  {ct.minimo == null ? "—" : fmt(ct.minimo)}
                </td>
                <td className={contractCell}>{fmt(ct.media)}</td>
                <td className={contractCell}>{fmt(ct.total12)}</td>
                <td className={contractCell}>{fmt(ct.mrr)}</td>
                <td className={contractCell}>{ct.cons}%</td>
                <td className={contractCell}>
                  <FaturadoWithBadge
                    amount={ct.faturado}
                    statusKey={ct.faturaStatus}
                    valorPagoParcial={ct.valorPagoParcial}
                    layout="badge-below"
                  />
                </td>
                <td className={contractCell}>
                  <TableExpandButton
                    expanded={open}
                    ariaLabel="Expandir franquias"
                    onClick={() => onToggleContract(ct.id)}
                  />
                </td>
              </tr>
              {open && franchises.length ? (
                <tr className="bg-white">
                  <td
                    colSpan={CONTRACT_COLSPAN}
                    className={`border-l border-primary-100 bg-white ${inlineDetail ? "px-4 py-2" : "p-2"}`}
                  >
                    <FranchiseNestedTable
                      franchises={franchises}
                      listMode={listMode}
                      billingReference={billingReference}
                    />
                  </td>
                </tr>
              ) : null}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
