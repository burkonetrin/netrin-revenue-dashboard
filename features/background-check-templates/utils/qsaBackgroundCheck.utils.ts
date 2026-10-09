/**
 * Regras puras da flag hasQsaBackgroundCheck no modelo BGC.
 * Elegibilidade = internalName fixo da fonte QSA Completo (estável entre ambientes).
 */

/** internalName estável da fonte "Receita Federal CNPJ QSA Completo". */
export const QSA_COMPLETO_INTERNAL_NAME = "SituacaoCadastralPessoaJuridicaQSACompleto";

type WithQsaIdentity = {
  internalName?: string;
  hasQsaBackgroundCheck?: boolean;
};

/**
 * Indica se a fonte é a QSA Completo elegível para o checkbox de BGC dos sócios.
 */
export function isQsaEligibleDataSource(source: { internalName?: string }): boolean {
  return source.internalName === QSA_COMPLETO_INTERNAL_NAME;
}

/**
 * Normaliza o valor da flag: unset/false → false; true → true.
 */
export function normalizeQsaBackgroundCheckValue(value: boolean | undefined): boolean {
  return value === true;
}

/**
 * Resolve a flag após mudança de seleção: sem fonte elegível selecionada → sempre false.
 */
export function resolveQsaBackgroundCheckForSelection(
  isEligibleSourceSelected: boolean,
  checkboxChecked: boolean,
): boolean {
  if (!isEligibleSourceSelected) return false;
  return checkboxChecked === true;
}

/**
 * Hidrata a flag a partir das fontes vinculadas ao template (GET).
 * Prefere internalName QSA Completo; fallback no campo hasQsaBackgroundCheck do vínculo.
 */
export function hydrateQsaBackgroundCheckFromLinkedSources(
  linkedSources: WithQsaIdentity[],
): boolean {
  const eligible =
    linkedSources.find(isQsaEligibleDataSource) ??
    linkedSources.find((source) =>
      Object.prototype.hasOwnProperty.call(source, "hasQsaBackgroundCheck"),
    );

  if (!eligible) return false;
  return normalizeQsaBackgroundCheckValue(eligible.hasQsaBackgroundCheck);
}

/**
 * Monta o body de assign só com dataSourceIds (flag QSA vai no PUT do template).
 */
export function buildAssignTemplateDataSourcesPayload(dataSourceIds: string[]): {
  dataSourceIds: string[];
} {
  return { dataSourceIds };
}

/**
 * Lê a flag QSA do recurso template (camelCase ou snake_case).
 */
export function getTemplateHasQsaBackgroundCheck(template: {
  hasQsaBackgroundCheck?: boolean;
  has_qsa_background_check?: boolean;
}): boolean {
  return normalizeQsaBackgroundCheckValue(
    template.hasQsaBackgroundCheck ?? template.has_qsa_background_check,
  );
}

/**
 * Retorna a fonte QSA Completo da lista, se existir.
 */
export function findEligibleQsaSource<T extends { internalName?: string }>(
  sources: T[],
): T | undefined {
  return sources.find(isQsaEligibleDataSource);
}
