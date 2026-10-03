/**
 * Helpers para disparar download de ZIP de comprovantes no browser.
 */

import type { BillingComprovantesSource } from "../types/billing-comprovantes.types";

/**
 * Extrai o filename de um header Content-Disposition (attachment).
 */
export function parseFilenameFromContentDisposition(
  contentDisposition: string | undefined,
): string | null {
  if (!contentDisposition) {
    return null;
  }

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return utf8Match[1].trim();
    }
  }

  const plainMatch = /filename="?([^";]+)"?/i.exec(contentDisposition);
  return plainMatch?.[1]?.trim() ?? null;
}

/**
 * Resolve o nome do ZIP: header da API ou fallback `{source}-{id}-comprovantes.zip`.
 */
export function resolveComprovantesZipFilename(options: {
  contentDisposition: string | undefined;
  source: BillingComprovantesSource;
  id: string;
}): string {
  const fromHeader = parseFilenameFromContentDisposition(options.contentDisposition);
  if (fromHeader) {
    return fromHeader;
  }
  return `${options.source}-${options.id}-comprovantes.zip`;
}

/**
 * Dispara download do blob via object URL + anchor click.
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}
