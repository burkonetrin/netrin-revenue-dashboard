"use client";

/**
 * Store global do job de comprovantes — sobrevive à navegação (REQ-4 / COMP-05).
 */

import { getErrorMessage } from "@/shared/utils/errorParser";
import { addToast } from "@heroui/react";
import { isAxiosError } from "axios";
import { create } from "zustand";
import {
  downloadComprovantesZip,
  getComprovantesJob,
  startComprovantesJob,
} from "../services/billing-comprovantes.service";
import type { BillingComprovantesSource } from "../types/billing-comprovantes.types";
import {
  resolveComprovantesZipFilename,
  triggerBlobDownload,
} from "../utils/billing-comprovantes-download.utils";

export type ComprovantesUiJobStatus = "idle" | "in_progress" | "completed" | "failed";

export interface ComprovantesJobEntry {
  status: ComprovantesUiJobStatus;
  jobId?: string;
  error?: string | null;
}

interface BillingComprovantesStore {
  jobs: Record<string, ComprovantesJobEntry>;
  generateAndDownloadComprovantes: (options: {
    source: BillingComprovantesSource;
    id: string;
  }) => Promise<void>;
  isGenerating: (source: BillingComprovantesSource, id: string) => boolean;
  getJobEntry: (source: BillingComprovantesSource, id: string) => ComprovantesJobEntry;
}

/** Intervalo de poll do status do job (~1s conforme contrato API). */
export const COMPROVANTES_POLL_INTERVAL_MS = 1000;

export function buildComprovantesJobKey(source: BillingComprovantesSource, id: string): string {
  return `${source}:${id}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForComprovantesJob(jobId: string) {
  const job = await getComprovantesJob(jobId);

  if (job.status === "ready" && job.zipReady === true) {
    return job;
  }

  if (job.status === "failed") {
    throw new Error(job.error || "Falha ao gerar comprovantes");
  }

  await sleep(COMPROVANTES_POLL_INTERVAL_MS);
  return waitForComprovantesJob(jobId);
}

const idleEntry: ComprovantesJobEntry = { status: "idle" };

/**
 * Orquestra generate → poll → download ZIP → toast global.
 */
export const useBillingComprovantesStore = create<BillingComprovantesStore>((set, get) => ({
  jobs: {},

  getJobEntry: (source, id) => {
    return get().jobs[buildComprovantesJobKey(source, id)] ?? idleEntry;
  },

  isGenerating: (source, id) => {
    return get().getJobEntry(source, id).status === "in_progress";
  },

  generateAndDownloadComprovantes: async ({ source, id }) => {
    const key = buildComprovantesJobKey(source, id);
    const current = get().jobs[key];
    if (current?.status === "in_progress") {
      return;
    }

    set((state) => ({
      jobs: {
        ...state.jobs,
        [key]: { status: "in_progress", error: null },
      },
    }));

    try {
      const started = await startComprovantesJob(source, id);
      set((state) => ({
        jobs: {
          ...state.jobs,
          [key]: { status: "in_progress", jobId: started.jobId, error: null },
        },
      }));

      await waitForComprovantesJob(started.jobId);

      const { blob, headers } = await downloadComprovantesZip(started.jobId);
      const filename = resolveComprovantesZipFilename({
        contentDisposition: headers["content-disposition"],
        source,
        id,
      });
      triggerBlobDownload(blob, filename);

      addToast({
        title: "Download concluído",
        color: "success",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });

      set((state) => ({
        jobs: {
          ...state.jobs,
          [key]: { status: "completed", jobId: started.jobId, error: null },
        },
      }));
    } catch (error) {
      const message = isAxiosError(error)
        ? getErrorMessage(error, "Não foi possível gerar os comprovantes")
        : error instanceof Error
          ? error.message
          : "Não foi possível gerar os comprovantes";

      addToast({
        title: message,
        color: "danger",
        timeout: 4000,
        shouldShowTimeoutProgress: true,
      });

      set((state) => ({
        jobs: {
          ...state.jobs,
          [key]: { status: "failed", error: message },
        },
      }));
    }
  },
}));
