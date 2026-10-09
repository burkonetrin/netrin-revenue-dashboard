import { BackgroundCheckTemplatesTab } from "@/features/providers/components/BackgroundCheckTemplatesTab";
import { ProvidersTab } from "@/features/providers/components/ProvidersTab";
import { SourceGroupsTab } from "@/features/providers/components/SourceGroupsTab";
import { SourcesTab } from "@/features/providers/components/SourcesTab";
import { PageTitle } from "@/shared/components/PageTitle";
import { ProvidersIcon } from "@/shared/components/sidebar/icons";
import {
  nucleusPrivatePageShellSpaceY6Class,
  providersPageTabsClassNames,
} from "@/shared/styles/prototypePageShell";
import { Tab, Tabs } from "@heroui/react";

/** Shell Fontes e Fornecedores — 4 abas (protótipo). */
export function ProvidersAndSourcesPage() {
  return (
    <div className={nucleusPrivatePageShellSpaceY6Class}>
      <div className="flex flex-col gap-1">
        <PageTitle icon={<ProvidersIcon color="currentColor" />} label="Fontes e Fornecedores" />
      </div>

      <Tabs
        aria-label="Fontes e Fornecedores"
        color="primary"
        classNames={providersPageTabsClassNames}
      >
        <Tab key="providers" title="Fornecedores">
          <ProvidersTab />
        </Tab>
        <Tab key="sources" title="Fontes">
          <SourcesTab />
        </Tab>
        <Tab key="groups" title="Grupos de fontes">
          <SourceGroupsTab />
        </Tab>
        <Tab key="bgc-templates" title="Modelos Background Check">
          <BackgroundCheckTemplatesTab />
        </Tab>
      </Tabs>
    </div>
  );
}
