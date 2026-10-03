"use client";

import { CONTRACTS_MOCK, MOCK_CLIENT_USERS } from "../../clientesDashboardMockData";
import { FieldSelect } from "@/design-system/ui";
import { defaultInputClassNames } from "@/shared/styles/inputClassNames";
import {
  Accordion,
  AccordionItem,
  Autocomplete,
  AutocompleteItem,
  Checkbox,
  Chip,
  Input,
  Switch,
} from "@heroui/react";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Shield,
  ShoppingBag,
  Unlock,
} from "lucide-react";
import { useMemo, useState } from "react";

const accordionItemClasses = {
  base: "border border-default-200 rounded-xl bg-white shadow-sm",
  title: "text-base font-semibold text-default-800",
  trigger: "px-4 py-3",
  content: "px-0 pb-0",
  indicator: "text-default-400",
};

const MOCK_CLIENTS = [
  { id: "alpha", name: "Alpha Serviços Financeiros LTDA" },
  { id: "boreal", name: "Boreal Logística S.A." },
];

const MOCK_GROUPS = [
  { id: "g1", name: "Administradores", description: "acesso total ao painel" },
  { id: "g2", name: "Operacional", description: "consultas e relatórios" },
  { id: "g3", name: "Financeiro", description: "faturas e pagamentos" },
];

const MOCK_ROLES = [
  {
    id: "r1",
    name: "Visualizar clientes",
    internalName: "clients.read",
  },
  {
    id: "r2",
    name: "Editar contratos",
    internalName: "contracts.write",
  },
];

function ProductAccordionTitle({
  label,
  isSelected,
}: {
  label: string;
  isSelected: boolean;
}) {
  return (
    <div className="flex items-center justify-between w-full pr-2">
      <span className="text-base font-semibold text-default-800">{label}</span>
      {isSelected ? (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-default-200 text-default-700 rounded-full border border-default-300">
          <span className="text-[10px] font-bold uppercase tracking-tight">
            Selecionado
          </span>
        </div>
      ) : null}
    </div>
  );
}

