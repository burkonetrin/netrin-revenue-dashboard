/**
 * Error Parser Utilities
 * Helpers para extrair mensagens de erro de forma reutilizável
 */

import type { AxiosError } from "axios";

/**
 * Formato de erro padrão do backend
 */
export interface ErrorResponse {
  message?: string;
  detail?: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

/**
 * Extrai mensagem de erro de login
 */
export function getLoginErrorMessage(
  error: AxiosError<ErrorResponse> | null,
): string {
  if (!error) return "";

  return (
    error.response?.data?.message ||
    error.response?.data?.detail ||
    "Erro ao fazer login. Tente novamente."
  );
}

/**
 * Extrai mensagem de erro genérica
 */
export function getErrorMessage(
  error: AxiosError<ErrorResponse> | null,
  defaultMessage = "Ocorreu um erro. Tente novamente.",
): string {
  if (!error) return "";

  return (
    error.response?.data?.message ||
    error.response?.data?.detail ||
    defaultMessage
  );
}

/**
 * Extrai erros por campo (para formulários)
 */
export function getFieldErrors(
  error: AxiosError<ErrorResponse> | null,
): Record<string, string> {
  if (!error?.response?.data?.errors) return {};

  const fieldErrors: Record<string, string> = {};

  error.response.data.errors.forEach((err) => {
    if (err.field) {
      fieldErrors[err.field] = err.message;
    }
  });

  return fieldErrors;
}
