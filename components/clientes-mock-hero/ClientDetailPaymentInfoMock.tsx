"use client";

import {
  Button,
  Chip,
  Radio,
  RadioGroup,
  Switch,
} from "@heroui/react";
import { CONTRACTS_MOCK } from "../../clientesDashboardMockData";
import { SapCodeSectionMock } from "./ClientTagsSectionMock";

const CLIENT_SINGLE_INVOICE_LABEL =
  "Emitir uma única nota fiscal para o cliente";

function PaymentStatusChipMock({
  configured,
}: {
  configured: boolean;
}) {
  return (
    <Chip
      variant="flat"
      color={configured ? "success" : "danger"}
      radius="full"
      classNames={{
        base: "h-7 max-h-7 min-h-7 gap-0 px-1",
        content: "px-1 text-sm font-normal leading-5",
      }}
    >
      {configured ? "Configurado" : "Pendente"}
    </Chip>
  );
}

function ContractPaymentCardMock({
  contractName,
  modeDefault = "contract",
  configured = true,
  showFranchises = false,
}: {
  contractName: string;
  modeDefault?: "contract" | "deductible" | "unify";
  configured?: boolean;
  showFranchises?: boolean;
}) {
  const franchises =
    CONTRACTS_MOCK.find((c) => c.name === contractName)?.franchises.filter(
      (f) => f.ativo,
    ) ?? [];

  return (
    <article className="flex flex-col gap-5 rounded-lg border border-zinc-200 bg-white px-[18px] py-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-sm font-normal leading-5 text-black m-0">
          {contractName}
        </h3>
        <PaymentStatusChipMock configured={configured} />
      </div>
      <div className="flex w-full items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-sm font-normal leading-6 text-default-500 m-0">
            Regra de imposto do contrato
          </p>
          <RadioGroup
            orientation="horizontal"
            size="sm"
            defaultValue="gross"
            classNames={{ wrapper: "gap-6 flex-wrap" }}
          >
            <Radio value="gross" classNames={{ label: "text-sm leading-6 text-foreground" }}>
              Bruto
            </Radio>
            <Radio value="net" classNames={{ label: "text-sm leading-6 text-foreground" }}>
              Líquido
            </Radio>
          </RadioGroup>
        </div>
      </div>
      <div className="flex w-full items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-sm font-normal leading-6 text-default-500 m-0">
            Configurar emissão de nota fiscal
          </p>
          <RadioGroup
            orientation="horizontal"
            size="sm"
            defaultValue={modeDefault}
            classNames={{ wrapper: "gap-6 flex-wrap" }}
          >
            <Radio value="contract" classNames={{ label: "text-sm leading-6 text-foreground" }}>
              Uma nota por contrato
            </Radio>
            <Radio value="deductible" classNames={{ label: "text-sm leading-6 text-foreground" }}>
              Uma nota por franquia
            </Radio>
            <Radio value="unify" classNames={{ label: "text-sm leading-6 text-foreground" }}>
              Unificar com outros contratos
            </Radio>
          </RadioGroup>
        </div>
        <Button
          variant="bordered"
          radius="sm"
          size="md"
          className="h-10 min-w-0 border-2 border-default-300 bg-white px-4 text-sm font-normal text-foreground"
        >
          Editar informações
        </Button>
      </div>
      {showFranchises && franchises.length > 0 ? (
        <div className="mt-5 flex w-full flex-col gap-5 border-t border-zinc-200 pt-5">
          <h4 className="text-sm font-normal leading-6 text-default-500 m-0">
            Franquias
          </h4>
          <ul className="flex flex-col gap-5 m-0 p-0 list-none">
            {franchises.map((fr) => (
              <li
                key={fr.id}
                className="flex items-center justify-between gap-4"
              >
                <span className="min-w-0 text-sm font-normal leading-5 text-black">
                  {fr.name}
                </span>
                <div className="flex shrink-0 items-center gap-5">
                  <PaymentStatusChipMock configured={false} />
                  <Button color="primary" radius="sm" size="md" className="h-10 px-4 text-sm">
                    Configurar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

export function ClientDetailPaymentInfoMock() {
  return (
    <div className="mt-4 space-y-6">
      <SapCodeSectionMock />
      <div className="flex flex-col gap-4 rounded-lg border border-default-200 bg-white px-[18px] py-4">
        <div className="flex items-center justify-between gap-4">
          <Switch
            size="sm"
            classNames={{
              base: "max-w-full items-center gap-2",
              label: "text-sm font-normal leading-6 text-default-600",
            }}
          >
            {CLIENT_SINGLE_INVOICE_LABEL}
          </Switch>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-base font-medium leading-6 text-default-600 m-0">
          Contratos
        </h3>
        <ContractPaymentCardMock contractName="CONTRATO 01" configured />
        <ContractPaymentCardMock
          contractName="CONTRATO 02"
          modeDefault="deductible"
          configured={false}
          showFranchises
        />
      </div>
    </div>
  );
}
