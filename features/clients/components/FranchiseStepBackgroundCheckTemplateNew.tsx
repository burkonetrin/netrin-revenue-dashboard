"use client";

import {
  type BackgroundCheckTemplate,
  useListBackgroundCheckTemplates,
} from "@/features/background-check-templates";
import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import { Checkbox, Input, Select, SelectItem, Spinner } from "@heroui/react";
import { Search } from "lucide-react";
import { useState } from "react";

interface FranchiseStepBackgroundCheckTemplateNewProps {
  selectedTemplateIds: string[];
  onTemplateChange: (templateIds: string[]) => void;
  canListTemplates?: boolean;
}

function getConsultationTypeLabel(template: BackgroundCheckTemplate) {
  const consultationType = template.consultationType ?? template.consultation_type;
  if (consultationType && typeof consultationType === "object") return consultationType.label;
  return consultationType ?? template.queryType ?? template.query_type ?? "-";
}

/**
 * Passo de template de background check na nova franquia.
 */
export function FranchiseStepBackgroundCheckTemplateNew({
  selectedTemplateIds,
  onTemplateChange,
  canListTemplates = true,
}: FranchiseStepBackgroundCheckTemplateNewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [consultationType, setConsultationType] = useState("all");
  const { data, isLoading } = useListBackgroundCheckTemplates(
    {
      page: 1,
      pageSize: 20,
      search: searchTerm.trim() || null,
      consultationType: consultationType === "all" ? null : consultationType,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
    { enabled: canListTemplates },
  );

  const templates = canListTemplates ? (data?.data ?? []) : [];

  const toggleTemplate = (templateId: string, isSelected: boolean) => {
    const next = new Set(selectedTemplateIds);
    if (isSelected) next.add(templateId);
    else next.delete(templateId);
    onTemplateChange(Array.from(next));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-default-500">Modelo Background Check</h3>

      {!canListTemplates ? (
        <p className="text-sm text-default-500">
          Você não possui permissão para listar modelos de Background Check.
        </p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          placeholder="Pesquise por modelo"
          value={searchTerm}
          onValueChange={setSearchTerm}
          endContent={<Search size={18} className="text-default-400" />}
          classNames={defaultInputClassNames}
          isDisabled={!canListTemplates}
        />
        <Select
          selectedKeys={[consultationType]}
          onChange={(event) => setConsultationType(event.target.value || "all")}
          classNames={defaultInputClassNames}
          isDisabled={!canListTemplates}
        >
          <SelectItem key="all">Todos os tipos</SelectItem>
          <SelectItem key="br-person">Pessoa física (CPF)</SelectItem>
          <SelectItem key="br-entity">Pessoa jurídica (CNPJ)</SelectItem>
          <SelectItem key="intl-entity">Pessoa estrangeira</SelectItem>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <div className="border border-default-200 rounded-lg overflow-hidden">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              className="w-full text-left min-h-16 p-3 border-b border-default-200 last:border-b-0 flex items-start gap-3 hover:bg-default-50 cursor-pointer"
              onClick={() =>
                toggleTemplate(template.id, !selectedTemplateIds.includes(template.id))
              }
            >
              <Checkbox
                isSelected={selectedTemplateIds.includes(template.id)}
                onValueChange={(selected) => toggleTemplate(template.id, selected)}
                onClick={(event) => event.stopPropagation()}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-default-800 truncate">
                    {template.name}
                  </span>
                  <span className="text-xs text-default-500 whitespace-nowrap">
                    {getConsultationTypeLabel(template)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-default-500 line-clamp-2">
                  {template.description || "Sem descrição"}
                </p>
              </div>
            </button>
          ))}
          {templates.length === 0 && (
            <p className="p-4 text-center text-default-400 text-sm">
              Nenhum modelo Background Check encontrado
            </p>
          )}
        </div>
      )}
    </div>
  );
}
