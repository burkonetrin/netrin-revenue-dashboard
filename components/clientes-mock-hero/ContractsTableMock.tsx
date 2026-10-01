"use client";

import {
  nucleusTableHeadCellClass,
  nucleusTableHeadCellCompactClass,
} from "@/shared/styles/tableClassNames";
import { Button } from "@heroui/react";
import { Fragment } from "react";
import {
  CONTRACTS_MOCK,
  type MockContract,
  type MockFranchise,
} from "../../clientesDashboardMockData";
import { fmt, fmtDetail, fmtN, franchiseBillingModelTooltipContent } from "../../clientesDashboardMockFormat";
import { FaturadoWithBadge } from "./FaturadoCell";
import { FranchisePopover } from "./FranchisePopover";
import { MockInfoTooltip } from "./MockInfoTooltip";

const CONTRACT_COLSPAN = 9;

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
}: {
  franchises: MockFranchise[];
  listMode: boolean;
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-2 my-2 mx-0">
      {!listMode ? (
        <Button color="primary" size="sm" className="mb-3">
          Nova franquia
        </Button>
      ) : null}
      <table className="w-full border-collapse text-[11px] bg-white">
        <thead>
          <tr>
            <th className={nucleusTableHeadCellCompactClass}>Franquia</th>
            <th className={nucleusTableHeadCellCompactClass}>Centro de lucro</th>
            <th className={nucleusTableHeadCellCompactClass}>Vigência</th>
            <th className={nucleusTableHeadCellCompactClass}>Valor</th>
            <th className={nucleusTableHeadCellCompactClass}>
              Consultas no período
            </th>
            <th className={nucleusTableHeadCellCompactClass}>Excedente</th>
            <th className={nucleusTableHeadCellCompactClass}>Faturado</th>
            <th className={`${nucleusTableHeadCellCompactClass} w-10`} />
          </tr>
        </thead>
        <tbody>
          {franchises.map((f) => {
            const billingTooltip = franchiseBillingModelTooltipContent(f);
            return (
            <tr key={f.id} className="border-b border-zinc-100 bg-white">
              <td className="p-2 align-top bg-white">
                <a href="#" className="block text-primary font-semibold no-underline">
                  {f.name}
                </a>
                <span className="block text-[10px] text-zinc-500 mt-0.5 font-normal">
                  {f.product}
                </span>
              </td>
              <td className="p-2 align-top bg-white">
                {f.centro}
                <span className="block text-[10px] text-zinc-500 mt-0.5">
                  {f.excLabel}
                </span>
              </td>
              <td className="p-2 align-top bg-white">
                {f.vigencia}
                <span className="block text-[10px] text-zinc-500 mt-0.5">
                  {f.periodo}
                </span>
              </td>
              <td className="p-2 align-top bg-white">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {f.valorLabel ? (
                    <strong>{f.valorLabel}</strong>
                  ) : (
                    <span className="font-medium">{fmtDetail(f.valor)}</span>
                  )}
                  <MockInfoTooltip
                    content={
                      <div className="text-[13px] space-y-1">
                        <p className="m-0 text-zinc-800">
                          {billingTooltip.line1}
                        </p>
                        <p className="m-0 text-zinc-800">
                          {billingTooltip.line2}
                        </p>
                      </div>
                    }
                  />
                </div>
                <span className="block text-[10px] text-zinc-500 mt-0.5">
                  MRR {fmtDetail(f.mrr)}
                </span>
              </td>
              <td className="p-2 align-top bg-white">
                <div className="flex items-center gap-1.5 flex-wrap font-medium">
                  {fmtDetail(f.consVal)}
                  <MockInfoTooltip
                    content={
                      <span>
                        <strong>Consumo neste mês</strong>
                        <br />
                        {f.consMes} consultas — {fmt(f.consMesVal)}
                      </span>
                    }
                  />
                </div>
                <span className="block text-[10px] text-zinc-500 mt-0.5">
                  {f.consUsed} de {fmtN(f.consLim)}
                </span>
              </td>
              <td className="p-2 align-top bg-white">
                <div className="font-medium">{fmtDetail(f.excVal)}</div>
                <span className="block text-[10px] text-zinc-500 mt-0.5">
                  {fmtN(f.excQ)} consultas
                </span>
              </td>
              <td className="p-2 align-top bg-white">
                <FaturadoWithBadge
                  amount={f.totalPeriodo}
                  statusKey={f.faturaStatus}
                  valorPagoParcial={f.valorPagoParcial}
                  detailed
                  layout="badge-right"
                />
                <span className="block text-[10px] text-zinc-500 mt-0.5">
                  {fmtN(f.consUsed)} consultas
                </span>
              </td>
              <td className="p-2 align-top text-center bg-white">
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
  expandedContractId: string | null;
  onToggleContract: (contractId: string) => void;
  showInactiveItems: boolean;
  listMode?: boolean;
  inlineDetail?: boolean;
}

export function ContractsTableMock({
  expandedContractId,
  onToggleContract,
  showInactiveItems,
  listMode = false,
  inlineDetail = false,
}: ContractsTableMockProps) {
  const contracts = visibleContracts(showInactiveItems);

  const cellPad = inlineDetail ? "px-4 py-3.5" : "px-3 py-3";
  const headCell = inlineDetail
    ? nucleusTableHeadCellClass
    : `${nucleusTableHeadCellClass} h-10 px-3`;
  const tableClass = inlineDetail
    ? "w-full border-collapse text-[13px] bg-white"
    : "w-full border-collapse text-xs bg-white";

  return (
    <table className={tableClass}>
      <thead>
        <tr>
          <th className={headCell}>Contrato</th>
          <th className={headCell}>Imposto</th>
          <th className={headCell}>Valor mínimo</th>
          <th className={headCell}>Média últimos 3 meses</th>
          <th className={headCell}>Total últimos 12 meses</th>
          <th className={headCell}>MRR</th>
          <th className={headCell}>Consumo médio</th>
          <th className={headCell}>Faturado</th>
          <th className={headCell}>Franquias</th>
        </tr>
      </thead>
      <tbody>
        {contracts.map((ct: MockContract) => {
          const open = expandedContractId === ct.id;
          const franchises = visibleFranchises(ct.franchises, showInactiveItems);
          return (
            <Fragment key={ct.id}>
              <tr className="bg-white">
                <td className={`${cellPad} border-b border-zinc-100 align-top bg-white`}>
                  <a href="#" className="text-primary font-semibold no-underline">
                    {ct.name}
                  </a>
                  <span className="block text-[11px] text-zinc-500 mt-0.5 font-normal">
                    {ct.vigencia}
                  </span>
                  {ct.renovacao ? (
                    <span className="inline-block text-[10px] bg-zinc-100 px-2 py-0.5 rounded-full text-zinc-600 mt-1">
                      Com renovação
                    </span>
                  ) : null}
                </td>
                <td className={`${cellPad} border-b border-zinc-100 align-top bg-white`}>
                  {ct.imposto}
                </td>
                <td className={`${cellPad} border-b border-zinc-100 align-top bg-white`}>
                  {ct.minimo == null ? "—" : fmt(ct.minimo)}
                </td>
                <td className={`${cellPad} border-b border-zinc-100 align-top bg-white`}>
                  {fmt(ct.media)}
                </td>
                <td className={`${cellPad} border-b border-zinc-100 align-top bg-white`}>
                  {fmt(ct.total12)}
                </td>
                <td className={`${cellPad} border-b border-zinc-100 align-top bg-white`}>
                  {fmt(ct.mrr)}
                </td>
                <td className={`${cellPad} border-b border-zinc-100 align-top bg-white`}>
                  {ct.cons}%
                </td>
                <td className={`${cellPad} border-b border-zinc-100 align-top bg-white`}>
                  <FaturadoWithBadge
                    amount={ct.faturado}
                    statusKey={ct.faturaStatus}
                    valorPagoParcial={ct.valorPagoParcial}
                    layout="badge-below"
                  />
                </td>
                <td className={`${cellPad} border-b border-zinc-100 align-top bg-white`}>
                  <button
                    type="button"
                    className="border-none bg-transparent cursor-pointer p-1 text-zinc-600"
                    aria-label="Expandir"
                    onClick={() => onToggleContract(ct.id)}
                  >
                    {open ? "▴" : "▾"}
                  </button>
                </td>
              </tr>
              {open && franchises.length ? (
                <tr className="bg-white">
                  <td
                    colSpan={CONTRACT_COLSPAN}
                    className={`bg-white ${inlineDetail ? "px-4 py-2" : "p-2"}`}
                  >
                    <FranchiseNestedTable
                      franchises={franchises}
                      listMode={listMode}
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
