import { getBaseURL } from "@/shared/utils/env";

const BASE_URL = getBaseURL();

/**
 * Endpoints da API de autenticação e sessão do usuário.
 */
export const AUTH_ENDPOINTS = {
  /**
   * POST /v1/login
   * Login de usuário
   *
   * Request Body:
   * {
   *   ipAddress: string;
   *   userAgent: string;
   *   location: string;
   *   origin: string;
   *   emailOrUsername: string;
   *   password: string;
   * }
   *
   * Response:
   * {
   *   access_token: string;
   *   refresh_token: string;
   *   fixed_token: string;
   *   username: string;
   *   request_2fa: boolean;
   *   is_active: boolean;
   *   user_info: {
   *     user_id_postgres: number;
   *     user_name: string;
   *     user_email: string;
   *     client_name: string;
   *     client_tenant_id: string;
   *     client_mongo_id: string[];
   *   }
   * }
   */
  LOGIN: `${BASE_URL}v1/login`,

  /**
   * POST /v1/logout
   * Logout de usuário
   */
  LOGOUT: `${BASE_URL}v1/logout`,

  /**
   * POST /v1/refresh
   * Renovar access token usando refresh token
   */
  REFRESH: `${BASE_URL}v1/refresh`,

  /**
   * POST /v1/forgot-password
   * Solicitar recuperação de senha
   */
  FORGOT_PASSWORD: `${BASE_URL}v1/forgot-password`,

  /**
   * POST /v1/reset-password
   * Redefinir senha com token
   */
  RESET_PASSWORD: `${BASE_URL}v1/reset-password`,

  /**
   * POST /v1/verify-2fa
   * Verificar código 2FA
   */
  VERIFY_2FA: `${BASE_URL}v1/verify-2fa`,

  /**
   * GET /v1/me
   * Obter dados do usuário logado
   */
  ME: `${BASE_URL}v1/me`,
} as const;

export default AUTH_ENDPOINTS;
