"use client";

import { Button } from "@heroui/react";

interface SupportToolsFiltersDrawerFooterProps {
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
}

/** Rodapé dos filtros das ferramentas de suporte (Cancelar / Limpar / Aplicar). */
export function SupportToolsFiltersDrawerFooter({
  onClose,
  onClear,
  onApply,
}: SupportToolsFiltersDrawerFooterProps) {
  return (
    <div className="flex w-full gap-2.5">
      <Button variant="light" onPress={onClose} className="h-10 flex-1 border border-gray-300">
        Cancelar
      </Button>
      <Button variant="light" onPress={onClear} className="h-10 flex-1 border border-gray-300">
        Limpar filtros
      </Button>
      <Button color="primary" onPress={onApply} className="h-10 flex-1">
        Aplicar filtros
      </Button>
    </div>
  );
}
