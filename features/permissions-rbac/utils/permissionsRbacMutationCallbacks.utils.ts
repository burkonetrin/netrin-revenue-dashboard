import { getErrorMessage } from "@/shared/utils/errorParser";
import { addToast } from "@heroui/react";

export function onPermissionFormSuccess(closeFormDrawer: () => void, title: string) {
  return () => {
    addToast({ title, color: "success" });
    closeFormDrawer();
  };
}

export function onPermissionFormError(title: string, fallback: string) {
  return (err: unknown) => {
    addToast({
      title,
      description: getErrorMessage(err as Parameters<typeof getErrorMessage>[0], fallback),
      color: "danger",
    });
  };
}

export function onPermissionStatusSuccess(clearLoading: () => void) {
  return () => {
    clearLoading();
    addToast({
      title: "Status atualizado com sucesso!",
      color: "success",
    });
  };
}

export function onPermissionStatusError(clearLoading: () => void, fallback: string) {
  return (err: unknown) => {
    clearLoading();
    addToast({
      title: "Erro ao atualizar status",
      description: getErrorMessage(err as Parameters<typeof getErrorMessage>[0], fallback),
      color: "danger",
    });
  };
}
