"use client";

import { Link } from "react-router-dom";
import { Chip } from "@heroui/react";
import type { ClientMock } from "../types";
import { HEALTH_CHIP_COLOR } from "../constants";
import { HEALTH_OPTIONS } from "../constants";
import { formatCnpj, formatCurrency, formatPercent } from "../utils/format";
import { nucleusTableHeadCellClass } from "@/shared/styles/tableClassNames";

function healthLabel(saude: ClientMock["saude"]) {
  return HEALTH_OPTIONS.find((h) => h.key === saude)?.label.split(" (")[0] ?? saude;
}

interface ClientsSummaryTableProps {
  clients: ClientMock[];
}

export function ClientsSummaryTable({ clients }: ClientsSummaryTableProps) {
  const productCount = (c: ClientMock) =>
    new Set(
      c.contracts.flatMap((ct) => ct.franchises.map((f) => f.servico)),
    ).size;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <header className="px-4 py-3 border-b border-zinc-100">
        <h2 className="text-base font-semibold text-zinc-900">
          Listagem de clientes
        </h2>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className={nucleusTableHeadCellClass}>Razão social</th>
              <th className={nucleusTableHeadCellClass}>CNPJ</th>
              <th className={nucleusTableHeadCellClass}>Produtos</th>
              <th className={nucleusTableHeadCellClass}>Faturamento</th>
              <th className={nucleusTableHeadCellClass}>% Consumo</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t border-zinc-100">
                <td className="px-4 py-3">
                  <Link
                    to={`/demo/commercial-dashboard/clientes#${client.id}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {client.razaoSocial}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {formatCnpj(client.cnpj)}
                </td>
                <td className="px-4 py-3">{productCount(client)}</td>
                <td className="px-4 py-3">
                  {formatCurrency(client.faturadoPorMes)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{formatPercent(client.consumoMedioPct)}</span>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={HEALTH_CHIP_COLOR[client.saude]}
                    >
                      {healthLabel(client.saude)}
                    </Chip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
