import type { DeductibleProduct, DeductibleProductInput } from "../types/deductibles.types";

export const FRANCHISE_COMBO_PRODUCT_ID = "franchise-combo-api-audicon-enrichment";

export const FRANCHISE_COMBO_PRODUCT_LABEL = "API / Audicon / Enriquecimento";

export const FRANCHISE_COMBO_CHECKBOX_LABELS = ["API", "Audicon", "Enriquecimento"] as const;

export type FranchiseComboCheckboxLabel = (typeof FRANCHISE_COMBO_CHECKBOX_LABELS)[number];

export const FRANCHISE_COMBO_MEMBER_PRODUCT_IDS: Record<FranchiseComboCheckboxLabel, string> = {
  API: "prod-api",
  Audicon: "prod-audicon",
  Enriquecimento: "prod-enrichment",
};

const COMBO_MEMBER_IDS = new Set(Object.values(FRANCHISE_COMBO_MEMBER_PRODUCT_IDS));

export function isFranchiseComboAnchor(productId: string): boolean {
  return productId === FRANCHISE_COMBO_PRODUCT_ID;
}

export function isFranchiseComboMode(productIds: DeductibleProductInput[]): boolean {
  return productIds.some((row) => isFranchiseComboAnchor(row.productId));
}

export function getFranchiseComboMemberRows(productIds: DeductibleProductInput[]): DeductibleProductInput[] {
  return productIds.filter((row) => !isFranchiseComboAnchor(row.productId));
}

export function isFranchiseComboProductSelection(productIds: DeductibleProductInput[]): boolean {
  if (isFranchiseComboMode(productIds)) {
    return getFranchiseComboMemberRows(productIds).length > 0;
  }
  return (
    productIds.length > 0 && productIds.every((row) => COMBO_MEMBER_IDS.has(row.productId))
  );
}

export function resolveFranchiseMainProductId(productIds: DeductibleProductInput[]): string {
  if (productIds.length === 0) return "";
  if (isFranchiseComboMode(productIds)) return FRANCHISE_COMBO_PRODUCT_ID;
  if (isFranchiseComboProductSelection(productIds)) return FRANCHISE_COMBO_PRODUCT_ID;
  return productIds[0]?.productId ?? "";
}

export function stripFranchiseComboAnchor(productIds: DeductibleProductInput[]): DeductibleProductInput[] {
  return productIds.filter((row) => !isFranchiseComboAnchor(row.productId));
}

export function isFranchiseBasicProductSelectionValid(
  productIds: DeductibleProductInput[],
  canListProducts: boolean,
): boolean {
  if (!canListProducts) return true;
  if (productIds.length === 0) return false;

  if (isFranchiseComboMode(productIds) || isFranchiseComboProductSelection(productIds)) {
    return getFranchiseComboMemberRows(productIds).length >= 1;
  }

  if (productIds.length !== 1) return false;
  return Boolean(productIds[0]?.serviceTypeId);
}

function resolveServiceTypeName(product: DeductibleProduct): string | undefined {
  return product.serviceType?.name ?? product.service_type?.name;
}

/** Texto de exibição do produto da franquia na aba Sobre. */
export function formatFranchiseProductsDisplay(products?: DeductibleProduct[]): string {
  if (!products?.length) return "-";

  const isComboBundle =
    products.length > 1 &&
    products.every(
      (product) =>
        COMBO_MEMBER_IDS.has(product.id) ||
        FRANCHISE_COMBO_CHECKBOX_LABELS.includes(product.name as FranchiseComboCheckboxLabel),
    );

  if (isComboBundle) {
    return products.map((product) => product.name).join(" · ");
  }

  return products
    .map((product) => {
      const serviceTypeName = resolveServiceTypeName(product);
      if (serviceTypeName && serviceTypeName !== product.name) {
        return `${product.name} — ${serviceTypeName}`;
      }
      return product.name;
    })
    .join(" · ");
}