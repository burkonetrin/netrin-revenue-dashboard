import type React from "react";

interface CardSourceInfoProps {
  items: Array<{
    label: string;
    value: string | number | null | undefined | React.ReactNode;
    className?: string;
  }>;
  columns?: number;
}

export default function CardSourceInfo({
  items,
  columns = 2,
}: CardSourceInfoProps) {
  const groupedItems = [];
  for (let i = 0; i < items.length; i += columns) {
    groupedItems.push(items.slice(i, i + columns));
  }

  return (
    <>
      {groupedItems.map((row, rowIndex) => (
        <div key={rowIndex} className="flex w-full gap-4 mb-2">
          {row.map((item, itemIndex) => (
            <div
              key={`${rowIndex}-${itemIndex}`}
              className={`flex-1 p-3 rounded-lg bg-zinc-50 ${
                item.className || ""
              }`}
            >
              <div className="text-xs text-zinc-500 mb-1">{item.label}</div>
              <div className="text-sm font-medium text-zinc-800">
                {item.value || "-"}
              </div>
            </div>
          ))}
          {row.length < columns &&
            Array.from({ length: columns - row.length }).map((_, index) => (
              <div
                key={`placeholder-${rowIndex}-${index}`}
                className="flex-1 p-3 rounded-lg bg-zinc-50 opacity-0"
                aria-hidden
              >
                <div className="text-xs text-zinc-500 mb-1">Placeholder</div>
                <div className="text-sm font-medium text-zinc-800">-</div>
              </div>
            ))}
        </div>
      ))}
    </>
  );
}
