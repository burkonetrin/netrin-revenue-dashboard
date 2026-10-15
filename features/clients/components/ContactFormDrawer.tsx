"use client";

import { DynamicDrawer } from "@/shared/components/DynamicDrawer";
import { Button } from "@heroui/react";
import { useState } from "react";
import { useContactsStore } from "../store/contacts.store";
import { ContactForm } from "./ContactForm";

interface ContactFormDrawerProps {
  clientId?: string;
}

export function ContactFormDrawer({ clientId }: ContactFormDrawerProps) {
  const { contactFormDrawer, closeContactFormDrawer } = useContactsStore();
  const [isFormPending, setIsFormPending] = useState(false);
  const { isOpen, contact } = contactFormDrawer;

  const handleClose = () => {
    setIsFormPending(false);
    closeContactFormDrawer();
  };

  return (
    <DynamicDrawer
      size="lg"
      title={contact ? "Editar contato" : "Novo contato"}
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      classNames={{
        base: "h-full",
        body: "flex-1! mb-0 overflow-y-auto",
        footer: "mt-auto",
      }}
      component={
        <ContactForm
          key={contact?.id ?? "new-contact"}
          clientId={clientId}
          contact={contact}
          onSuccessSubmit={handleClose}
          onPendingChange={setIsFormPending}
        />
      }
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button
            variant="light"
            onPress={handleClose}
            className="border border-default-200 min-w-32 h-11 font-medium"
            isDisabled={isFormPending}
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            type="submit"
            form="contact-form"
            className="min-w-32 h-11 font-semibold shadow-md text-white"
            isLoading={isFormPending}
          >
            {isFormPending ? "" : "Salvar"}
          </Button>
        </div>
      }
    />
  );
}
