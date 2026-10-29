"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const MONTHS = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(new Date(2020, index, 1)),
);

interface SourceMonthPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function formatMonth(value: string): string {
  const [year, month] = value.split("-");
  return `${month}/${year}`;
}

export function SourceMonthPicker({ label, value, onChange }: SourceMonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => Number(value.slice(0, 4)));

  useEffect(() => setViewYear(Number(value.slice(0, 4))), [value]);

  const selectMonth = (monthIndex: number) => {
    onChange(`${viewYear}-${String(monthIndex + 1).padStart(2, "0")}`);
    setIsOpen(false);
  };

  return (
    <div
      data-testid={`source-month-picker-${label === "Competência inicial" ? "from" : "to"}`}
      data-value={value}
      data-view-year={viewYear}
      className="relative flex min-w-0 flex-col gap-2"
    >
      <p className="text-xs text-default-500">{label}</p>
      <button
        type="button"
        aria-label={`${label}: ${formatMonth(value)}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 w-[174px] items-center justify-between rounded-lg border border-default-200 bg-white px-3 text-sm text-default-700 shadow-sm outline-none focus-visible:border-primary-300 focus-visible:ring-2 focus-visible:ring-primary-100"
      >
        <span>{formatMonth(value)}</span>
        <CalendarDays size={18} aria-hidden="true" className="text-default-500" />
      </button>

      {isOpen && (
        <dialog
          open
          aria-label={`Selecionar ${label.toLocaleLowerCase()}`}
          className="absolute left-0 top-12 z-50 m-0 w-[260px] rounded-xl border border-default-200 bg-white p-3 shadow-lg"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Ano anterior"
              onClick={() => setViewYear((year) => year - 1)}
              className="rounded-md p-1.5 text-default-500 hover:bg-default-100"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <span className="text-sm font-medium text-default-800">{viewYear}</span>
            <button
              type="button"
              aria-label="Próximo ano"
              onClick={() => setViewYear((year) => year + 1)}
              className="rounded-md p-1.5 text-default-500 hover:bg-default-100"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((month, index) => {
              const monthValue = `${viewYear}-${String(index + 1).padStart(2, "0")}`;
              const isSelected = monthValue === value;
              return (
                <button
                  key={month}
                  type="button"
                  aria-label={`Selecionar ${month} de ${viewYear}`}
                  aria-pressed={isSelected}
                  onClick={() => selectMonth(index)}
                  className={`rounded-lg px-2 py-2 text-xs capitalize transition-colors ${
                    isSelected ? "bg-primary text-white" : "text-default-700 hover:bg-default-100"
                  }`}
                >
                  {month.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </dialog>
      )}
    </div>
  );
}
