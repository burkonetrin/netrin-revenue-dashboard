"use client";

/**
 * Listagem em accordion de permissões RBAC por tipo de produto.
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PermissionRow } from "./PermissionRow";
import type {
  PermissionWithChildren,
  PermissionType,
} from "../types/permission.types";

interface PermissionsListProps {
  permissions: PermissionWithChildren[];
  type: PermissionType;
  onCreateChild: (permission: PermissionWithChildren) => void;
  onEdit: (permission: PermissionWithChildren) => void;
  onDelete: (permission: PermissionWithChildren) => void;
  onViewLinkedClients: (permission: PermissionWithChildren) => void;
}

/**
 * Item de accordion recursivo para permissões aninhadas.
 */
function CustomAccordionItem({
  permission,
  level,
  onCreateChild,
  onEdit,
  onDelete,
  onViewLinkedClients,
  renderPermissionRecursive,
}: {
  permission: PermissionWithChildren;
  level: number;
  onCreateChild: (permission: PermissionWithChildren) => void;
  onEdit: (permission: PermissionWithChildren) => void;
  onDelete: (permission: PermissionWithChildren) => void;
  onViewLinkedClients: (permission: PermissionWithChildren) => void;
  renderPermissionRecursive: (
    permission: PermissionWithChildren,
    level: number,
    onCreateChild: (permission: PermissionWithChildren) => void,
    onEdit: (permission: PermissionWithChildren) => void,
    onDelete: (permission: PermissionWithChildren) => void,
    onViewLinkedClients: (permission: PermissionWithChildren) => void
  ) => React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren =
    permission.children && permission.children.length > 0;

  return (
    <div className={isExpanded ? "" : "border-b border-gray-200"}>
      {/* Header com borda que se estende até o chevron */}
      <div className="flex items-center w-full">
        <div className="flex-1 min-w-0">
          <PermissionRow
            permission={permission}
            level={level}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
            onCreateChild={() => onCreateChild(permission)}
            onEdit={() => onEdit(permission)}
            onDelete={() => onDelete(permission)}
            onViewLinkedClients={() => onViewLinkedClients(permission)}
            isInsideAccordion={true}
          />
        </div>
        {/* Chevron à direita, dentro da borda */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center w-10 h-full px-4 text-gray-400 hover:bg-gray-50 transition-all shrink-0"
          aria-label={isExpanded ? "Recolher" : "Expandir"}
          aria-expanded={isExpanded}
        >
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Conteúdo expandido */}
      {isExpanded && (
        <>
          <div className="pl-8 pr-4 pb-4">
            {hasChildren ? (
              permission.children?.map((child) =>
                renderPermissionRecursive(
                  child,
                  level + 1,
                  onCreateChild,
                  onEdit,
                  onDelete,
                  onViewLinkedClients
                )
              )
            ) : (
              <div className="py-4 text-center text-gray-500 text-sm">
                Essa permissão não possuí permissões filhas!
              </div>
            )}
          </div>
          {/* Borda que se estende de fora a fora quando expandido */}
          <div className="border-b border-gray-200 w-full h-px"></div>
        </>
      )}
    </div>
  );
}

function renderPermissionRecursive(
  permission: PermissionWithChildren,
  level: number,
  onCreateChild: (permission: PermissionWithChildren) => void,
  onEdit: (permission: PermissionWithChildren) => void,
  onDelete: (permission: PermissionWithChildren) => void,
  onViewLinkedClients: (permission: PermissionWithChildren) => void
): React.ReactNode {
  return (
    <CustomAccordionItem
      key={permission.id}
      permission={permission}
      level={level}
      onCreateChild={onCreateChild}
      onEdit={onEdit}
      onDelete={onDelete}
      onViewLinkedClients={onViewLinkedClients}
      renderPermissionRecursive={renderPermissionRecursive}
    />
  );
}

/**
 * Lista hierárquica de permissões RBAC com accordion customizado.
 *
 * Legado Wave 2: exportado no barrel, mas sem uso em runtime na página ativa
 * (`PermissionsByProductList` + `ListRBACPermissions`). Mantido como N/A dead code —
 * não aplicar refatoração nesta Task.
 */
export function PermissionsList({
  permissions,
  onCreateChild,
  onEdit,
  onDelete,
  onViewLinkedClients,
}: PermissionsListProps) {
  if (permissions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Nenhuma permissão cadastrada
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {permissions.map((permission) =>
        renderPermissionRecursive(
          permission,
          0,
          onCreateChild,
          onEdit,
          onDelete,
          onViewLinkedClients
        )
      )}
    </div>
  );
}
