/**
 * Chaves RBAC do módulo Clientes (produto Nucleus) — Wave 5.
 * Match exato com o cadastro Nucleus / `can()` / `PermissionGuard`.
 *
 * Tags ficam sob `clients.overview.tags.*` (UI na Sobre; não liberam detalhe sozinhas).
 * `deleteContract` / `deleteDeductible` existem no cadastro sem UI — sem guard.
 * Ações compartilhadas no detalhe `/billing/[id]`: `clients.invoices.invoiceDetails.*` **OU**
 * equivalente `billing.invoiceDetails.*` / `billing.createInvoice`
 * (ver `canClientsOrBillingInvoice`).
 */
export const CLIENTS_PERMISSIONS = {
  access: "clients",
  createClient: "clients.createClient",
  deleteClient: "clients.deleteClient",

  overview: "clients.overview",
  toggleClient: "clients.overview.toggleClient",
  searchZipCode: "clients.overview.searchZipCode",
  reCheckCnpj: "clients.overview.reCheckCnpj",
  updateOverview: "clients.overview.updateOverview",
  tags: "clients.overview.tags",
  addTag: "clients.overview.tags.addTag",
  removeTag: "clients.overview.tags.removeTag",
  deleteTag: "clients.overview.tags.deleteTag",

  contracts: "clients.contracts",
  showInactiveContracts: "clients.contracts.showInactiveContracts",
  createContract: "clients.contracts.createContract",
  updateContract: "clients.contracts.updateContract",
  toggleContract: "clients.contracts.toggleContract",
  deleteContract: "clients.contracts.deleteContract", // cadastro existe; sem UI
  createDeductible: "clients.contracts.createDeductible",
  createDeductibleListProducts: "clients.contracts.createDeductible.listProducts",
  createDeductibleListDataSources: "clients.contracts.createDeductible.listDataSources",
  createDeductibleListDataSourceBundles: "clients.contracts.createDeductible.listDataSourceBundles",
  createDeductibleListBackgroundCheckTemplates:
    "clients.contracts.createDeductible.listBackgroundCheckTemplates",
  updateDeductible: "clients.contracts.updateDeductible",
  renewDeductible: "clients.contracts.renewDeductible",
  toggleDeductible: "clients.contracts.toggleDeductible",
  deleteDeductible: "clients.contracts.deleteDeductible", // cadastro existe; sem UI
  deductibleDetails: "clients.contracts.deductibleDetails",
  deductibleOverview: "clients.contracts.deductibleDetails.overview",
  deductibleUpdateOverview: "clients.contracts.deductibleDetails.overview.updateOverview",
  deductibleBillingModel: "clients.contracts.deductibleDetails.billingModel",
  deductibleUpdateBillingModel:
    "clients.contracts.deductibleDetails.billingModel.updateBillingModel",
  deductibleSources: "clients.contracts.deductibleDetails.sources",
  deductibleUpdateSources: "clients.contracts.deductibleDetails.sources.updateSources",

  users: "clients.users",
  createUser: "clients.users.createUser",
  createUserListProducts: "clients.users.createUser.listProducts",
  createUserAssignRbacGroups: "clients.users.createUser.assignRbacGroups",
  createUserAssignRbacRoles: "clients.users.createUser.assignRbacRoles",
  updateUser: "clients.users.updateUser",
  deleteUser: "clients.users.deleteUser",
  toggleUser: "clients.users.toggleUser",

  contacts: "clients.contacts",
  createContact: "clients.contacts.createContact",
  updateContact: "clients.contacts.updateContact",
  deleteContact: "clients.contacts.deleteContact",

  invoices: "clients.invoices",
  listInvoiceProfitCenters: "clients.invoices.listProfitCenters",
  createInvoice: "clients.invoices.createInvoice",
  createInvoiceListContracts: "clients.invoices.createInvoice.listContracts",
  createInvoiceListProducts: "clients.invoices.createInvoice.listProducts",
  createInvoiceListProfitCenters: "clients.invoices.createInvoice.listProfitCenters",
  createInvoiceReadClient: "clients.invoices.createInvoice.readClient",
  invoiceDetails: "clients.invoices.invoiceDetails",
  invoiceDetailsReadClient: "clients.invoices.invoiceDetails.readClient",
  adjustInvoice: "clients.invoices.invoiceDetails.adjustInvoice",
  adjustDiscount: "clients.invoices.invoiceDetails.adjustInvoice.discount",
  adjustAddition: "clients.invoices.invoiceDetails.adjustInvoice.addition",
  adjustDueDate: "clients.invoices.invoiceDetails.adjustInvoice.dueDate",
  adjustCompetence: "clients.invoices.invoiceDetails.adjustInvoice.competence",
  adjustDescription: "clients.invoices.invoiceDetails.adjustInvoice.description",
  generateHistory: "clients.invoices.invoiceDetails.generateHistory",
  sendEmail: "clients.invoices.invoiceDetails.sendEmail",

  paymentInfo: "clients.paymentInfo",
  updatePaymentInfo: "clients.paymentInfo.updatePaymentInfo",
  updateProfitCenter: "clients.paymentInfo.updateProfitCenter",
  updateInvoiceEmission: "clients.paymentInfo.updateInvoiceEmission",
} as const;

export type ClientsPermission = (typeof CLIENTS_PERMISSIONS)[keyof typeof CLIENTS_PERMISSIONS];

export const CLIENTS_PERMISSION_KEYS: readonly ClientsPermission[] =
  Object.values(CLIENTS_PERMISSIONS);

/**
 * Abas do detalhe que liberam link na listagem / acesso útil ao detalhe.
 * `clients.overview.tags` NÃO entra.
 */
export const CLIENT_DETAIL_TAB_PERMISSIONS = [
  CLIENTS_PERMISSIONS.overview,
  CLIENTS_PERMISSIONS.contracts,
  CLIENTS_PERMISSIONS.users,
  CLIENTS_PERMISSIONS.contacts,
  CLIENTS_PERMISSIONS.invoices,
  CLIENTS_PERMISSIONS.paymentInfo,
] as const;

export type ClientDetailTabKey =
  | "sobre"
  | "contratos"
  | "usuarios"
  | "contatos"
  | "faturas"
  | "informacoes-pagamento";

export const CLIENT_DETAIL_TAB_PERMISSION_BY_KEY: Record<ClientDetailTabKey, ClientsPermission> = {
  sobre: CLIENTS_PERMISSIONS.overview,
  contratos: CLIENTS_PERMISSIONS.contracts,
  usuarios: CLIENTS_PERMISSIONS.users,
  contatos: CLIENTS_PERMISSIONS.contacts,
  faturas: CLIENTS_PERMISSIONS.invoices,
  "informacoes-pagamento": CLIENTS_PERMISSIONS.paymentInfo,
};
