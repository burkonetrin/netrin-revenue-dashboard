"use client";

import { addToast } from "@heroui/react";
import { create } from "zustand";
import {
  listAllBillingMockListRecords,
  type BillingRecordSource,
} from "../mock/billingMockStore";
import type { BillingFilters } from "../types/billing.types";
import type {
  BillingInvoiceStatusKey,
  BillingInvoiceStatusState,
} from "../types/billing-invoice-status.types";
import { buildBillingRecordKey } from "../utils/billing-invoice-status.utils";
import { billingStatusShowcaseSeed } from "../mock/billingMockStatusShowcase";

type StatusMap = Record<string, BillingInvoiceStatusState>;

const SEED_STATUS: StatusMap = {
  "invoice:bill-001": { status: "fatura_aberta" },
  "entry:bill-005": { status: "fatura_aberta" },
  ...billingStatusShowcaseSeed,
};

function cloneSeed(): StatusMap {
  return structuredClone(SEED_STATUS);
}

interface BillingInvoiceStatusStore {
  byKey: StatusMap;
  getState: (source: BillingRecordSource, id: string) => BillingInvoiceStatusState;
  setClosed: (source: BillingRecordSource, id: string, closed: boolean) => void;
  closeMany: (keys: string[]) => void;
  billClient: (source: BillingRecordSource, id: string) => void;
  billClientsClosedInCompetence: (competence: string) => { billed: number };
  reset: () => void;
}

export const useBillingInvoiceStatusStore = create<BillingInvoiceStatusStore>((set, get) => ({
  byKey: cloneSeed(),

  reset: () => set({ byKey: cloneSeed() }),

  getState: (source, id) => {
    const key = `${source}:${id}`;
    return get().byKey[key] ?? { status: "fatura_aberta" };
  },

  setClosed: (source, id, closed) => {
    const key = `${source}:${id}`;
    const current = get().getState(source, id);
    if (current.closeCheckboxLocked) return;

    const nextStatus: BillingInvoiceStatusKey = closed ? "fatura_fechada" : "fatura_aberta";
    if (current.status !== "fatura_aberta" && current.status !== "fatura_fechada") {
      return;
    }

    set((state) => ({
      byKey: {
        ...state.byKey,
        [key]: { ...current, status: nextStatus },
      },
    }));

    addToast({
      title: closed ? "Fatura fechada" : "Fatura reaberta",
      color: "success",
      timeout: 3000,
      shouldShowTimeoutProgress: true,
    });
  },

  closeMany: (keys) => {
    set((state) => {
      const next = { ...state.byKey };
      for (const key of keys) {
        const current = next[key] ?? { status: "fatura_aberta" as const };
        if (current.status !== "fatura_aberta") continue;
        next[key] = { ...current, status: "fatura_fechada" };
      }
      return { byKey: next };
    });

    addToast({
      title: "Faturas fechadas com sucesso",
      color: "success",
      timeout: 3000,
      shouldShowTimeoutProgress: true,
    });
  },

  billClient: (source, id) => {
    const key = `${source}:${id}`;
    set((state) => ({
      byKey: {
        ...state.byKey,
        [key]: {
          status: "faturado",
          closeCheckboxLocked: true,
        },
      },
    }));

    addToast({
      title: "Faturamento solicitado no Sankhya",
      color: "success",
      timeout: 3000,
      shouldShowTimeoutProgress: true,
    });
  },

  billClientsClosedInCompetence: (competence: string) => {
    const records = listAllBillingMockListRecords({ startMonth: competence, endMonth: competence });
    let billed = 0;

    set((state) => {
      const next = { ...state.byKey };
      for (const record of records) {
        const key = buildBillingRecordKey(record);
        const current = next[key] ?? { status: "fatura_aberta" as const };
        if (current.status !== "fatura_fechada") {
          continue;
        }
        next[key] = { status: "faturado", closeCheckboxLocked: true };
        billed += 1;
      }
      return { byKey: next };
    });

    if (billed > 0) {
      addToast({
        title: "Faturamento em lote solicitado no Sankhya",
        color: "success",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
    }

    return { billed };
  },
}));

export function getBillingStatusForRecord(
  record: Parameters<typeof buildBillingRecordKey>[0],
): BillingInvoiceStatusState {
  return useBillingInvoiceStatusStore.getState().getState(record.source ?? "invoice", record.id);
}

export function listCloseEligibleKeysForFilters(filters: BillingFilters): string[] {
  const rows = listAllBillingMockListRecords(filters);
  const store = useBillingInvoiceStatusStore.getState();
  return rows
    .filter((row) => store.getState(row.source ?? "invoice", row.id).status === "fatura_aberta")
    .map((row) => buildBillingRecordKey(row));
}
