import { type CalendarDate, parseDate } from "@internationalized/date";

/**
 * Campo de vigência da franquia.
 */
export type FranchiseTermField = "beginningTerm" | "endTerm";

/**
 * Erro de validação de vigência da franquia.
 */
export type FranchiseTermFieldError = {
  path: FranchiseTermField;
  message: string;
};

/**
 * Extrai apenas a data de um termo ISO.
 */
export function toTermDateOnly(iso: string): string {
  return iso.split("T")[0] ?? "";
}

/**
 * Converte string ISO em CalendarDate.
 */
export function toCalendarDate(iso: string | undefined): CalendarDate | null {
  if (!iso?.trim()) return null;
  try {
    return parseDate(toTermDateOnly(iso));
  } catch {
    return null;
  }
}

/**
 * Formata data de vigência para exibição.
 */
export function formatTermDateLabel(iso: string): string {
  const [year, month, day] = toTermDateOnly(iso).split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

/**
 * Valida ordem da vigência da franquia (início ≤ fim).
 */
export function validateFranchiseTermOrder(franchise: {
  beginningTerm: string;
  endTerm: string;
}): FranchiseTermFieldError[] {
  const franchiseStart = toTermDateOnly(franchise.beginningTerm);
  const franchiseEnd = toTermDateOnly(franchise.endTerm);

  if (!franchiseStart || !franchiseEnd) return [];

  if (franchiseStart > franchiseEnd) {
    return [
      {
        path: "beginningTerm",
        message: "A vigência inicial não pode ser posterior à vigência final",
      },
      {
        path: "endTerm",
        message: "A vigência final não pode ser anterior à vigência inicial",
      },
    ];
  }

  return [];
}

/**
 * Verifica se início ≤ fim na vigência da franquia.
 */
export function isFranchiseTermOrderValid(franchise: {
  beginningTerm: string;
  endTerm: string;
}): boolean {
  return validateFranchiseTermOrder(franchise).length === 0;
}
