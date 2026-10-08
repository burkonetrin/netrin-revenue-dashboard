"use client";

import { Button } from "@heroui/react";
import { Download, Funnel, X } from "lucide-react";

interface SupportToolsFiltersToolbarProps {
  hasFilters: boolean;
  onOpenFilters: () => void;
  onClearFilters: () => void;
  onExportCsv?: () => void;
}

export function SupportToolsFiltersToolbar({
  hasFilters,
  onOpenFilters,
  onClearFilters,
  onExportCsv,
}: SupportToolsFiltersToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
    <div
      className={`flex w-fit items-center rounded-lg ${
        hasFilters ? "bg-primary-600" : "bg-transparent"
      }`}
    >
      <Button
        startContent={<Funnel size={18} className={hasFilters ? "text-white" : "text-gray-400"} />}
        radius="sm"
        variant={hasFilters ? "solid" : "bordered"}
        color={hasFilters ? "primary" : "default"}
        onPress={onOpenFilters}
        className={hasFilters ? "text-white" : ""}
      >
        {hasFilters ? "Filtros ativos" : "Filtros"}
      </Button>
      {hasFilters ? (
        <>
          <div className="h-6 w-px bg-white/70" />
          <Button
            isIconOnly
            size="sm"
            color="primary"
            aria-label="Limpar filtros"
            className="min-w-0 text-white"
            onPress={onClearFilters}
          >
            <X size={20} />
          </Button>
        </>
      ) : null}
    </div>
    {onExportCsv ? (
      <Button
        variant="bordered"
        radius="sm"
        startContent={<Download size={18} className="text-gray-400" />}
        onPress={onExportCsv}
      >
        Exportar CSV
      </Button>
    ) : null}
    </div>
  );
}
