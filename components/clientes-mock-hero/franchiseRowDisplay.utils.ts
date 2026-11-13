import type { MockFranchise } from "@/clientesDashboardMockData";

/** Indica se o produto da franquia é Background Check. */
export function isBackgroundCheckProduct(product: string): boolean {
  return product.trim().toLowerCase() === "background check";
}

/** Retorna o nome do modelo BGC para exibir abaixo do nome da franquia, se aplicável. */
export function franchiseBackgroundCheckModelSubline(
  franchise: MockFranchise,
): string | null {
  if (!isBackgroundCheckProduct(franchise.product)) {
    return null;
  }
  const name = franchise.backgroundCheckTemplateName?.trim();
  return name || null;
}
