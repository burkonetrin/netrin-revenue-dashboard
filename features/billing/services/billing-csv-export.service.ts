/**
 * Serviço mock — exportação CSV (ZIP simulado).
 */

export interface BillingCsvExportDownload {
  blob: Blob;
  headers: Record<string, string>;
}

export async function downloadBillingCsvExport(
  year: number,
  month: number,
): Promise<BillingCsvExportDownload> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const content = `competencia,${year}-${String(month).padStart(2, "0")}\n`;
  const blob = new Blob([content], { type: "application/zip" });
  return {
    blob,
    headers: {
      "content-disposition": `attachment; filename="faturamento-${year}-${month}.zip"`,
      "content-type": "application/zip",
    },
  };
}
