"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { Button } from "@heroui/react";
import { ChevronRight, GripVertical } from "lucide-react";
import type { CostManagementHierarchyLevel } from "../types/costManagement.types";

const labels: Record<CostManagementHierarchyLevel, string> = {
  client: "Clientes",
  product: "Produtos",
  deductible: "Franquias",
  data_source: "Fontes",
  provider: "Fornecedores",
};

interface HierarchyOrderEditorProps {
  value: CostManagementHierarchyLevel[];
  onChange: (next: CostManagementHierarchyLevel[]) => void;
  onGenerate: () => void;
}

export function reorderHierarchy(
  value: CostManagementHierarchyLevel[],
  fromIndex: number,
  toIndex: number,
) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= value.length ||
    toIndex >= value.length
  )
    return value;
  const next = [...value];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function HierarchyOrderEditor({ value, onChange, onGenerate }: HierarchyOrderEditorProps) {
  return (
    <section aria-label="Ordem de visualização" className="space-y-3">
      <p className="text-sm text-default-600">Ordem de visualização</p>
      <DragDropProvider
        onDragEnd={({ canceled, operation }) => {
          if (canceled || !isSortable(operation.source)) return;
          const next = reorderHierarchy(
            value,
            operation.source.initialIndex,
            operation.source.index,
          );
          if (next !== value) onChange(next);
        }}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {value.map((level, index) => (
            <SortablePill key={level} level={level} index={index} />
          ))}
          <Button color="primary" className="ml-1 h-10 text-sm" onPress={onGenerate}>
            Gerar visualização
          </Button>
        </div>
      </DragDropProvider>
    </section>
  );
}

function SortablePill({ level, index }: { level: CostManagementHierarchyLevel; index: number }) {
  const { handleRef, isDragging, ref } = useSortable({
    id: level,
    index,
    group: "financial-hierarchy",
    transition: { duration: 120, easing: "cubic-bezier(0.2, 0, 0, 1)" },
  });

  return (
    <div ref={ref} className="flex items-center gap-1.5" data-dragging={isDragging || undefined}>
      <div
        className={`flex h-10 items-center gap-1.5 rounded-lg bg-white px-2 text-sm transition-opacity duration-100 will-change-transform ${isDragging ? "opacity-60 ring-2 ring-primary shadow-lg" : ""}`}
        style={{
          boxShadow: isDragging
            ? undefined
            : "0 1px 1.5px rgba(0, 0, 0, 0.1), 0 1px 1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <button
          ref={handleRef}
          type="button"
          aria-label={`Mover ${labels[level]}`}
          className="cursor-grab touch-none rounded-sm text-default-500 outline-none transition-colors hover:text-primary active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-primary"
          title={`Arrastar ${labels[level]}`}
        >
          <GripVertical size={14} aria-hidden />
        </button>
        <span>{labels[level]}</span>
      </div>
      {index < 4 ? <ChevronRight size={17} className="text-default-400" aria-hidden /> : null}
    </div>
  );
}
