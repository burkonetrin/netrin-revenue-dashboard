import { MOCK_CLIENT_CONTACTS } from "@/clientesDashboardMockData";
import type { PaginationInfo } from "@/shared/types/pagination.types";
import type {
  Contact,
  ContactType,
  CreateContactRequest,
  ListContactsParams,
  PaginatedContactsResponse,
  UpdateContactRequest,
} from "../types/contacts.types";

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

const LEGACY_TYPE_MAP: Record<string, ContactType> = {
  Financeiro: "finance",
  Comercial: "contract_manager",
  TI: "it",
  "Gestor do contrato": "contract_manager",
  "Key user": "key_user",
};

function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalRecords = items.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    pagination: {
      page,
      pageSize,
      totalRecords,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    } satisfies PaginationInfo,
  };
}

function seedForClient(clientId: string): Contact[] {
  const now = new Date().toISOString();
  return MOCK_CLIENT_CONTACTS.map((row) => ({
    id: row.id,
    clientId,
    name: row.name,
    email: row.email,
    phone: row.phone,
    contactType: LEGACY_TYPE_MAP[row.contactType] ?? "finance",
    sendInvoicesAndBillsByEmail: row.id === "ct1",
    isActive: true,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  }));
}

const contactsByClient = new Map<string, Contact[]>();

function ensureClientContacts(clientId: string): Contact[] {
  if (!contactsByClient.has(clientId)) {
    contactsByClient.set(clientId, seedForClient(clientId));
  }
  return contactsByClient.get(clientId)!;
}

function newId() {
  return `ct-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getContactsByClient(
  clientId: string,
  params: ListContactsParams = {},
): Promise<PaginatedContactsResponse> {
  await delay();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const list = ensureClientContacts(clientId).filter((c) => !c.isArchived);
  return paginate(list, page, pageSize);
}

export async function createContact(
  clientId: string,
  data: CreateContactRequest,
): Promise<Contact> {
  await delay();
  const now = new Date().toISOString();
  const contact: Contact = {
    id: newId(),
    clientId,
    name: data.name,
    email: data.email,
    phone: data.phone,
    contactType: data.contactType,
    sendInvoicesAndBillsByEmail: data.sendInvoicesAndBillsByEmail ?? false,
    isActive: data.isActive ?? true,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };
  const list = ensureClientContacts(clientId);
  contactsByClient.set(clientId, [contact, ...list]);
  return contact;
}

export async function updateContact(
  clientId: string,
  contactId: string,
  data: UpdateContactRequest,
): Promise<Contact> {
  await delay();
  const list = ensureClientContacts(clientId);
  const idx = list.findIndex((c) => c.id === contactId);
  if (idx < 0) throw new Error("Contato não encontrado");
  const updated: Contact = {
    ...list[idx],
    ...data,
    sendInvoicesAndBillsByEmail: data.sendInvoicesAndBillsByEmail ?? false,
    updatedAt: new Date().toISOString(),
  };
  list[idx] = updated;
  contactsByClient.set(clientId, [...list]);
  return updated;
}

export async function deleteContact(clientId: string, contactId: string): Promise<void> {
  await delay();
  const list = ensureClientContacts(clientId);
  contactsByClient.set(
    clientId,
    list.map((c) =>
      c.id === contactId ? { ...c, isArchived: true, isActive: false } : c,
    ),
  );
}
