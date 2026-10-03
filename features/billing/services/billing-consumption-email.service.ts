export type BillingConsumptionEmailSource = "entry" | "invoice";

export interface SendConsumptionEmailParams {
  source: BillingConsumptionEmailSource;
  billingId: string;
  itemId: string;
  email: string;
}

export interface SendConsumptionEmailResponse {
  message: string;
  to: string;
}

export async function sendConsumptionEmail(
  params: SendConsumptionEmailParams,
): Promise<SendConsumptionEmailResponse> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return {
    message: "E-mail enviado com sucesso",
    to: params.email,
  };
}
