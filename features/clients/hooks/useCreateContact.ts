"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { addToast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { createContact } from "../services/contactsMock.service";
import type { Contact, CreateContactRequest } from "../types/contacts.types";

interface CreateContactInput {
  clientId: string;
  data: CreateContactRequest;
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation<Contact, AxiosError<ErrorResponse>, CreateContactInput>({
    mutationFn: ({ clientId, data }) => createContact(clientId, data),
    onSuccess: (_contact, { clientId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["clients", clientId, "contacts"],
      });
      addToast({
        title: "Contato criado com sucesso!",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Erro ao criar contato",
        description: "Ocorreu um erro ao tentar criar o contato.",
        color: "danger",
      });
    },
  });
}
