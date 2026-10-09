import { addToast } from "@heroui/react";
import { getErrorMessage } from "@/shared/utils/errorParser";

/** Callbacks compartilhados de sucesso/erro ao excluir permissão RBAC. */
export function createPermissionDeleteCallbacks(
  onClose: () => void,
  errorDescription = "Não foi possível excluir. Tente novamente.",
) {
  return {
    onSuccess: () => {
      addToast({
        title: "Permissão excluída com sucesso!",
        color: "success",
      });
      onClose();
    },
    onError: (err: unknown) => {
      addToast({
        title: "Erro ao excluir permissão",
        description: getErrorMessage(
          err as Parameters<typeof getErrorMessage>[0],
          errorDescription,
        ),
        color: "danger",
      });
    },
  };
}