function GroupRow({
  name,
  description,
  isSelected,
  onToggle,
}: {
  name: string;
  description: string;
  isSelected: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 border-b border-default-200 last:border-b-0 hover:bg-default-100 transition-colors h-12 ${
        isSelected ? "bg-default-100" : "bg-default-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-default-200 text-default-600">
          <Shield size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-default-800">{name}</span>
          <span className="text-[10px] text-default-400 leading-tight line-clamp-1 max-w-xs lowercase">
            {description || "Sem descrição pública"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {isSelected ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-default-200 text-default-700 rounded-full border border-default-300">
            <span className="text-[10px] font-bold uppercase tracking-tight">
              Selecionada
            </span>
          </div>
        ) : null}
        <Switch size="sm" isSelected={isSelected} onValueChange={onToggle} />
      </div>
    </div>
  );
}

function MockRolePermissionSelector({
  roleName,
  roleInternalName,
  isSelected,
  onToggleRole,
}: {
  roleName: string;
  roleInternalName?: string;
  isSelected: boolean;
  onToggleRole: (v: boolean) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-default-200 overflow-hidden bg-white shadow-sm first:rounded-t-lg last:rounded-b-lg border-b-0 last:border-b">
      <button
        type="button"
        className={`flex w-full items-center justify-between px-4 cursor-pointer text-left transition-colors border-b border-default-200 ${
          isSelected ? "bg-default-100" : "bg-default-50"
        } hover:bg-default-100 h-12`}
        onClick={() => setIsExpanded((e) => !e)}
      >
        <div className="flex items-center flex-1">
          <div className="text-default-500 transition-colors">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          <div className="flex items-center gap-2 ml-1">
            <Unlock
              size={16}
              className={isSelected ? "text-default-700" : "text-default-500"}
            />
            <div className="flex flex-col">
              <span
                className={`text-sm font-medium ${
                  isSelected ? "text-default-900" : "text-default-800"
                }`}
              >
                {roleName}
              </span>
              {roleInternalName ? (
                <span className="text-[10px] text-default-400 font-mono italic">
                  {roleInternalName}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSelected ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-default-200 text-default-700 rounded-full border border-default-300">
              <span className="text-[10px] font-bold uppercase tracking-tight">
                Selecionada
              </span>
            </div>
          ) : null}
        </div>
      </button>
      {isExpanded ? (
        <div className="p-2 border-t border-default-100 bg-white">
          <div className="space-y-1 px-2 py-2 text-xs text-default-500">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onToggleRole(e.target.checked)}
                className="rounded border-default-300"
              />
              clients
            </label>
            <label className="flex items-center gap-2 ml-4">
              <input type="checkbox" className="rounded border-default-300" />
              clients.overview
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function UserStepBasicInfoMock({
  defaultClientName,
}: {
  defaultClientName?: string;
}) {
  const hideClientField = Boolean(defaultClientName);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isActive, setIsActive] = useState(true);
  const [clientSearchQuery, setClientSearchQuery] = useState(
    defaultClientName ?? "",
  );
  const [clientId, setClientId] = useState<string | null>(null);

  const filteredClients = MOCK_CLIENTS.filter((c) =>
    c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-2xl font-semibold text-default-900 tracking-tight">
          Informações básicas
        </h2>
      </div>
      <div className="flex flex-col gap-4">
        <Input
          label="Nome completo"
          labelPlacement="outside"
          placeholder="Digite o nome completo"
          classNames={defaultInputClassNames}
        />
        <Input
          type="email"
          label="E-mail"
          labelPlacement="outside"
          placeholder="Digite o e-mail"
          classNames={defaultInputClassNames}
        />
        <Input
          label="Username"
          labelPlacement="outside"
          placeholder="Digite o username"
          autoComplete="off"
          classNames={defaultInputClassNames}
        />
        {!hideClientField ? (
          <Autocomplete
            label="Tipo de usuário"
            labelPlacement="outside"
            placeholder="Selecione um cliente"
            items={filteredClients}
            inputValue={clientSearchQuery}
            onInputChange={setClientSearchQuery}
            selectedKey={clientId}
            onSelectionChange={(key) => {
              const id = key ? String(key) : "";
              setClientId(id || null);
              const selected = MOCK_CLIENTS.find((c) => c.id === id);
              setClientSearchQuery(selected?.name ?? "");
            }}
            onClear={() => {
              setClientId(null);
              setClientSearchQuery("");
            }}
          >
            {(client) => (
              <AutocompleteItem key={client.id}>{client.name}</AutocompleteItem>
            )}
          </Autocomplete>
        ) : null}
        <div className="flex flex-row gap-4">
          <div className="flex-1">
            <Input
              type={isPasswordVisible ? "text" : "password"}
              label="Senha"
              labelPlacement="outside"
              placeholder="••••••••"
              autoComplete="new-password"
              classNames={defaultInputClassNames}
              endContent={
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((v) => !v)}
                  className="focus:outline-none"
                >
                  {isPasswordVisible ? (
                    <EyeOff className="size-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="size-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              }
            />
          </div>
          <div className="flex-1">
            <Input
              type={isConfirmPasswordVisible ? "text" : "password"}
              label="Confirmar Senha"
              labelPlacement="outside"
              placeholder="••••••••"
              autoComplete="new-password"
              classNames={defaultInputClassNames}
              endContent={
                <button
                  type="button"
                  onClick={() => setIsConfirmPasswordVisible((v) => !v)}
                  className="focus:outline-none"
                >
                  {isConfirmPasswordVisible ? (
                    <EyeOff className="size-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="size-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 mt-2">
          <Checkbox isSelected={isActive} onValueChange={setIsActive} size="sm">
            Ativo
          </Checkbox>
        </div>
      </div>
    </div>
  );
}

export function UserStepPermissionsMock() {
  const [copyFromUserId, setCopyFromUserId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Record<string, boolean>>({
    g1: false,
    g2: true,
    g3: false,
  });
  const [roles, setRoles] = useState<Record<string, boolean>>({
    r1: true,
    r2: false,
  });

  const productLabel = "Nucleus";
  const isProductGroupSelected = Object.values(groups).some(Boolean);
  const isProductRoleSelected = Object.values(roles).some(Boolean);

  return (
    <div className="flex flex-col gap-10 pb-8">
      <FieldSelect
        label="Copiar permissões de outro usuário"
        aria-label="Copiar permissões de outro usuário"
        placeholder="Selecione um usuário"
        className="max-w-md"
        items={MOCK_CLIENT_USERS.map((user) => ({
          key: user.id,
          label: `${user.fullName} · ${user.username}`,
        }))}
        selectedKeys={
          copyFromUserId ? new Set([copyFromUserId]) : new Set<string>()
        }
        onSelectionChange={(key) => setCopyFromUserId(key)}
      />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-default-800">
            Selecione grupos de permissões para este usuário
          </h3>
          <p className="text-xs text-default-400">
            O usuário herdará todas as permissões dos grupos selecionados.
          </p>
        </div>
        <Accordion
          selectionMode="multiple"
          className="flex flex-col gap-2"
          itemClasses={accordionItemClasses}
          defaultExpandedKeys={["product-groups"]}
        >
          <AccordionItem
            key="product-groups"
            aria-label={productLabel}
            title={
              <ProductAccordionTitle
                label={productLabel}
                isSelected={isProductGroupSelected}
              />
            }
          >
            <div className="flex flex-col border-t border-default-200 overflow-hidden">
              {MOCK_GROUPS.map((g) => (
                <GroupRow
                  key={g.id}
                  name={g.name}
                  description={g.description}
                  isSelected={groups[g.id] ?? false}
                  onToggle={(v) =>
                    setGroups((prev) => ({ ...prev, [g.id]: v }))
                  }
                />
              ))}
            </div>
          </AccordionItem>
        </Accordion>
      </div>
      <hr className="border-default-100" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-default-800">
            Adicione permissões individuais
          </h3>
          <p className="text-xs text-default-400">
            Atribua roles específicas e configure permissões adicionais.
          </p>
        </div>
        <Accordion
          selectionMode="multiple"
          className="flex flex-col gap-2"
          itemClasses={accordionItemClasses}
          defaultExpandedKeys={["product-roles"]}
        >
          <AccordionItem
            key="product-roles"
            aria-label={productLabel}
            title={
              <ProductAccordionTitle
                label={productLabel}
                isSelected={isProductRoleSelected}
              />
            }
          >
            <div className="flex flex-col border-t border-default-200 overflow-hidden">
              {MOCK_ROLES.map((role) => (
                <MockRolePermissionSelector
                  key={role.id}
                  roleName={role.name}
                  roleInternalName={role.internalName}
                  isSelected={roles[role.id] ?? false}
                  onToggleRole={(v) =>
                    setRoles((prev) => ({ ...prev, [role.id]: v }))
                  }
                />
              ))}
            </div>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

function ContractFranchiseGroupMock({
  contract,
  selectedKeys,
  onToggle,
}: {
  contract: { id: string; name: string; franchises: { id: string; name: string }[] };
  selectedKeys: Set<string>;
  onToggle: (deductId: string, name: string, selected: boolean) => void;
}) {
  if (contract.franchises.length === 0) return null;

  return (
    <div className="flex flex-col border border-default-200 rounded-2xl overflow-hidden shadow-sm bg-default-50/20">
      <div className="flex items-center gap-2 px-5 py-3 bg-default-100/50 border-b border-default-200">
        <FileText size={16} className="text-default-500" />
        <span className="text-xs font-bold uppercase tracking-widest text-default-600">
          {contract.name}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-4 bg-white/50">
        <div className="grid grid-cols-1 gap-3 ml-4">
          {contract.franchises.map((deduct) => {
            const isSelected = selectedKeys.has(deduct.id);
            return (
              <div
                key={deduct.id}
                className={`flex items-center justify-between px-4 py-3 bg-white border rounded-xl transition-all h-14 ${
                  isSelected
                    ? "border-primary-200 bg-primary-50/10 shadow-sm"
                    : "border-default-100 hover:border-default-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                      onToggle(deduct.id, deduct.name, e.target.checked)
                    }
                    className="size-5 rounded border-default-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? "text-primary-700" : "text-default-700"
                      }`}
                    >
                      {deduct.name}
                    </span>
                  </div>
                </div>
                {isSelected ? (
                  <div className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      variant="flat"
                      color="primary"
                      className="h-5 text-[9px] font-bold uppercase"
                    >
                      Selecionada
                    </Chip>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function UserStepFranchisesMock() {
  const contracts = useMemo(
    () =>
      CONTRACTS_MOCK.filter((c) => c.ativo).map((c) => ({
        id: c.id,
        name: c.name,
        franchises: c.franchises
          .filter((f) => f.ativo)
          .map((f) => ({ id: f.id, name: f.name })),
      })),
    [],
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleToggle = (id: string, _name: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const hasContracts = contracts.some((c) => c.franchises.length > 0);

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex flex-col gap-1.5 px-1">
        <h2 className="text-xl font-semibold text-default-800 tracking-tight">
          Selecione as franquias às quais este usuário tem acesso
        </h2>
        <p className="text-sm text-default-400">
          Marque as franquias que serão vinculadas a este usuário.
        </p>
      </div>
      <div className="flex flex-col gap-6">
        {!hasContracts ? (
          <div className="border-2 border-dashed border-default-200 rounded-2xl py-12 flex flex-col items-center justify-center gap-3 text-default-400">
            <ShoppingBag size={32} className="text-default-300" />
            <p className="text-sm font-medium text-center">
              Nenhum contrato ativo encontrado para este cliente.
            </p>
          </div>
        ) : (
          contracts.map((contract) => (
            <ContractFranchiseGroupMock
              key={contract.id}
              contract={contract}
              selectedKeys={selectedIds}
              onToggle={handleToggle}
            />
          ))
        )}
      </div>
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-blue-800">
        <AlertCircle className="shrink-0 size-5" />
        <p className="text-xs leading-relaxed text-blue-700">
          As franquias vinculadas aqui permitem que o usuário realize consultas
          e utilize serviços específicos. O faturamento será gerado de acordo
          com o contrato de cada franquia.
        </p>
      </div>
    </div>
  );
}
