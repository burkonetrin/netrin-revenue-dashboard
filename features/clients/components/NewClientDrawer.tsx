"use client";

import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { DrawerFormFooter } from "@/shared/components/DynamicDrawer/DrawerFormFooter";
import { useState } from "react";
import { NEW_CLIENT_FORM_ID, NewClientForm } from "./NewClientForm";

interface NewClientDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Sidebar de criação de novo cliente no protótipo comercial.
 */
export function NewClientDrawer({ isOpen, onOpenChange }: NewClientDrawerProps) {
  const [isFormPending, setIsFormPending] = useState(false);
  const formKey = isOpen ? "new-client-open" : "new-client-closed";

  const handleClose = () => {
    setIsFormPending(false);
    onOpenChange(false);
  };

  return (
    <DynamicDrawer
      size="lg"
      title="Novo Cliente"
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      classNames={{
        base: "max-w-[504px]",
        header: "font-bold text-gray-950",
        body: "flex-1! mb-0",
        footer: "border-t-0",
      }}
      component={
        <NewClientForm
          key={formKey}
          onSuccessSubmit={handleClose}
          onPendingChange={setIsFormPending}
        />
      }
      footer={
        <DrawerFormFooter
          formId={NEW_CLIENT_FORM_ID}
          onCancel={handleClose}
          isLoading={isFormPending}
          isCancelDisabled={isFormPending}
          saveLabel="Salvar"
        />
      }
    />
  );
}