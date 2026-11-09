"use client";

import { usePersonRestrictionSport } from "@/features/banned-bettors/hooks/usePersonRestrictionSport";
import {
  triggerPersonRestrictionSourceUpdate,
  updatePersonRestrictionSportPeriodicity,
} from "@/features/banned-bettors/services/personRestriction.service";
import type { PersonRestrictionSource } from "@/features/banned-bettors/types/person-restriction.types";
import { DATA_INTELLIGENCE_BASE_PATH } from "@/constants";
import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { BreadcrumbItem, Breadcrumbs, Button, Input } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { nucleusPrivatePageShellSpaceY6Class } from "@/shared/styles/prototypePageShell";

function formatBrDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

/**
 * Detalhe do esporte — impedidos de apostar.
 */
export function BannedBettorDetailPage() {
  const { sportId = "" } = useParams<{ sportId: string }>();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = usePersonRestrictionSport(sportId);
  const [days, setDays] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingSource, setUpdatingSource] = useState<string | null>(null);

  const columns: ColumnConfig<PersonRestrictionSource & { quantity: number }>[] = useMemo(
    () => [
      { id: "id", label: "ID", width: 60 },
      { id: "restrictionType", label: "Tipo de restrição" },
      { id: "quantity", label: "Quantidade" },
      {
        id: "siteName",
        label: "Fonte",
        render: (value, row) =>
          row.siteUrl ? (
            <a
              href={row.siteUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              {value}
            </a>
          ) : (
            value
          ),
      },
      {
        id: "action",
        label: "Ações",
        width: 140,
        render: (_, row) => (
          <button
            type="button"
            disabled={updatingSource === row.id}
            onClick={async () => {
              setUpdatingSource(row.id);
              try {
                await triggerPersonRestrictionSourceUpdate(sportId, row.id);
                await queryClient.invalidateQueries({
                  queryKey: ["person-restriction", "sports", sportId],
                });
              } finally {
                setUpdatingSource(null);
              }
            }}
            className="rounded-md border border-default-300 bg-white px-3 py-2 text-xs text-gray-900 hover:bg-default-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Atualizar fonte
          </button>
        ),
      },
    ],
    [sportId, updatingSource, queryClient],
  );

  if (isLoading) {
    return <div className={nucleusPrivatePageShellSpaceY6Class}>Carregando...</div>;
  }

  if (error || !data) {
    return (
      <div className={nucleusPrivatePageShellSpaceY6Class} role="alert">
        Não foi possível carregar os dados do esporte.
      </div>
    );
  }

  const date = (value: string | null) => (value ? formatBrDate(value) : "-");
  const rows = data.sources.map((source) => ({
    ...source,
    quantity:
      data.restrictions.find((item) => item.restrictionType === source.restrictionType)
        ?.quantity ?? 0,
  }));

  return (
    <div className={nucleusPrivatePageShellSpaceY6Class}>
      <Breadcrumbs>
        <BreadcrumbItem>
          <Link
            to={`${DATA_INTELLIGENCE_BASE_PATH}?tab=impedidos-apostar`}
            className="text-gray-400 hover:text-gray-600"
          >
            Impedidos de apostar
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem>{data.name}</BreadcrumbItem>
      </Breadcrumbs>
      <div className="flex items-end gap-3">
        <div className="grid basis-[60%] grid-cols-3 gap-3">
          {[
            ["Total de restrições", data.totalRestrictions.toLocaleString("pt-BR")],
            ["Última atualização", date(data.lastUpdate)],
            ["Próxima atualização", date(data.nextUpdate)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm text-gray-900">{value}</p>
            </div>
          ))}
        </div>
        <div className="flex basis-[40%] items-end gap-2 border-l border-primary-100 pl-4">
          <div className="flex flex-col gap-2">
            <span className="whitespace-nowrap text-xs text-gray-700">
              Atualização automática a cada (dias)
            </span>
            <div className="flex items-center gap-2">
              <Input
                aria-label="Dias para atualização automática"
                value={days || String(data.daysNextUpdate)}
                onValueChange={setDays}
                type="number"
                className="w-[220px]"
              />
              <Button
                variant="bordered"
                isLoading={saving}
                onPress={async () => {
                  setSaving(true);
                  try {
                    await updatePersonRestrictionSportPeriodicity(
                      sportId,
                      Number(days || data.daysNextUpdate),
                    );
                    await queryClient.invalidateQueries({
                      queryKey: ["person-restriction", "sports", sportId],
                    });
                    await queryClient.invalidateQueries({
                      queryKey: ["person-restriction", "sports"],
                    });
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </div>
      <DynamicTable
        columns={columns}
        data={rows}
        keyExtractor={(row) => row.id}
        classNames={{
          th: "bg-gray-50 text-gray-700 font-semibold text-xs",
          td: "text-gray-900 border-b border-gray-200 h-12 text-xs",
        }}
      />
    </div>
  );
}
