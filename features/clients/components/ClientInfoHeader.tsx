import type { Client } from "../types/clients.types";

interface ClientInfoHeaderProps {
  client?: Pick<Client, "name" | "fantasyName" | "cnpj" | "createdAt">;
  fallbackName?: string;
  headingAs?: "h1" | "h2";
}

function formatCnpj(cnpj?: string | null): string {
  if (!cnpj) {
    return "-";
  }

  const digits = cnpj.replace(/\D/g, "");
  if (digits.length === 14) {
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  }

  return cnpj;
}

function formatCreatedAt(createdAt?: string | null): string {
  if (!createdAt) {
    return "";
  }

  return new Date(createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Cabeçalho com nome, CNPJ e data de criação do cliente.
 */
export function ClientInfoHeader({
  client,
  fallbackName,
  headingAs = "h1",
}: ClientInfoHeaderProps) {
  const companyName = client?.name || client?.fantasyName || fallbackName || "-";
  const formattedCnpj = client ? formatCnpj(client.cnpj) : "-";
  const formattedDate = client ? formatCreatedAt(client.createdAt) : "";
  const Heading = headingAs;

  return (
    <div>
      <Heading className="text-lg font-bold text-gray-900">{companyName}</Heading>
      <p className="mt-1 text-sm text-gray-600">
        <span className="font-bold">CNPJ:</span> {formattedCnpj}
        {formattedDate ? (
          <>
            <span className="font-bold"> - Data de criação:</span> {formattedDate}
          </>
        ) : null}
      </p>
    </div>
  );
}
