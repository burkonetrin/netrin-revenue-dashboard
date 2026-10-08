type CsvColumn<T> = { header: string; value: (row: T) => string };

function escapeCsvCell(value: string): string {
  if (/[;"\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadSupportToolsCsv<T>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[],
): void {
  const header = columns.map((col) => col.header).join(";");
  const lines = rows.map((row) =>
    columns.map((col) => escapeCsvCell(col.value(row))).join(";"),
  );
  const blob = new Blob([`\uFEFF${[header, ...lines].join("\n")}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
