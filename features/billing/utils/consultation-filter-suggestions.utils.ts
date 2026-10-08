import type { BillingRequestConsultationRow } from "../types/billing-request-consultation.types";

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim()))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}

export function buildConsultationFilterSuggestions(rows: BillingRequestConsultationRow[]) {
  return {
    sourceNames: uniqueSorted(
      rows.map((row) => row.dataSourceName ?? "").filter(Boolean),
    ),
    clientNames: uniqueSorted(rows.map((row) => row.clientName)),
    usernames: uniqueSorted(rows.map((row) => row.username)),
    statusCodes: uniqueSorted(rows.map((row) => String(row.statusCode))),
  };
}
