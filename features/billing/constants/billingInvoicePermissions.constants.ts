/**
 * Permissões do menu Faturamento (produto Nucleus).
 * Match exato com o cadastro BE / `can()` / `PermissionGuard`.
 *
 * Ações de detalhe compartilhado com a aba Faturas do cliente usam
 * `canClientsOrBillingInvoice` (`clients.invoices.*` OU equivalente `billing.*`).
 */
export const BILLING_INVOICE_PERMISSIONS = {
  access: "billing",
  listClients: "billing.listClients",
  listProfitCenters: "billing.listProfitCenters",
  createInvoice: "billing.createInvoice",
  createInvoiceListContracts: "billing.createInvoice.listContracts",
  createInvoiceListProducts: "billing.createInvoice.listProducts",
  createInvoiceListProfitCenters: "billing.createInvoice.listProfitCenters",
  createInvoiceReadClient: "billing.createInvoice.readClient",
  invoiceDetails: "billing.invoiceDetails",
  invoiceDetailsReadClient: "billing.invoiceDetails.readClient",
  adjustInvoice: "billing.invoiceDetails.adjustInvoice",
  adjustDiscount: "billing.invoiceDetails.adjustInvoice.discount",
  adjustAddition: "billing.invoiceDetails.adjustInvoice.addition",
  adjustDueDate: "billing.invoiceDetails.adjustInvoice.dueDate",
  adjustCompetence: "billing.invoiceDetails.adjustInvoice.competence",
  adjustDescription: "billing.invoiceDetails.adjustInvoice.description",
  generateHistory: "billing.invoiceDetails.generateHistory",
  sendEmail: "billing.invoiceDetails.sendEmail",
} as const;

/** Alias alinhado ao contrato BE (mesmo mapa). */
export const BILLING_PERMISSIONS = BILLING_INVOICE_PERMISSIONS;

export type BillingInvoicePermission =
  (typeof BILLING_INVOICE_PERMISSIONS)[keyof typeof BILLING_INVOICE_PERMISSIONS];

/**
 * Converte chave `clients.invoices.*` → equivalente `billing.*`.
 * - createInvoice fica na raiz: `billing.createInvoice`
 * - demais paths trocam o prefixo `clients.invoices` por `billing`
 *   (ex.: `clients.invoices.invoiceDetails.sendEmail` → `billing.invoiceDetails.sendEmail`)
 */
export function toBillingInvoicePermission(clientsInvoicePermission: string): string {
  if (clientsInvoicePermission === "clients.invoices.createInvoice") {
    return BILLING_INVOICE_PERMISSIONS.createInvoice;
  }

  if (clientsInvoicePermission.startsWith("clients.invoices")) {
    return clientsInvoicePermission.replace(/^clients\.invoices/, "billing");
  }

  return clientsInvoicePermission;
}

/**
 * Detalhe de fatura compartilhado: libera se tiver a chave do cliente
 * (`clients.invoices.*`) ou a equivalente do faturamento (`billing.*`).
 */
export function canClientsOrBillingInvoice(
  can: (permission: string) => boolean,
  clientsInvoicePermission: string,
): boolean {
  return can(clientsInvoicePermission) || can(toBillingInvoicePermission(clientsInvoicePermission));
}
