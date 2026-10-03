"use client";

/**
 * Store global do export CSV de faturamento — sobrevive à navegação (BILCSV-17).
 */

import { getErrorMessage } from "@/shared/utils/errorParser";
import { addToast } from "@heroui/react";
import { isAxiosError } from "axios";
import { create } from "zustand";
import { downloadBillingCsvExport } from "../services/billing-csv-export.service";
import { triggerBlobDownload } from "../utils/billing-comprovantes-download.utils";
import {
  parseBillingCompetenceToYearMonth,
  resolveBillingCsvExportFilename,
} from "../utils/billing-csv-export.utils";

interface BillingCsvExportStore {
  isDownloading: boolean;
  downloadCsv: (competence: string) => Promise<void>;
}

/**
 * Orquestra download ZIP → blob → toast global “Download concluído”.
 */
export const useBillingCsvExportStore = create<BillingCsvExportStore>((set, get) => ({
  isDownloading: false,

  downloadCsv: async (competence) => {
    if (get().isDownloading) {
      return;
    }

    const parsed = parseBillingCompetenceToYearMonth(competence);
    if (!parsed) {
      addToast({
        title: "Selecione uma competência para exportar",
        color: "warning",
        timeout: 4000,
        shouldShowTimeoutProgress: true,
      });
      return;
    }

    set({ isDownloading: true });

    try {
      const { blob, headers } = await downloadBillingCsvExport(parsed.year, parsed.month);
      const filename = resolveBillingCsvExportFilename({
        year: parsed.year,
        month: parsed.month,
        contentDisposition: headers["content-disposition"],
      });
      triggerBlobDownload(blob, filename);

      addToast({
        title: "Download concluído",
        color: "success",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
    } catch (error) {
      const message = isAxiosError(error)
        ? getErrorMessage(error, "Não foi possível baixar o CSV")
        : error instanceof Error
          ? error.message
          : "Não foi possível baixar o CSV";

      addToast({
        title: message,
        color: "danger",
        timeout: 4000,
        shouldShowTimeoutProgress: true,
      });
    } finally {
      set({ isDownloading: false });
    }
  },
}));
