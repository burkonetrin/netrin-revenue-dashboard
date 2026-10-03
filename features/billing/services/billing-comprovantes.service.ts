import type {
  BillingComprovantesSource,
  ComprovantesJobGenerateResponse,
  ComprovantesJobStatusResponse,
} from "../types/billing-comprovantes.types";

export interface ComprovantesZipDownload {
  blob: Blob;
  headers: Record<string, string>;
}

const jobs = new Map<string, ComprovantesJobStatusResponse>();

export async function startComprovantesJob(
  source: BillingComprovantesSource,
  id: string,
): Promise<ComprovantesJobGenerateResponse> {
  const jobId = `job-${source}-${id}-${Date.now()}`;
  jobs.set(jobId, { status: "ready", zipReady: true, jobId });
  return { jobId, status: "queued" };
}

export async function getComprovantesJob(jobId: string): Promise<ComprovantesJobStatusResponse> {
  return jobs.get(jobId) ?? { status: "ready", zipReady: true, jobId };
}

export async function downloadComprovantesZip(jobId: string): Promise<ComprovantesZipDownload> {
  void jobId;
  const blob = new Blob(["comprovantes-mock"], { type: "application/zip" });
  return {
    blob,
    headers: {
      "content-disposition": 'attachment; filename="comprovantes.zip"',
      "content-type": "application/zip",
    },
  };
}
