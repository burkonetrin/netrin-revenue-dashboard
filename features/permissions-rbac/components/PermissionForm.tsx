"use client";

/**
 * Formulário de criação e edição de permissão RBAC.
 */

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Input } from "@heroui/react";
import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import type { Permission } from "../types/permission.types";

interface PermissionFormProps {
  permission?: Permission;
  parentPermission?: Permission;
  contextProductName?: string | null;
  onSubmit: (data: {
    name: string;
    internalName: string;
    description: string;
  }) => void;
  onCancel: () => void;
  isRootRole?: boolean;
  isDisabled?: boolean;
}

/** API imperativa do formulário de permissão (submit externo). */
export interface PermissionFormRef {
  submit: () => void;
}

/**
 * Formulário de criação e edição de permissões RBAC.
 */
export const PermissionForm = forwardRef<PermissionFormRef, PermissionFormProps>(
  ({ permission, parentPermission, contextProductName, onSubmit, onCancel, isRootRole, isDisabled }, ref) => {
    const [name, setName] = useState(permission?.name || "");
    const [internalName, setInternalName] = useState(permission?.internalName || "");
    const [description, setDescription] = useState(permission?.description || "");
    const [errors, setErrors] = useState<{
      name?: string;
      internalName?: string;
      description?: string;
    }>({});

    useEffect(() => {
      if (permission) {
        setName(permission.name);
        setInternalName(permission.internalName);
        setDescription(permission.description);
      } else {
        setName("");
        setInternalName("");
        setDescription("");
      }
    }, [permission]);

    const isEditing = Boolean(permission);
    const showInternalName = true;
    const isInternalNameReadOnly = isEditing;

    const validate = () => {
      const newErrors: typeof errors = {};

      if (!name.trim()) {
        newErrors.name = "Nome é obrigatório";
      }

      if (showInternalName && !isInternalNameReadOnly && !internalName.trim()) {
        newErrors.internalName = "Nome interno é obrigatório";
      }

      if (!description.trim()) {
        newErrors.description = "Descrição é obrigatória";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
      if (validate()) {
        onSubmit({
          name: name.trim(),
          internalName: internalName.trim(),
          description: description.trim(),
        });
      }
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
    }));

    const inputClassNames = {
      ...defaultInputClassNames,
      label: `${defaultInputClassNames.label} mb-2`,
    };

    return (
      <div className="flex flex-col gap-4">
        {parentPermission && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Cadastrando em</p>
            <p className="text-base font-semibold text-gray-900">{parentPermission.name}</p>
          </div>
        )}

        {!parentPermission && contextProductName && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Cadastrando em</p>
            <p className="text-base font-semibold text-gray-900">{contextProductName}</p>
          </div>
        )}

        <Input
          label="Nome"
          labelPlacement="outside"
          placeholder="Digite o nome da permissão"
          value={name}
          onValueChange={setName}
          isRequired
          isInvalid={Boolean(errors.name)}
          errorMessage={errors.name}
          classNames={inputClassNames}
          isDisabled={isDisabled}
        />

        {showInternalName && (
          <Input
            label="Nome interno"
            labelPlacement="outside"
            placeholder="Digite o nome interno (ex: safe_partner.overview)"
            value={internalName}
            onValueChange={setInternalName}
            isRequired={!isInternalNameReadOnly}
            isInvalid={Boolean(errors.internalName)}
            errorMessage={errors.internalName}
            classNames={inputClassNames}
            isDisabled={isDisabled || isInternalNameReadOnly}
            description={
              isInternalNameReadOnly
                ? "O nome interno não pode ser alterado após o cadastro."
                : undefined
            }
          />
        )}

        <Input
          label="Descrição"
          labelPlacement="outside"
          placeholder="Digite a descrição da permissão"
          value={description}
          onValueChange={setDescription}
          isRequired
          isInvalid={Boolean(errors.description)}
          errorMessage={errors.description}
          classNames={inputClassNames}
          isDisabled={isDisabled}
        />
      </div>
    );
  },
);

PermissionForm.displayName = "PermissionForm";
