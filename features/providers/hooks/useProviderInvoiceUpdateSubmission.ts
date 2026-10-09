"use client";

import { useCallback, useRef, useState } from "react";
import { updateProviderInvoice } from "../services/providerInvoices.service";
import type {
  ProviderInvoiceResponse,
  UpdateProviderInvoiceRequest,
} from "../types/providerInvoices.types";
import { resolveProviderInvoiceFileUrl } from "../utils/providerInvoiceUpload.utils";

/** Dados necessários para atualizar uma fatura de fornecedor existente. */
export interface ProviderInvoiceUpdateSubmissionInput {
  invoiceId: string;
  payload: UpdateProviderInvoiceRequest;
  invoiceFile?: File | null;
}

/** Estado observável do ciclo de atualização da fatura. */
export type ProviderInvoiceUpdateSubmissionStatus =
  | "idle"
  | "uploading"
  | "submitting"
  | "success"
  | "error";

/** Resultado de uma tentativa de atualização, sem lançar erros de validação conhecidos. */
export type ProviderInvoiceUpdateSubmissionOutcome =
  | { status: "success"; data: ProviderInvoiceResponse }
  | { status: "error"; error: unknown }
  | { status: "invalid"; error: Error }
  | { status: "duplicate" };

/** Updates an open postpaid invoice while preserving the draft for a safe retry. */
export function useProviderInvoiceUpdateSubmission(providerId?: string) {
  const [status, setStatus] = useState<ProviderInvoiceUpdateSubmissionStatus>("idle");
  const [error, setError] = useState<unknown>(null);
  const submittingRef = useRef(false);
  const lastInputRef = useRef<ProviderInvoiceUpdateSubmissionInput | null>(null);
  const uploadedFileRef = useRef<File | null>(null);
  const uploadedFileUrlRef = useRef<string | null>(null);

  const submit = useCallback(
    async (
      input?: ProviderInvoiceUpdateSubmissionInput,
    ): Promise<ProviderInvoiceUpdateSubmissionOutcome> => {
      if (submittingRef.current) return { status: "duplicate" };

      const currentInput = input ?? lastInputRef.current;
      if (!providerId || !currentInput?.invoiceId) {
        const invalidError = new Error("Dados da fatura incompletos");
        setStatus("error");
        setError(invalidError);
        return { status: "invalid", error: invalidError };
      }

      lastInputRef.current = currentInput;
      submittingRef.current = true;
      setError(null);

      try {
        const invoiceFile = currentInput.invoiceFile ?? null;
        const invoiceFileUrl = await resolveProviderInvoiceFileUrl({
          providerId,
          competenceMonth: currentInput.payload.competenceMonth,
          invoiceFile,
          invoiceFileUrl: currentInput.payload.invoiceFileUrl ?? null,
          cache: { file: uploadedFileRef.current, invoiceFileUrl: uploadedFileUrlRef.current },
          onUploadStart: () => setStatus("uploading"),
        });
        if (invoiceFile) {
          uploadedFileRef.current = invoiceFile;
          uploadedFileUrlRef.current = invoiceFileUrl;
        }

        setStatus("submitting");
        const payload = invoiceFile
          ? { ...currentInput.payload, invoiceFileUrl }
          : currentInput.payload;
        const updatedInvoice = await updateProviderInvoice(
          providerId,
          currentInput.invoiceId,
          payload,
        );

        submittingRef.current = false;
        setStatus("success");
        setError(null);
        lastInputRef.current = null;
        uploadedFileRef.current = null;
        uploadedFileUrlRef.current = null;
        return { status: "success", data: updatedInvoice };
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
    isSubmitting: submittingRef.current || status === "uploading" || status === "submitting",
    submit,
    retry,
  };
}
