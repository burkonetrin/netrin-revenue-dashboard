/**
 * Utilitário para path name to display.
 * @param pathName - path name
 */
export function pathNameToDisplay(pathName: string[]): string {
  if (!pathName.length) return "";
  return JSON.stringify(pathName);
}

/**
 * Utilitário para display to path name.
 * @param display - display
 */
export function displayToPathName(display: string): string[] {
  const trimmed = display.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0);
    }
  } catch {
    // fall through to comma-separated parsing
  }

  return trimmed
    .split(",")
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
    .filter((item) => item.length > 0);
}
