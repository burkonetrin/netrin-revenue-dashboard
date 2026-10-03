"use client";

import { DynamicTable } from "@/shared/components/DynamicTable";
import type { ColumnConfig } from "@/shared/components/DynamicTable/types";
import {
  buildBooleanStatusColumn,
  renderActiveStatusChip,
} from "@/shared/components/table/renderActiveStatusChip";
import { TableListFooter } from "@/shared/components/table/TableListFooter";
import {
  defaultInputClassNames,
  defaultSelectClassNames,
} from "@/shared/styles/inputClassNames";
import {
  Button,
  Chip,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Switch,
} from "@heroui/react";
import {
  Check,
  CirclePlus,
  Copy,
  Download,
  Eye,
  Pencil,
  RefreshCw,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  CONTRACTS_MOCK,
  MOCK_CLIENT_CONTACTS,
  MOCK_CLIENT_INVOICES,
  MOCK_CLIENT_USERS,
  type MockClient,
  type MockContract,
  type MockFranchise,
} from "../../clientesDashboardMockData";
import { fmtDetail } from "../../clientesDashboardMockFormat";
import { ClientDetailPaymentInfoMock } from "./ClientDetailPaymentInfoMock";
import { ClientPaginatedTableFooter } from "./ClientPaginatedTableFooter";
import { ClientTagsSectionMock } from "./ClientTagsSectionMock";

const TABLE_TH = "bg-gray-50 text-gray-700 font-semibold text-xs";
const TABLE_TD = "text-gray-900 border-b border-gray-200 h-12 text-xs";
const BILLING_TH = "bg-default-100 text-gray-500 font-semibold text-xs h-11";

function splitVigencia(vigencia: string): { start: string; end: string } {
  const parts = vigencia.split(" - ").map((p) => p.trim());
  return { start: parts[0] ?? "—", end: parts[1] ?? "—" };
}

function maskBrazilianPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return phone;
}

