import type { DeductibleProduct, DeductibleProductInput } from "../types/deductibles.types";
import {
  FRANCHISE_COMBO_MEMBER_PRODUCT_IDS,
  FRANCHISE_COMBO_PRODUCT_ID,
  isFranchiseComboAnchor,
} from "./franchiseBasicProductSelection.utils";

const SELLABLE_BY_NAME: Record<
  string,
  { productId: string; serviceTypeId: string; serviceTypeName: string }
> = {
  "background check": {
    productId: "prod-bgc",
    serviceTypeId: "st-bgc-1",
    serviceTypeName: "Padrão",
  },
  bgc: {
    productId: "prod-bgc",
    serviceTypeId: "st-bgc-1",
    serviceTypeName: "Padrão",
  },
  "id validation": {
    productId: "prod-idv",
    serviceTypeId: "st-idv-web",
    serviceTypeName: "Web",
  },
  idv: {
    productId: "prod-idv",
    serviceTypeId: "st-idv-web",
    serviceTypeName: "Web",
  },
  "consulta netrin": {
    productId: "prod-nucleus",
    serviceTypeId: "st-nuc-1",
    serviceTypeName: "Consulta",
  },
  api: {
    productId: "prod-api",
    serviceTypeId: "st-api-1",
    serviceTypeName: "API",
  },
  audicon: {
    productId: "prod-audicon",
    serviceTypeId: "st-audicon-1",
    serviceTypeName: "Audicon",
  },
  enriquecimento: {
    productId: "prod-enrichment",
    serviceTypeId: "st-enrichment-1",
    serviceTypeName: "Enriquecimento",
  },
  workflow: {
    productId: "prod-nucleus",
    serviceTypeId: "st-nuc-1",
    serviceTypeName: "Consulta",
  },
  monitoramento: {
    productId: "prod-nucleus",
    serviceTypeId: "st-nuc-1",
    serviceTypeName: "Consulta",
  },
};

const KNOWN_PRODUCT_IDS = new Set([
  "prod-bgc",
  "prod-idv",
  "prod-nucleus",
  "prod-api",
  "prod-audicon",
  "prod-enrichment",
  FRANCHISE_COMBO_PRODUCT_ID,
  ...Object.values(FRANCHISE_COMBO_MEMBER_PRODUCT_IDS),
]);

function normalizeProductKey(label: string): string {
  return label.trim().toLowerCase();
}

function lookupSellableByName(name: string) {
  const key = normalizeProductKey(name);
  return SELLABLE_BY_NAME[key];
}

/** Converte o nome do produto mock em produto vendável do catálogo do protótipo. */
export function mapMockFranchiseProductToDeductibleProduct(productLabel: string): DeductibleProduct {
  const catalog = lookupSellableByName(productLabel);
  const productId = catalog?.productId ?? "prod-nucleus";
  const serviceTypeName = catalog?.serviceTypeName ?? "Consulta";
  const serviceTypeId = catalog?.serviceTypeId ?? "st-nuc-1";

  return {
    id: productId,
    name: productLabel.trim() || "Consulta Netrin",
    internalName: productLabel.replace(/\s+/g, "_").toUpperCase(),
    serviceTypeId,
    serviceType: {
      id: serviceTypeId,
      name: serviceTypeName,
      internalName: serviceTypeName.toUpperCase(),
    },
  };
}

function resolveCatalogProductId(product: DeductibleProduct): string {
  if (KNOWN_PRODUCT_IDS.has(product.id)) {
    return product.id;
  }
  const byName = lookupSellableByName(product.name);
  if (byName) return byName.productId;
  return product.id;
}

function resolveCatalogServiceTypeId(product: DeductibleProduct, productId: string): string {
  const fromProduct =
    product.serviceType?.id ??
    product.service_type?.id ??
    product.serviceTypeId ??
    product.service_type_id;
  if (fromProduct) return fromProduct;

  const byName = lookupSellableByName(product.name);
  if (byName && byName.productId === productId) return byName.serviceTypeId;

  if (productId === "prod-bgc") return "st-bgc-1";
  if (productId === "prod-idv") return "st-idv-web";
  if (productId === "prod-api") return "st-api-1";
  if (productId === "prod-audicon") return "st-audicon-1";
  if (productId === "prod-enrichment") return "st-enrichment-1";
  return "st-nuc-1";
}

/** Normaliza produtos da API/mock para ids do catálogo vendável (drawer de edição). */
export function normalizeDeductibleProductInputs(
  products?: DeductibleProduct[],
): DeductibleProductInput[] {
  if (!products?.length) return [];

  const memberRows = products.filter((product) =>
    Object.values(FRANCHISE_COMBO_MEMBER_PRODUCT_IDS).includes(product.id),
  );
  const hasComboMembers = memberRows.length >= 2;

  if (hasComboMembers) {
    const normalizedMembers = memberRows.map((product) => {
      const productId = resolveCatalogProductId(product);
      return {
        productId,
        serviceTypeId: resolveCatalogServiceTypeId(product, productId),
      };
    });
    return [{ productId: FRANCHISE_COMBO_PRODUCT_ID, serviceTypeId: "" }, ...normalizedMembers];
  }

  if (products.length === 1) {
    const product = products[0];
    const productId = resolveCatalogProductId(product);
    if (isFranchiseComboAnchor(productId)) {
      return [];
    }
    return [
      {
        productId,
        serviceTypeId: resolveCatalogServiceTypeId(product, productId),
      },
    ];
  }

  return products.map((product) => {
    const productId = resolveCatalogProductId(product);
    return {
      productId,
      serviceTypeId: resolveCatalogServiceTypeId(product, productId),
    };
  });
}