import type { ClientHealth } from "../types";

export function healthFromConsumption(consumptionPct: number): ClientHealth {
  if (consumptionPct <= 50) return "risco_alto";
  if (consumptionPct <= 90) return "risco_medio";
  if (consumptionPct <= 100) return "sucesso";
  return "oportunidade";
}
