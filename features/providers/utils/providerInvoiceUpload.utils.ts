import { uploadProviderInvoiceFile } from "../services/providerInvoices.service";

/** Cache de upload reutilizado por tentativas de submissão da mesma fatura. */
export interface ProviderInvoiceUploadCache {
  file: File | null;
  invoiceFileUrl: string | null;
}

interface ResolveProviderInvoiceFileUrlInput {
  providerId: string;
  competenceMonth: string;
  invoiceFile: File | null;
  invoiceFileUrl: string | null;
  cache: ProviderInvoiceUploadCache;
  onUploadStart: () => void;
}

/** Reutiliza o upload já concluído para a mesma fatura durante uma nova tentativa. */
export async function resolveProviderInvoiceFileUrl({
  providerId,
  competenceMonth,
  invoiceFile,
  invoiceFileUrl,
  cache,
  onUploadStart,
}: ResolveProviderInvoiceFileUrlInput): Promise<string | null> {
  if (!invoiceFile) return invoiceFileUrl;
  if (cache.file === invoiceFile && cache.invoiceFileUrl) return cache.invoiceFileUrl;

  onUploadStart();
  const upload = await uploadProviderInvoiceFile(providerId, competenceMonth, invoiceFile);
  cache.file = invoiceFile;
  cache.invoiceFileUrl = upload.invoiceFileUrl;
  return upload.invoiceFileUrl;
}
