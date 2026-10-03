"use client";



import { PROTOTYPE_BASE_PATH } from "@/constants";

import {

  BreadcrumbItem,

  Breadcrumbs,

  Tab,

  Tabs,

} from "@heroui/react";

import { useEffect, useState } from "react";

import { Link, useSearchParams } from "react-router-dom";

import {

  CLIENT_DETAIL_TABS,

  CLIENTS,

  type ClientDetailTabKey,

  type MockClient,

} from "../../clientesDashboardMockData";

import { ClientInfoHeader } from "./ClientInfoHeader";

import {

  ClientDetailAboutPanel,

  ClientDetailContactsPanel,

  ClientDetailContractsPanel,

  ClientDetailInvoicesPanel,

  ClientDetailPaymentInfoPanel,

  ClientDetailUsersPanel,

} from "./ClientDetailTabPanels";

import { PendingPaymentAlert } from "./PendingPaymentAlert";

import { UserFormDrawerMock } from "./UserFormDrawerMock";



const CLIENT_LIST_HREF = `${PROTOTYPE_BASE_PATH}?tab=clientes`;



const TAB_KEYS = new Set<string>(CLIENT_DETAIL_TABS.map((t) => t.key));



function parseTab(raw: string | null): ClientDetailTabKey {

  if (raw && TAB_KEYS.has(raw)) return raw as ClientDetailTabKey;

  return "sobre";

}



interface ClientDetailViewProps {

  clientId: string;

}



export function ClientDetailView({ clientId }: ClientDetailViewProps) {

  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = parseTab(searchParams.get("tab"));

  const [userDrawerOpen, setUserDrawerOpen] = useState(false);



  const client = CLIENTS.find((x) => x.id === clientId) as MockClient | undefined;



  useEffect(() => {

    const raw = searchParams.get("tab");

    if (raw && !TAB_KEYS.has(raw)) {

      setSearchParams({ tab: "sobre" }, { replace: true });

    }

  }, [searchParams, setSearchParams]);



  if (!client) {

    return (

      <div className="space-y-4 p-6">

        <Breadcrumbs className="mb-3">

          <BreadcrumbItem>

            <Link

              to={CLIENT_LIST_HREF}

              className="text-gray-400 hover:text-gray-600"

            >

              Clientes

            </Link>

          </BreadcrumbItem>

        </Breadcrumbs>

        <p className="text-sm text-zinc-600">Cliente não encontrado.</p>

        <Link to={CLIENT_LIST_HREF} className="text-primary text-sm">

          Voltar para a listagem

        </Link>

      </div>

    );

  }



  const setTab = (key: ClientDetailTabKey) => {

    setSearchParams({ tab: key }, { replace: true });

  };



  const showMissingPaymentAlert = client.pendingPaymentInfo === true;



  return (

    <div className="size-full p-6">

      <div>

        <Breadcrumbs className="mb-3">

          <BreadcrumbItem>

            <Link

              to={CLIENT_LIST_HREF}

              className="text-gray-400 hover:text-gray-600"

            >

              Clientes

            </Link>

          </BreadcrumbItem>

          <BreadcrumbItem>

            <span className="text-gray-900">Detalhes do cliente</span>

          </BreadcrumbItem>

        </Breadcrumbs>

        <ClientInfoHeader client={client} />

      </div>



      {showMissingPaymentAlert ? (

        <div className="mt-6">

          <PendingPaymentAlert visible />

        </div>

      ) : null}



      <div className="mt-6">

        <Tabs

          aria-label="Client details tabs"

          selectedKey={activeTab}

          onSelectionChange={(key) => {

            setTab(String(key) as ClientDetailTabKey);

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

          <Tab key="sobre" title="Sobre">

            <ClientDetailAboutPanel client={client} />

          </Tab>

          <Tab key="contratos" title="Contratos">

            <ClientDetailContractsPanel client={client} />

          </Tab>

          <Tab key="usuarios" title="Usuários">

            <ClientDetailUsersPanel

              clientId={client.id}

              onNewUser={() => setUserDrawerOpen(true)}

            />

          </Tab>

          <Tab key="contatos" title="Contatos do cliente">

            <ClientDetailContactsPanel />

          </Tab>

          <Tab key="faturas" title="Faturas">

            <ClientDetailInvoicesPanel />

          </Tab>

          <Tab key="informacoes-pagamento" title="Informações de pagamento">

            <ClientDetailPaymentInfoPanel />

          </Tab>

        </Tabs>

      </div>



      <UserFormDrawerMock

        isOpen={userDrawerOpen}

        onClose={() => setUserDrawerOpen(false)}

        defaultClientName={client.nome}

      />

    </div>

  );

}


