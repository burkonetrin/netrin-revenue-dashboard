import type { MockClient } from "../../clientesDashboardMockData";

export function ClientInfoHeader({ client }: { client: MockClient }) {
  return (
    <div>
      <h1 className="text-lg font-bold text-gray-900 m-0">{client.nome}</h1>
      <p className="mt-1 text-sm text-gray-600 m-0">
        <span className="font-bold">CNPJ:</span> {client.cnpj}
        <span className="font-bold"> - Data de criação:</span> {client.inicio}
      </p>
    </div>
  );
}
