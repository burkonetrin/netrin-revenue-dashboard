import type { BillingBankTransactionRow } from "../types/billing-bank-transaction.types";
import type { BillingRequestConsultationRow } from "../types/billing-request-consultation.types";
import type {
  SupportToolsBankTransactionFilters,
  SupportToolsRequestConsultationFilters,
} from "../types/support-tools-filters.types";

function parseExecutedAtMs(value: string): number | null {
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const ms = Date.parse(normalized);
  return Number.isNaN(ms) ? null : ms;
}

function isWithinDateRange(executedAt: string, startDate: string, endDate: string): boolean {
  if (!startDate && !endDate) return true;
  const ms = parseExecutedAtMs(executedAt);
  if (ms == null) return false;

  if (startDate) {
    const startMs = Date.parse(`${startDate}T00:00:00`);
    if (ms < startMs) return false;
  }
  if (endDate) {
    const endMs = Date.parse(`${endDate}T23:59:59.999`);
    if (ms > endMs) return false;
  }
  return true;
}

function includesText(haystack: string, needle: string): boolean {
  if (!needle.trim()) return true;
  return haystack.toLowerCase().includes(needle.trim().toLowerCase());
}

function matchesMultiSelect(selected: string[], value: string): boolean {
  if (selected.length === 0) return true;
  return selected.includes(value);
}

function matchesAnyChip(
  selected: string[],
  predicate: (chip: string) => boolean,
): boolean {
  if (selected.length === 0) return true;
  return selected.some(predicate);
}

function parseCommaSeparatedTerms(raw: string): string[] {
  return raw
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);
}

function matchesCommaSeparatedTextFilter(
  rawFilter: string,
  predicate: (term: string) => boolean,
): boolean {
  const terms = parseCommaSeparatedTerms(rawFilter);
  if (terms.length === 0) return true;
  return terms.some(predicate);
}

export function hasActiveRequestConsultationFilters(
  filters: SupportToolsRequestConsultationFilters,
): boolean {
  return Boolean(
    filters.startDate ||
      filters.endDate ||
      filters.origins.length ||
      filters.clients.length ||
      filters.usernames.length ||
      filters.document ||
      filters.dataSourceNames.length ||
      filters.statusCodes.length ||
      filters.caches.length,
  );
}

export function hasActiveBankTransactionFilters(filters: SupportToolsBankTransactionFilters): boolean {
  return Boolean(
    filters.startDate ||
      filters.endDate ||
      filters.microDeposits.length ||
      filters.statusCodes.length ||
      filters.sourceNames.length ||
      filters.origins.length ||
      filters.document ||
      filters.pixKeyTypes.length ||
      filters.pixKey ||
      filters.bankCode ||
      filters.bankBranch ||
      filters.bankAccount ||
      filters.clients.length ||
      filters.usernames.length,
  );
}

export function isSupportToolsDateRangeValid(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return true;
  return startDate <= endDate;
}

export function filterRequestConsultationRows(
  rows: BillingRequestConsultationRow[],
  filters: SupportToolsRequestConsultationFilters,
): BillingRequestConsultationRow[] {
  return rows.filter((row) => {
    if (!isWithinDateRange(row.executedAt, filters.startDate, filters.endDate)) return false;
    if (!matchesMultiSelect(filters.origins, row.origin)) return false;
    if (
      !matchesAnyChip(filters.clients, (chip) =>
        includesText(row.clientName, chip) || includesText(String(row.clientId), chip),
      )
    ) {
      return false;
    }
    if (
      !matchesAnyChip(filters.usernames, (chip) =>
        includesText(row.username, chip) || includesText(String(row.userId), chip),
      )
    ) {
      return false;
    }
    if (
      !matchesCommaSeparatedTextFilter(filters.document, (term) => row.document.includes(term))
    ) {
      return false;
    }
    if (
      !matchesAnyChip(filters.dataSourceNames, (chip) =>
        (row.dataSourceName && includesText(row.dataSourceName, chip)) ||
        includesText(String(row.dataSourceId), chip),
      )
    ) {
      return false;
    }
    if (!matchesMultiSelect(filters.statusCodes, String(row.statusCode))) return false;
    if (filters.caches.length > 0) {
      const matchesYes = filters.caches.includes("yes") && row.cache;
      const matchesNo = filters.caches.includes("no") && !row.cache;
      if (!matchesYes && !matchesNo) return false;
    }
    return true;
  });
}

function resolveMicroDepositStatus(row: BillingBankTransactionRow): "Validado" | "Invalidado" {
  return row.microDepositStatus ?? "Validado";
}

export function filterBankTransactionRows(
  rows: BillingBankTransactionRow[],
  filters: SupportToolsBankTransactionFilters,
): BillingBankTransactionRow[] {
  return rows.filter((row) => {
    if (!isWithinDateRange(row.executedAt, filters.startDate, filters.endDate)) return false;
    if (!matchesMultiSelect(filters.microDeposits, resolveMicroDepositStatus(row))) {
      return false;
    }
    if (!matchesMultiSelect(filters.origins, row.origin)) return false;
    if (
      !matchesCommaSeparatedTextFilter(filters.document, (term) =>
        Boolean(row.document && includesText(row.document, term)),
      )
    ) {
      return false;
    }
    if (filters.pixKeyTypes.length > 0) {
      const type = (row.pixKeyType ?? "").toLowerCase();
      if (!filters.pixKeyTypes.some((value) => value.toLowerCase() === type)) return false;
    }
    if (
      !matchesCommaSeparatedTextFilter(filters.pixKey, (term) =>
        Boolean(row.pixKey && includesText(row.pixKey, term)),
      )
    ) {
      return false;
    }
    if (
      !matchesCommaSeparatedTextFilter(filters.bankCode, (term) =>
        Boolean(row.bankCode && includesText(row.bankCode, term)),
      )
    ) {
      return false;
    }
    if (
      !matchesCommaSeparatedTextFilter(filters.bankBranch, (term) =>
        Boolean(row.bankBranch && includesText(row.bankBranch, term)),
      )
    ) {
      return false;
    }
    const accountLine = [row.bankAccount, row.bankAccountDigit].filter(Boolean).join("-");
    if (
      !matchesCommaSeparatedTextFilter(filters.bankAccount, (term) =>
        includesText(accountLine, term),
      )
    ) {
      return false;
    }
    if (!matchesMultiSelect(filters.statusCodes, String(row.statusCode))) return false;
    if (
      !matchesAnyChip(filters.sourceNames, (chip) =>
        includesText(row.sourceName, chip) || includesText(String(row.dataSourceId), chip),
      )
    ) {
      return false;
    }
    if (
      !matchesAnyChip(filters.clients, (chip) =>
        includesText(row.clientName, chip) || includesText(String(row.clientId), chip),
      )
    ) {
      return false;
    }
    if (
      !matchesAnyChip(filters.usernames, (chip) =>
        includesText(row.username, chip) || includesText(String(row.userId), chip),
      )
    ) {
      return false;
    }
    return true;
  });
}
