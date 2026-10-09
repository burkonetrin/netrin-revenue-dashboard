"use client";

/**
 * Formulário principal de fonte de dados com abas Sobre e Provider.
 */

import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { AboutSourceForm } from "./AboutSourceForm";
import { ProviderSourceForm } from "./ProviderSourceForm";
import type { SourceFormProps } from "@/features/sources/types/sources.types";

/**
 * Formulário com abas para cadastro e edição de fonte de dados.
 */
export function SourceForm({ formData, onFormDataChange }: SourceFormProps) {
  const [selectedTab, setSelectedTab] = useState<string>("about");

  const handleSelectionChange = (key: React.Key) => {
    setSelectedTab(String(key));
  };

  return (
    <div className="w-full">
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={handleSelectionChange}
        classNames={{
          base: "w-fit",
          tabList: "gap-6 w-fit relative rounded-lg bg-gray-100 p-1",
          cursor: "bg-primary",
          tab: "max-w-fit px-4 py-2 h-10",
          tabContent: "group-data-[selected=true]:text-white",
        }}
      >
        <Tab key="about" title="Sobre">
          <AboutSourceForm
            formData={formData}
            onFormDataChange={onFormDataChange}
          />
        </Tab>
        <Tab key="provider" title="Provider">
          <ProviderSourceForm
            formData={formData}
            onFormDataChange={onFormDataChange}
          />
        </Tab>
      </Tabs>
    </div>
  );
}
