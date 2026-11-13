"use client";

import { BAR_HEALTH, type ClientHealthKey } from "../../clientesDashboardMockData";
import { Funnel } from "lucide-react";
import { CmpRight } from "./CmpRight";

const HEALTH_SEGMENT_COLORS: Record<ClientHealthKey, string> = {
  oportunidade: "#652cdd",
  sucesso: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
};

interface ClientHealthDonutPanelProps {
  onHealthFilter?: (healthKey: ClientHealthKey) => void;
}

/** Resumo de saúde dos clientes com legenda, métricas e filtro para a listagem. */
export function ClientHealthDonutPanel({ onHealthFilter }: ClientHealthDonutPanelProps) {
  return (
    <article className="flex min-h-[108px] flex-col rounded-xl border border-[var(--ds-border)] bg-[var(--ds-card)] p-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <h3 className="m-0 mb-3 text-[13px] font-medium text-[var(--ds-muted)]">
        Saúde dos clientes (% consumo)
      </h3>
      <ul className="m-0 flex w-full min-w-0 flex-1 list-none flex-col justify-center gap-2.5 p-0">
        {BAR_HEALTH.map((row) => (
          <li
            key={row.healthKey}
            className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2"
          >
            <div className="min-w-0">
              <span className="flex items-center gap-1.5 text-[11px] text-zinc-700">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: HEALTH_SEGMENT_COLORS[row.healthKey] }}
                  aria-hidden
                />
                {row.title}
              </span>
              <span className="block text-[9px] text-zinc-400">{row.sub}</span>
            </div>
            <div className="flex shrink-0 items-baseline justify-end gap-1 tabular-nums">
              <span className="text-[11px] font-semibold text-zinc-800">{row.v}</span>
              <CmpRight cur={row.v} prev={row.p} className="text-[10px] font-normal" />
            </div>
            <button
              type="button"
              className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded p-0.5 text-zinc-400 transition-colors hover:text-primary"
              aria-label={`Filtrar clientes por ${row.title}`}
              onClick={() => onHealthFilter?.(row.healthKey)}
            >
              <Funnel size={14} strokeWidth={2} />
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}
