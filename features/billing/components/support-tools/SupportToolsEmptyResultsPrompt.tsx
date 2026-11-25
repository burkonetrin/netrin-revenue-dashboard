"use client";

export function SupportToolsEmptyResultsPrompt() {
  return (
    <div
      className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-12"
      role="status"
    >
      <p className="text-sm text-gray-500">Faça filtros para visualizar os resultados</p>
    </div>
  );
}