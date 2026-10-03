/**
 * Utilitários para formatação e máscara de moeda (BRL)
 */

/**
 * Formata um número ou string numérica para o formato de moeda BRL (R$ 0,00)
 */
export const formatCurrency = (value: number | string): string => {
  const amount = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(amount)) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
};

function parseMaskedCurrencyAmount(value: string | number, divisor: number): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "number") return Number.isNaN(value) ? 0 : value;

  const hasCurrencyPrefix = value.includes("R$");
  const hasComma = value.includes(",");
  const hasDot = value.includes(".");
  let amount: number;

  if (!hasCurrencyPrefix && (hasComma || hasDot)) {
    amount = hasComma
      ? Number.parseFloat(value.replace(/\./g, "").replace(",", "."))
      : Number.parseFloat(value);
  } else {
    const digits = value.replace(/\D/g, "");
    amount = digits ? Number.parseInt(digits, 10) / divisor : 0;
  }

  return Number.isNaN(amount) ? 0 : amount;
}

/**
 * Máscara para input de moeda (R$ 1.234,56)
 * Transforma uma string de dígitos ou número em formato de moeda
 */
export const maskCurrency = (value: string | number): string => {
  const amount = parseMaskedCurrencyAmount(value, 100);
  if (amount === null) return "";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Remove a máscara de moeda e retorna o valor numérico
 */
export const unmaskCurrency = (value: string): number => {
  if (!value) return 0;

  // Pegamos apenas os dígitos e dividimos por 100
  const digits = value.replace(/\D/g, "");
  if (!digits) return 0;

  return Number.parseInt(digits, 10) / 100;
};

const CURRENCY_4_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
};

/**
 * Formata um número ou string numérica para BRL com exatamente 4 casas decimais (cadastro).
 * Valores com menos casas são padados à direita (ex.: 10.12 → R$ 10,1200).
 */
export const formatCurrency4 = (value: number | string): string => {
  const amount = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(amount)) return "R$ 0,0000";

  return new Intl.NumberFormat("pt-BR", CURRENCY_4_FORMAT_OPTIONS).format(amount);
};

/**
 * Máscara para input de moeda com 4 casas decimais (R$ 1.234,5678).
 * Entrada digit-by-digit divide por 10000.
 */
export const maskCurrency4 = (value: string | number): string => {
  const amount = parseMaskedCurrencyAmount(value, 10000);
  if (amount === null) return "";

  return new Intl.NumberFormat("pt-BR", CURRENCY_4_FORMAT_OPTIONS).format(amount);
};

/**
 * Remove a máscara de moeda de 4 casas e retorna o valor numérico.
 */
export const unmaskCurrency4 = (value: string): number => {
  if (!value) return 0;

  const digits = value.replace(/\D/g, "");
  if (!digits) return 0;

  return Number.parseInt(digits, 10) / 10000;
};

/**
 * Serializa um valor numérico como string decimal com exatamente 4 casas (ex.: "10.1200").
 */
export const toApiDecimalString4 = (value: number): string => value.toFixed(4);

/**
 * Converte valor decimal da API/form (`number | string`) para `number`.
 * Strings inválidas / vazias retornam 0.
 */
export const toNumericDecimal = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Verifica se um valor monetário pt-BR possui exatamente 4 casas decimais.
 * Rejeita precisão menor (10,12 / 10) ou maior (1,23456).
 * Deve ser usado com a string mascarada do input (números perdem zeros à direita).
 */
export const hasExactlyFourDecimalPlaces = (value: string): boolean => {
  if (value === undefined || value === null || value === "") return false;

  const trimmed = value.trim();
  if (!trimmed) return false;

  const normalized = trimmed
    .replace(/R\$\s?/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const [, fraction = ""] = normalized.split(".");
  if (!fraction) return false;
  return fraction.length === 4;
};
