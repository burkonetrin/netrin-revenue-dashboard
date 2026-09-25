"use client";

import { formatCurrency } from "../utils/format";

interface StatCardsProps {
  clientesAtivosFaturados: number;
  contratosAtivos: number;
  franquiasAtivas: number;
  mediaFaturamento3m: number;
}

export function StatCards({
  clientesAtivosFaturados,
  contratosAtivos,
  franquiasAtivas,
  mediaFaturamento3m,
}: StatCardsProps) {
  const items = [
    {
      label: "Clientes ativos faturados",
      value: clientesAtivosFaturados.toLocaleString("pt-BR"),
    },
    {
      label: "Contratos ativos",
      value: contratosAtivos.toLocaleString("pt-BR"),
    },
    {
      label: "Franquias ativas",
      value: franquiasAtivas.toLocaleString("pt-BR"),
    },
    {
      label: "Média de faturamento (últimos 3 meses)",
      value: formatCurrency(mediaFaturamento3m),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs text-zinc-500 mb-1">{item.label}</p>
          <p className="text-2xl font-semibold text-zinc-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
