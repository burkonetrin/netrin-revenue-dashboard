"use client";

import { defaultInputClassNames, defaultSelectClassNames } from "@/shared/styles/inputClassNames";
import { maskBrazilianPhone } from "@/shared/utils/phone";
import { Checkbox, Input, Select, SelectItem } from "@heroui/react";
import { type FormEvent, useEffect, useState } from "react";
import { useCreateContact } from "../hooks/useCreateContact";
import { useUpdateContact } from "../hooks/useUpdateContact";
import {
  CONTACT_ACTIVE_CHECKBOX_LABEL,
  CONTACT_RECEIVES_BOLETOS_CHECKBOX_LABEL,
  CONTACT_RECEIVES_NFE_CHECKBOX_LABEL,
  CONTACT_TYPE_OPTIONS,
  type Contact,
  type ContactType,
} from "../types/contacts.types";

const requiredMessage = "Campo obrigatório";
const fieldLabelClassName = "text-xs text-zinc-500";

interface ContactFormProps {
  clientId?: string;
  contact?: Contact | null;
  onSuccessSubmit?: () => void;
  onPendingChange?: (pending: boolean) => void;
}

export function ContactForm({
  clientId,
  contact,
  onSuccessSubmit,
  onPendingChange,
}: ContactFormProps) {
  const isEditMode = Boolean(contact);
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const isPending = createContact.isPending || updateContact.isPending;

  const [isActive, setIsActive] = useState(contact?.isActive ?? true);
  const [receivesNfe, setReceivesNfe] = useState(contact?.receivesNfe ?? false);
  const [receivesBoletos, setReceivesBoletos] = useState(contact?.receivesBoletos ?? false);
  const [name, setName] = useState(contact?.name ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [phone, setPhone] = useState(maskBrazilianPhone(contact?.phone ?? ""));
  const [contactType, setContactType] = useState<ContactType | undefined>(
    contact?.contactType,
  );
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    contactType?: string;
  }>({});

  useEffect(() => {
    setIsActive(contact?.isActive ?? true);
    setReceivesNfe(contact?.receivesNfe ?? false);
    setReceivesBoletos(contact?.receivesBoletos ?? false);
    setName(contact?.name ?? "");
    setEmail(contact?.email ?? "");
    setPhone(maskBrazilianPhone(contact?.phone ?? ""));
    setContactType(contact?.contactType);
    setErrors({});
  }, [contact]);

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  const getErrorClassNames = (hasError: boolean) => ({
    ...defaultInputClassNames,
    inputWrapper: hasError
      ? `${defaultInputClassNames.inputWrapper} !border-danger-500 !border-2`
      : defaultInputClassNames.inputWrapper,
  });

  const getSelectClassNames = (hasError: boolean) => ({
    ...defaultSelectClassNames,
    value: "text-black! text-sm",
    trigger: hasError
      ? `${defaultSelectClassNames.trigger} !border-danger-500 !border-2`
      : defaultSelectClassNames.trigger,
  });

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = requiredMessage;
    if (!email.trim()) nextErrors.email = requiredMessage;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "E-mail inválido";
    }
    if (!phone.trim()) nextErrors.phone = requiredMessage;
    if (!contactType) nextErrors.contactType = requiredMessage;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!clientId || !validate() || !contactType) return;

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: maskBrazilianPhone(phone),
      contactType,
      receivesNfe,
      receivesBoletos,
      isActive,
    };

    if (isEditMode && contact) {
      updateContact.mutate(
        { clientId, contactId: contact.id, data: payload },
        { onSuccess: () => onSuccessSubmit?.() },
      );
      return;
    }

    createContact.mutate(
      { clientId, data: payload },
      { onSuccess: () => onSuccessSubmit?.() },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <form id="contact-form" onSubmit={onSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Checkbox
            isSelected={isActive}
            onValueChange={setIsActive}
            isDisabled={isPending}
            aria-label={CONTACT_ACTIVE_CHECKBOX_LABEL}
            classNames={{ label: "text-sm text-zinc-500" }}
          >
            {CONTACT_ACTIVE_CHECKBOX_LABEL}
          </Checkbox>
          <Checkbox
            isSelected={receivesNfe}
            onValueChange={setReceivesNfe}
            isDisabled={isPending}
            aria-label={CONTACT_RECEIVES_NFE_CHECKBOX_LABEL}
            classNames={{ label: "text-sm text-zinc-500" }}
          >
            {CONTACT_RECEIVES_NFE_CHECKBOX_LABEL}
          </Checkbox>
          <Checkbox
            isSelected={receivesBoletos}
            onValueChange={setReceivesBoletos}
            isDisabled={isPending}
            aria-label={CONTACT_RECEIVES_BOLETOS_CHECKBOX_LABEL}
            classNames={{ label: "text-sm text-zinc-500" }}
          >
            {CONTACT_RECEIVES_BOLETOS_CHECKBOX_LABEL}
          </Checkbox>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="contact-name" className={fieldLabelClassName}>
            Nome do contato
          </label>
          <Input
            id="contact-name"
            aria-label="Nome do contato"
            value={name}
            onValueChange={setName}
            classNames={getErrorClassNames(Boolean(errors.name))}
            isInvalid={Boolean(errors.name)}
            errorMessage={errors.name}
            isDisabled={isPending}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="contact-email" className={fieldLabelClassName}>
            E-mail do contato
          </label>
          <Input
            id="contact-email"
            aria-label="E-mail do contato"
            value={email}
            onValueChange={setEmail}
            classNames={getErrorClassNames(Boolean(errors.email))}
            isInvalid={Boolean(errors.email)}
            errorMessage={errors.email}
            isDisabled={isPending}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="contact-phone" className={fieldLabelClassName}>
            Telefone do contato
          </label>
          <Input
            id="contact-phone"
            aria-label="Telefone do contato"
            value={phone}
            onValueChange={(value) => setPhone(maskBrazilianPhone(value))}
            classNames={getErrorClassNames(Boolean(errors.phone))}
            isInvalid={Boolean(errors.phone)}
            errorMessage={errors.phone}
            isDisabled={isPending}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="contact-type" className={fieldLabelClassName}>
            Tipo de contato
          </label>
          <Select
            id="contact-type"
            aria-label="Tipo de contato"
            placeholder="Selecione uma opção"
            selectedKeys={contactType ? [contactType] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as ContactType | undefined;
              setContactType(selected);
            }}
            classNames={getSelectClassNames(Boolean(errors.contactType))}
            isInvalid={Boolean(errors.contactType)}
            errorMessage={errors.contactType}
            isDisabled={isPending}
          >
            {CONTACT_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value}>{option.label}</SelectItem>
            ))}
          </Select>
        </div>
      </form>
    </div>
  );
}
