"use client";

import { create } from "zustand";
import type { Contact } from "../types/contacts.types";

interface ContactFormDrawerState {
  isOpen: boolean;
  contact: Contact | null;
}

interface ContactsStore {
  contactToDelete: Contact | null;
  openDeleteModal: (contact: Contact) => void;
  closeDeleteModal: () => void;
  contactFormDrawer: ContactFormDrawerState;
  openCreateContactDrawer: () => void;
  openEditContactDrawer: (contact: Contact) => void;
  closeContactFormDrawer: () => void;
}

const DEFAULT_CONTACT_FORM_DRAWER: ContactFormDrawerState = {
  isOpen: false,
  contact: null,
};

export const useContactsStore = create<ContactsStore>((set) => ({
  contactToDelete: null,
  openDeleteModal: (contact) => set({ contactToDelete: contact }),
  closeDeleteModal: () => set({ contactToDelete: null }),
  contactFormDrawer: DEFAULT_CONTACT_FORM_DRAWER,
  openCreateContactDrawer: () =>
    set({
      contactFormDrawer: {
        isOpen: true,
        contact: null,
      },
    }),
  openEditContactDrawer: (contact) =>
    set({
      contactFormDrawer: {
        isOpen: true,
        contact,
      },
    }),
  closeContactFormDrawer: () =>
    set({
      contactFormDrawer: DEFAULT_CONTACT_FORM_DRAWER,
    }),
}));
