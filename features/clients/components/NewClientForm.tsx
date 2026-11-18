"use client";

import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import { addToast, Checkbox, Input } from "@heroui/react";
import { type FormEvent, useState } from "react";

export const NEW_CLIENT_FORM_ID = "client-form";

interface NewClientFormProps {
  onSuccessSubmit?: () => void;
  onPendingChange?: (pending: boolean) => void;
}

function inputClassNamesWithError(hasError: boolean) {
  return {
    ...defaultInputClassNames,
    inputWrapper: hasError
      ? `${defaultInputClassNames.inputWrapper} !border-danger-500 !border-2`
      : defaultInputClassNames.inputWrapper,
  };
}

/**
 * Formulário de cadastro de novo cliente (protótipo comercial).
 */
export function NewClientForm({
  onSuccessSubmit,
  onPendingChange,
}: NewClientFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [withoutCnpj, setWithoutCnpj] = useState(false);
  const [isTest, setIsTest] = useState(false);
  const [cnpj, setCnpj] = useState("");
  const [foreignIdentification, setForeignIdentification] = useState("");
  const [name, setName] = useState("");
  const [fantasyName, setFantasyName] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [segment, setSegment] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ cnpj?: string; name?: string }>({});

  const showFullForm = withoutCnpj;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};

    if (!withoutCnpj) {
      const digits = cnpj.replace(/\D/g, "");
      if (!digits) {
        nextErrors.cnpj = "CNPJ é obrigatório";
      } else if (digits.length !== 14) {
        nextErrors.cnpj = "CNPJ deve ter 14 dígitos";
      }
    } else if (!name.trim()) {
      nextErrors.name = "Nome é obrigatório";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsPending(true);
    onPendingChange?.(true);
    window.setTimeout(() => {
      setIsPending(false);
      onPendingChange?.(false);
      addToast({
        title: "Cliente criado",
        description: "Cadastro salvo no protótipo comercial.",
        color: "success",
        timeout: 3000,
      });
      onSuccessSubmit?.();
    }, 400);
  };

  const cnpjInvalid = Boolean(errors.cnpj);
  const nameInvalid = Boolean(errors.name);
  const fieldsDisabled = isPending;

  return (
    <form
      id={NEW_CLIENT_FORM_ID}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-3">
        <Checkbox
          isSelected={withoutCnpj}
          onValueChange={setWithoutCnpj}
          isDisabled={fieldsDisabled}
          size="sm"
        >
          Cliente sem CNPJ
        </Checkbox>
        <Checkbox
          isSelected={isTest}
          onValueChange={setIsTest}
          isDisabled={fieldsDisabled}
          size="sm"
        >
          Cliente de teste
        </Checkbox>
      </div>

      {!showFullForm ? (
        <Input
          label="CNPJ"
          labelPlacement="outside"
          placeholder="Digite o CNPJ da empresa"
          value={cnpj}
          onValueChange={setCnpj}
          classNames={inputClassNamesWithError(cnpjInvalid)}
          isInvalid={cnpjInvalid}
          errorMessage={errors.cnpj}
          isDisabled={fieldsDisabled}
        />
      ) : (
        <>
          <Input
            label="Identificação de estrangeiro"
            labelPlacement="outside"
            placeholder="Digite a identificação"
            value={foreignIdentification}
            onValueChange={setForeignIdentification}
            classNames={defaultInputClassNames}
            isDisabled={fieldsDisabled}
          />
          <Input
            label="Nome"
            labelPlacement="outside"
            placeholder="Digite o nome"
            value={name}
            onValueChange={setName}
            classNames={inputClassNamesWithError(nameInvalid)}
            isInvalid={nameInvalid}
            errorMessage={errors.name}
            isDisabled={fieldsDisabled}
          />
          <Input
            label="Nome Fantasia"
            labelPlacement="outside"
            placeholder="Digite o nome fantasia"
            value={fantasyName}
            onValueChange={setFantasyName}
            classNames={defaultInputClassNames}
            isDisabled={fieldsDisabled}
          />
          <Input
            label="Logradouro"
            labelPlacement="outside"
            placeholder="Digite o logradouro"
            value={street}
            onValueChange={setStreet}
            classNames={defaultInputClassNames}
            isDisabled={fieldsDisabled}
          />
          <Input
            label="Número"
            labelPlacement="outside"
            placeholder="Digite o número"
            value={number}
            onValueChange={setNumber}
            classNames={defaultInputClassNames}
            isDisabled={fieldsDisabled}
          />
          <Input
            label="Complemento"
            labelPlacement="outside"
            placeholder="Digite o complemento"
            value={complement}
            onValueChange={setComplement}
            classNames={defaultInputClassNames}
            isDisabled={fieldsDisabled}
          />
          <Input
            label="Bairro"
            labelPlacement="outside"
            placeholder="Digite o bairro"
            value={neighborhood}
            onValueChange={setNeighborhood}
            classNames={defaultInputClassNames}
            isDisabled={fieldsDisabled}
          />
          <div className="flex flex-row gap-4">
            <div className="flex-1">
              <Input
                label="Cidade"
                labelPlacement="outside"
                placeholder="Digite a cidade"
                value={city}
                onValueChange={setCity}
                classNames={defaultInputClassNames}
                isDisabled={fieldsDisabled}
              />
            </div>
            <div className="w-24">
              <Input
                label="UF"
                labelPlacement="outside"
                placeholder="UF"
                value={state}
                onValueChange={setState}
                classNames={defaultInputClassNames}
                isDisabled={fieldsDisabled}
              />
            </div>
          </div>
          <Input
            label="CEP"
            labelPlacement="outside"
            placeholder="Digite o CEP"
            value={zipCode}
            onValueChange={setZipCode}
            classNames={defaultInputClassNames}
            isDisabled={fieldsDisabled}
          />
          <Input
            label="Segmento"
            labelPlacement="outside"
            placeholder="Digite o segmento"
            value={segment}
            onValueChange={setSegment}
            classNames={defaultInputClassNames}
            isDisabled={fieldsDisabled}
          />
          <Checkbox
            isSelected={isActive}
            onValueChange={setIsActive}
            isDisabled={fieldsDisabled}
            size="sm"
          >
            Cliente ativo?
          </Checkbox>
        </>
      )}
    </form>
  );
}