"use client";

import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { NewUserFormMock } from "./NewUserFormMock";

interface UserFormDrawerMockProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientName?: string;
}

export function UserFormDrawerMock({
  isOpen,
  onClose,
  defaultClientName,
}: UserFormDrawerMockProps) {
  return (
    <DynamicDrawer
      dataTestId="user-form-drawer"
      size="4xl"
      title="Novo Usuário"
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      component={
        isOpen ? (
          <NewUserFormMock
            key={defaultClientName ?? "new-user"}
            defaultClientName={defaultClientName}
            onClose={onClose}
          />
        ) : null
      }
    />
  );
}
