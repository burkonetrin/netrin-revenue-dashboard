import { BACKGROUND_CHECK_TEMPLATE_PERMISSIONS } from "@/features/background-check-templates/constants/backgroundCheckTemplatePermissions.constants";

/** Permissões de produtos — protótipo libera tudo via usePermission. */
export const PRODUCTS_PERMISSIONS = {
  access: "products",
  listBackgroundCheckTemplates: "products.listBackgroundCheckTemplates",
  createProduct: "products.createProduct",
  updateProduct: "products.updateProduct",
  deleteProduct: "products.deleteProduct",
} as const;

export type ProductsPermission = (typeof PRODUCTS_PERMISSIONS)[keyof typeof PRODUCTS_PERMISSIONS];

export function canListProductBackgroundCheckTemplates(
  can: (permission: string) => boolean,
): boolean {
  return (
    can(PRODUCTS_PERMISSIONS.listBackgroundCheckTemplates) ||
    can(BACKGROUND_CHECK_TEMPLATE_PERMISSIONS.access)
  );
}
