import { formatBlockedDocumentDisplay } from "../utils/blockedDocuments.utils";

const initialDocuments = ["123.456.789-09", "12.345.678/0001-90"];

let savedBlockedDocuments = [...initialDocuments];

/** Retorna a lista persistida de documentos bloqueados. */
export function getBlockedDocuments(): string[] {
  return savedBlockedDocuments.map((document) => formatBlockedDocumentDisplay(document));
}

/** Substitui a lista persistida de documentos bloqueados. */
export function setBlockedDocuments(documents: string[]): void {
  savedBlockedDocuments = documents.map((document) => formatBlockedDocumentDisplay(document));
}
