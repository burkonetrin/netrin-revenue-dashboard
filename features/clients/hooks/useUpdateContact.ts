"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { addToast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { updateContact } from "../services/contactsMock.service";
import type { Contact, UpdateContactRequest } from "../types/contacts.types";

interface UpdateContactInput {
  clientId: string;
  contactId: string;
  data: UpdateContactRequest;
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation<Contact, AxiosError<ErrorResponse>, UpdateContactInput>({
    mutationFn: ({ clientId, contactId, data }) =>
      updateContact(clientId, contactId, data),
    onSuccess: (_contact, { clientId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["clients", clientId, "contacts"],
      });
      addToast({
        title: "Contato atualizado com sucesso!",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Erro ao atualizar contato",
        description: "Ocorreu um erro ao tentar atualizar o contato.",
        color: "danger",
      });
    },
  });
}
