import type { PriceRange } from "../types/deductibles.types";

/**
 * Retorna mínimo da primeira faixa de preço.
 * Contrato atual: a 1ª faixa sempre começa em 1 (inclusive modelos com fixedPrice).
 */
export function getFirstRangeMin(_hasFixedPrice: boolean, _includedConsultations: number): number {
  return 1;
}

/**
 * Calcula mínimo da próxima faixa após o máximo anterior (faixa fechada).
 */
export function getNextRangeMin(previousMax: number): number {
  return previousMax + 1;
}

/**
 * Cria faixa padrão aberta (última faixa: max ilimitado).
 */
export function createDefaultRange(min: number): PriceRange {
  return {
    minConsultations: min,
    maxConsultations: null,
    unitPrice: 0,
  };
}

/**
 * Fecha a última faixa aberta para permitir append de uma nova faixa ilimitada.
 */
export function closeLastRangeForAppend(ranges: PriceRange[]): PriceRange[] {
  if (ranges.length === 0) return [];

  const lastIndex = ranges.length - 1;
  const last = ranges[lastIndex];
  if (last.maxConsultations !== null && last.maxConsultations !== undefined) {
    return ranges.map((range) => ({ ...range }));
  }

  return ranges.map((range, index) =>
    index === lastIndex
      ? {
          ...range,
          maxConsultations: range.minConsultations + 1,
        }
      : { ...range },
  );
}

/**
 * Normaliza e encadeia faixas de preço.
 * Faixas intermediárias ficam fechadas; a última sempre com maxConsultations null.
 */
export function normalizePriceRanges(
  ranges: PriceRange[],
  hasFixedPrice: boolean,
  includedConsultations: number,
): PriceRange[] {
  if (ranges.length === 0) return [];

  const firstMin = getFirstRangeMin(hasFixedPrice, includedConsultations);
  const normalized: PriceRange[] = [];
  const lastIndex = ranges.length - 1;

  for (let i = 0; i < ranges.length; i += 1) {
    const source = ranges[i];
    const previousMax = i === 0 ? null : normalized[i - 1].maxConsultations;
    const min =
      i === 0
        ? firstMin
        : previousMax !== null && previousMax !== undefined
          ? getNextRangeMin(previousMax)
          : firstMin;
    const isLast = i === lastIndex;

    let max: number | null;
    if (isLast) {
      max = null;
    } else {
      const sourceMax = source.maxConsultations;
       max =
         sourceMax !== null && sourceMax !== undefined && sourceMax > min ? sourceMax : min + 1;
    }

    normalized.push({
      minConsultations: min,
      maxConsultations: max,
      unitPrice: source.unitPrice,
    });
  }

  return normalized;
}

/**
 * Recalcula faixas após alteração de máximo.
 */
export function recalculateRangesFromMaxChange(
  ranges: PriceRange[],
  _changedIndex: number,
  hasFixedPrice: boolean,
  includedConsultations: number,
): PriceRange[] {
  return normalizePriceRanges(ranges, hasFixedPrice, includedConsultations);
}

/**
 * Valida encadeamento das faixas de preço (última aberta, intermediárias fechadas).
 */
export function validateChainedPriceRanges(
  ranges: PriceRange[] | undefined,
  hasFixedPrice: boolean,
  includedConsultations: number,
): boolean {
  if (!ranges || ranges.length === 0) return false;

  if (hasFixedPrice && includedConsultations < 1) return false;

  const firstMin = getFirstRangeMin(hasFixedPrice, includedConsultations);

  for (let i = 0; i < ranges.length; i += 1) {
    const range = ranges[i];
    const isLast = i === ranges.length - 1;
    const previousMax = i === 0 ? null : ranges[i - 1].maxConsultations;

    if (i > 0 && (previousMax === null || previousMax === undefined)) return false;

    const expectedMin = i === 0 ? firstMin : getNextRangeMin(previousMax as number);

    if (range.minConsultations !== expectedMin) return false;

    if (isLast) {
      if (range.maxConsultations !== null) return false;
      continue;
    }

    if (range.maxConsultations === null || range.maxConsultations === undefined) return false;
    if (range.maxConsultations <= range.minConsultations) return false;
  }

  return true;
}
