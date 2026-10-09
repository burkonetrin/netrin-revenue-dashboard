"use client";

import { useCallback, useRef, useState } from "react";
import {
  addProviderCreditDeposit,
  removeProviderCreditDeposit,
  updateProviderInvoiceCompetence,
} from "../services/providerInvoices.service";
import type {
  ProviderInvoiceResponse,
  UpdateProviderInvoiceCompetenceRequest,
} from "../types/providerInvoices.types";
import {
  type NormalizedPrepaidCompetenceDraft,
  type PrepaidDepositPersistencePlan,
  buildPrepaidDepositPersistencePlan,
} from "../utils/providerPrepaidCompetence.utils";

export interface PrepaidCompetenceSubmissionInput {
  invoiceId: string;
  payload: Omit<UpdateProviderInvoiceCompetenceRequest, "creditDeposits">;
  draft: Pick<
    NormalizedPrepaidCompetenceDraft,
    "creditDeposits" | "isMonthClosed" | "endingBalance"
  >;
  persistedDepositIds: string[];
}

export type PrepaidCompetenceSubmissionStatus =
  | "idle"
  | "submitting"
  | "removing-deposit"
  | "adding-deposit"
  | "closing"
  | "success"
  | "error";

export type PrepaidCompetenceSubmissionOutcome =
  | { status: "success"; data: ProviderInvoiceResponse }
  | { status: "error"; error: unknown }
  | { status: "invalid"; error: Error }
  | { status: "duplicate" };

interface SubmissionCheckpoint {
  plan: Extract<PrepaidDepositPersistencePlan, { status: "valid" }>;
  patchCompleted: boolean;
  deletionCompleted: boolean;
  completedNewDeposits: number;
  closingCompleted: boolean;
}

function invalidOutcome(message: string): { status: "invalid"; error: Error } {
  return { status: "invalid", error: new Error(message) };
}

/** Persists an open prepaid competence without replaying confirmed operations on retry. */
export function usePrepaidCompetenceSubmission(providerId?: string) {
  const [status, setStatus] = useState<PrepaidCompetenceSubmissionStatus>("idle");
  const [error, setError] = useState<unknown>(null);
  const submittingRef = useRef(false);
  const lastInputRef = useRef<PrepaidCompetenceSubmissionInput | null>(null);
  const checkpointRef = useRef<SubmissionCheckpoint | null>(null);

  const submit = useCallback(
    async (
      input?: PrepaidCompetenceSubmissionInput,
    ): Promise<PrepaidCompetenceSubmissionOutcome> => {
      if (submittingRef.current) return { status: "duplicate" };

      const currentInput = input ?? lastInputRef.current;
      if (!providerId || !currentInput) {
        const outcome = invalidOutcome("Dados da competência incompletos");
        setStatus("error");
        setError(outcome.error);
        return outcome;
      }

      if (input && input !== lastInputRef.current) {
        const plan = buildPrepaidDepositPersistencePlan(input.draft, input.persistedDepositIds);
        if (plan.status === "invalid") {
          const outcome = invalidOutcome("Não foi possível persistir os depósitos informados");
          setStatus("error");
          setError(outcome.error);
          return outcome;
        }

        lastInputRef.current = input;
        checkpointRef.current = {
          plan,
          patchCompleted: false,
          deletionCompleted: false,
          completedNewDeposits: 0,
          closingCompleted: false,
        };
      }

      const checkpoint = checkpointRef.current;
      if (!checkpoint) {
        const outcome = invalidOutcome("Não foi possível preparar a edição da competência");
        setStatus("error");
        setError(outcome.error);
        return outcome;
      }

      submittingRef.current = true;
      setError(null);

      try {
        let latestResponse: ProviderInvoiceResponse | null = null;

        if (!checkpoint.patchCompleted) {
          setStatus("submitting");
          latestResponse = await updateProviderInvoiceCompetence(providerId, currentInput.invoiceId, {
            ...currentInput.payload,
            creditDeposits: checkpoint.plan.persistedDeposits,
          });
          checkpoint.patchCompleted = true;
        }

        if (checkpoint.plan.deletedDepositId && !checkpoint.deletionCompleted) {
          setStatus("removing-deposit");
          latestResponse = await removeProviderCreditDeposit(
            providerId,
            currentInput.invoiceId,
            checkpoint.plan.deletedDepositId,
          );
          checkpoint.deletionCompleted = true;
        }

        while (checkpoint.completedNewDeposits < checkpoint.plan.newDepositCommands.length) {
          setStatus("adding-deposit");
          latestResponse = await addProviderCreditDeposit(
            providerId,
            currentInput.invoiceId,
            checkpoint.plan.newDepositCommands[checkpoint.completedNewDeposits],
          );
          checkpoint.completedNewDeposits += 1;
        }

        if (checkpoint.plan.closingCommand && !checkpoint.closingCompleted) {
          setStatus("closing");
          latestResponse = await addProviderCreditDeposit(
            providerId,
            currentInput.invoiceId,
            checkpoint.plan.closingCommand,
          );
          checkpoint.closingCompleted = true;
        }

        submittingRef.current = false;
        setStatus("success");
        setError(null);
        lastInputRef.current = null;
        checkpointRef.current = null;
        return { status: "success", data: latestResponse as ProviderInvoiceResponse };
      } catch (submissionError) {
        submittingRef.current = false;
        setStatus("error");
        setError(submissionError);
        return { status: "error", error: submissionError };
      }
    },
    [providerId],
  );

  const retry = useCallback(() => submit(), [submit]);

  return {
    status,
    error,
    isSubmitting: submittingRef.current || ["submitting", "removing-deposit", "adding-deposit", "closing"].includes(status),
    submit,
    retry,
  };
}
