"use client";

import type { ReactNode } from "react";

interface CompetenceWithActiveClientsProps {
  competenceLabel: ReactNode;
  activeClientCount: number;
  /** Ex.: `Competência:` antes do mês de referência. */
  competencePrefix?: ReactNode;
  className?: string;
  /** Estilo de subtítulo abaixo das abas do painel. */
  variant?: "default" | "subtitle";
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
  variant = "default",
}: CompetenceWithActiveClientsProps) {
  const formattedCompetence = capitalizeCompetenceLabel(competenceLabel);
  const Tag = variant === "subtitle" ? "h4" : "h6";
  const variantClassName =
    variant === "subtitle"
      ? "text-lg font-medium leading-snug text-gray-600 whitespace-nowrap"
      : "text-sm font-normal text-default-600";

  return (
    <Tag
      className={`m-0 flex flex-wrap items-center gap-3 ${variantClassName} ${className}`.trim()}
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
    </Tag>
  );
}
