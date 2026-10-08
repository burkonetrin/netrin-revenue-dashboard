"use client";

import type { BillingRequestConsultationRow } from "../types/billing-request-consultation.types";
import { formatBillingRequestDateTime } from "../utils/billing-request-consultation.utils";
import {
  SupportToolsDataSourceCell,
  SupportToolsUserCell,
} from "./support-tools/SupportToolsTableCells";

const SUBLINE_CLASS = "text-xs text-gray-500";

export function BillingRequestClientCell({ row }: { row: BillingRequestConsultationRow }) {
  const franchise = row.franchiseName?.trim() || "—";
  const serviceType = row.serviceType?.trim();

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-gray-900">{row.clientName}</span>
      <span className={`inline-flex max-w-full flex-wrap items-center gap-2 ${SUBLINE_CLASS}`}>
        <span>{franchise}</span>
        {serviceType ? (
          <>
            <span className="h-3 w-px shrink-0 bg-gray-300" aria-hidden />
            <span>{serviceType}</span>
          </>
        ) : null}
      </span>
    </div>
  );
}

export function BillingRequestUserCell({ row }: { row: BillingRequestConsultationRow }) {
  return <SupportToolsUserCell username={row.username} userId={row.userId} />;
}

export function BillingRequestDataSourceCell({ row }: { row: BillingRequestConsultationRow }) {
  return (
    <SupportToolsDataSourceCell
      name={row.dataSourceName}
      dataSourceId={row.dataSourceId}
    />
  );
}

export function BillingRequestExecutedAtCell({ row }: { row: BillingRequestConsultationRow }) {
  const tempo =
    row.requestTimeMs != null && !Number.isNaN(row.requestTimeMs)
      ? `${Math.round(row.requestTimeMs)} ms`
      : "—";

  return (
    <div className="flex w-max max-w-full flex-col gap-0.5">
      <span className="whitespace-nowrap text-gray-900">
        {formatBillingRequestDateTime(row.executedAt)}
      </span>
      <span className={`whitespace-nowrap ${SUBLINE_CLASS}`}>Tempo: {tempo}</span>
    </div>
  );
}
