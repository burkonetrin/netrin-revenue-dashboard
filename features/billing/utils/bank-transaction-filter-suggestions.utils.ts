import type { BillingBankTransactionRow } from "../types/billing-bank-transaction.types";

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim()))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}

export function buildBankTransactionFilterSuggestions(rows: BillingBankTransactionRow[]) {
  return {
    sourceNames: uniqueSorted(rows.map((row) => row.sourceName)),
    clientNames: uniqueSorted(rows.map((row) => row.clientName)),
    usernames: uniqueSorted(rows.map((row) => row.username)),
  };
}