function formatCepMask(cep: string): string {
  const d = cep.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

type MockContractRow = {
  id: string;
  name: string;
  isActive: boolean;
  minimumValue: number | null;
  beginningTerm: string;
  endTerm: string;
  automaticRenovation: boolean;
};

type MockFranchiseRow = {
  id: string;
  name: string;
  isActive: boolean;
  isTest: boolean;
  billingModel: string;
  beginningTerm: string;
  endTerm: string;
  proofExpiration: number | null;
};

function mapContractRow(c: MockContract): MockContractRow {
  const { start, end } = splitVigencia(c.vigencia);
  return {
    id: c.id,
    name: c.name,
    isActive: c.ativo,
    minimumValue: c.minimo,
    beginningTerm: start,
    endTerm: end,
    automaticRenovation: c.renovacao,
  };
}

function mapFranchiseRow(f: MockFranchise): MockFranchiseRow {
  const { start, end } = splitVigencia(f.vigencia);
  return {
    id: f.id,
    name: f.name,
    isActive: f.ativo,
    isTest: false,
    billingModel: f.billingModelName ?? "—",
    beginningTerm: start,
    endTerm: end,
    proofExpiration: 30,
  };
}

function TokenPopover({ token }: { token?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!token) {
    return <span className="text-gray-400 text-xs">—</span>;
  }

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-end" showArrow>
      <PopoverTrigger>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Ver token"
        >
          <Eye size={20} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-80">
        <div className="px-1 py-2 w-full">
          <div className="text-small font-bold mb-2">Token</div>
          <div className="text-tiny mb-3 break-all">{token}</div>
          <Button
            size="sm"
            color="primary"
            startContent={copied ? <Check size={16} /> : <Copy size={16} />}
            className="w-full"
            onPress={() => {
              void navigator.clipboard.writeText(token);
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
                setIsOpen(false);
              }, 2000);
            }}
          >
            {copied ? "Copiado!" : "Copiar Token"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ContractFranchisesExpanded({
  contractId,
  clientId,
  showInactive,
}: {
  contractId: string;
  clientId: string;
  showInactive: boolean;
}) {
  const contract = CONTRACTS_MOCK.find((c) => c.id === contractId);
  const deductibles = useMemo(() => {
    const list = contract?.franchises ?? [];
    return list
      .filter((f) => showInactive || f.ativo)
      .map(mapFranchiseRow);
  }, [contract, showInactive]);

  const columns: ColumnConfig<MockFranchiseRow>[] = [
    {
      id: "name",
      label: "Franquia",
      render: (value) => (
        <button
          type="button"
          className="text-primary underline text-xs text-left inline-block font-medium"
        >
          {String(value)}
        </button>
      ),
    },
    buildBooleanStatusColumn<MockFranchiseRow>(),
    {
      id: "isTest",
      label: "Tipo",
      render: (value) => (
        <Chip size="sm" variant="flat" color="default">
          {value ? "Teste" : "Produção"}
        </Chip>
      ),
    },
    {
      id: "billingModel",
      label: "Modelo",
    },
    { id: "beginningTerm", label: "Início" },
    { id: "endTerm", label: "Fim" },
    {
      id: "proofExpiration",
      label: "Expiração comprovante (dias)",
      render: (v) => (v != null ? String(v) : "-"),
    },
    {
      id: "action",
      label: "",
      width: 100,
      render: () => (
        <div className="flex justify-end pr-2">
          <Button
            size="sm"
            variant="bordered"
            radius="sm"
            className="text-xs border-gray-300 text-gray-700 font-medium bg-white"
          >
            Renovar franquia
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="py-2 px-3 bg-white space-y-3">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="bordered">
          Nova franquia
        </Button>
      </div>
      {deductibles.length === 0 ? (
        <p className="text-sm text-default-500 py-4 m-0">
          Ainda não há franquias neste contrato
        </p>
      ) : (
        <DynamicTable
          columns={columns}
          data={deductibles}
          keyExtractor={(row) => row.id}
          emptyMessage="Nenhuma franquia encontrada"
          classNames={{
            wrapper: "shadow-none",
            th: "bg-default-100 text-gray-700 font-semibold text-xs",
            td: "text-gray-900 border-b border-gray-200 h-11 text-xs",
          }}
        />
      )}
      <span className="sr-only">{clientId}</span>
    </div>
  );
}

export function ClientDetailAboutPanel({ client }: { client: MockClient }) {
  const segment = client.produtos[0] ?? "";
  const fantasyName = client.nome.split(" ").slice(0, 2).join(" ");
  const [isActive, setIsActive] = useState(client.ativo);
  const [zipCode, setZipCode] = useState("01310100");

  return (
    <div className="mt-4">
      <div className="w-full bg-white rounded-lg">
        <form className="grid grid-cols-3 gap-4" onSubmit={(e) => e.preventDefault()}>
          <ClientTagsSectionMock />
          <div className="col-span-3 grid grid-cols-3 gap-4">
            <Switch
              isSelected={isActive}
              onValueChange={setIsActive}
              classNames={{ base: "self-end pb-2" }}
            >
              Ativo
            </Switch>
          </div>
          <Input
            label="Nome do cliente"
            labelPlacement="outside"
            defaultValue={client.nome}
            classNames={defaultInputClassNames}
          />
          <Input
            label="Nome fantasia"
            labelPlacement="outside"
            defaultValue={fantasyName}
            classNames={defaultInputClassNames}
          />
          <Input
            label="CNPJ"
            labelPlacement="outside"
            defaultValue={client.cnpj}
            isReadOnly
            isDisabled
            classNames={defaultInputClassNames}
          />
          <Input
            label="Segmento"
            labelPlacement="outside"
            defaultValue={segment}
            classNames={defaultInputClassNames}
          />
          <Input
            label="Tenant"
            labelPlacement="outside"
            defaultValue={`tenant-${client.id}`}
            isReadOnly
            isDisabled
            classNames={defaultInputClassNames}
          />
          <Input
            label="Arquivado"
            labelPlacement="outside"
            defaultValue="Não"
            isReadOnly
            isDisabled
            classNames={defaultInputClassNames}
          />
          <Input
            label="CEP"
            labelPlacement="outside"
            value={formatCepMask(zipCode)}
            onValueChange={(v) => setZipCode(v.replace(/\D/g, ""))}
            maxLength={9}
            classNames={defaultInputClassNames}
            endContent={
              <Button size="sm" variant="bordered" className="h-8 -mr-2 bg-default-100">
                Pesquisar CEP
              </Button>
            }
          />
          <Input
            label="Logradouro"
            labelPlacement="outside"
            defaultValue="Av. Paulista"
            isReadOnly
            isDisabled
            classNames={defaultInputClassNames}
          />
          <Input
            label="Número"
            labelPlacement="outside"
            defaultValue="1000"
            classNames={defaultInputClassNames}
          />
          <Input
            label="Complemento"
            labelPlacement="outside"
            defaultValue="Conj. 101"
            classNames={defaultInputClassNames}
          />
          <Input
            label="Bairro"
            labelPlacement="outside"
            defaultValue="Bela Vista"
            isReadOnly
            isDisabled
            classNames={defaultInputClassNames}
          />
          <Input
            label="Cidade"
            labelPlacement="outside"
            defaultValue="São Paulo"
            isReadOnly
            isDisabled
            classNames={defaultInputClassNames}
          />
          <Input
            label="UF"
            labelPlacement="outside"
            defaultValue="SP"
            isReadOnly
            isDisabled
            classNames={defaultInputClassNames}
          />
          <Select
            label="Situação de pagamento"
            labelPlacement="outside"
            aria-label="Situação de pagamento"
            placeholder="Selecione uma opção"
            defaultSelectedKeys={["up_to_date"]}
            classNames={defaultSelectClassNames}
          >
            <SelectItem key="up_to_date">Em dia</SelectItem>
            <SelectItem key="overdue">Inadimplente</SelectItem>
          </Select>
          <div className="col-span-3 flex justify-end gap-3 mt-4">
            <Button type="button" variant="bordered">
              Reconsultar CNPJ
            </Button>
            <Button color="primary" type="submit" startContent={<Save size={20} />}>
              Atualizar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ClientDetailContractsPanel({
  client,
}: {
  client: MockClient;
}) {
  const [page, setPage] = useState(1);
  const [expandedRowKeys, setExpandedRowKeys] = useState<Set<string | number>>(
    new Set(),
  );
  const [showInactiveContracts, setShowInactiveContracts] = useState(false);

  const contracts = useMemo(() => {
    const rows = CONTRACTS_MOCK.map(mapContractRow);
    if (showInactiveContracts) return rows;
    return rows.filter((c) => c.isActive);
  }, [showInactiveContracts]);

  const columns: ColumnConfig<MockContractRow>[] = [
    {
      id: "name",
      label: "Nome",
      sortable: true,
      width: 300,
      render: (value) => (
        <button
          type="button"
          className="text-primary font-medium hover:underline cursor-pointer text-left"
        >
          {String(value)}
        </button>
      ),
    },
    {
      id: "isActive",
      label: "Status",
      sortable: true,
      render: (value) => (
        <Chip
          size="sm"
          variant="flat"
          color={value === true ? "success" : "danger"}
          className={
            value === true ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }
        >
          {value === true ? "Ativo" : "Inativo"}
        </Chip>
      ),
    },
    {
      id: "minimumValue",
      label: "Valor mínimo do contrato",
      sortable: true,
      render: (value) =>
        value ? fmtDetail(Number(value)) : "R$ 0,00",
    },
    { id: "beginningTerm", label: "Inicio", sortable: true },
    { id: "endTerm", label: "Fim", sortable: true },
    {
      id: "automaticRenovation",
      label: "Renovação automatica",
      sortable: true,
      render: (value) => (
        <span className=" pl-10">{value === true ? "Sim" : "Não"}</span>
      ),
    },
  ];

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div>
        <Button
          startContent={<CirclePlus size={20} className="shrink-0" />}
          radius="sm"
          color="primary"
          className="px-8"
        >
          Novo contrato
        </Button>
      </div>
      <div>
        <Switch
          isSelected={showInactiveContracts}
          size="sm"
          onValueChange={setShowInactiveContracts}
        >
          Exibir contratos e franquias inativos
        </Switch>
      </div>
      <DynamicTable
        columns={columns}
        data={contracts}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhum contrato e franquia encontrado"
        expandable
        expandColumnLabel="Franquias"
        expandedRowKeys={expandedRowKeys}
        onExpandedChange={(key, isExpanded) => {
          setExpandedRowKeys((prev) => {
            const next = new Set(prev);
            if (isExpanded) next.add(key);
            else next.delete(key);
            return next;
          });
        }}
        expandedContent={(row) => (
          <ContractFranchisesExpanded
            contractId={row.id}
            clientId={client.id}
            showInactive={showInactiveContracts}
          />
        )}
        classNames={{
          th: "bg-default-100 text-gray-700 font-semibold text-xs",
          td: TABLE_TD,
        }}
      />
      <TableListFooter
        shownCount={contracts.length}
        totalCount={contracts.length}
        entityLabel="contratos"
        page={page}
        totalPages={1}
        onPageChange={setPage}
      />
    </div>
  );
}

export function ClientDetailUsersPanel({
  clientId,
  onNewUser,
}: {
  clientId: string;
  onNewUser?: () => void;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const users = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MOCK_CLIENT_USERS;
    return MOCK_CLIENT_USERS.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q),
    );
  }, [search]);

  const columns: ColumnConfig<(typeof MOCK_CLIENT_USERS)[0]>[] = [
    {
      id: "fullName",
      label: "Nome",
      sortable: true,
      render: (value) => (
        <span className="text-primary hover:underline font-medium cursor-pointer">
          {String(value)}
        </span>
      ),
    },
    { id: "email", label: "Email", sortable: true },
    { id: "username", label: "Usuário", sortable: true },
    {
      id: "token",
      label: "Token",
      align: "center",
      render: (_v, row) => (
        <div className="flex justify-center">
          <TokenPopover token={row.token} />
        </div>
      ),
    },
    {
      id: "isActive",
      label: "Status",
      sortable: true,
      render: (value) =>
        renderActiveStatusChip(Boolean(value), { active: "ativo", inactive: "inativo" }),
    },
    {
      id: "action",
      label: "Ações",
      width: 50,
      render: () => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-primary hover:text-primary-600 cursor-pointer"
            aria-label="Editar"
          >
            <Pencil size={20} />
          </button>
          <button
            type="button"
            className="text-red-500 hover:text-red-700 cursor-pointer"
            aria-label="Excluir usuário"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-4">
      <div className="mb-5">
        <Button
          startContent={<CirclePlus size={20} className="shrink-0" />}
          radius="sm"
          color="primary"
          onPress={onNewUser}
          className="px-8"
        >
          Novo Usuário
        </Button>
        <Input
          aria-label="Buscar usuários"
          placeholder="Buscar usuários..."
          value={search}
          onValueChange={setSearch}
          className="mt-4 max-w-md"
          classNames={defaultInputClassNames}
          startContent={<Search className="text-gray-400" size={20} />}
        />
      </div>
      <DynamicTable
        columns={columns}
        data={users}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhum usuário encontrado"
        classNames={{ th: TABLE_TH, td: TABLE_TD }}
      />
      <ClientPaginatedTableFooter
        visibleCount={users.length}
        pagination={{ totalRecords: users.length, totalPages: 1 }}
        entityLabel="usuários"
        page={page}
        onPageChange={setPage}
      />
      <span className="sr-only">{clientId}</span>
    </div>
  );
}

export function ClientDetailContactsPanel() {
  const [page, setPage] = useState(1);
  const columns: ColumnConfig<(typeof MOCK_CLIENT_CONTACTS)[0]>[] = [
    { id: "name", label: "Nome", sortable: true },
    { id: "email", label: "E-mail", sortable: true },
    {
      id: "phone",
      label: "Telefone",
      sortable: true,
      render: (value) =>
        value ? maskBrazilianPhone(String(value)) : "—",
    },
    { id: "contactType", label: "Tipo de contato", sortable: true },
    {
      id: "actions",
      label: "Ações",
      width: 90,
      align: "center",
      render: () => (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            className="text-primary hover:text-primary-600 cursor-pointer"
            aria-label="Editar contato"
          >
            <Pencil size={20} />
          </button>
          <button
            type="button"
            className="text-red-500 hover:text-red-700 cursor-pointer"
            aria-label="Excluir contato"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-4">
      <div className="mb-5">
        <Button
          startContent={<CirclePlus size={20} className="shrink-0" />}
          radius="sm"
          color="primary"
          className="px-8"
        >
          Novo Contato
        </Button>
      </div>
      <DynamicTable
        columns={columns}
        data={MOCK_CLIENT_CONTACTS}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhum contato encontrado"
        classNames={{ th: TABLE_TH, td: TABLE_TD }}
      />
      <ClientPaginatedTableFooter
        visibleCount={MOCK_CLIENT_CONTACTS.length}
        pagination={{
          totalRecords: MOCK_CLIENT_CONTACTS.length,
          totalPages: 1,
        }}
        entityLabel="contatos"
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}

export function ClientDetailInvoicesPanel() {
  const records = MOCK_CLIENT_INVOICES;

  const columns: ColumnConfig<(typeof records)[0]>[] = [
    {
      id: "details",
      label: "Detalhes da fatura",
      render: () => (
        <button type="button" className="text-primary underline">
          Detalhes
        </button>
      ),
    },
    { id: "referenceLabel", label: "Referência" },
    { id: "competence", label: "Competência" },
    { id: "dueDate", label: "Vencimento" },
    {
      id: "totalAmount",
      label: "Consumo acumulado",
      render: (value) => fmtDetail(Number(value)),
    },
  ];

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          startContent={<Download size={18} className="text-gray-400" />}
          radius="sm"
          variant="bordered"
        >
          Baixar CSV
        </Button>
        <Button
          startContent={<RefreshCw size={18} className="text-gray-400" />}
          radius="sm"
          variant="bordered"
        >
          Atualizar consumo
        </Button>
        <Button
          startContent={<CirclePlus size={18} className="text-gray-400" />}
          radius="sm"
          variant="bordered"
        >
          Adicionar fatura
        </Button>
      </div>
      <DynamicTable
        columns={columns}
        data={records}
        keyExtractor={(row) => row.id}
        emptyMessage="Nenhuma fatura encontrada"
        classNames={{ th: BILLING_TH, td: TABLE_TD }}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600 m-0">
          Mostrando <span className="font-semibold">{records.length}</span> de{" "}
          <span className="font-semibold">{records.length}</span> faturas
        </p>
      </div>
    </div>
  );
}

export function ClientDetailPaymentInfoPanel() {
  return <ClientDetailPaymentInfoMock />;
}
