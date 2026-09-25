"use client";

import { Select, SelectItem } from "@heroui/react";
import { useState, type CSSProperties, type ReactNode } from "react";
import {
  COHORT_OFFSETS,
  COHORT_ROWS,
} from "../cohortMockData";
import { formatMil, formatPercent } from "../utils/format";

type CohortMetric = "retention" | "mrr";

function retentionStyle(pct: number, offset: number): string {
  if (offset === 0) return "bg-zinc-100 text-zinc-700";
  if (pct >= 95) return "bg-emerald-100 text-emerald-800";
  if (pct >= 85) return "bg-amber-100 text-amber-900";
  return "bg-red-100 text-red-800";
}

function mrrStyle(value: number, rowMax: number): CSSProperties {
  const t = rowMax > 0 ? value / rowMax : 0;
  const lightness = 92 - t * 42;
  return {
    backgroundColor: `hsl(220, 70%, ${lightness}%)`,
    color: t > 0.5 ? "#fff" : "#1e3a5f",
  };
}

export function CohortRetentionPanel() {
  const [metric, setMetric] = useState<CohortMetric>("retention");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            Cohort retention
          </h2>
          <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
            Primeiro MRR observado, não necessariamente aquisição. Jan/24 é a
            base preexistente. Clientes reativados voltam a contar na retenção
            de logos. Células futuras ficam vazias.
          </p>
        </div>
        <Select
          label="Métrica"
          size="sm"
          className="min-w-[200px] max-w-xs"
          selectedKeys={new Set([metric])}
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0]?.toString() as CohortMetric;
            if (key === "retention" || key === "mrr") setMetric(key);
          }}
        >
          <SelectItem key="retention">Logo retention</SelectItem>
          <SelectItem key="mrr">MRR</SelectItem>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white p-3">
        <table className="w-full min-w-[880px] border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-zinc-500 px-2 py-2 w-40">
                Cohort / tamanho inicial
              </th>
              {COHORT_OFFSETS.map((o) => (
                <th
                  key={o}
                  className="text-center text-xs font-medium text-zinc-500 px-1 py-2"
                >
                  M{o}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COHORT_ROWS.map((row) => {
              const rowMrrMax = Math.max(
                ...COHORT_OFFSETS.map((o) => row.mrr[o] ?? 0),
              );
              return (
                <tr key={row.key}>
                  <td className="align-top px-2 py-2">
                    <p className="font-medium text-zinc-900">{row.label}</p>
                    <p className="text-xs text-zinc-500">
                      {row.initialClients} clientes
                    </p>
                  </td>
                  {COHORT_OFFSETS.map((offset) => {
                    const data =
                      metric === "retention" ? row.retention : row.mrr;
                    const value = data[offset];
                    if (value === undefined) {
                      return (
                        <td key={offset} className="p-0">
                          <div className="rounded-md bg-zinc-50 text-center text-zinc-400 py-3 text-xs">
                            —
                          </div>
                        </td>
                      );
                    }
                    if (metric === "retention") {
                      return (
                        <td key={offset} className="p-0">
                          <div
                            className={`rounded-md text-center py-3 text-xs font-medium ${retentionStyle(value, offset)}`}
                          >
                            {formatPercent(value).replace(".0", "")}
                          </div>
                        </td>
                      );
                    }
                    return (
                      <td key={offset} className="p-0">
                        <div
                          className="rounded-md text-center py-3 text-xs font-medium"
                          style={mrrStyle(value, rowMrrMax)}
                        >
                          {formatMil(value)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DashboardViewTabs({
  dashboard,
  clientes,
}: {
  dashboard: ReactNode;
  clientes: ReactNode;
}) {
  const [active, setActive] = useState<"dashboard" | "clientes">("dashboard");

  return (
    <>
      <div
        className="flex border-b border-zinc-200 mb-5"
        role="tablist"
        aria-label="Visões do painel de clientes"
      >
        <button
          type="button"
          role="tab"
          aria-selected={active === "dashboard"}
          className={`py-2.5 mr-5 -mb-px border-b-2 bg-transparent border-x-0 border-t-0 font-inherit text-sm cursor-pointer ${
            active === "dashboard"
              ? "text-primary font-semibold border-primary"
              : "text-zinc-500 border-transparent"
          }`}
          onClick={() => setActive("dashboard")}
        >
          Dashboard
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={active === "clientes"}
          className={`py-2.5 mr-5 -mb-px border-b-2 bg-transparent border-x-0 border-t-0 font-inherit text-sm cursor-pointer ${
            active === "clientes"
              ? "text-primary font-semibold border-primary"
              : "text-zinc-500 border-transparent"
          }`}
          onClick={() => setActive("clientes")}
        >
          Clientes
        </button>
      </div>
      <div role="tabpanel">
        {active === "dashboard" ? dashboard : clientes}
      </div>
    </>
  );
}
