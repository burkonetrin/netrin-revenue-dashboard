/** Retorna a última parte do nome interno (após o último ponto). */
export function getLastPartOfInternalName(internalName: string): string {
  const parts = internalName.split(".");
  return parts[parts.length - 1] || internalName;
}
