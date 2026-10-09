"use client";

import { useCallback, useRef, useState } from "react";
import { createProviderInvoice } from "../services/providerInvoices.service";
import type {
  CreateProviderInvoiceRequest,
  ProviderInvoiceResponse,
} from "../types/providerInvoices.types";
import type { ProviderInvoiceFormValidation } from "../utils/providerInvoiceForm.utils";
import { resolveProviderInvoiceFileUrl } from "../utils/providerInvoiceUpload.utils";

/** Dados necessários para criar uma fatura de fornecedor. */
export interface ProviderInvoiceSubmissionInput {
  payload: CreateProviderInvoiceRequest;
  invoiceFile?: File | null;
}

/** Estado observável do ciclo de submissão da fatura. */
export type ProviderInvoiceSubmissionStatus =
  | "idle"
  | "uploading"
  | "submitting"
  | "success"
  | "error";

/** Resultado de uma tentativa de submissão, sem lançar erros de validação conhecidos. */
export type ProviderInvoiceSubmissionOutcome =
  | { status: "success"; data: ProviderInvoiceResponse }
  | { status: "error"; error: unknown }
  | { status: "invalid"; error: Error }
  | { status: "duplicate" };

/** Opções para validar os dados antes de iniciar o upload ou a criação. */
export interface UseProviderInvoiceSubmissionOptions {
  validate?: (input: ProviderInvoiceSubmissionInput) => boolean | ProviderInvoiceFormValidation;
}

function getSubmissionValidationError(
  input: ProviderInvoiceSubmissionInput,
  validate: UseProviderInvoiceSubmissionOptions["validate"],
): Error | null {
  if (!validate) return null;

  const validation = validate(input);
  const isValid = typeof validation === "boolean" ? validation : validation.valid;
  return isValid ? null : new Error("Corrija os campos obrigatórios da fatura");
}

function withUploadedInvoiceFileUrl(
  input: ProviderInvoiceSubmissionInput,
  invoiceFileUrl: string | null,
): CreateProviderInvoiceRequest {
  return input.invoiceFile ? { ...input.payload, invoiceFileUrl } : input.payload;
}

/** Cria uma fatura de fornecedor, preservando o rascunho para retry em caso de falha. */
export function useProviderInvoiceSubmission(
  providerId?: string,
  options: UseProviderInvoiceSubmissionOptions = {},
) {
  const [status, setStatus] = useState<ProviderInvoiceSubmissionStatus>("idle");
  const [error, setError] = useState<unknown>(null);
  const submittingRef = useRef(false);
  const lastInputRef = useRef<ProviderInvoiceSubmissionInput | null>(null);
  const uploadedFileRef = useRef<File | null>(null);
  const uploadedFileUrlRef = useRef<string | null>(null);

  const submit = useCallback(
    async (input?: ProviderInvoiceSubmissionInput): Promise<ProviderInvoiceSubmissionOutcome> => {
      if (submittingRef.current) return { status: "duplicate" };

      const currentInput = input ?? lastInputRef.current;
      if (!currentInput || !providerId) {
        const invalidError = new Error("Dados da fatura incompletos");
        setStatus("error");
        setError(invalidError);
        return { status: "invalid", error: invalidError };
      }

      const validationError = getSubmissionValidationError(currentInput, options.validate);
      if (validationError) {
        setStatus("error");
        setError(validationError);
        return { status: "invalid", error: validationError };
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
        const payload = withUploadedInvoiceFileUrl(currentInput, invoiceFileUrl);
        const createdInvoice = await createProviderInvoice(providerId, payload);

        submittingRef.current = false;
        setStatus("success");
        setError(null);
        lastInputRef.current = null;
        uploadedFileRef.current = null;
        uploadedFileUrlRef.current = null;
        return { status: "success", data: createdInvoice };
      } catch (submissionError) {
        submittingRef.current = false;
        setStatus("error");
        setError(submissionError);
        return { status: "error", error: submissionError };
      }
    },
    [options, providerId],
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
