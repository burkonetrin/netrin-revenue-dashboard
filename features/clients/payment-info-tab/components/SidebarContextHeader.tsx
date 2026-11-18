"use client";

import type { PaymentOwner } from "../types/paymentInfoTab.types";

export interface SidebarContextHeaderProps {
  owner: PaymentOwner;
  /** Nome do contrato (owner contract / deductible). */
  contractName?: string;
  /** Nome da franquia (owner deductible). */
  franchiseName?: string;
  /** Nomes dos contratos do grupo (owner group). */
  groupContractNames?: string[];
  /** Disclaimer opcional (edição de grupo). */
  disclaimer?: string;
}

/**
 * Bloco contextual antes do form na sidebar (PAY-04).
 * Label e valor em linhas separadas (Figma 5841:86277 / 6168:83747).
 */
export function SidebarContextHeader({
  owner,
  contractName,
  franchiseName,
  groupContractNames = [],
  disclaimer,
}: SidebarContextHeaderProps) {
  return (
    <div className="space-y-5" data-testid="sidebar-context-header">
      {owner.type === "client" && (
        <div className="flex flex-col gap-1" data-testid="sidebar-context-client">
          <p className="text-sm font-normal leading-6 text-default-500">Cliente</p>
          <p className="text-sm font-normal leading-6 text-black">Nota única do cliente</p>
        </div>
      )}

      {owner.type === "contract" && (
        <div className="flex flex-col gap-1" data-testid="sidebar-context-contract">
          <p className="text-sm font-normal leading-6 text-default-500">Contrato</p>
          <p className="text-sm font-normal leading-6 text-black">
            {contractName ?? owner.contractId}
          </p>
        </div>
      )}

      {owner.type === "deductible" && (
        <div className="flex flex-col gap-5" data-testid="sidebar-context-franchise">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-normal leading-6 text-default-500">Contrato</p>
            <p className="text-sm font-normal leading-6 text-black">
              {contractName ?? owner.contractId}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-normal leading-6 text-default-500">Franquia</p>
            <p className="text-sm font-normal leading-6 text-black">
              {franchiseName ?? owner.deductibleId}
            </p>
          </div>
        </div>
      )}

      {owner.type === "group" && (
        <div className="flex flex-col gap-1" data-testid="sidebar-context-group">
          {disclaimer ? (
            <p
              className="mb-3 text-sm font-normal leading-6 text-amber-700"
              data-testid="sidebar-context-disclaimer"
            >
              {disclaimer}
            </p>
          ) : null}
          <p className="text-sm font-normal leading-6 text-default-500">Contratos do grupo</p>
          <ul className="flex flex-col gap-1">
            {groupContractNames.map((name) => (
              <li key={name} className="text-sm font-normal leading-6 text-black">
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
