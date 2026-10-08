"use client";

import type { ReactNode } from "react";

interface CompetenceWithActiveClientsProps {
  competenceLabel: ReactNode;
  activeClientCount: number;
  /** Ex.: `Período:` antes da competência (aba dashboard). */
  competencePrefix?: ReactNode;
  className?: string;
}

function capitalizeCompetenceLabel(label: ReactNode): ReactNode {
  if (typeof label !== "string" || label.length === 0) return label;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function CompetenceWithActiveClients({
  competenceLabel,
  activeClientCount,
  competencePrefix,
  className = "",
}: CompetenceWithActiveClientsProps) {
  const formattedCompetence = capitalizeCompetenceLabel(competenceLabel);

  return (
    <h6
      className={`m-0 flex flex-wrap items-center gap-3 text-sm font-normal text-default-600 ${className}`.trim()}
    >
      <span>
        {competencePrefix ? (
          <>
            {competencePrefix}{" "}
          </>
        ) : null}
        {formattedCompetence}
      </span>
      <span className="h-4 w-px shrink-0 bg-default-200" aria-hidden />
      <span>{activeClientCount} clientes ativos</span>
    </h6>
  );
}
