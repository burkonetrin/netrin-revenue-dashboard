/**
 * Endpoints centralizados da API Nucleus.
 *
 * Uso: `import { API_ENDPOINTS } from '@/shared/endpoints'`
 */

export { AUTH_ENDPOINTS } from "./auth";
export { BACKGROUND_CHECK_TEMPLATES_ENDPOINTS } from "./background-check-templates.endpoints";
export { BANK_VALIDATION_ENDPOINTS } from "./bank-validation";
export { USERS_ENDPOINTS } from "./users";
export { CLIENTS_ENDPOINTS } from "./clients";
export { CONTRACTS_ENDPOINTS } from "./contracts";
export { PROVIDERS_ENDPOINTS } from "./providers";
export { RBAC_ENDPOINTS } from "./rbac.endpoints";
export { PRODUCTS_ENDPOINTS } from "./products.endpoints";
export { RBAC_GROUPS_ENDPOINTS } from "./rbacGroups.endpoints";
export { DATA_SOURCES_ENDPOINTS } from "./data-sources";
export { DATA_SOURCE_BUNDLES_ENDPOINTS } from "./data-source-bundles";
export { DEDUCTIBLE_ENDPOINTS } from "./deductible";
export { BILLING_ENDPOINTS } from "./billing";
export { TAGS_ENDPOINTS } from "./tags";

// Exportação centralizada
import { AUTH_ENDPOINTS } from "./auth";
import { BACKGROUND_CHECK_TEMPLATES_ENDPOINTS } from "./background-check-templates.endpoints";
import { BANK_VALIDATION_ENDPOINTS } from "./bank-validation";
import { BILLING_ENDPOINTS } from "./billing";
import { CLIENTS_ENDPOINTS } from "./clients";
import { CONTRACTS_ENDPOINTS } from "./contracts";
import { DATA_SOURCE_BUNDLES_ENDPOINTS } from "./data-source-bundles";
import { DATA_SOURCES_ENDPOINTS } from "./data-sources";
import { DEDUCTIBLE_ENDPOINTS } from "./deductible";
import { PRODUCTS_ENDPOINTS } from "./products.endpoints";
import { PROVIDERS_ENDPOINTS } from "./providers";
import { RBAC_ENDPOINTS } from "./rbac.endpoints";
import { RBAC_GROUPS_ENDPOINTS } from "./rbacGroups.endpoints";
import { TAGS_ENDPOINTS } from "./tags";
import { USERS_ENDPOINTS } from "./users";

/**
 * Mapa agregado de endpoints por domínio (auth, clientes, billing, etc.).
 */
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  BACKGROUND_CHECK_TEMPLATES: BACKGROUND_CHECK_TEMPLATES_ENDPOINTS,
  BANK_VALIDATION: BANK_VALIDATION_ENDPOINTS,
  USERS: USERS_ENDPOINTS,
  CLIENTS: CLIENTS_ENDPOINTS,
  CONTRACTS: CONTRACTS_ENDPOINTS,
  PROVIDERS: PROVIDERS_ENDPOINTS,
  RBAC: RBAC_ENDPOINTS,
  PRODUCTS: PRODUCTS_ENDPOINTS,
  RBAC_GROUPS: RBAC_GROUPS_ENDPOINTS,
  DATA_SOURCES: DATA_SOURCES_ENDPOINTS,
  DATA_SOURCE_BUNDLES: DATA_SOURCE_BUNDLES_ENDPOINTS,
  DEDUCTIBLE: DEDUCTIBLE_ENDPOINTS,
  BILLING: BILLING_ENDPOINTS,
  TAGS: TAGS_ENDPOINTS,
} as const;

export default API_ENDPOINTS;
