"use client";

import { Button, Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Info, MoreVertical, Plus } from "lucide-react";
import type { PermissionWithChildren } from "../types/permission.types";
import { getLastPartOfInternalName } from "../utils/permissionInternalName.utils";

interface PermissionRowProps {
  permission: PermissionWithChildren;
  level: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCreateChild: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewLinkedClients: () => void;
  isInsideAccordion?: boolean;
}

function PermissionRowDropdownMenu({
  onEdit,
  onDelete,
  onViewLinkedClients,
}: Pick<PermissionRowProps, "onEdit" | "onDelete" | "onViewLinkedClients">) {
  return (
    <DropdownMenu aria-label="Ações da permissão">
      <DropdownItem key="edit" onPress={onEdit}>
        Editar
      </DropdownItem>
      <DropdownItem key="delete" onPress={onDelete} className="text-danger" color="danger">
        Excluir
      </DropdownItem>
      <DropdownItem key="viewClients" onPress={onViewLinkedClients}>
        Ver clientes vinculados
      </DropdownItem>
    </DropdownMenu>
  );
}

/**
 * Linha da árvore de permissões RBAC com ações de edição e expansão.
 *
 * Legado Wave 2: usado apenas por `PermissionsList` (dead code em runtime).
 * Sem `PermissionGuard` — N/A enquanto o caminho ativo for `ListRBACPermissions`.
 */
export function PermissionRow({
  permission,
  level,
  isExpanded: _isExpanded,
  onToggleExpand: _onToggleExpand,
  onCreateChild,
  onEdit,
  onDelete,
  onViewLinkedClients,
  isInsideAccordion = false,
}: PermissionRowProps) {
  const paddingLeft = level * 24;
  const lastPartOfInternalName = getLastPartOfInternalName(permission.internalName);

  const tooltipContent = (
    <div className="max-w-xs p-4">
      <p className="font-semibold mb-2">Nome interno:</p>
      <p className="text-sm mb-3">{lastPartOfInternalName}</p>
      <p className="font-semibold mb-2">Descrição:</p>
      <p className="text-sm">{permission.description}</p>
    </div>
  );

  const infoControl = isInsideAccordion ? (
    <div
      className="flex items-center justify-center size-6 text-blue-500 hover:text-blue-700 transition-colors cursor-pointer"
      aria-label="Informações da permissão"
      onClick={(e) => e.stopPropagation()}
    >
      <Info size={16} />
    </div>
  ) : (
    <button
      type="button"
      className="flex items-center justify-center size-6 text-blue-500 hover:text-blue-700 transition-colors"
      aria-label="Informações da permissão"
    >
      <Info size={16} />
    </button>
  );

  const createChildControl =
    level === 0 &&
    (isInsideAccordion ? (
      <div
        onClick={(e) => {
          e.stopPropagation();
          onCreateChild();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            onCreateChild();
          }
        }}
      >
        <Plus size={14} />
        <span>Cadastrar permissão filha</span>
      </div>
    ) : (
      <Button
        size="sm"
        variant="light"
        startContent={<Plus size={14} />}
        onPress={onCreateChild}
        className="text-xs"
      >
        Cadastrar permissão filha
      </Button>
    ));

  const dropdownTrigger = isInsideAccordion ? (
    <div
      className="flex items-center justify-center size-8 hover:bg-gray-100 rounded transition-colors cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label="Mais opções"
    >
      <MoreVertical size={16} className="text-gray-600" />
    </div>
  ) : (
    <Button isIconOnly size="sm" variant="light" aria-label="Mais opções">
      <MoreVertical size={16} className="text-gray-600" />
    </Button>
  );

  return (
    <div
      className={`flex items-center gap-3 py-3 hover:bg-gray-50 transition-colors ${isInsideAccordion ? "" : "border-b border-gray-200"}`}
      style={{
        paddingLeft: level === 0 ? "16px" : `${paddingLeft + 16}px`,
        paddingRight: "16px",
      }}
    >
      <Tooltip content={tooltipContent} placement="right">
        {infoControl}
      </Tooltip>

      <span className="flex-1 text-sm font-medium text-gray-900">{permission.name}</span>

      {createChildControl}

      {isInsideAccordion ? (
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown>
            <DropdownTrigger>{dropdownTrigger}</DropdownTrigger>
            <PermissionRowDropdownMenu
              onEdit={onEdit}
              onDelete={onDelete}
              onViewLinkedClients={onViewLinkedClients}
            />
          </Dropdown>
        </div>
      ) : (
        <Dropdown>
          <DropdownTrigger>{dropdownTrigger}</DropdownTrigger>
          <PermissionRowDropdownMenu
            onEdit={onEdit}
            onDelete={onDelete}
            onViewLinkedClients={onViewLinkedClients}
          />
        </Dropdown>
      )}
    </div>
  );
}
