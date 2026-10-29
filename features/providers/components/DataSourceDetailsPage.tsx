"use client";

import { PROVIDERS_BASE_PATH } from "@/constants";
import { DataSourceFinancialChart } from "@/features/providers/components/DataSourceFinancialChart";
import { SourceMonthPicker } from "@/features/providers/components/SourceMonthPicker";
import { useDataSource } from "@/features/providers/hooks/useDataSource";
import { useDataSourceMonthlyFinancials } from "@/features/providers/hooks/useDataSourceMonthlyFinancials";
import { Spinner } from "@heroui/react";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  type SourceMonthRange,
  getDefaultSourceMonthRange,
} from "../utils/sourceMonthlyFinancials.utils";

interface DataSourceDetailsPageProps {
  sourceId: string;
}

type PeriodField = "from" | "to";

function isValidCompetence(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function DataSourceDetailsPage({ sourceId }: DataSourceDetailsPageProps) {
  const [defaultRange] = useState(getDefaultSourceMonthRange);
  const [periodFields, setPeriodFields] = useState<SourceMonthRange>(defaultRange);
  const [appliedRange, setAppliedRange] = useState<SourceMonthRange>(defaultRange);
  const [periodError, setPeriodError] = useState("");
  const {
    data: source,
    isLoading: isSourceLoading,
    isError: isSourceError,
  } = useDataSource(sourceId);
  const {
    data: financials,
    isLoading: isFinancialsLoading,
    isError: isFinancialsError,
  } = useDataSourceMonthlyFinancials(sourceId, appliedRange.from, appliedRange.to);

  const handlePeriodChange = (field: PeriodField, value: string) => {
    if (!isValidCompetence(value)) return;

    const nextFields = { ...periodFields, [field]: value };
    setPeriodFields(nextFields);
    if (nextFields.from > nextFields.to) {
      setPeriodError("A competência inicial não pode ser posterior à competência final.");
      return;
    }

    setPeriodError("");
    setAppliedRange(nextFields);
  };

  if (isSourceLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (isSourceError || !source) {
    return (
      <p role="alert" className="text-sm text-danger">
        Não foi possível carregar esta fonte.
      </p>
    );
  }

  return (
    <div className="space-y-7 p-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-default-500">
        <Link to={PROVIDERS_BASE_PATH} className="hover:text-primary">
          Fontes e fornecedores
        </Link>
        <ChevronRight size={14} aria-hidden="true" />
        <h1 className="font-medium text-default-800">{source.name}</h1>
      </nav>

      <div className="flex flex-wrap items-end gap-3">
        <SourceMonthPicker
          label="Competência inicial"
          value={periodFields.from}
          onChange={(value) => handlePeriodChange("from", value)}
        />
        <SourceMonthPicker
          label="Competência final"
          value={periodFields.to}
          onChange={(value) => handlePeriodChange("to", value)}
        />
      </div>

      {periodError && (
        <p role="alert" className="text-sm text-danger-600">
          {periodError}
        </p>
      )}

      {isFinancialsLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" color="primary" />
        </div>
      ) : isFinancialsError ? (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar os dados financeiros desta fonte.
        </p>
      ) : (
        <DataSourceFinancialChart
          dateFrom={appliedRange.from}
          dateTo={appliedRange.to}
          months={financials?.months ?? []}
        />
      )}
    </div>
  );
}
