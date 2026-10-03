/** Stub de tipos de payment-info (protótipo não chama API real). */
export interface PaymentTabClientResponse {
  id: string;
  name: string;
  contracts?: Array<{
    id: string;
    name: string;
    nfeMode?: string | null;
    paymentInfo?: unknown;
    deductibles?: Array<{ id: string; name: string }>;
  }>;
  contractInvoiceGroups?: Array<{
    id: string;
    name: string;
    paymentInfo?: unknown;
    contracts?: Array<{ id: string; name: string }>;
  }>;
}
