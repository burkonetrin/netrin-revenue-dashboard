/** Retorna apenas os dígitos do documento (CPF ou CNPJ). */
export function blockedDocumentDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Indica se o texto é CPF (11) ou CNPJ (14 dígitos), com ou sem máscara. */
export function isValidBlockedDocumentInput(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  const digits = blockedDocumentDigits(trimmed);
  return digits.length === 11 || digits.length === 14;
}

/** Formata CPF ou CNPJ para exibição na tabela. */
export function formatBlockedDocumentDisplay(value: string): string {
  const digits = blockedDocumentDigits(value);
  if (digits.length === 11) {
    return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }
  if (digits.length === 14) {
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  }
  return value.trim();
}
