"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DataSourceMonthFinancialsResponse } from "../types/data-sources.types";
import { formatSourceCurrency } from "../utils/sourceCurrency.utils";
import {
  type SourceFinancialChartPoint,
  buildSourceFinancialChartData,
} from "../utils/sourceMonthlyFinancials.utils";

const FINANCIAL_SERIES = [
  {
    key: "referenceCost",
    label: "Custo de referência",
    color: "#E6007E",
    axis: "value",
    kind: "currency",
  },
  {
    key: "averageRealCost",
    label: "Custo real médio",
    color: "#6078FF",
    axis: "value",
    kind: "currency",
  },
  {
    key: "averageRevenue",
    label: "Receita média",
    color: "#20A5A8",
    axis: "value",
    kind: "currency",
  },
  { key: "markup", label: "Markup", color: "#27272A", axis: "markup", kind: "markup" },
] as const;

type FinancialSeriesKey = (typeof FINANCIAL_SERIES)[number]["key"];

interface DataSourceFinancialChartProps {
  dateFrom: string;
  dateTo: string;
  months: DataSourceMonthFinancialsResponse[];
}

interface FinancialTooltipPayloadItem {
  dataKey: string;
  value: unknown;
  payload: SourceFinancialChartPoint;
}

interface DataSourceFinancialTooltipProps {
  active?: boolean;
  payload?: FinancialTooltipPayloadItem[];
}

function formatMarkup(value: number | null): string {
  return value == null
    ? "—"
    : new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
}

export function DataSourceFinancialTooltip({ active, payload }: DataSourceFinancialTooltipProps) {
  const point = payload?.[0]?.payload;
  const focusedSeries = FINANCIAL_SERIES.find((series) => series.key === payload?.[0]?.dataKey);
  if (!active || !point || !focusedSeries) return null;

  const focusedValue =
    focusedSeries.kind === "currency"
      ? formatSourceCurrency(Number(payload?.[0]?.value ?? 0))
      : formatMarkup(point.markup);

  return (
    <div className="rounded-lg border border-default-200 bg-white px-4 py-3 shadow-lg">
      <p className="mb-2 text-xs text-default-500">{point.label}</p>
      <p className="text-sm font-medium text-default-800">
        {focusedSeries.label}: {focusedValue}
      </p>
      <p className="mt-1 text-sm text-default-700">Markup: {formatMarkup(point.markup)}</p>
    </div>
  );
}

export function DataSourceFinancialChart({
  dateFrom,
  dateTo,
  months,
}: DataSourceFinancialChartProps) {
  const [hiddenSeries, setHiddenSeries] = useState<Set<FinancialSeriesKey>>(() => new Set());
  const chartData = useMemo(
    () => buildSourceFinancialChartData(dateFrom, dateTo, months),
    [dateFrom, dateTo, months],
  );

  const toggleSeries = (key: FinancialSeriesKey) => {
    setHiddenSeries((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <section
      aria-label="Gráfico financeiro mensal da fonte"
      data-testid="source-financial-chart"
      data-months={chartData.map(({ month }) => month).join(",")}
      className="w-full"
    >
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        {FINANCIAL_SERIES.map((series) => {
          const isVisible = !hiddenSeries.has(series.key);
          return (
            <button
              key={series.key}
              type="button"
              aria-pressed={isVisible}
              onClick={() => toggleSeries(series.key)}
              className={`inline-flex items-center gap-2 text-xs transition-opacity ${
                isVisible ? "text-default-700" : "text-default-400 line-through opacity-60"
              }`}
            >
              <span
                aria-hidden="true"
                className="size-3 rounded-[3px]"
                style={{ backgroundColor: series.color }}
              />
              {series.label}
            </button>
          );
        })}
      </div>

      <div className="h-[420px] w-full" aria-label="Área do gráfico">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 12, right: 24, bottom: 18, left: 24 }}>
            <CartesianGrid stroke="#E4E4E7" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#71717A", fontSize: 12 }}
              axisLine={{ stroke: "#A1A1AA" }}
              tickLine={false}
              label={{ value: "Mês/Ano", position: "insideBottom", offset: -8, fill: "#52525B" }}
            />
            <YAxis
              yAxisId="value"
              orientation="left"
              width={104}
              tick={{ fill: "#71717A", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => formatSourceCurrency(value)}
              label={{
                value: "Valor",
                angle: -90,
                position: "insideLeft",
                offset: -10,
                fill: "#52525B",
              }}
              tickMargin={20}
            />
            <YAxis
              yAxisId="markup"
              orientation="right"
              tick={{ fill: "#71717A", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => formatMarkup(value)}
              label={{ value: "Markup", angle: 90, position: "insideRight", fill: "#52525B" }}
            />
            <Tooltip shared={false} content={<DataSourceFinancialTooltip />} />
            {FINANCIAL_SERIES.map((series) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                name={series.label}
                yAxisId={series.axis}
                stroke={series.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
                hide={hiddenSeries.has(series.key)}
                isAnimationActive={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
