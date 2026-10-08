"use client";

import { addToast } from "@heroui/react";
import { create } from "zustand";
import { CLIENTS } from "@/clientesDashboardMockData";
import type {
  BillingInvoiceStatusKey,
  BillingInvoiceStatusState,
} from "@/features/billing/types/billing-invoice-status.types";
import {
  isBillingCloseEligible,
  isBillingBillClientEligible,
} from "@/features/billing/utils/billing-invoice-status.utils";

type StatusMap = Record<string, BillingInvoiceStatusState>;

function seedStatusForClient(clientId: string): BillingInvoiceStatusState {
  const client = CLIENTS.find((row) => row.id === clientId);
  if (client?.faturaStatus === "aberta") {
    return { status: "fatura_aberta" };
  }
  if (client?.faturaStatus === "fatura_fechada") {
    return { status: "fatura_fechada" };
  }
  return { status: "faturado", closeCheckboxLocked: true };
}

interface ClientListInvoiceStatusStore {
  byClientId: StatusMap;
  revision: number;
  getState: (clientId: string) => BillingInvoiceStatusState;
  setClosed: (clientId: string, closed: boolean) => void;
  closeMany: (clientIds: string[]) => void;
  billClient: (clientId: string) => void;
}

export const useClientListInvoiceStatusStore = create<ClientListInvoiceStatusStore>((set, get) => ({
  byClientId: {},
  revision: 0,

  getState: (clientId) => {
    return get().byClientId[clientId] ?? seedStatusForClient(clientId);
  },

  setClosed: (clientId, closed) => {
    const current = get().getState(clientId);
    if (current.closeCheckboxLocked) return;
    if (current.status !== "fatura_aberta" && current.status !== "fatura_fechada") {
      return;
    }

    const nextStatus: BillingInvoiceStatusKey = closed ? "fatura_fechada" : "fatura_aberta";

    set((state) => ({
      byClientId: {
        ...state.byClientId,
        [clientId]: { ...current, status: nextStatus },
      },
      revision: state.revision + 1,
    }));

    addToast({
      title: closed ? "Fatura fechada" : "Fatura reaberta",
      color: "success",
      timeout: 3000,
      shouldShowTimeoutProgress: true,
    });
  },

  closeMany: (clientIds) => {
    set((state) => {
      const next = { ...state.byClientId };
      for (const clientId of clientIds) {
        const current = get().getState(clientId);
        if (!isBillingCloseEligible(current.status)) continue;
        next[clientId] = { ...current, status: "fatura_fechada" };
      }
      return { byClientId: next, revision: state.revision + 1 };
    });

    addToast({
      title: "Faturas fechadas com sucesso",
      color: "success",
      timeout: 3000,
      shouldShowTimeoutProgress: true,
    });
  },

  billClient: (clientId) => {
    const current = get().getState(clientId);
    if (!isBillingBillClientEligible(current.status)) return;

    set((state) => ({
      byClientId: {
        ...state.byClientId,
        [clientId]: {
          status: "faturado",
          closeCheckboxLocked: true,
        },
      },
      revision: state.revision + 1,
    }));

    addToast({
      title: "Faturamento solicitado no Sankhya",
      color: "success",
      timeout: 3000,
      shouldShowTimeoutProgress: true,
    });
  },
}));

export function isClientListCloseEligible(clientId: string): boolean {
  const state = useClientListInvoiceStatusStore.getState().getState(clientId);
  return isBillingCloseEligible(state.status);
}

export function isClientListCloseToggleEligible(clientId: string): boolean {
  const state = useClientListInvoiceStatusStore.getState().getState(clientId);
  return (
    !state.closeCheckboxLocked &&
    (state.status === "fatura_aberta" || state.status === "fatura_fechada")
  );
}

export function isClientListBillEligible(clientId: string): boolean {
  const state = useClientListInvoiceStatusStore.getState().getState(clientId);
  return isBillingBillClientEligible(state.status);
}
