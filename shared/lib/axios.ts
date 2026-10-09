/**
 * Axios Instance Configuration
 * Configured for cookie-based authentication
 *
 * O backend usa HTTP-only cookies para autenticação.
 * O navegador envia automaticamente os cookies em cada requisição.
 */

import { getBaseURL } from "@/shared/utils/env";
import axios, { type AxiosError } from "axios";

// Create axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  // IMPORTANTE: Permite envio automático de cookies nas requisições
  withCredentials: true,
});

/**
 * Request Interceptor
 * Logs requests in development
 */
api.interceptors.request.use(
  (config) => {
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 * Handles errors and logs responses
 */
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.status,
      );
    }

    return response;
  },
  async (error: AxiosError) => {
    // Errors are handled by TanStack Query and shown in UI
    // No need to log expected errors like login failures

    // Handle 401 Unauthorized - Session expired
    if (error.response?.status === 401) {
      console.warn("[API] Unauthorized - session expired, redirecting to login");

      // Redirecionar para login apenas se não estiver já na página de login
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error("[API] Access forbidden - insufficient permissions");
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error("[API] Resource not found");
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error("[API] Internal server error");
    }

    return Promise.reject(error);
  },
);

export default api;
