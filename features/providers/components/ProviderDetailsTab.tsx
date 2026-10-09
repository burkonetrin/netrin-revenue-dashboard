"use client";

import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import { Button, Tooltip } from "@heroui/react";
import { Info } from "lucide-react";
import { useMemo } from "react";
import type {
  GetDirectProviderResponse,
  GetIndirectProviderResponse,
  ProviderDetail,
} from "../types/providers.types";
import {
  type DirectDetailRow,
  type IndirectDetailRow,
  buildDirectDetailRows,
  buildIndirectDetailRows,
  formatMultiItemCellLabel,
  getIndirectServiceText,
  getMultiItemTooltipNames,
} from "../utils/providerDetail.utils";
import { providerTableClassNames } from "../utils/providersTableColumns.shared";

export interface ProviderDetailsTabProps {
  provider: ProviderDetail;
  onEdit: () => void;
}

function MultiItemCell({
  items,
  unit,
}: {
  items: { id: string; name: string }[];
  unit: "fornecedor" | "fonte";
}) {
  const label = formatMultiItemCellLabel(items, unit);
  if (items.length <= 1) {
    return <span>{label}</span>;
  }
  const names = getMultiItemTooltipNames(items);
  return (
    <div className="flex items-center gap-2">
      <span>{label}</span>
      <Tooltip
        placement="left"
        showArrow
        content={
          <ul className="flex flex-col gap-1 py-0.5 text-left">
            {items.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        }
      >
        <span
          className="inline-flex text-primary cursor-default"
          aria-label={names.join(", ")}
        >
          <Info size={18} />
        </span>
      </Tooltip>
    </div>
  );
}

/**
 * Aba Detalhes — Variantes 1 (direto) e 2 (indireto).
 */
export function ProviderDetailsTab({ provider, onEdit }: ProviderDetailsTabProps) {
  const isDirect = provider.providerType.value === "direct";
  const directProvider = isDirect ? (provider as GetDirectProviderResponse) : null;
  const indirectProvider = !isDirect ? (provider as GetIndirectProviderResponse) : null;

  const directColumns = useMemo<ColumnConfig<DirectDetailRow>[]>(
    () => [
      {
        id: "sourceName",
        label: "Fontes fornecidas",
        render: (value) => String(value),
      },
      {
        id: "defaultCostLabel",
        label: "Custo padrão da fonte (R$)",
        render: (value) => String(value),
      },
      {
        id: "indirectProviders",
        label: "Fornecedores indiretos para a fonte",
        render: (_, row) => <MultiItemCell items={row.indirectProviders} unit="fornecedor" />,
      },
    ],
    [],
  );

  const indirectColumns = useMemo<ColumnConfig<IndirectDetailRow>[]>(
    () => [
      {
        id: "directProviderName",
        label: "Fornecedores diretos vinculados",
        render: (value) => String(value),
      },
      {
        id: "sources",
        label: "Fontes que utilizam o serviço",
        render: (_, row) => <MultiItemCell items={row.sources} unit="fonte" />,
      },
    ],
    [],
  );

  const directRows = directProvider ? buildDirectDetailRows(directProvider) : [];
  const indirectRows = indirectProvider ? buildIndirectDetailRows(indirectProvider) : [];
  const serviceText = indirectProvider ? getIndirectServiceText(indirectProvider.description) : "";

  return (
    <div className="space-y-6">
      <Button color="primary" radius="sm" onPress={onEdit}>
        Editar detalhes
      </Button>

      {!isDirect && (
        <div className="space-y-1">
          <h3 className="text-base font-medium text-default-600">Serviço</h3>
          <p className="text-sm text-foreground">{serviceText || "—"}</p>
        </div>
      )}

      {isDirect ? (
        <DynamicTable
          columns={directColumns}
          data={directRows}
          keyExtractor={(row) => row.sourceId}
          emptyMessage="Nenhuma fonte vinculada"
          classNames={providerTableClassNames}
        />
      ) : (
        <DynamicTable
          columns={indirectColumns}
          data={indirectRows}
          keyExtractor={(row) => row.directProviderId}
          emptyMessage="Nenhum fornecedor direto vinculado"
          classNames={providerTableClassNames}
        />
      )}
    </div>
  );
}
