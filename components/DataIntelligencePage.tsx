"use client";

import { BankValidationDadosBancariosPanel } from "@/features/bank-validation/components/BankValidationDadosBancariosPanel";
import { BannedBettorsTab } from "@/features/banned-bettors/components/BannedBettorsTab";
import { PageTitle } from "@/shared/components/PageTitle";
import { DataSourcesIcon } from "@/shared/components/sidebar/icons";
import { nucleusPrivatePageShellSpaceY6Class } from "@/shared/styles/prototypePageShell";
import { Tab, Tabs } from "@heroui/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function getCurrentReferenceMonth() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

type DataIntelligenceTabKey = "dados-bancarios" | "impedidos-apostar";

/**
 * Inteligência de dados — dados bancários e impedidos de apostar (branch 14640).
 */
export function DataIntelligencePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const initialTab: DataIntelligenceTabKey =
    tabFromUrl === "impedidos-apostar" ? "impedidos-apostar" : "dados-bancarios";

  const [selectedTab, setSelectedTab] = useState<DataIntelligenceTabKey>(initialTab);
  const [referenceMonth, setReferenceMonth] = useState(getCurrentReferenceMonth);

  useEffect(() => {
    if (tabFromUrl === "impedidos-apostar" || tabFromUrl === "dados-bancarios") {
      setSelectedTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  return (
    <div className={nucleusPrivatePageShellSpaceY6Class}>
      <PageTitle icon={<DataSourcesIcon color="currentColor" />} label="Inteligência de dados" />

      <div className="mt-6">
        <Tabs
          aria-label="Inteligência de dados tabs"
          selectedKey={selectedTab}
          onSelectionChange={(key) => {
            const next = String(key) as DataIntelligenceTabKey;
            setSelectedTab(next);
            if (next === "impedidos-apostar") {
              setSearchParams({ tab: next });
            } else {
              setSearchParams({});
            }
          }}
          classNames={{
            base: "w-full",
            tabList: "gap-6 w-fit relative rounded-lg bg-gray-100 p-1",
            cursor: "bg-primary",
            tab: "max-w-fit px-4 py-2 h-10",
            tabContent: "group-data-[selected=true]:text-white",
          }}
        >
          <Tab key="dados-bancarios" title="Dados bancários" />
          <Tab key="impedidos-apostar" title="Impedidos de apostar" />
        </Tabs>
      </div>

      <div className="mt-8">
        {selectedTab === "dados-bancarios" ? (
          <div className="space-y-8 pb-8" aria-label="Dados bancários">
            <BankValidationDadosBancariosPanel
              referenceMonth={referenceMonth}
              onReferenceMonthChange={setReferenceMonth}
            />
          </div>
        ) : (
          <div aria-label="Impedidos de apostar">
            <BannedBettorsTab />
          </div>
        )}
      </div>
    </div>
  );
}
