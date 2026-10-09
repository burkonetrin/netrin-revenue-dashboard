import { addToast } from "@heroui/react";

export function showPatchActiveSuccessToast(entityLabel = "grupo") {
  addToast({
    title: "Status atualizado",
    description: `O status do ${entityLabel} foi atualizado com sucesso.`,
    color: "success",
  });
}

export function showPatchActiveErrorToast(entityLabel = "grupo") {
  addToast({
    title: "Erro ao atualizar status",
    description: `Ocorreu um erro ao tentar atualizar o status do ${entityLabel}.`,
    color: "danger",
  });
}
