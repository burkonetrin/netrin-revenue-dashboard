"use client";

import { PageTitle } from "@/shared/components/PageTitle";
import { SettingsIcon } from "@/shared/components/sidebar/icons";
import { Tab, Tabs } from "@heroui/react";
import { useState } from "react";
import { BillingBankTransactionsTab } from "./BillingBankTransactionsTab";
import { BillingRequestConsultationsTab } from "./BillingRequestConsultationsTab";

const PAGE_SHELL_CLASS =
  "relative min-h-full space-y-6 bg-white -m-6 md:-m-8 w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] max-w-none p-6 md:p-8";

type SupportToolsTabKey = "requests" | "bank-transactions";

export function BillingSupportToolsPage() {
  const [activeTab, setActiveTab] = useState<SupportToolsTabKey>("requests");

  return (
    <div className={PAGE_SHELL_CLASS}>
      <PageTitle icon={<SettingsIcon color="currentColor" />} label="Ferramentas de suporte" />

      <Tabs
        aria-label="Ferramentas de suporte"
        selectedKey={activeTab}
        onSelectionChange={(key) => {
          const next = String(key);
          if (next === "requests" || next === "bank-transactions") {
            setActiveTab(next);
          }
        }}
        classNames={{
          base: "w-full",
          tabList: "gap-6 w-fit relative rounded-lg bg-gray-100 p-1",
          cursor: "bg-primary",
          tab: "max-w-fit px-4 py-2 h-10",
          tabContent: "group-data-[selected=true]:text-white",
          panel: "py-3 px-0",
        }}
      >
        <Tab key="requests" title="Consultas de requisições">
          <BillingRequestConsultationsTab />
        </Tab>
        <Tab key="bank-transactions" title="Transações bancárias">
          <BillingBankTransactionsTab />
        </Tab>
      </Tabs>
    </div>
  );
}
