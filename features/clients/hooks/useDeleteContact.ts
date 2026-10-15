"use client";

import type { ErrorResponse } from "@/shared/utils/errorParser";
import { addToast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { deleteContact } from "../services/contactsMock.service";

interface DeleteContactInput {
  clientId: string;
  contactId: string;
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ErrorResponse>, DeleteContactInput>({
    mutationFn: ({ clientId, contactId }) => deleteContact(clientId, contactId),
    onSuccess: (_data, { clientId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["clients", clientId, "contacts"],
      });
      addToast({
        title: "Contato excluído com sucesso!",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Erro ao excluir contato",
        description: "Ocorreu um erro ao tentar excluir o contato.",
        color: "danger",
      });
    },
  });
}
