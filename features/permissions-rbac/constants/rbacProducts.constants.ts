import type { Product } from "@/features/products/types/products.types";
import type { PermissionType } from "../types/permission.types";
import { PRODUCT_ID_MAPPING } from "../services/rbacPermissions.service";

/** ID do produto SafePartner no mapeamento RBAC. */
export const SAFE_PARTNER_PRODUCT_ID = PRODUCT_ID_MAPPING.SafePartner;

/** ID do produto Nucleus no mapeamento RBAC. */
export const NUCLEUS_PRODUCT_ID = PRODUCT_ID_MAPPING.Nucleus;

/** Rótulo exibido na UI para o produto SafePartner. */
export const SAFE_PARTNER_UI_LABEL = "Visualizar elementos da interface";

/**
 * Resolve o tipo de permissão RBAC a partir do ID do produto.
 *
 * @param productId - ID do produto
 * @returns Tipo de permissão (`SafePartner` ou `Nucleus`)
 */
export function getPermissionTypeForProductId(productId: string): PermissionType {
  return productId === SAFE_PARTNER_PRODUCT_ID ? "SafePartner" : "Nucleus";
}

/**
 * Remove o produto SafePartner da lista exibida na interface.
 *
 * @param products - Lista de produtos
 * @returns Produtos visíveis na tela de permissões
 */
export function filterVisibleProducts(products: Product[]): Product[] {
  return products.filter((product) => product.id !== SAFE_PARTNER_PRODUCT_ID);
}

/**
 * Retorna o nome de exibição do produto na tela RBAC.
 *
 * @param productId - ID do produto
 * @param productName - Nome original do produto
 * @returns Nome formatado para a UI
 */
export function getRBACProductDisplayName(
  productId: string,
  productName: string,
): string {
  return productId === SAFE_PARTNER_PRODUCT_ID ? SAFE_PARTNER_UI_LABEL : productName;
}

/**
 * Monta as opções de produto para o formulário de grupos RBAC.
 *
 * @param products - Lista de produtos disponíveis
 * @returns Opções ordenadas com SafePartner em primeiro lugar
 */
export function buildGroupFormProductOptions(
  products: Product[],
): Array<{ id: string; name: string }> {
  const mapped = products.map((product) => ({
    id: product.id,
    name: getRBACProductDisplayName(product.id, product.name),
  }));

  const safePartner = mapped.find((p) => p.id === SAFE_PARTNER_PRODUCT_ID);
  const others = mapped
    .filter((p) => p.id !== SAFE_PARTNER_PRODUCT_ID)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return safePartner ? [safePartner, ...others] : others;
}
